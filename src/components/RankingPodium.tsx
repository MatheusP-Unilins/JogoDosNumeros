'use client';

import React from 'react';
import { Award, Trophy, Medal, Crown } from 'lucide-react';
import { DIFFICULTIES, DifficultyKey } from '@/types/game';
import { ScoreEntry } from '@/lib/db';

interface RankingPodiumProps {
  scores: ScoreEntry[];
  activeDifficulty: DifficultyKey;
  onSelectDifficulty: (d: DifficultyKey) => void;
  isLoading: boolean;
}

export const RankingPodium: React.FC<RankingPodiumProps> = ({
  scores,
  activeDifficulty,
  onSelectDifficulty,
  isLoading,
}) => {
  // Filtra por dificuldade ativa e ordena por menor número de tentativas
  const filtered = scores
    .filter((s) => s.difficulty === activeDifficulty)
    .sort((a, b) => a.attempts - b.attempts);

  const top1 = filtered[0];
  const top2 = filtered[1];
  const top3 = filtered[2];
  const rest = filtered.slice(3, 10);

  const currentConfig = DIFFICULTIES[activeDifficulty];

  return (
    <div className="bg-white rounded-3xl border-4 border-cajua-charcoal shadow-pop p-6 sm:p-8">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b-2 border-cajua-sand pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cajua-yellow border-2 border-cajua-charcoal flex items-center justify-center shadow-pop">
            <Trophy className="w-6 h-6 text-cajua-charcoal" />
          </div>
          <div>
            <h2 className="font-fredoka text-2xl font-bold text-cajua-charcoal">
              Hall da Fama
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 font-medium">
              Os melhores acertadores com o menor número de chutes
            </p>
          </div>
        </div>

        {/* Difficulty Selector Tabs */}
        <div className="flex gap-2 p-1.5 bg-cajua-sand rounded-2xl border-2 border-cajua-charcoal">
          {(Object.keys(DIFFICULTIES) as DifficultyKey[]).map((key) => {
            const isSelected = activeDifficulty === key;
            return (
              <button
                key={key}
                onClick={() => onSelectDifficulty(key)}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-fredoka font-bold transition-all ${
                  isSelected
                    ? `${DIFFICULTIES[key].badgeBg} border-2 border-cajua-charcoal shadow-pop`
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
        <div className="py-16 text-center">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-cajua-yellow border-t-cajua-charcoal rounded-full mb-3" />
          <p className="font-fredoka text-neutral-600 font-medium">Carregando o ranking...</p>
        </div>
      ) : (
        <>
          {/* PÓDIO TOP 3 */}
          <div className="my-8 pt-6">
            <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end max-w-lg mx-auto">
              {/* 2º Lugar */}
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-slate-200 border-3 border-cajua-charcoal flex items-center justify-center font-fredoka font-bold text-lg sm:text-xl text-slate-700 shadow-pop mb-2">
                  2º
                </div>
                <div className="text-center w-full px-1 mb-2">
                  <p className="font-fredoka font-bold text-xs sm:text-sm truncate text-cajua-charcoal">
                    {top2 ? top2.player_name : 'Disponível'}
                  </p>
                  <span className="text-[10px] sm:text-xs font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full inline-block mt-0.5">
                    {top2 ? `${top2.attempts} chutes` : '-'}
                  </span>
                </div>
                <div className="w-full h-24 sm:h-32 bg-slate-200 rounded-t-2xl border-x-3 border-t-3 border-cajua-charcoal flex items-center justify-center shadow-inner">
                  <Medal className="w-6 h-6 sm:w-8 sm:h-8 text-slate-500" />
                </div>
              </div>

              {/* 1º Lugar (Destaque Maior) */}
              <div className="flex flex-col items-center">
                <Crown className="w-7 h-7 sm:w-9 sm:h-9 text-amber-500 animate-bounce mb-1" />
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-cajua-yellow border-3 border-cajua-charcoal flex items-center justify-center font-fredoka font-bold text-xl sm:text-2xl text-cajua-charcoal shadow-pop mb-2">
                  1º
                </div>
                <div className="text-center w-full px-1 mb-2">
                  <p className="font-fredoka font-bold text-sm sm:text-base truncate text-cajua-charcoal">
                    {top1 ? top1.player_name : 'Disponível'}
                  </p>
                  <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full inline-block mt-0.5 border border-amber-300">
                    {top1 ? `🏆 ${top1.attempts} chute${top1.attempts > 1 ? 's' : ''}` : '-'}
                  </span>
                </div>
                <div className="w-full h-32 sm:h-44 bg-gradient-to-t from-cajua-yellow/70 to-cajua-yellow rounded-t-2xl border-x-3 border-t-3 border-cajua-charcoal flex items-center justify-center shadow-inner">
                  <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-cajua-charcoal" />
                </div>
              </div>

              {/* 3º Lugar */}
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-amber-700/20 border-3 border-cajua-charcoal flex items-center justify-center font-fredoka font-bold text-lg sm:text-xl text-amber-900 shadow-pop mb-2">
                  3º
                </div>
                <div className="text-center w-full px-1 mb-2">
                  <p className="font-fredoka font-bold text-xs sm:text-sm truncate text-cajua-charcoal">
                    {top3 ? top3.player_name : 'Disponível'}
                  </p>
                  <span className="text-[10px] sm:text-xs font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full inline-block mt-0.5">
                    {top3 ? `${top3.attempts} chutes` : '-'}
                  </span>
                </div>
                <div className="w-full h-20 sm:h-24 bg-amber-100 rounded-t-2xl border-x-3 border-t-3 border-cajua-charcoal flex items-center justify-center shadow-inner">
                  <Award className="w-6 h-6 sm:w-7 sm:h-7 text-amber-800" />
                </div>
              </div>
            </div>
            <div className="h-3 w-full bg-cajua-charcoal rounded-full mx-auto" />
          </div>

          {/* LISTA DO 4º AO 10º */}
          {rest.length > 0 && (
            <div className="mt-8">
              <h3 className="font-fredoka text-sm uppercase tracking-wider text-neutral-500 font-bold mb-3">
                Outros Acertos Notáveis (Top 4 ao 10)
              </h3>
              <div className="space-y-2">
                {rest.map((entry, idx) => (
                  <div
                    key={entry.id || idx}
                    className="flex items-center justify-between p-3 rounded-2xl bg-cajua-sand/60 border-2 border-cajua-charcoal/20 hover:border-cajua-charcoal transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-white border-2 border-cajua-charcoal flex items-center justify-center font-fredoka font-bold text-xs text-cajua-charcoal">
                        {idx + 4}
                      </span>
                      <span className="font-fredoka font-bold text-sm text-cajua-charcoal">
                        {entry.player_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-neutral-600 bg-white px-2.5 py-1 rounded-xl border border-neutral-300">
                        {entry.attempts} chutes
                      </span>
                      <span className="text-[11px] text-neutral-600 font-medium hidden sm:inline">
                        (nº {entry.secret_number})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
