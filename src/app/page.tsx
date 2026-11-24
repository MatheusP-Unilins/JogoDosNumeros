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
  History,
} from 'lucide-react';
import { DIFFICULTIES, DifficultyKey, GuessRecord } from '@/types/game';
import { RankingPodium } from '@/components/RankingPodium';
import { SmooshCupGraphic } from '@/components/DecorativeGraphics';
import { ScoreEntry } from '@/lib/db';

export default function GamePage() {
  // Configuração e Estado Geral
  const [playerName, setPlayerName] = useState<string>('');
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

  useEffect(() => {
    startNewGame('iniciante');
  }, []);

  // Lógica de Processamento do Chute
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

    // Regra 1: Validação de Valor Máximo / Mínimo (Não consome tentativa)
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

    // Regra 2: Validação de Chute Duplicado (Não consome tentativa)
    if (usedNumbers.has(guess)) {
      setStatusMessage({
        text: 'Valor duplicado, já foi usado',
        type: 'warning',
      });
      setInputVal('');
      return;
    }

    // Chute Válido
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

      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FFCA28', '#FF7043', '#E53935', '#43A047', '#1E88E5'],
        });
      } catch (err) {}

      setGuessHistory((prev) => [
        {
          value: guess,
          feedback: 'Acertou o número!',
          type: 'correct',
          guessNumber: nextAttempts,
        },
        ...prev,
      ]);

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
        fetchScores(currentDiff.key);
      } catch (err) {
        console.error('Erro ao gravar score:', err);
      }

      setInputVal('');
      return;
    }

    // Regra 4: Chute Incorreto
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

    if (nextAttempts >= currentDiff.maxAttempts) {
      setIsGameOver(true);
      setStatusMessage({
        text: `Fim de jogo! Suas chances acabaram. O número era ${secretNumber}.`,
        type: 'error',
      });
    }

    setInputVal('');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6">
      {/* HEADER COMPACTO E RESPONSIVO */}
      <header className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border-4 border-cajua-charcoal shadow-pop">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="scale-75 sm:scale-90 origin-left -mr-3 sm:mr-0">
            <SmooshCupGraphic color={currentDiff.cupColor} label={currentDiff.label} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-cajua-yellow border-2 border-cajua-charcoal font-fredoka font-bold text-[10px] uppercase tracking-wide">
                Identidade Cajuá
              </span>
              <span className="text-xs font-semibold text-neutral-500">
                {currentDiff.fruit}
              </span>
            </div>
            <h1 className="font-fredoka text-2xl sm:text-4xl font-extrabold tracking-tight text-cajua-charcoal">
              Jogo dos Números
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 font-medium">
              Descubra o número secreto com a menor quantidade de chutes!
            </p>
          </div>
        </div>

        {/* Identificação do Jogador */}
        <div className="w-full md:w-auto flex flex-col items-start md:items-end gap-1.5 bg-cajua-sand p-3 rounded-2xl border-2 border-cajua-charcoal shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-fredoka font-bold text-cajua-charcoal">
            <User className="w-3.5 h-3.5 text-cajua-orange" />
            <span>NOME DO JOGADOR:</span>
          </div>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Digite seu nome/apelido"
            maxLength={25}
            className="px-3 py-1.5 rounded-xl border-2 border-cajua-charcoal font-fredoka text-xs sm:text-sm w-full md:w-56 bg-white focus:outline-none focus:ring-2 focus:ring-cajua-yellow"
          />
        </div>
      </header>

      {/* ÁREA CENTRAL - GRADE RESPONSIVA EQUILIBRADA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
        {/* COLUNA ESQUERDA: CONTROLES E TABULEIRO (7 colunas) */}
        <div className="lg:col-span-7 flex flex-col gap-4 sm:gap-5">
          {/* SELETOR DE DIFICULDADES */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border-4 border-cajua-charcoal shadow-pop space-y-3">
            <div className="flex items-center justify-between text-xs font-fredoka font-bold text-neutral-600 uppercase tracking-wider">
              <span>1. Escolha a Dificuldade</span>
              <span className="text-[11px] text-neutral-400 font-normal">Reinicia a partida</span>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {(Object.keys(DIFFICULTIES) as DifficultyKey[]).map((key) => {
                const conf = DIFFICULTIES[key];
                const active = difficulty === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => startNewGame(key)}
                    className={`p-2.5 sm:p-3.5 rounded-2xl border-2 sm:border-3 border-cajua-charcoal text-left transition-all relative overflow-hidden btn-pop ${
                      active
                        ? `${conf.color} shadow-pop`
                        : 'bg-white hover:bg-neutral-50 opacity-80'
                    }`}
                  >
                    <h3 className="font-fredoka font-bold text-xs sm:text-base text-cajua-charcoal truncate">
                      {conf.label}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-neutral-700 font-semibold mt-0.5">
                      {conf.min} a {conf.max}
                    </p>
                    <span className="inline-block mt-1.5 text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-white/90 border border-cajua-charcoal/30">
                      {conf.maxAttempts} chances
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PAINEL DE ENTRADA DO CHUTE */}
          <div className="bg-white p-4 sm:p-6 rounded-3xl border-4 border-cajua-charcoal shadow-pop space-y-4">
            {/* Status e Contador de Chances */}
            <div className="flex items-center justify-between gap-2 p-3 sm:p-3.5 rounded-2xl bg-cajua-sand border-2 border-cajua-charcoal">
              <div>
                <span className="text-[10px] sm:text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                  Chances Restantes
                </span>
                <div className="flex items-center gap-1 sm:gap-1.5 mt-1 flex-wrap">
                  {Array.from({ length: currentDiff.maxAttempts }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-2.5 sm:w-3.5 h-5 sm:h-6 rounded-md border border-cajua-charcoal transition-all ${
                        idx < remainingChances
                          ? 'bg-cajua-red shadow-sm'
                          : 'bg-neutral-300 opacity-30'
                      }`}
                    />
                  ))}
                  <span className="ml-1 sm:ml-2 font-fredoka font-bold text-sm sm:text-base text-cajua-charcoal">
                    {remainingChances}/{currentDiff.maxAttempts}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] sm:text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                  Chutes Válidos
                </span>
                <span className="font-fredoka font-extrabold text-xl sm:text-2xl text-cajua-charcoal">
                  {validAttemptsCount}
                </span>
              </div>
            </div>

            {/* Form de Chute */}
            <form onSubmit={handleMakeGuess} className="space-y-3">
              <label className="block">
                <span className="font-fredoka text-xs sm:text-sm font-bold text-neutral-700">
                  Qual é o seu chute? (Entre {currentDiff.min} e {currentDiff.max})
                </span>
                <div className="mt-1.5 flex gap-2 sm:gap-3">
                  <input
                    type="number"
                    value={inputVal}
                    disabled={isWon || isGameOver}
                    onChange={(e) => setInputVal(e.target.value)}
                    placeholder={`Ex: ${Math.floor(currentDiff.max / 2)}`}
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-xl sm:text-2xl font-fredoka font-bold rounded-2xl border-2 sm:border-3 border-cajua-charcoal focus:outline-none focus:ring-4 focus:ring-cajua-yellow disabled:bg-neutral-100 disabled:opacity-60"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={isWon || isGameOver || !inputVal.trim()}
                    className="px-5 sm:px-6 py-2 sm:py-2.5 bg-cajua-yellow hover:bg-amber-400 disabled:bg-neutral-300 text-cajua-charcoal font-fredoka font-bold text-base sm:text-lg rounded-2xl border-2 sm:border-3 border-cajua-charcoal shadow-pop btn-pop disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
                  >
                    <span>Chutar</span>
                    <Play className="w-4 h-4 fill-current" />
                  </button>
                </div>
              </label>
            </form>

            {/* MENSAGEM DE FEEDBACK */}
            <div
              className={`p-3.5 sm:p-4 rounded-2xl border-2 sm:border-3 border-cajua-charcoal flex items-start gap-3 transition-all animate-pop-in ${
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
                <CheckCircle2 className="w-6 h-6 text-green-700 shrink-0 mt-0.5" />
              )}
              {statusMessage.type === 'error' && (
                <AlertTriangle className="w-6 h-6 text-red-700 shrink-0 mt-0.5" />
              )}
              {statusMessage.type === 'warning' && (
                <HelpCircle className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
              )}
              {statusMessage.type === 'info' && (
                <Sparkles className="w-6 h-6 text-cajua-orange shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-fredoka font-bold text-base sm:text-lg leading-snug">
                  {statusMessage.text}
                </p>
                {isWon && (
                  <p className="text-xs sm:text-sm font-semibold text-green-800 mt-1">
                    🎉 Parabéns! Você precisou de {validAttemptsCount} chute
                    {validAttemptsCount > 1 ? 's' : ''} válido{validAttemptsCount > 1 ? 's' : ''}!
                  </p>
                )}
              </div>
            </div>

            {/* BOTÃO JOGAR NOVAMENTE */}
            {(isWon || isGameOver) && (
              <button
                type="button"
                onClick={() => startNewGame(difficulty)}
                className="w-full py-3 bg-cajua-charcoal text-white font-fredoka font-bold text-base rounded-2xl border-2 border-cajua-charcoal shadow-pop btn-pop flex items-center justify-center gap-2 hover:bg-neutral-800"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Jogar Novamente ({currentDiff.label})</span>
              </button>
            )}
          </div>

          {/* HISTÓRICO DE CHUTES DA RODADA */}
          {guessHistory.length > 0 && (
            <div className="bg-white p-4 sm:p-5 rounded-3xl border-4 border-cajua-charcoal shadow-pop space-y-2.5">
              <div className="flex items-center gap-2 text-cajua-charcoal font-fredoka font-bold text-xs sm:text-sm">
                <History className="w-4 h-4 text-cajua-blue" />
                <span>Histórico de Chutes Válidos Desta Partida:</span>
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {guessHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-xl bg-cajua-sand/70 border border-cajua-charcoal/20 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-fredoka font-bold bg-white px-1.5 py-0.5 rounded border border-cajua-charcoal/30">
                        #{item.guessNumber}
                      </span>
                      <span className="font-fredoka font-extrabold text-sm text-cajua-charcoal">
                        {item.value}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 font-medium">
                      {item.type === 'higher' && (
                        <span className="text-red-700 flex items-center gap-1">
                          <ArrowDownCircle className="w-3.5 h-3.5" /> É menor
                        </span>
                      )}
                      {item.type === 'lower' && (
                        <span className="text-blue-700 flex items-center gap-1">
                          <ArrowUpCircle className="w-3.5 h-3.5" /> É maior
                        </span>
                      )}
                      {item.type === 'correct' && (
                        <span className="text-green-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Acertou!
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* COLUNA DIREITA: PÓDIO E RANKING NEON (5 colunas) */}
        <div className="lg:col-span-5 flex flex-col">
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
