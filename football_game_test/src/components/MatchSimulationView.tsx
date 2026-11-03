import React, { useState, useEffect, useRef } from 'react';
import { Club, MatchDecisionOption, MatchDecisionPrompt, MatchEvent, MatchResult, Player } from '../types/game';
import { createDecisionPrompt, simulateMatch } from '../engine/gameEngine';
import { playSound } from '../utils/audio';
import { Play, FastForward, CheckCircle2, AlertTriangle, Shield, Award } from 'lucide-react';
import { STADIUM_BG } from '../data/avatars';

interface MatchSimulationViewProps {
  player: Player;
  currentClub: Club;
  opponentClub: Club;
  round: number;
  season: string;
  soundEnabled: boolean;
  onMatchComplete: (result: MatchResult) => void;
}

export const MatchSimulationView: React.FC<MatchSimulationViewProps> = ({
  player,
  currentClub,
  opponentClub,
  round,
  season,
  soundEnabled,
  onMatchComplete,
}) => {
  const [currentMinute, setCurrentMinute] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [simSpeed, setSimSpeed] = useState<'normal' | 'fast'>('normal');
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [ballPosition, setBallPosition] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [activeDecision, setActiveDecision] = useState<MatchDecisionPrompt | null>(null);
  const [decisionHistory, setDecisionHistory] = useState<{ option: MatchDecisionOption; success: boolean }[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const commentaryEndRef = useRef<HTMLDivElement>(null);
  const decisionTriggeredRef = useRef<boolean>(false);

  // Play initial whistle
  useEffect(() => {
    playSound('whistle', soundEnabled);
  }, [soundEnabled]);

  // Main game tick timer
  useEffect(() => {
    if (!isPlaying || isFinished || activeDecision) return;

    const intervalTime = simSpeed === 'fast' ? 120 : 350;
    const timer = setInterval(() => {
      setCurrentMinute((prev) => {
        const nextMin = prev + 1;

        // Move ball around dynamically on pitch
        const nx = Math.min(88, Math.max(12, 50 + (Math.sin(nextMin * 0.4) * 35) + (Math.random() * 10 - 5)));
        const ny = Math.min(85, Math.max(15, 50 + (Math.cos(nextMin * 0.3) * 30) + (Math.random() * 10 - 5)));
        setBallPosition({ x: nx, y: ny });

        // Trigger interactive decision prompt once around minute 38-44
        if (nextMin >= 40 && !decisionTriggeredRef.current) {
          decisionTriggeredRef.current = true;
          const prompt = createDecisionPrompt(nextMin, player.position);
          setActiveDecision(prompt);
          return nextMin;
        }

        // Random mid-game events
        if (nextMin === 15 || nextMin === 28 || nextMin === 55 || nextMin === 72 || nextMin === 85) {
          generatePeriodicEvent(nextMin);
        }

        if (nextMin >= 90) {
          setIsFinished(true);
          setIsPlaying(false);
          playSound('whistle', soundEnabled);
          finishMatch(decisionHistory);
          return 90;
        }

        return nextMin;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, isFinished, simSpeed, activeDecision, decisionHistory, player.position, soundEnabled]);

  // Auto scroll commentary
  useEffect(() => {
    commentaryEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  const generatePeriodicEvent = (min: number) => {
    const isPlayerInvolved = Math.random() < 0.45;
    if (isPlayerInvolved) {
      if (player.position === 'FW' && Math.random() < 0.35) {
        setHomeScore((s) => s + 1);
        playSound('goal', soundEnabled);
        setEvents((prev) => [
          ...prev,
          {
            minute: min,
            type: 'goal',
            text: `[GOOOAL!] ${player.name} 선수가 수비수를 따돌리고 강력한 오른발 슈팅으로 골망을 흔듭니다! (${min}')`,
            isPlayerInvolved: true,
            scoringClubId: currentClub.id,
            playerName: player.name,
          },
        ]);
        return;
      }
      if (player.position === 'MF' && Math.random() < 0.3) {
        playSound('kick', soundEnabled);
        setEvents((prev) => [
          ...prev,
          {
            minute: min,
            type: 'assist',
            text: `${player.name} 선수의 날카로운 전진 킬패스! 공격수의 슈팅이 골키퍼 손끝을 스칩니다. (${min}')`,
            isPlayerInvolved: true,
          },
        ]);
        return;
      }
      if (player.position === 'DF') {
        playSound('tackle', soundEnabled);
        setEvents((prev) => [
          ...prev,
          {
            minute: min,
            type: 'tackle',
            text: `${player.name} 선수의 단단한 수비 블로킹! 상대 공격을 사전 차단합니다. (${min}')`,
            isPlayerInvolved: true,
          },
        ]);
        return;
      }
      if (player.position === 'GK') {
        playSound('tackle', soundEnabled);
        setEvents((prev) => [
          ...prev,
          {
            minute: min,
            type: 'save',
            text: `${player.name} 수호신의 슈퍼 다이빙 세이브! 실점 위기를 지워냅니다. (${min}')`,
            isPlayerInvolved: true,
          },
        ]);
        return;
      }
    }

    // Generic team event
    if (Math.random() < 0.25) {
      if (Math.random() < 0.5) {
        setAwayScore((s) => s + 1);
        playSound('whistle', soundEnabled);
        setEvents((prev) => [
          ...prev,
          {
            minute: min,
            type: 'goal',
            text: `${opponentClub.name}의 기습적인 크로스에 이은 헤더 골. (${min}')`,
            isPlayerInvolved: false,
            scoringClubId: opponentClub.id,
          },
        ]);
      } else {
        setEvents((prev) => [
          ...prev,
          {
            minute: min,
            type: 'commentary',
            text: `치열한 중원 볼다툼이 이어집니다. (${min}')`,
            isPlayerInvolved: false,
          },
        ]);
      }
    }
  };

  const handleDecisionSelect = (option: MatchDecisionOption) => {
    // Check success probability based on player's corresponding stat
    const statVal = player.attributes[option.statCheck];
    const roll = Math.random() * 100;
    const isSuccess = roll < Math.min(92, Math.max(25, statVal - option.difficulty + 55));

    const updatedDecisions = [...decisionHistory, { option, success: isSuccess }];
    setDecisionHistory(updatedDecisions);

    if (isSuccess) {
      if (option.successResult.scoreGoal) {
        setHomeScore((s) => s + 1);
        playSound('goal', soundEnabled);
      } else if (option.successResult.makeAssist) {
        setHomeScore((s) => s + 1);
        playSound('goal', soundEnabled);
      } else {
        playSound('levelUp', soundEnabled);
      }

      setEvents((prev) => [
        ...prev,
        {
          minute: activeDecision?.minute || currentMinute,
          type: option.successResult.scoreGoal ? 'goal' : 'commentary',
          text: `[선택 성공!] ${option.successResult.eventText}`,
          isPlayerInvolved: true,
          scoringClubId: option.successResult.scoreGoal ? currentClub.id : undefined,
          playerName: player.name,
        },
      ]);
    } else {
      playSound('kick', soundEnabled);
      setEvents((prev) => [
        ...prev,
        {
          minute: activeDecision?.minute || currentMinute,
          type: 'commentary',
          text: `[선택 실패] ${option.failResult.eventText}`,
          isPlayerInvolved: true,
        },
      ]);
    }

    setActiveDecision(null);
  };

  const finishMatch = (decisions = decisionHistory) => {
    const finalResult = simulateMatch({
      player,
      currentClub,
      opponentClub,
      round,
      season,
      isStarter: true,
      decisionResults: decisions,
    });

    // Merge generated live scores if any were already scored
    if (homeScore > 0 || awayScore > 0) {
      finalResult.homeScore = Math.max(finalResult.homeScore, homeScore);
      finalResult.awayScore = Math.max(finalResult.awayScore, awayScore);
    }

    onMatchComplete(finalResult);
  };

  const handleInstantSimulate = () => {
    playSound('whistle', soundEnabled);
    finishMatch(decisionHistory);
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto space-y-6 pb-8">
      {/* Stadium Header Backdrop Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl">
        <div className="absolute inset-0 z-0">
          <img
            src={STADIUM_BG}
            alt="Football Stadium"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
        </div>

        {/* Scoreboard */}
        <div className="relative z-10 p-6 flex flex-col items-center">
          <div className="text-xs font-semibold text-emerald-400 tracking-wider uppercase mb-2">
            {season} 시즌 · 제 {round}라운드 매치데이
          </div>

          <div className="w-full max-w-3xl flex items-center justify-between gap-4">
            {/* Home Club */}
            <div className="flex-1 flex items-center justify-end gap-3 text-right">
              <div>
                <h3 className="font-athletic text-2xl font-black text-white">{currentClub.name}</h3>
                <div className="text-xs text-slate-400">HOME · {currentClub.stadiumName}</div>
              </div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-base border border-white/20 shadow-md shrink-0"
                style={{ backgroundColor: currentClub.badgeColor, color: currentClub.badgeTextColor }}
              >
                {currentClub.shortName}
              </div>
            </div>

            {/* Score Center */}
            <div className="flex flex-col items-center px-6 py-2 bg-slate-950/90 border border-slate-700/80 rounded-2xl shadow-inner min-w-[140px]">
              <div className="font-athletic text-4xl font-extrabold text-amber-300 tracking-wider">
                {homeScore} : {awayScore}
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="font-mono text-xs font-bold text-emerald-400 tabular-nums">
                  {currentMinute}'
                </span>
                <span className="text-[10px] text-slate-400 uppercase">
                  {currentMinute >= 90 ? 'FT' : 'LIVE'}
                </span>
              </div>
            </div>

            {/* Away Club */}
            <div className="flex-1 flex items-center justify-start gap-3 text-left">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-base border border-white/20 shadow-md shrink-0"
                style={{ backgroundColor: opponentClub.badgeColor, color: opponentClub.badgeTextColor }}
              >
                {opponentClub.shortName}
              </div>
              <div>
                <h3 className="font-athletic text-2xl font-black text-white">{opponentClub.name}</h3>
                <div className="text-xs text-slate-400">AWAY · OVR {opponentClub.overallRating}</div>
              </div>
            </div>
          </div>

          {/* Speed Controls */}
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isPlaying ? '일시정지' : '재개'}</span>
            </button>
            <button
              onClick={() => setSimSpeed(simSpeed === 'normal' ? 'fast' : 'normal')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border ${
                simSpeed === 'fast'
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300'
              }`}
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>배속: {simSpeed === 'fast' ? '2x 빠름' : '1x 보통'}</span>
            </button>
            <button
              onClick={handleInstantSimulate}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white rounded-lg transition-colors cursor-pointer"
            >
              결과 즉시 확인 (스킵)
            </button>
          </div>
        </div>
      </div>

      {/* Main Pitch and Commentary Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 2D Tactical Pitch (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-between">
          <div className="w-full flex items-center justify-between mb-3 text-xs text-slate-400">
            <span className="font-semibold text-slate-200">실시간 피치 전술도</span>
            <span>
              선수: <strong className="text-emerald-400">{player.name}</strong> ({player.position})
            </span>
          </div>

          {/* Football Field Visual */}
          <div className="relative w-full aspect-[16/10] bg-emerald-950/80 border-2 border-emerald-600/60 rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
            {/* Center Line & Circle */}
            <div className="absolute inset-y-0 left-1/2 w-0.5 bg-emerald-600/40 -translate-x-1/2" />
            <div className="absolute w-24 h-24 rounded-full border-2 border-emerald-600/40" />
            <div className="absolute w-2 h-2 rounded-full bg-emerald-600/50" />

            {/* Penalty boxes */}
            <div className="absolute inset-y-8 left-0 w-24 border-r-2 border-y-2 border-emerald-600/40" />
            <div className="absolute inset-y-8 right-0 w-24 border-l-2 border-y-2 border-emerald-600/40" />

            {/* Goal Posts */}
            <div className="absolute inset-y-16 left-0 w-3 bg-white/20 border-r border-white/40" />
            <div className="absolute inset-y-16 right-0 w-3 bg-white/20 border-l border-white/40" />

            {/* Animated Ball */}
            <div
              className="absolute w-4 h-4 rounded-full bg-white shadow-[0_0_10px_white] transition-all duration-300 ease-out flex items-center justify-center text-[8px]"
              style={{
                left: `${ballPosition.x}%`,
                top: `${ballPosition.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              ⚽
            </div>

            {/* Player Icon Marker on Pitch */}
            <div
              className="absolute px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-bold text-[10px] shadow-lg flex items-center gap-1 transition-all duration-700 ease-out pointer-events-none"
              style={{
                left: `${player.position === 'FW' ? 72 : player.position === 'MF' ? 52 : player.position === 'DF' ? 30 : 12}%`,
                top: `${48 + Math.sin(currentMinute * 0.5) * 14}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <span>{player.position}</span>
              <span className="truncate max-w-[60px]">{player.name}</span>
            </div>
          </div>

          <div className="w-full grid grid-cols-3 gap-2 mt-4 text-center text-xs">
            <div className="p-2 bg-slate-950/60 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[11px]">체력 소모</span>
              <span className="font-mono font-bold text-amber-400 tabular-nums">
                {Math.max(10, player.stamina - Math.floor(currentMinute * 0.3))}%
              </span>
            </div>
            <div className="p-2 bg-slate-950/60 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[11px]">선수 사기</span>
              <span className="font-bold text-emerald-400">{player.morale}</span>
            </div>
            <div className="p-2 bg-slate-950/60 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[11px]">예상 평점</span>
              <span className="font-mono font-bold text-white tabular-nums">
                {(7.0 + (homeScore > awayScore ? 0.8 : 0)).toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Live Commentary Feed (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <h4 className="font-semibold text-sm text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>실시간 경기 중계 브리핑</span>
            </h4>
            <span className="text-xs text-slate-400 font-mono tabular-nums">{events.length}개 이벤트</span>
          </div>

          <div className="flex-1 max-h-[320px] overflow-y-auto space-y-2.5 pr-2">
            {events.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                선수들이 피치에 도열하고 있습니다. 경기가 곧 시작됩니다...
              </div>
            ) : (
              events.map((evt, idx) => {
                let badgeColor = 'text-slate-400';
                if (evt.type === 'goal') badgeColor = 'text-emerald-400 font-bold';
                else if (evt.type === 'assist') badgeColor = 'text-sky-400 font-semibold';
                else if (evt.type === 'save' || evt.type === 'tackle') badgeColor = 'text-amber-400 font-semibold';

                return (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg text-xs leading-relaxed border ${
                      evt.isPlayerInvolved
                        ? 'bg-slate-950/90 border-emerald-500/30 text-slate-200'
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-emerald-400 tabular-nums">
                        {evt.minute}'
                      </span>
                      {evt.isPlayerInvolved && (
                        <span className="text-[10px] px-1.5 py-0.2 bg-emerald-950 text-emerald-300 rounded font-bold">
                          선수 관여
                        </span>
                      )}
                    </div>
                    <p className={badgeColor}>{evt.text}</p>
                  </div>
                );
              })
            )}
            <div ref={commentaryEndRef} />
          </div>
        </div>
      </div>

      {/* Interactive Tactical Decision Modal Prompt */}
      {activeDecision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border border-emerald-500/50 rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <Shield className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">
                인게임 전술 선택 ({activeDecision.minute}')
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{activeDecision.title}</h3>
            <p className="text-sm text-slate-300 mb-5 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              {activeDecision.situation}
            </p>

            <div className="space-y-3">
              {activeDecision.options.map((opt) => {
                const statVal = player.attributes[opt.statCheck];
                const estChance = Math.min(92, Math.max(25, statVal - opt.difficulty + 55));
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleDecisionSelect(opt)}
                    className="w-full p-3.5 bg-slate-950 hover:bg-emerald-950/40 border border-slate-700 hover:border-emerald-500 rounded-xl text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-white group-hover:text-emerald-300">
                        {opt.label}
                      </span>
                      <span className="text-xs text-emerald-400 font-mono font-semibold">
                        예상 성공률 {estChance}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{opt.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
