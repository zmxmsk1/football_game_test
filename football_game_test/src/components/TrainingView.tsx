import React, { useState } from 'react';
import { Player, TrainingIntensity, TrainingResult, TrainingType } from '../types/game';
import { executeTraining } from '../engine/gameEngine';
import { playSound } from '../utils/audio';
import { Dumbbell, Zap, Heart, Shield, Award, CheckCircle2, AlertCircle } from 'lucide-react';

interface TrainingViewProps {
  player: Player;
  soundEnabled: boolean;
  onTrainingComplete: (updatedPlayer: Player, result: TrainingResult) => void;
}

export const TrainingView: React.FC<TrainingViewProps> = ({
  player,
  soundEnabled,
  onTrainingComplete,
}) => {
  const [selectedType, setSelectedType] = useState<TrainingType>('shooting');
  const [selectedIntensity, setSelectedIntensity] = useState<TrainingIntensity>('normal');
  const [lastResult, setLastResult] = useState<TrainingResult | null>(null);

  const trainingDrills: {
    id: TrainingType;
    title: string;
    targetAttr: string;
    currentVal: number;
    desc: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'shooting',
      title: '슈팅 & 골 결정력 훈련',
      targetAttr: '슈팅 (SHO)',
      currentVal: player.attributes.shooting,
      desc: '문전 침착성과 강력한 발리, 중거리 슈팅 테크닉 훈련',
      icon: <Award className="w-5 h-5 text-amber-400" />,
    },
    {
      id: 'pace',
      title: '스프린트 & 순간 가속도 훈련',
      targetAttr: '속도 (PAC)',
      currentVal: player.attributes.pace,
      desc: '단거리 질주와 방향 전환 민첩성을 끌어올리는 주력 훈련',
      icon: <Zap className="w-5 h-5 text-amber-400" />,
    },
    {
      id: 'passing',
      title: '패스 & 시야 전술 훈련',
      targetAttr: '패스 (PAS)',
      currentVal: player.attributes.passing,
      desc: '원터치 숏패스 정확도와 롱패스 전개 능력을 배양',
      icon: <Dumbbell className="w-5 h-5 text-sky-400" />,
    },
    {
      id: 'dribbling',
      title: '볼 컨트롤 & 탈압박 드리블',
      targetAttr: '드리블 (DRI)',
      currentVal: player.attributes.dribbling,
      desc: '좁은 공간에서의 볼 키핑과 페인팅 돌파 기술 훈련',
      icon: <Award className="w-5 h-5 text-emerald-400" />,
    },
    {
      id: 'defending',
      title: '태클 & 압박 위치선정',
      targetAttr: '수비 (DEF)',
      currentVal: player.attributes.defending,
      desc: '대인 마크 및 인터셉트 타이밍 수비 훈련',
      icon: <Shield className="w-5 h-5 text-indigo-400" />,
    },
    {
      id: 'physical',
      title: '웨이트 & 코어 피지컬 훈련',
      targetAttr: '피지컬 (PHY)',
      currentVal: player.attributes.physical,
      desc: '몸싸움 버티기와 90분 강철 폐활량을 위한 근력 훈련',
      icon: <Dumbbell className="w-5 h-5 text-rose-400" />,
    },
    {
      id: 'recovery',
      title: '전문 마사지 & 회복 세션',
      targetAttr: '체력 회복 (+28)',
      currentVal: player.stamina,
      desc: '지친 근육을 풀고 컨디션과 사기를 최상으로 끌어올리는 회복 프로그램',
      icon: <Heart className="w-5 h-5 text-emerald-400" />,
    },
  ];

  const staminaCosts = {
    light: selectedType === 'recovery' ? 0 : 10,
    normal: selectedType === 'recovery' ? 0 : 18,
    intense: selectedType === 'recovery' ? 0 : 28,
  };

  const handleStartTraining = () => {
    if (selectedType !== 'recovery' && player.stamina < staminaCosts[selectedIntensity]) {
      alert('체력이 부족하여 훈련을 진행할 수 없습니다. 회복 세션을 먼저 진행하세요.');
      return;
    }

    const { player: updatedPlayer, result } = executeTraining(player, selectedType, selectedIntensity);
    setLastResult(result);

    if (result.successType === 'great') {
      playSound('levelUp', soundEnabled);
    } else {
      playSound('click', soundEnabled);
    }

    onTrainingComplete(updatedPlayer, result);
  };

  const activeDrill = trainingDrills.find((d) => d.id === selectedType);
  const isAtPotentialCeiling = activeDrill && selectedType !== 'recovery' && activeDrill.currentVal >= player.potential;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Dumbbell className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white tracking-wide">선수 훈련 센터</h2>
          </div>
          <p className="text-xs text-slate-400">
            원하는 드릴과 훈련 강도를 설정하여 능력치를 향상시키세요. (잠재력 한계치: {player.potential})
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-950/60 px-4 py-2.5 rounded-xl border border-slate-800 shrink-0">
          <div>
            <span className="text-[11px] text-slate-400 block">현재 체력</span>
            <span className={`font-mono text-base font-bold tabular-nums ${player.stamina < 30 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {player.stamina}%
            </span>
          </div>
          <div className="w-px h-6 bg-slate-800" />
          <div>
            <span className="text-[11px] text-slate-400 block">현재 사기</span>
            <span className="text-xs font-bold text-slate-200">{player.morale}</span>
          </div>
          <div className="w-px h-6 bg-slate-800" />
          <div>
            <span className="text-[11px] text-slate-400 block">종합 능력치 (OVR)</span>
            <span className="font-athletic text-xl font-black text-amber-300">{player.ovr}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Drills List (7 cols) + Intensity & Action (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Drill Selection List */}
        <div className="lg:col-span-7 space-y-2.5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            훈련 종목 선택
          </span>

          {trainingDrills.map((drill) => {
            const isSelected = selectedType === drill.id;
            const isCapped = drill.id !== 'recovery' && drill.currentVal >= player.potential;

            return (
              <button
                key={drill.id}
                onClick={() => {
                  setSelectedType(drill.id);
                  playSound('click', soundEnabled);
                }}
                className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-950/30 shadow-md ring-1 ring-emerald-500/50'
                    : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">{drill.icon}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{drill.title}</span>
                      {isCapped && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-600/40">
                          잠재력 한계 도달
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{drill.desc}</p>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-3">
                  <span className="text-xs text-slate-400 block">{drill.targetAttr}</span>
                  <span className="font-mono text-base font-bold text-emerald-400 tabular-nums">
                    {drill.currentVal}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Intensity & Action Panel */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                훈련 강도 설정
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'light', label: '라이트', cost: '-10 체력', note: '부담 적음' },
                  { id: 'normal', label: '일반', cost: '-18 체력', note: '균형 성장' },
                  { id: 'intense', label: '하드', cost: '-28 체력', note: '대성공 가능' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedIntensity(item.id as TrainingIntensity);
                      playSound('click', soundEnabled);
                    }}
                    className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                      selectedIntensity === item.id
                        ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold">{item.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                      {selectedType === 'recovery' ? '소모 없음' : item.cost}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Drill Summary Card */}
            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>선택 훈련</span>
                <span className="font-bold text-white">{activeDrill?.title}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>예상 체력 소모</span>
                <span className="font-mono font-bold text-amber-400 tabular-nums">
                  {selectedType === 'recovery' ? '0 (체력 회복 +28)' : `-${staminaCosts[selectedIntensity]}`}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>선수 나이 반영 계수</span>
                <span className="text-emerald-400 font-semibold">
                  {player.age <= 21 ? '유망주 성장 보너스 (+15%)' : player.age > 28 ? '노련미 (성장 둔화)' : '전성기'}
                </span>
              </div>
            </div>

            {isAtPotentialCeiling && (
              <div className="flex items-start gap-2 p-3 bg-amber-950/40 border border-amber-600/40 rounded-xl text-xs text-amber-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  이 능력치는 현재 선수의 잠재력 한계({player.potential})에 도달했습니다. 다른 능력치 훈련을 권장합니다.
                </span>
              </div>
            )}

            {/* Execute Button */}
            <button
              onClick={handleStartTraining}
              disabled={selectedType !== 'recovery' && player.stamina < staminaCosts[selectedIntensity]}
              className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-athletic text-base font-black rounded-xl tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-[0.99]"
            >
              <Dumbbell className="w-4 h-4" />
              <span>{selectedType === 'recovery' ? '회복 세션 시작' : '훈련 실시하기'}</span>
            </button>
          </div>

          {/* Last Result Notification Card */}
          {lastResult && (
            <div
              className={`p-4 rounded-2xl border transition-all ${
                lastResult.successType === 'great'
                  ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300'
                  : lastResult.successType === 'normal'
                  ? 'bg-slate-900 border-slate-700 text-slate-200'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-xs uppercase tracking-wider">최근 훈련 결과 피드백</span>
              </div>
              <p className="text-xs leading-relaxed mt-1">{lastResult.message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
