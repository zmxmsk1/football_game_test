import React from 'react';
import { Club, GameState, MatchResult } from '../types/game';
import { getNextOpponent } from '../engine/gameEngine';
import { PlayerCard } from './PlayerCard';
import { playSound } from '../utils/audio';
import {
  Play,
  Dumbbell,
  Heart,
  TrendingUp,
  DollarSign,
  Calendar,
  Award,
  ChevronRight,
  Shield,
  Save,
} from 'lucide-react';

interface DashboardViewProps {
  state: GameState;
  onStartMatch: () => void;
  onGoTraining: () => void;
  onRest: () => void;
  onGoTransfers: () => void;
  onGoHistory: () => void;
  onSaveGame: () => void;
  soundEnabled: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  state,
  onStartMatch,
  onGoTraining,
  onRest,
  onGoTransfers,
  onGoHistory,
  onSaveGame,
  soundEnabled,
}) => {
  const { player, currentClub, currentSeason, currentRound, standings, matchHistory, pendingOffers } = state;

  const nextOpponent = getNextOpponent(currentClub, currentRound);
  const myStanding = standings[currentClub.id];

  // Calculate current season metrics
  const seasonMatches = matchHistory.filter((m) => m.season === currentSeason);
  const apps = seasonMatches.length;
  const goals = seasonMatches.reduce((acc, m) => acc + m.goals, 0);
  const assists = seasonMatches.reduce((acc, m) => acc + m.assists, 0);
  const avgRating =
    apps > 0
      ? (seasonMatches.reduce((acc, m) => acc + m.playerRating, 0) / apps).toFixed(1)
      : '0.0';

  // Determine current league rank
  const sortedStandings = Object.values(standings).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.goalDiff - a.goalDiff;
  });
  const currentRank = sortedStandings.findIndex((s) => s.clubId === currentClub.id) + 1;

  // Format currency
  const formatEuro = (val: number) => {
    if (val >= 1000000) return `€${(val / 1000000).toFixed(1)}M`;
    return `€${(val / 1000).toFixed(0)}K`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Top Banner: Next Match Spotlight */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Match Day Info */}
          <div className="space-y-2 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              <Calendar className="w-4 h-4" />
              <span>
                다음 경기: {currentSeason} 시즌 제 {currentRound}라운드
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white">
              {currentClub.name} <span className="text-slate-400 font-normal">vs</span> {nextOpponent.name}
            </h2>
            <p className="text-xs text-slate-400">
              홈 경기장: {currentClub.stadiumName} (상대 전력 OVR {nextOpponent.overallRating})
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                playSound('kick', soundEnabled);
                onStartMatch();
              }}
              className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-athletic text-lg font-black rounded-xl tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/25 active:scale-[0.98]"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              <span>경기 시작하기</span>
            </button>

            <button
              onClick={() => {
                playSound('click', soundEnabled);
                onGoTraining();
              }}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Dumbbell className="w-4 h-4 text-emerald-400" />
              <span>훈련 센터</span>
            </button>

            <button
              onClick={() => {
                playSound('click', soundEnabled);
                onRest();
              }}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Heart className="w-4 h-4 text-rose-400" />
              <span>휴식 (체력 회복)</span>
            </button>

            <button
              onClick={() => {
                playSound('click', soundEnabled);
                onSaveGame();
              }}
              className="px-3.5 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold rounded-xl border border-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="게임 저장"
            >
              <Save className="w-4 h-4 text-sky-400" />
              <span>저장</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main 3-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Column 1: Player Card & Condition Gauges (4 cols) */}
        <div className="md:col-span-4 flex flex-col items-center gap-4">
          <PlayerCard player={player} size="md" />

          {/* Condition Gauges Box */}
          <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              선수 상태 및 계약
            </h4>

            {/* Stamina Bar */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">체력 (컨디션)</span>
                <span className={`font-mono font-bold tabular-nums ${player.stamina < 30 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {player.stamina}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    player.stamina < 30 ? 'bg-rose-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${player.stamina}%` }}
                />
              </div>
            </div>

            {/* Morale & Role */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="p-2 bg-slate-950/60 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block">사기</span>
                <span className="font-bold text-emerald-400">{player.morale}</span>
              </div>
              <div className="p-2 bg-slate-950/60 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block">팀내 역할</span>
                <span className="font-bold text-white truncate block">{player.squadRole}</span>
              </div>
            </div>

            {/* Contract & Wage */}
            <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">계약 잔여 기간</span>
                <span className="font-bold text-amber-300">{player.contractYears}년</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">주급 (Weekly)</span>
                <span className="font-mono font-bold text-white tabular-nums">
                  €{player.weeklyWage.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">시장 가치 (Market Value)</span>
                <span className="font-mono font-bold text-emerald-400 tabular-nums">
                  {formatEuro(player.marketValue)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Season Performance & Standing (5 cols) */}
        <div className="md:col-span-5 space-y-4">
          {/* Season Stats Summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>{currentSeason} 시즌 공식 기록</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono tabular-nums">
                리그 {currentRank}위 / 8개 팀
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
                <span className="text-[11px] text-slate-400 block">출전</span>
                <span className="font-mono text-xl font-bold text-white tabular-nums">{apps}</span>
              </div>
              <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
                <span className="text-[11px] text-slate-400 block">득점</span>
                <span className="font-mono text-xl font-bold text-emerald-400 tabular-nums">{goals}</span>
              </div>
              <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
                <span className="text-[11px] text-slate-400 block">도움</span>
                <span className="font-mono text-xl font-bold text-sky-400 tabular-nums">{assists}</span>
              </div>
              <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
                <span className="text-[11px] text-slate-400 block">평균 평점</span>
                <span className="font-mono text-xl font-bold text-amber-300 tabular-nums">{avgRating}</span>
              </div>
            </div>

            {/* Team League Status Mini Card */}
            {myStanding && (
              <div className="p-3.5 bg-slate-950/40 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs"
                    style={{ backgroundColor: currentClub.badgeColor, color: currentClub.badgeTextColor }}
                  >
                    {currentClub.shortName}
                  </div>
                  <div>
                    <span className="font-bold text-white block">{currentClub.name}</span>
                    <span className="text-slate-400 text-[11px]">
                      {myStanding.played}전 {myStanding.won}승 {myStanding.drawn}무 {myStanding.lost}패
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-athletic text-2xl font-black text-emerald-400 font-mono tabular-nums">
                    {myStanding.points}점
                  </span>
                  <span className="text-[10px] text-slate-400 block">득실차 {myStanding.goalDiff > 0 ? `+${myStanding.goalDiff}` : myStanding.goalDiff}</span>
                </div>
              </div>
            )}
          </div>

          {/* Pending Transfer Offer Alert if any */}
          {pendingOffers.length > 0 && (
            <div className="p-4 bg-emerald-950/30 border border-emerald-500/40 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-300">새 이적 제안 도착!</h4>
                  <p className="text-[11px] text-slate-300">
                    다른 구단에서 영입 제안서 {pendingOffers.length}건이 접수되었습니다.
                  </p>
                </div>
              </div>
              <button
                onClick={onGoTransfers}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                확인
              </button>
            </div>
          )}

          {/* Recent Match Log */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              최근 경기 결과 내역
            </h4>
            {seasonMatches.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                아직 진행된 경기가 없습니다. [경기 시작하기] 버튼을 눌러 개막전을 치르세요!
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {seasonMatches.slice(-4).reverse().map((m: MatchResult) => (
                  <div
                    key={m.id}
                    className="p-2.5 bg-slate-950/50 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-white block">
                        R{m.round} vs {m.homeClubId === currentClub.id ? m.awayClubId : m.homeClubId}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {m.goals > 0 && `${m.goals}골 `}
                        {m.assists > 0 && `${m.assists}도움 `}
                        {m.goals === 0 && m.assists === 0 && '선발 출전'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-athletic text-base font-bold text-amber-300">
                        {m.homeScore} : {m.awayScore}
                      </span>
                      <span className="font-mono text-xs font-bold text-emerald-400 tabular-nums">
                        ★ {m.playerRating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Quick Navigation & Milestones (3 cols) */}
        <div className="md:col-span-3 space-y-4">
          {/* Quick Hub Navigation Cards */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              커리어 메뉴 바로가기
            </h4>

            {[
              { label: '이적 시장 & 계약 협상', action: onGoTransfers, icon: <DollarSign className="w-4 h-4 text-emerald-400" /> },
              { label: '커리어 기록 & 트로피 룸', action: onGoHistory, icon: <Award className="w-4 h-4 text-amber-400" /> },
            ].map((btn, i) => (
              <button
                key={i}
                onClick={btn.action}
                className="w-full p-3 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition-all flex items-center justify-between text-xs font-semibold text-slate-200 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  {btn.icon}
                  <span>{btn.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            ))}
          </div>

          {/* Career Milestones */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                달성한 주요 업적 ({state.unlockedMilestones.length})
              </h4>
            </div>

            <div className="space-y-1.5">
              {state.unlockedMilestones.slice(0, 4).map((m, i) => (
                <div
                  key={i}
                  className="p-2 bg-slate-950/40 border border-slate-800/80 rounded-lg text-xs text-slate-300 flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span className="truncate">{m}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
