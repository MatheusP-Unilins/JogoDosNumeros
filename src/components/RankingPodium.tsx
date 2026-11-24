'use client';

import React, { useState } from 'react';
import { Award, Trophy, Medal, Crown, Trash2 } from 'lucide-react';
import { DIFFICULTIES, DifficultyKey } from '@/types/game';
import { ScoreEntry } from '@/lib/db';

interface RankingPodiumProps {
  scores: ScoreEntry[];
  activeDifficulty: DifficultyKey;
  onSelectDifficulty: (d: DifficultyKey) => void;
  onResetScores: (d?: DifficultyKey) => void;
  isLoading: boolean;
}

export const RankingPodium: React.FC<RankingPodiumProps> = ({
  scores,
  activeDifficulty,
  onSelectDifficulty,
  onResetScores,
  isLoading,
}) => {
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);

  // Filtra por dificuldade ativa e ordena por menor número de tentativas
  const filtered = scores
    .filter((s) => s.difficulty === activeDifficulty)
    .sort((a, b) => a.attempts - b.attempts);

  const top1 = filtered[0];
  const top2 = filtered[1];
  const top3 = filtered[2];
  const rest = filtered.slice(3, 8);

  const handleConfirmReset = () => {
    onResetScores(activeDifficulty);
    setIsConfirmingReset(false);
  };

  return (
    <div className="bg-white rounded-3xl border-4 border-cajua-charcoal shadow-pop p-4 sm:p-5 flex flex-col h-full justify-between overflow-hidden">
      {/* Header & Tabs */}
      <div className="flex flex-col gap-3 border-b-2 border-cajua-sand pb-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cajua-yellow border-2 border-cajua-charcoal flex items-center justify-center shadow-pop shrink-0">
              <Trophy className="w-5 h-5 text-cajua-charcoal" />
            </div>
            <div>
              <h2 className="font-fredoka text-xl font-bold text-cajua-charcoal leading-tight">
                Hall da Fama
              </h2>
              <p className="text-xs text-neutral-500 font-medium leading-tight">
                Menor quantidade de chutes válidos
              </p>
            </div>
          </div>

          {/* Botão de Resetar o Hall da Fama */}
          <div>
            {!isConfirmingReset ? (
              <button
                type="button"
                onClick={() => setIsConfirmingReset(true)}
                title="Resetar Hall da Fama desta dificuldade"
                className="p-2 rounded-xl bg-neutral-100 hover:bg-red-50 text-neutral-500 hover:text-red-600 border border-neutral-300 hover:border-red-300 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleConfirmReset}
                  className="px-2 py-1 rounded-lg bg-red-600 text-white font-fredoka font-bold text-[11px] shadow-sm hover:bg-red-700"
                >
                  Confirmar?
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirmingReset(false)}
                  className="px-2 py-1 rounded-lg bg-neutral-200 text-neutral-700 font-fredoka font-bold text-[11px] hover:bg-neutral-300"
                >
                  X
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Difficulty Selector Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-cajua-sand rounded-xl border-2 border-cajua-charcoal">
          {(Object.keys(DIFFICULTIES) as DifficultyKey[]).map((key) => {
            const isSelected = activeDifficulty === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setIsConfirmingReset(false);
                  onSelectDifficulty(key);
                }}
                className={`py-1.5 px-2 rounded-lg text-xs font-fredoka font-bold text-center transition-all truncate ${
                  isSelected
                    ? `${DIFFICULTIES[key].badgeBg} border border-cajua-charcoal shadow-sm`
                    : 'text-neutral-600 hover:text-cajua-charcoal'
                }`}
              >
                {DIFFICULTIES[key].label}
              </button>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center">
          <div className="inline-block animate-spin w-7 h-7 border-4 border-cajua-yellow border-t-cajua-charcoal rounded-full mb-2" />
          <p className="font-fredoka text-xs text-neutral-600 font-medium">Carregando scores...</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-center my-3">
          {/* PÓDIO TOP 3 */}
          <div className="grid grid-cols-3 gap-2 items-end max-w-sm mx-auto w-full pt-4">
            {/* 2º Lugar */}
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-200 border-2 border-cajua-charcoal flex items-center justify-center font-fredoka font-bold text-sm text-slate-700 shadow-sm mb-1.5">
                2º
              </div>
              <div className="text-center w-full px-0.5 mb-1.5">
                <p className="font-fredoka font-bold text-xs truncate text-cajua-charcoal max-w-[80px] mx-auto">
                  {top2 ? top2.player_name : 'Disponível'}
                </p>
                <span className="text-[10px] font-bold text-neutral-600 bg-neutral-100 px-1.5 py-0.5 rounded-full inline-block mt-0.5 border border-neutral-200">
                  {top2 ? `${top2.attempts} chutes` : '-'}
                </span>
              </div>
              <div className="w-full h-20 sm:h-24 bg-slate-200 rounded-t-xl border-x-2 border-t-2 border-cajua-charcoal flex items-center justify-center shadow-inner">
                <Medal className="w-5 h-5 text-slate-500" />
              </div>
            </div>

            {/* 1º Lugar */}
            <div className="flex flex-col items-center">
              <Crown className="w-6 h-6 text-amber-500 animate-bounce mb-0.5" />
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-cajua-yellow border-2 border-cajua-charcoal flex items-center justify-center font-fredoka font-bold text-base text-cajua-charcoal shadow-sm mb-1.5">
                1º
              </div>
              <div className="text-center w-full px-0.5 mb-1.5">
                <p className="font-fredoka font-bold text-xs sm:text-sm truncate text-cajua-charcoal max-w-[90px] mx-auto">
                  {top1 ? top1.player_name : 'Disponível'}
                </p>
                <span className="text-[10px] sm:text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full inline-block mt-0.5 border border-amber-300">
                  {top1 ? `🏆 ${top1.attempts} chute${top1.attempts > 1 ? 's' : ''}` : '-'}
                </span>
              </div>
              <div className="w-full h-28 sm:h-36 bg-gradient-to-t from-cajua-yellow/80 to-cajua-yellow rounded-t-xl border-x-2 border-t-2 border-cajua-charcoal flex items-center justify-center shadow-inner">
                <Trophy className="w-7 h-7 text-cajua-charcoal" />
              </div>
            </div>

            {/* 3º Lugar */}
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-amber-700/20 border-2 border-cajua-charcoal flex items-center justify-center font-fredoka font-bold text-sm text-amber-900 shadow-sm mb-1.5">
                3º
              </div>
              <div className="text-center w-full px-0.5 mb-1.5">
                <p className="font-fredoka font-bold text-xs truncate text-cajua-charcoal max-w-[80px] mx-auto">
                  {top3 ? top3.player_name : 'Disponível'}
                </p>
                <span className="text-[10px] font-bold text-neutral-600 bg-neutral-100 px-1.5 py-0.5 rounded-full inline-block mt-0.5 border border-neutral-200">
                  {top3 ? `${top3.attempts} chutes` : '-'}
                </span>
              </div>
              <div className="w-full h-16 sm:h-18 bg-amber-100 rounded-t-xl border-x-2 border-t-2 border-cajua-charcoal flex items-center justify-center shadow-inner">
                <Award className="w-5 h-5 text-amber-800" />
              </div>
            </div>
          </div>
          <div className="h-2 w-full bg-cajua-charcoal rounded-full mx-auto" />

          {/* LISTA RESUMIDA DO 4º AO 7º */}
          {rest.length > 0 && (
            <div className="mt-4 pt-3 border-t border-neutral-100">
              <span className="font-fredoka text-[11px] uppercase tracking-wider text-neutral-400 font-bold block mb-2">
                Top 4 em diante
              </span>
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {rest.map((entry, idx) => (
                  <div
                    key={entry.id || idx}
                    className="flex items-center justify-between p-1.5 px-2.5 rounded-xl bg-cajua-sand/50 border border-cajua-charcoal/15 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-5 h-5 rounded-full bg-white border border-cajua-charcoal flex items-center justify-center font-fredoka font-bold text-[10px] text-cajua-charcoal shrink-0">
                        {idx + 4}
                      </span>
                      <span className="font-fredoka font-bold text-xs text-cajua-charcoal truncate">
                        {entry.player_name}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-neutral-600 bg-white px-2 py-0.5 rounded-md border border-neutral-200 shrink-0">
                      {entry.attempts} chutes
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
