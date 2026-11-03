import React from 'react';
import { GameState, SeasonStats } from '../types/game';
import { CLUBS, LEAGUES } from '../data/clubs';
import { TROPHY_IMG } from '../data/avatars';
import { Trophy, Award, Calendar, TrendingUp, Star } from 'lucide-react';

interface CareerHistoryViewProps {
  state: GameState;
}

export const CareerHistoryView: React.FC<CareerHistoryViewProps> = ({ state }) => {
  const { player, seasonHistory, matchHistory, trophies, unlockedMilestones } = state;

  // Career aggregate statistics
  const totalMatches = matchHistory.length;
  const totalGoals = matchHistory.reduce((acc, m) => acc + m.goals, 0);
  const totalAssists = matchHistory.reduce((acc, m) => acc + m.assists, 0);
  const careerAvgRating =
    totalMatches > 0
      ? (matchHistory.reduce((acc, m) => acc + m.playerRating, 0) / totalMatches).toFixed(2)
      : '0.00';

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white tracking-wide">커리어 기록 & 명예의 전당</h2>
          </div>
          <p className="text-xs text-slate-400">
            선수의 통산 출전 및 공격 포인트 기록, 시즌별 발자취, 획득한 우승 트로피를 확인합니다.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-950/60 px-4 py-2 rounded-xl border border-slate-800 shrink-0">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span className="text-xs font-semibold text-white">
            획득 트로피: <strong className="text-amber-300 font-mono text-sm">{trophies.length}개</strong>
          </span>
        </div>
      </div>

      {/* Career Totals 4-Box Metric Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-center">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">통산 출전 경기</span>
          <span className="font-athletic text-3xl font-black text-white mt-1 block font-mono tabular-nums">
            {totalMatches} <span className="text-xs text-slate-400 font-normal">경기</span>
          </span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-center">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">통산 득점 (골)</span>
          <span className="font-athletic text-3xl font-black text-emerald-400 mt-1 block font-mono tabular-nums">
            {totalGoals} <span className="text-xs text-slate-400 font-normal">골</span>
          </span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-center">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">통산 도움 (어시스트)</span>
          <span className="font-athletic text-3xl font-black text-sky-400 mt-1 block font-mono tabular-nums">
            {totalAssists} <span className="text-xs text-slate-400 font-normal">도움</span>
          </span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-center">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">통산 평균 평점</span>
          <span className="font-athletic text-3xl font-black text-amber-300 mt-1 block font-mono tabular-nums">
            ★ {careerAvgRating}
          </span>
        </div>
      </div>

      {/* Trophy Cabinet & Golden Trophy Visual */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>트로피 진열장 (Trophy Cabinet)</span>
          </h3>
          <span className="text-xs text-slate-500">시즌 1위 달성 시 영구 소장</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-4 rounded-xl overflow-hidden border border-amber-500/30 relative aspect-[4/3] bg-slate-950 flex items-center justify-center">
            <img
              src={TROPHY_IMG}
              alt="Champion Trophy"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
            <div className="absolute bottom-2 inset-x-2 text-center">
              <span className="text-[11px] font-bold text-amber-300 drop-shadow">
                THE GLORY TROPHY
              </span>
            </div>
          </div>

          <div className="md:col-span-8 space-y-2.5">
            {trophies.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800">
                아직 우승 트로피가 없습니다. 정규 시즌 1위를 차지하여 첫 트로피를 들어올리세요!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {trophies.map((t, i) => (
                  <div
                    key={i}
                    className="p-3.5 bg-slate-950/70 border border-amber-500/30 rounded-xl flex items-center gap-3"
                  >
                    <Trophy className="w-6 h-6 text-amber-400 shrink-0" />
                    <div>
                      <h4 className="font-bold text-xs text-white">{t}</h4>
                      <span className="text-[10px] text-amber-300/80">공식 리그 챔피언 등극</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Season-by-Season History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            시즌별 공식 기록 아카이브
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">시즌</th>
                <th className="py-3 px-4">소속 구단</th>
                <th className="py-3 px-3 text-center">출전</th>
                <th className="py-3 px-3 text-center">득점</th>
                <th className="py-3 px-3 text-center">도움</th>
                <th className="py-3 px-3 text-center">M.O.T.M</th>
                <th className="py-3 px-3 text-center">평균 평점</th>
                <th className="py-3 px-4">주요 성과</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {seasonHistory.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-slate-500">
                    현재 데뷔 시즌({state.currentSeason})을 치르는 중입니다. 시즌 종료 후 기록이 아카이브에 영구 저장됩니다.
                  </td>
                </tr>
              ) : (
                seasonHistory.map((s: SeasonStats, idx: number) => {
                  const club = CLUBS[s.clubId];
                  return (
                    <tr key={idx} className="hover:bg-slate-800/40 text-slate-300">
                      <td className="py-3 px-4 font-mono font-bold text-white">{s.season}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {club && (
                            <span
                              className="w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center"
                              style={{ backgroundColor: club.badgeColor, color: club.badgeTextColor }}
                            >
                              {club.shortName.slice(0, 2)}
                            </span>
                          )}
                          <span>{club ? club.name : s.clubId}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono tabular-nums">{s.appearances}</td>
                      <td className="py-3 px-3 text-center font-mono tabular-nums text-emerald-400">{s.goals}</td>
                      <td className="py-3 px-3 text-center font-mono tabular-nums text-sky-400">{s.assists}</td>
                      <td className="py-3 px-3 text-center font-mono tabular-nums text-amber-300">{s.motmCount}</td>
                      <td className="py-3 px-3 text-center font-mono tabular-nums font-bold text-white">
                        {s.averageRating.toFixed(1)}
                      </td>
                      <td className="py-3 px-4 text-emerald-300">
                        {s.trophiesWon.join(', ') || '시즌 완주'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
