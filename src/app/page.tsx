'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  HelpCircle,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  ArrowUpCircle,
  ArrowDownCircle,
  Play,
  User,
  Heart,
  History,
} from 'lucide-react';
import { DIFFICULTIES, DifficultyKey, GuessRecord } from '@/types/game';
import { RankingPodium } from '@/components/RankingPodium';
import { SmooshCupGraphic } from '@/components/DecorativeGraphics';
import { ScoreEntry } from '@/lib/db';

export default function GamePage() {
  // Configuração e Estado Geral
  const [playerName, setPlayerName] = useState<string>('');
  const [isNameSet, setIsNameSet] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<DifficultyKey>('iniciante');

  // Estado do Jogo Ativo
  const [secretNumber, setSecretNumber] = useState<number>(0);
  const [inputVal, setInputVal] = useState<string>('');
  const [guessHistory, setGuessHistory] = useState<GuessRecord[]>([]);
  const [usedNumbers, setUsedNumbers] = useState<Set<number>>(new Set());
  const [validAttemptsCount, setValidAttemptsCount] = useState<number>(0);

  // Status da Rodada
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: 'info' | 'warning' | 'error' | 'success';
  }>({
    text: 'Faça o seu primeiro chute!',
    type: 'info',
  });
  const [isWon, setIsWon] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  // Rankings e Pontuações
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [isLoadingScores, setIsLoadingScores] = useState<boolean>(false);
  const [rankingDifficulty, setRankingDifficulty] = useState<DifficultyKey>('iniciante');

  const currentDiff = DIFFICULTIES[difficulty];
  const remainingChances = currentDiff.maxAttempts - validAttemptsCount;

  // Carregar scores do banco/API
  const fetchScores = async (diffKey?: DifficultyKey) => {
    setIsLoadingScores(true);
    try {
      const res = await fetch(`/api/scores${diffKey ? `?difficulty=${diffKey}` : ''}`);
      const data = await res.json();
      if (data.success) {
        setScores(data.scores);
      }
    } catch (e) {
      console.error('Falha ao carregar ranking:', e);
    } finally {
      setIsLoadingScores(false);
    }
  };

  useEffect(() => {
    fetchScores();
  }, []);

  // Iniciar nova partida
  const startNewGame = (diffKey: DifficultyKey = difficulty) => {
    const config = DIFFICULTIES[diffKey];
    // Número aleatório inclusivo entre min e max
    const randomNum = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
    setSecretNumber(randomNum);
    setDifficulty(diffKey);
    setRankingDifficulty(diffKey);
    setGuessHistory([]);
    setUsedNumbers(new Set());
    setValidAttemptsCount(0);
    setIsWon(false);
    setIsGameOver(false);
    setInputVal('');
    setStatusMessage({
      text: `Jogo iniciado! A máquina escolheu um número entre ${config.min} e ${config.max}. Você tem ${config.maxAttempts} chances!`,
      type: 'info',
    });
  };

  // Inicializa o primeiro jogo
  useEffect(() => {
    startNewGame('iniciante');
  }, []);

  // Lógica de Processamento do Chute (Validações Estritas)
  const handleMakeGuess = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isWon || isGameOver) return;

    const trimmed = inputVal.trim();
    if (!trimmed) return;

    const guess = parseInt(trimmed, 10);
    if (isNaN(guess)) {
      setStatusMessage({
        text: 'Por favor, insira um número inteiro válido.',
        type: 'warning',
      });
      return;
    }

    // Regra 1: Validação de Valor Máximo / Mínimo
    // O sistema não pode deixar a pessoa colocar um número maior que o valor máximo da dificuldade escolhida,
    // não deve contabilizar o chute e deve informar a mensagem
    if (guess > currentDiff.max) {
      setStatusMessage({
        text: `Valor acima do valor máximo possível (Maior que ${currentDiff.max})`,
        type: 'error',
      });
      setInputVal('');
      return;
    }

    if (guess < currentDiff.min) {
      setStatusMessage({
        text: `Valor abaixo do valor mínimo possível (Menor que ${currentDiff.min})`,
        type: 'error',
      });
      setInputVal('');
      return;
    }

    // Regra 2: Validação de Chute Duplicado
    // O sistema não pode deixar a pessoa usar duas vezes o mesmo valor como chute e não deve contabilizar
    if (usedNumbers.has(guess)) {
      setStatusMessage({
        text: 'Valor duplicado, já foi usado',
        type: 'warning',
      });
      setInputVal('');
      return;
    }

    // A partir daqui, o chute é VÁLIDO e contabiliza
    const nextAttempts = validAttemptsCount + 1;
    setValidAttemptsCount(nextAttempts);

    const nextUsed = new Set(usedNumbers);
    nextUsed.add(guess);
    setUsedNumbers(nextUsed);

    // Regra 3: Checagem de Acerto
    if (guess === secretNumber) {
      setIsWon(true);
      setStatusMessage({
        text: `Acertou! O número escolhido foi ${secretNumber}`,
        type: 'success',
      });

      // Dispara confetes coloridos
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#FFCA28', '#FF7043', '#E53935', '#43A047', '#1E88E5'],
        });
      } catch (err) {
        // Confetti fallback silencioso
      }

      setGuessHistory((prev) => [
        {
          value: guess,
          feedback: 'Acertou o número!',
          type: 'correct',
          guessNumber: nextAttempts,
        },
        ...prev,
      ]);

      // Salva no banco de dados Neon
      const player = playerName.trim() || 'Jogador Anônimo';
      try {
        await fetch('/api/scores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            player_name: player,
            difficulty: currentDiff.key,
            attempts: nextAttempts,
            secret_number: secretNumber,
          }),
        });
        // Atualiza a tabela de ranking
        fetchScores(currentDiff.key);
      } catch (err) {
        console.error('Erro ao gravar score:', err);
      }

      setInputVal('');
      return;
    }

    // Regra 4: Chute Incorreto (Maior ou Menor)
    const isHigher = guess > secretNumber;
    const feedbackText = isHigher
      ? `${guess} é maior que o valor escolhido`
      : `${guess} é menor que o valor escolhido`;

    setStatusMessage({
      text: feedbackText,
      type: 'info',
    });

    setGuessHistory((prev) => [
      {
        value: guess,
        feedback: feedbackText,
        type: isHigher ? 'higher' : 'lower',
        guessNumber: nextAttempts,
      },
      ...prev,
    ]);

    // Verifica se esgotou as chances
    if (nextAttempts >= currentDiff.maxAttempts) {
      setIsGameOver(true);
      setStatusMessage({
        text: `Fim de jogo! Suas chances acabaram. O número secreto era ${secretNumber}.`,
        type: 'error',
      });
    }

    setInputVal('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-10">
      {/* HEADER PRINCIPAL */}
      <header className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-3xl border-4 border-cajua-charcoal shadow-pop">
        <div className="flex items-center gap-5">
          <SmooshCupGraphic color={currentDiff.cupColor} label={currentDiff.label} />
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-3 py-0.5 rounded-full bg-cajua-yellow border-2 border-cajua-charcoal font-fredoka font-bold text-xs uppercase tracking-wide">
                Identidade Cajuá
              </span>
              <span className="text-xs font-semibold text-neutral-500">
                {currentDiff.fruit}
              </span>
            </div>
            <h1 className="font-fredoka text-3xl sm:text-5xl font-extrabold tracking-tight text-cajua-charcoal">
              Jogo dos Números
            </h1>
            <p className="text-sm sm:text-base text-neutral-600 font-medium mt-1">
              Descubra o número secreto com a menor quantidade de chutes!
            </p>
          </div>
        </div>

        {/* Identificação do Jogador */}
        <div className="w-full md:w-auto flex flex-col items-end gap-2 bg-cajua-sand p-4 rounded-2xl border-2 border-cajua-charcoal shadow-pop">
          <div className="flex items-center gap-2 text-xs font-fredoka font-bold text-cajua-charcoal">
            <User className="w-4 h-4 text-cajua-orange" />
            <span>NOME DO JOGADOR:</span>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Digite seu apelido"
              maxLength={25}
              className="px-3 py-1.5 rounded-xl border-2 border-cajua-charcoal font-fredoka text-sm w-full md:w-48 focus:outline-none focus:ring-2 focus:ring-cajua-yellow"
            />
            {playerName && !isNameSet && (
              <button
                onClick={() => setIsNameSet(true)}
                className="px-3 py-1 bg-cajua-green text-white font-fredoka font-bold text-xs rounded-xl border-2 border-cajua-charcoal btn-pop shadow-pop"
              >
                Salvar
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ÁREA CENTRAL DO JOGO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* COLUNA ESQUERDA: CONTROLES E TABULEIRO */}
        <div className="lg:col-span-7 space-y-6">
          {/* SELETOR DE DIFICULDADES */}
          <div className="bg-white p-6 rounded-3xl border-4 border-cajua-charcoal shadow-pop space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-fredoka font-bold text-sm text-neutral-600 uppercase tracking-wider">
                1. Escolha a Dificuldade
              </span>
              <span className="text-xs text-neutral-500 font-medium">
                (Reinicia a partida com novo número)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(Object.keys(DIFFICULTIES) as DifficultyKey[]).map((key) => {
                const conf = DIFFICULTIES[key];
                const active = difficulty === key;
                return (
                  <button
                    key={key}
                    onClick={() => startNewGame(key)}
                    className={`p-4 rounded-2xl border-3 border-cajua-charcoal text-left transition-all relative overflow-hidden btn-pop ${
                      active
                        ? `${conf.color} shadow-pop`
                        : 'bg-white hover:bg-neutral-50 opacity-75'
                    }`}
                  >
                    {active && (
                      <span className="absolute top-2 right-2 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cajua-charcoal opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-cajua-charcoal" />
                      </span>
                    )}
                    <h3 className="font-fredoka font-bold text-lg text-cajua-charcoal">
                      {conf.label}
                    </h3>
                    <p className="text-xs text-neutral-700 font-semibold mt-1">
                      {conf.min} a {conf.max}
                    </p>
                    <span className="inline-block mt-2 text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/80 border border-cajua-charcoal/30">
                      {conf.maxAttempts} chances
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PAINEL DE ENTRADA DO CHUTE */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border-4 border-cajua-charcoal shadow-pop space-y-6">
            {/* Status e Contador de Chances */}
            <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-cajua-sand border-2 border-cajua-charcoal">
              <div>
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                  Chances Restantes
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  {Array.from({ length: currentDiff.maxAttempts }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-3.5 h-6 rounded-md border-2 border-cajua-charcoal transition-all ${
                        idx < remainingChances
                          ? 'bg-cajua-red shadow-sm'
                          : 'bg-neutral-300 opacity-40'
                      }`}
                    />
                  ))}
                  <span className="ml-2 font-fredoka font-bold text-lg text-cajua-charcoal">
                    {remainingChances} / {currentDiff.maxAttempts}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                  Chutes Válidos
                </span>
                <span className="font-fredoka font-extrabold text-2xl text-cajua-charcoal">
                  {validAttemptsCount}
                </span>
              </div>
            </div>

            {/* Form de Chute */}
            <form onSubmit={handleMakeGuess} className="space-y-4">
              <label className="block">
                <span className="font-fredoka text-sm font-bold text-neutral-700">
                  Qual é o seu chute? (Entre {currentDiff.min} e {currentDiff.max})
                </span>
                <div className="mt-2 flex gap-3">
                  <input
                    type="number"
                    value={inputVal}
                    disabled={isWon || isGameOver}
                    onChange={(e) => setInputVal(e.target.value)}
                    placeholder={`Ex: ${Math.floor(currentDiff.max / 2)}`}
                    className="flex-1 px-4 py-3 text-2xl font-fredoka font-bold rounded-2xl border-3 border-cajua-charcoal focus:outline-none focus:ring-4 focus:ring-cajua-yellow disabled:bg-neutral-100 disabled:opacity-60"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={isWon || isGameOver || !inputVal.trim()}
                    className="px-6 py-3 bg-cajua-yellow hover:bg-amber-400 disabled:bg-neutral-300 text-cajua-charcoal font-fredoka font-bold text-lg rounded-2xl border-3 border-cajua-charcoal shadow-pop btn-pop disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <span>Chutar</span>
                    <Play className="w-5 h-5 fill-current" />
                  </button>
                </div>
              </label>
            </form>

            {/* MENSAGEM DE FEEDBACK EM DESTAQUE */}
            <div
              className={`p-4 rounded-2xl border-3 border-cajua-charcoal flex items-start gap-3.5 transition-all animate-pop-in ${
                statusMessage.type === 'success'
                  ? 'bg-cajua-green/20 text-green-950 border-green-800'
                  : statusMessage.type === 'error'
                  ? 'bg-cajua-red/15 text-red-950 border-red-700'
                  : statusMessage.type === 'warning'
                  ? 'bg-cajua-yellow/30 text-amber-950 border-amber-600'
                  : 'bg-cajua-sand text-cajua-charcoal'
              }`}
            >
              {statusMessage.type === 'success' && (
                <CheckCircle2 className="w-7 h-7 text-green-700 shrink-0 mt-0.5" />
              )}
              {statusMessage.type === 'error' && (
                <AlertTriangle className="w-7 h-7 text-red-700 shrink-0 mt-0.5" />
              )}
              {statusMessage.type === 'warning' && (
                <HelpCircle className="w-7 h-7 text-amber-700 shrink-0 mt-0.5" />
              )}
              {statusMessage.type === 'info' && (
                <Sparkles className="w-7 h-7 text-cajua-orange shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-fredoka font-bold text-lg leading-snug">
                  {statusMessage.text}
                </p>
                {isWon && (
                  <p className="text-xs sm:text-sm font-semibold text-green-800 mt-1">
                    🎉 Parabéns! Você precisou de apenas {validAttemptsCount} chute
                    {validAttemptsCount > 1 ? 's' : ''} válido{validAttemptsCount > 1 ? 's' : ''}!
                    Seu recorde foi salvo no Hall da Fama.
                  </p>
                )}
                {isGameOver && (
                  <p className="text-xs sm:text-sm font-semibold text-red-800 mt-1">
                    Não foi dessa vez! Tente novamente no botão abaixo para tentar acertar com menos palpites.
                  </p>
                )}
              </div>
            </div>

            {/* BOTÃO JOGAR NOVAMENTE QUANDO FINALIZAR */}
            {(isWon || isGameOver) && (
              <button
                onClick={() => startNewGame(difficulty)}
                className="w-full py-3.5 bg-cajua-charcoal text-white font-fredoka font-bold text-lg rounded-2xl border-3 border-cajua-charcoal shadow-pop btn-pop flex items-center justify-center gap-2 hover:bg-neutral-800"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Jogar Novamente ({currentDiff.label})</span>
              </button>
            )}
          </div>

          {/* HISTÓRICO DE CHUTES DA RODADA */}
          {guessHistory.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border-4 border-cajua-charcoal shadow-pop space-y-3">
              <div className="flex items-center gap-2 text-cajua-charcoal font-fredoka font-bold text-sm">
                <History className="w-4 h-4 text-cajua-blue" />
                <span>Histórico de Chutes Válidos Desta Partida:</span>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {guessHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-cajua-sand/70 border-2 border-cajua-charcoal/20 text-xs sm:text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-fredoka font-bold bg-white px-2 py-0.5 rounded-lg border border-cajua-charcoal/40">
                        Chute #{item.guessNumber}
                      </span>
                      <span className="font-fredoka font-extrabold text-base text-cajua-charcoal">
                        {item.value}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                      {item.type === 'higher' && (
                        <span className="text-red-700 flex items-center gap-1">
                          <ArrowDownCircle className="w-4 h-4" /> É menor
                        </span>
                      )}
                      {item.type === 'lower' && (
                        <span className="text-blue-700 flex items-center gap-1">
                          <ArrowUpCircle className="w-4 h-4" /> É maior
                        </span>
                      )}
                      {item.type === 'correct' && (
                        <span className="text-green-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Acertou!
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* COLUNA DIREITA: PÓDIO E RANKING NEON */}
        <div className="lg:col-span-5">
          <RankingPodium
            scores={scores}
            activeDifficulty={rankingDifficulty}
            onSelectDifficulty={(d) => {
              setRankingDifficulty(d);
              fetchScores(d);
            }}
            isLoading={isLoadingScores}
          />
        </div>
      </div>
    </div>
  );
}
