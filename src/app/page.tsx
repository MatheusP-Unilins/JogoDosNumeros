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
  Trash2,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import { DIFFICULTIES, DifficultyKey, GuessRecord } from '@/types/game';
import { RankingPodium } from '@/components/RankingPodium';
import { SmooshCupGraphic } from '@/components/DecorativeGraphics';
import { ScoreEntry } from '@/lib/db';

export default function GamePage() {
  // 1. Identificação do Jogador
  const [playerNameInput, setPlayerNameInput] = useState<string>('');
  const [activePlayerName, setActivePlayerName] = useState<string>('');
  const [difficulty, setDifficulty] = useState<DifficultyKey>('iniciante');

  // 2. Estado do Jogo Ativo
  const [secretNumber, setSecretNumber] = useState<number>(0);
  const [inputVal, setInputVal] = useState<string>('');
  const [guessHistory, setGuessHistory] = useState<GuessRecord[]>([]);
  const [usedNumbers, setUsedNumbers] = useState<Set<number>>(new Set());
  const [validAttemptsCount, setValidAttemptsCount] = useState<number>(0);

  // 3. Status da Rodada
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: 'info' | 'warning' | 'error' | 'success';
  }>({
    text: 'Faça o seu primeiro chute!',
    type: 'info',
  });
  const [isWon, setIsWon] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  // 4. Rankings e Pontuações
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [isLoadingScores, setIsLoadingScores] = useState<boolean>(false);
  const [rankingDifficulty, setRankingDifficulty] = useState<DifficultyKey>('iniciante');

  const currentDiff = DIFFICULTIES[difficulty];
  const remainingChances = currentDiff.maxAttempts - validAttemptsCount;

  // Carregar scores do Neon
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

  // Resetar scores do Hall da Fama
  const handleResetScores = async (diffKey?: DifficultyKey) => {
    try {
      setIsLoadingScores(true);
      await fetch(`/api/scores${diffKey ? `?difficulty=${diffKey}` : ''}`, {
        method: 'DELETE',
      });
      fetchScores(diffKey);
    } catch (e) {
      console.error('Falha ao resetar scores:', e);
    } finally {
      setIsLoadingScores(false);
    }
  };

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

  // Submeter nome do jogador para liberar o jogo
  const handleConfirmPlayerName = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = playerNameInput.trim();
    if (!trimmed) return;
    setActivePlayerName(trimmed);
    startNewGame(difficulty);
  };

  // Trocar de jogador
  const handleChangePlayer = () => {
    setActivePlayerName('');
    setPlayerNameInput('');
    setGuessHistory([]);
    setUsedNumbers(new Set());
    setValidAttemptsCount(0);
    setIsWon(false);
    setIsGameOver(false);
    setInputVal('');
  };

  // Limpar histórico da partida
  const handleClearHistory = () => {
    setGuessHistory([]);
    setUsedNumbers(new Set());
    setValidAttemptsCount(0);
    setStatusMessage({
      text: 'Histórico da partida limpo com sucesso!',
      type: 'info',
    });
  };

  // Lógica de Processamento do Chute
  const handleMakeGuess = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isWon || isGameOver || !activePlayerName) return;

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

    // Bloqueio estrito de valores menores que o mínimo
    if (guess < currentDiff.min) {
      setStatusMessage({
        text: `Valor inválido: ${guess}. O número não pode ser menor que ${currentDiff.min}.`,
        type: 'error',
      });
      setInputVal('');
      return;
    }

    // Bloqueio estrito de valores maiores que o máximo
    if (guess > currentDiff.max) {
      setStatusMessage({
        text: `Valor acima do valor máximo possível (Maior que ${currentDiff.max})`,
        type: 'error',
      });
      setInputVal('');
      return;
    }

    // Validação de Chute Duplicado
    if (usedNumbers.has(guess)) {
      setStatusMessage({
        text: 'Valor duplicado, já foi usado',
        type: 'warning',
      });
      setInputVal('');
      return;
    }

    // Chute Válido: contabiliza
    const nextAttempts = validAttemptsCount + 1;
    setValidAttemptsCount(nextAttempts);

    const nextUsed = new Set(usedNumbers);
    nextUsed.add(guess);
    setUsedNumbers(nextUsed);

    // Checagem de Acerto
    if (guess === secretNumber) {
      setIsWon(true);
      const winMessage = `Acertou! O número escolhido foi ${secretNumber}`;
      setStatusMessage({
        text: winMessage,
        type: 'success',
      });

      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#FFCA28', '#FF7043', '#E53935', '#43A047', '#1E88E5'],
        });
      } catch (err) {}

      setGuessHistory((prev) => [
        {
          value: guess,
          feedback: winMessage,
          type: 'correct',
          guessNumber: nextAttempts,
        },
        ...prev,
      ]);

      try {
        await fetch('/api/scores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            player_name: activePlayerName,
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

    // Chute Incorreto: TEXTOS 100% IDÊNTICOS ENTRE O BANNER E O HISTÓRICO
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
      {/* HEADER PRINCIPAL */}
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
              Descubra o número secreto com a menor quantidade de palpites!
            </p>
          </div>
        </div>

        {/* Status do Jogador Ativo no Topo */}
        {activePlayerName && (
          <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-3 bg-cajua-sand p-3 rounded-2xl border-2 border-cajua-charcoal shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-cajua-yellow border-2 border-cajua-charcoal flex items-center justify-center font-bold text-xs">
                <UserCheck className="w-4 h-4 text-cajua-charcoal" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block leading-none">
                  Jogador Atual
                </span>
                <span className="font-fredoka font-bold text-sm text-cajua-charcoal">
                  {activePlayerName}
                </span>
              </div>
            </div>
            <button
              onClick={handleChangePlayer}
              className="text-xs font-fredoka font-bold text-neutral-600 hover:text-cajua-charcoal bg-white hover:bg-neutral-100 px-2.5 py-1.5 rounded-xl border border-cajua-charcoal shadow-sm transition-all"
            >
              Trocar
            </button>
          </div>
        )}
      </header>

      {/* TELA DE BOAS-VINDAS / IDENTIFICAÇÃO OBRIGATÓRIA */}
      {!activePlayerName ? (
        <div className="bg-white p-6 sm:p-12 rounded-3xl border-4 border-cajua-charcoal shadow-pop max-w-xl mx-auto text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-cajua-yellow border-3 border-cajua-charcoal mx-auto flex items-center justify-center shadow-pop">
            <User className="w-8 h-8 text-cajua-charcoal" />
          </div>
          <div>
            <h2 className="font-fredoka text-2xl sm:text-3xl font-extrabold text-cajua-charcoal">
              Identifique-se para Jogar
            </h2>
            <p className="text-sm text-neutral-600 font-medium mt-1">
              Informe seu nome ou apelido para registrar sua pontuação no Hall da Fama!
            </p>
          </div>

          <form onSubmit={handleConfirmPlayerName} className="space-y-4 max-w-sm mx-auto">
            <input
              type="text"
              value={playerNameInput}
              onChange={(e) => setPlayerNameInput(e.target.value)}
              placeholder="Digite seu nome (Ex: Matheus)"
              maxLength={25}
              autoFocus
              className="w-full px-4 py-3 rounded-2xl border-3 border-cajua-charcoal font-fredoka text-lg text-center focus:outline-none focus:ring-4 focus:ring-cajua-yellow shadow-inner"
            />
            <button
              type="submit"
              disabled={!playerNameInput.trim()}
              className="w-full py-3.5 bg-cajua-yellow hover:bg-amber-400 disabled:bg-neutral-200 text-cajua-charcoal font-fredoka font-bold text-lg rounded-2xl border-3 border-cajua-charcoal shadow-pop btn-pop disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span>Começar Desafio</span>
              <Play className="w-5 h-5 fill-current" />
            </button>
          </form>
        </div>
      ) : (
        /* ÁREA CENTRAL DO JOGO */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
          {/* COLUNA ESQUERDA: TABULEIRO E AÇÕES */}
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
                      min={currentDiff.min}
                      max={currentDiff.max}
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
                      🎉 Parabéns, {activePlayerName}! Você acertou com {validAttemptsCount} chute
                      {validAttemptsCount > 1 ? 's' : ''} válido{validAttemptsCount > 1 ? 's' : ''}!
                    </p>
                  )}
                </div>
              </div>

              {/* OPÇÕES AO FINALIZAR PARTIDA */}
              {(isWon || isGameOver) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => startNewGame(difficulty)}
                    className="py-3 px-4 bg-cajua-yellow hover:bg-amber-400 text-cajua-charcoal font-fredoka font-bold text-sm sm:text-base rounded-2xl border-2 border-cajua-charcoal shadow-pop btn-pop flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Jogar Novamente ({activePlayerName})</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleChangePlayer}
                    className="py-3 px-4 bg-cajua-charcoal hover:bg-neutral-800 text-white font-fredoka font-bold text-sm sm:text-base rounded-2xl border-2 border-cajua-charcoal shadow-pop btn-pop flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Outro Jogador</span>
                  </button>
                </div>
              )}
            </div>

            {/* HISTÓRICO DE CHUTES COM TEXTO EXATO E BOTÃO DE LIMPAR */}
            {guessHistory.length > 0 && (
              <div className="bg-white p-4 sm:p-5 rounded-3xl border-4 border-cajua-charcoal shadow-pop space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-cajua-charcoal font-fredoka font-bold text-xs sm:text-sm">
                    <History className="w-4 h-4 text-cajua-blue" />
                    <span>Histórico de Chutes Válidos:</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearHistory}
                    className="text-[11px] font-fredoka font-bold text-red-600 hover:text-red-700 flex items-center gap-1 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-lg border border-red-200 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Limpar histórico</span>
                  </button>
                </div>

                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {guessHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-cajua-sand/70 border border-cajua-charcoal/20 text-xs sm:text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-fredoka font-bold bg-white px-2 py-0.5 rounded-md border border-cajua-charcoal/30">
                          #{item.guessNumber}
                        </span>
                        <span className="font-fredoka font-extrabold text-base text-cajua-charcoal">
                          {item.value}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 font-fredoka font-semibold">
                        {item.type === 'higher' && (
                          <span className="text-red-700 flex items-center gap-1.5 bg-red-100/90 px-2.5 py-1 rounded-lg border border-red-300">
                            <ArrowDownCircle className="w-4 h-4 text-red-600" />
                            <span>{item.value} é maior que o valor escolhido</span>
                          </span>
                        )}
                        {item.type === 'lower' && (
                          <span className="text-blue-700 flex items-center gap-1.5 bg-blue-100/90 px-2.5 py-1 rounded-lg border border-blue-300">
                            <ArrowUpCircle className="w-4 h-4 text-blue-600" />
                            <span>{item.value} é menor que o valor escolhido</span>
                          </span>
                        )}
                        {item.type === 'correct' && (
                          <span className="text-green-700 flex items-center gap-1.5 bg-green-100/90 px-2.5 py-1 rounded-lg border border-green-300">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <span>Acertou!</span>
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
          <div className="lg:col-span-5 flex flex-col">
            <RankingPodium
              scores={scores}
              activeDifficulty={rankingDifficulty}
              onSelectDifficulty={(d) => {
                setRankingDifficulty(d);
                fetchScores(d);
              }}
              onResetScores={(d) => handleResetScores(d)}
              isLoading={isLoadingScores}
            />
          </div>
        </div>
      )}
    </div>
  );
}
