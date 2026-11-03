import React from 'react';
import { GameState } from '../types/game';
import { TROPHY_IMG } from '../data/avatars';
import { Trophy, Star, ArrowRight, Award } from 'lucide-react';

interface SeasonSummaryModalProps {
  state: GameState;
  onAdvance: () => void;
}

export const SeasonSummaryModal: React.FC<SeasonSummaryModalProps> = ({ state, onAdvance }) => {
  const { player, currentClub, currentSeason, standings, matchHistory } = state;

  const sortedStandings = Object.values(standings).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.goalDiff - a.goalDiff;
  });

  const isChampion = sortedStandings.length > 0 && sortedStandings[0].clubId === currentClub.id;
  const myRank = sortedStandings.findIndex((s) => s.clubId === currentClub.id) + 1;

  const seasonMatches = matchHistory.filter((m) => m.season === currentSeason);
  const apps = seasonMatches.length;
  const goals = seasonMatches.reduce((acc, m) => acc + m.goals, 0);
  const assists = seasonMatches.reduce((acc, m) => acc + m.assists, 0);
  const avgRating =
    apps > 0
      ? (seasonMatches.reduce((acc, m) => acc + m.playerRating, 0) / apps).toFixed(2)
      : '0.00';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-center space-y-6">
        <div>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
            {currentSeason} 공식 시즌 종료 리포트
          </span>
          <h2 className="font-athletic text-3xl font-black text-white mt-1">
            {isChampion ? '🏆 리그 우승 & 챔피언 등극!' : `시즌 ${myRank}위로 최종 마감`}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            선수단의 한 시즌 여정이 마무리되었습니다. 개인 기록 및 다음 시즌 준비 사항을 확인하세요.
          </p>
        </div>

        {/* Champion Trophy Visual if champion */}
        {isChampion && (
          <div className="relative w-48 h-36 mx-auto rounded-xl overflow-hidden border border-amber-500/40 shadow-lg shadow-amber-500/20">
            <img src={TROPHY_IMG} alt="Trophy" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
            <div className="absolute bottom-1.5 inset-x-0 text-center font-bold text-xs text-amber-300">
              우승 트로피 획득!
            </div>
          </div>
        )}

        {/* Season Stat Grid */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
            <span className="text-[11px] text-slate-400 block">시즌 출전</span>
            <span className="font-mono text-xl font-bold text-white tabular-nums">{apps}</span>
          </div>
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
            <span className="text-[11px] text-slate-400 block">시즌 득점</span>
            <span className="font-mono text-xl font-bold text-emerald-400 tabular-nums">{goals}</span>
          </div>
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
            <span className="text-[11px] text-slate-400 block">시즌 도움</span>
            <span className="font-mono text-xl font-bold text-sky-400 tabular-nums">{assists}</span>
          </div>
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
            <span className="text-[11px] text-slate-400 block">시즌 평점</span>
            <span className="font-mono text-xl font-bold text-amber-300 tabular-nums">{avgRating}</span>
          </div>
        </div>

        {/* Off-season changes notice */}
        <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl text-left text-xs space-y-1.5 text-slate-300">
          <div className="font-bold text-white mb-1 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>오프시즌 갱신 안내</span>
          </div>
          <div>· 선수 나이가 1세 증가합니다 ({player.age}세 → {player.age + 1}세).</div>
          <div>· 계약 잔여 기간이 1년 차감됩니다 (남은 기간: {Math.max(0, player.contractYears - 1)}년).</div>
          <div>· 비시즌 휴식으로 체력이 100% 완전 회복되며 여름 이적 시장이 개방됩니다.</div>
        </div>

        <button
          onClick={onAdvance}
          className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-athletic text-base font-black rounded-xl tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
        >
          <span>새 시즌으로 진입하기 (Next Season)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
