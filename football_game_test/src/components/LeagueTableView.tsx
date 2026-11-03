import React from 'react';
import { Club, GameState, LeagueStanding } from '../types/game';
import { CLUBS, LEAGUES } from '../data/clubs';
import { Trophy, Shield, Award } from 'lucide-react';

interface LeagueTableViewProps {
  state: GameState;
  onSelectClub?: (club: Club) => void;
}

export const LeagueTableView: React.FC<LeagueTableViewProps> = ({ state }) => {
  const { currentClub, standings, currentSeason, currentRound, totalRounds } = state;
  const currentLeague = LEAGUES.find((l) => l.id === currentClub.leagueId) || LEAGUES[2];

  // Sort standings: Points desc -> GoalDiff desc -> GoalsFor desc
  const sortedStandings: LeagueStanding[] = Object.values(standings).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
    return b.goalsFor - a.goalsFor;
  });

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white tracking-wide">{currentLeague.name}</h2>
          </div>
          <p className="text-xs text-slate-400">
            {currentSeason} 정규 시즌 · 현재 진행: {currentRound - 1} / {totalRounds} 라운드
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
          <span>1위: 챔피언 트로피 수여</span>
        </div>
      </div>

      {/* Standings Table Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 w-12 text-center">순위</th>
                <th className="py-3 px-4">구단</th>
                <th className="py-3 px-3 text-center">경기</th>
                <th className="py-3 px-3 text-center">승</th>
                <th className="py-3 px-3 text-center">무</th>
                <th className="py-3 px-3 text-center">패</th>
                <th className="py-3 px-3 text-center">득점</th>
                <th className="py-3 px-3 text-center">실점</th>
                <th className="py-3 px-3 text-center">득실</th>
                <th className="py-3 px-4 text-center font-bold text-white">승점</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {sortedStandings.map((standing, index) => {
                const rank = index + 1;
                const club = CLUBS[standing.clubId];
                if (!club) return null;
                const isMyClub = club.id === currentClub.id;

                return (
                  <tr
                    key={standing.clubId}
                    className={`transition-colors ${
                      isMyClub
                        ? 'bg-emerald-950/30 font-bold border-l-2 border-emerald-400 text-white'
                        : 'hover:bg-slate-800/40 text-slate-300'
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3.5 px-4 text-center font-mono font-bold">
                      {rank === 1 ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-black">
                          1
                        </span>
                      ) : (
                        rank
                      )}
                    </td>

                    {/* Club */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black border border-white/20 shrink-0"
                          style={{ backgroundColor: club.badgeColor, color: club.badgeTextColor }}
                        >
                          {club.shortName.slice(0, 3)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm text-white">{club.name}</span>
                            {isMyClub && (
                              <span className="text-[10px] px-1.5 py-0.2 bg-emerald-900 text-emerald-300 rounded font-semibold">
                                내 구단
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            전력 OVR {club.overallRating} · {club.stadiumName}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Played */}
                    <td className="py-3.5 px-3 text-center font-mono tabular-nums">{standing.played}</td>
                    {/* Won */}
                    <td className="py-3.5 px-3 text-center font-mono tabular-nums text-emerald-400">{standing.won}</td>
                    {/* Drawn */}
                    <td className="py-3.5 px-3 text-center font-mono tabular-nums text-slate-400">{standing.drawn}</td>
                    {/* Lost */}
                    <td className="py-3.5 px-3 text-center font-mono tabular-nums text-rose-400">{standing.lost}</td>
                    {/* Goals For */}
                    <td className="py-3.5 px-3 text-center font-mono tabular-nums">{standing.goalsFor}</td>
                    {/* Goals Against */}
                    <td className="py-3.5 px-3 text-center font-mono tabular-nums text-slate-400">{standing.goalsAgainst}</td>
                    {/* Goal Diff */}
                    <td className="py-3.5 px-3 text-center font-mono tabular-nums">
                      {standing.goalDiff > 0 ? `+${standing.goalDiff}` : standing.goalDiff}
                    </td>
                    {/* Points */}
                    <td className="py-3.5 px-4 text-center font-athletic text-xl font-black text-amber-300 font-mono tabular-nums">
                      {standing.points}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
