import React from 'react';
import { Club, MatchResult, Player } from '../types/game';
import { Trophy, Star, CheckCircle2, ArrowRight } from 'lucide-react';

interface MatchResultModalProps {
  result: MatchResult;
  player: Player;
  currentClub: Club;
  opponentClub: Club;
  onClose: () => void;
}

export const MatchResultModal: React.FC<MatchResultModalProps> = ({
  result,
  player,
  currentClub,
  opponentClub,
  onClose,
}) => {
  const isWin = result.homeScore > result.awayScore;
  const isDraw = result.homeScore === result.awayScore;

  const resultTitle = isWin ? '경기 승리!' : isDraw ? '무승부' : '경기 패배';
  const resultColor = isWin ? 'text-emerald-400' : isDraw ? 'text-amber-400' : 'text-rose-400';

  const isMOTM = result.playerRating >= 8.5;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Header Title */}
        <div className="text-center pb-4 border-b border-slate-800">
          <div className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
            매치데이 {result.round} 경기 결과 리포트
          </div>
          <h2 className={`font-athletic text-3xl font-black mt-1 ${resultColor}`}>
            {resultTitle}
          </h2>

          {/* Big Scoreline */}
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="text-right flex-1">
              <span className="font-bold text-base text-white block">{currentClub.name}</span>
              <span className="text-xs text-slate-400">HOME</span>
            </div>
            <div className="px-5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl font-athletic text-3xl font-black text-amber-300">
              {result.homeScore} : {result.awayScore}
            </div>
            <div className="text-left flex-1">
              <span className="font-bold text-base text-white block">{opponentClub.name}</span>
              <span className="text-xs text-slate-400">AWAY</span>
            </div>
          </div>
        </div>

        {/* Player Rating & Performance Highlight */}
        <div className="py-5">
          <div className="flex items-center justify-between p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-800 shrink-0 border border-slate-700">
                <img
                  src={player.avatarUrl}
                  alt={player.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">{player.name}</span>
                  {isMOTM && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/40">
                      <Star className="w-3 h-3 fill-amber-400" />
                      M.O.T.M
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400">
                  출전: {result.playedMinutes}분 · 포지션 {player.position}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block">개인 평점</span>
              <span className="font-athletic text-3xl font-black text-emerald-400 font-mono tabular-nums">
                {result.playerRating.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Stats Matrix Grid */}
          <div className="grid grid-cols-4 gap-2.5 mt-4 text-center">
            <div className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl">
              <span className="text-[11px] text-slate-400 block">득점 (골)</span>
              <span className="font-mono text-xl font-bold text-white tabular-nums">{result.goals}</span>
            </div>
            <div className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl">
              <span className="text-[11px] text-slate-400 block">도움 (어시스트)</span>
              <span className="font-mono text-xl font-bold text-white tabular-nums">{result.assists}</span>
            </div>
            <div className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl">
              <span className="text-[11px] text-slate-400 block">슈팅 (유효)</span>
              <span className="font-mono text-xl font-bold text-white tabular-nums">
                {result.shots} ({result.shotsOnTarget})
              </span>
            </div>
            <div className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl">
              <span className="text-[11px] text-slate-400 block">패스 성공률</span>
              <span className="font-mono text-xl font-bold text-white tabular-nums">
                {result.passSuccessRate}%
              </span>
            </div>
          </div>

          {/* Stamina & Morale changes */}
          <div className="mt-4 p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs text-slate-300">
            <div>
              잔여 체력:{' '}
              <span className="font-mono font-bold text-amber-400 tabular-nums">
                {result.postMatchStamina}%
              </span>
            </div>
            <div>
              경기 후 사기: <span className="font-bold text-emerald-400">{result.postMatchMorale}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-athletic text-base font-black rounded-xl tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
          >
            <span>경기 결과 반영 & 대시보드로 이동</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
