import React from 'react';
import { Player } from '../types/game';
import { AttributeRadar } from './AttributeRadar';
import { PlayerCard } from './PlayerCard';
import { Award, Zap, Shield, Target, Compass, Heart } from 'lucide-react';

interface AttributesViewProps {
  player: Player;
}

export const AttributesView: React.FC<AttributesViewProps> = ({ player }) => {
  const statRows: {
    key: string;
    label: string;
    value: number;
    icon: React.ReactNode;
    desc: string;
    weight: string;
  }[] = [
    {
      key: 'pace',
      label: '속도 (PAC)',
      value: player.attributes.pace,
      icon: <Zap className="w-4 h-4 text-amber-400" />,
      desc: '스프린트 주력 및 순발력, 역습 가속도',
      weight: player.position === 'FW' ? '25%' : player.position === 'DF' ? '15%' : '10%',
    },
    {
      key: 'shooting',
      label: '슈팅 (SHO)',
      value: player.attributes.shooting,
      icon: <Target className="w-4 h-4 text-rose-400" />,
      desc: '골 결정력, 슛 파워, 중거리 슛 정확도',
      weight: player.position === 'FW' ? '35%' : player.position === 'MF' ? '15%' : '0%',
    },
    {
      key: 'passing',
      label: '패스 (PAS)',
      value: player.attributes.passing,
      icon: <Compass className="w-4 h-4 text-sky-400" />,
      desc: '숏패스, 롱패스, 스루패스 시야 및 어시스트 확률',
      weight: player.position === 'MF' ? '30%' : player.position === 'DF' ? '15%' : '10%',
    },
    {
      key: 'dribbling',
      label: '드리블 (DRI)',
      value: player.attributes.dribbling,
      icon: <Award className="w-4 h-4 text-emerald-400" />,
      desc: '볼 컨트롤, 민첩성, 탈압박 및 개인기 돌파',
      weight: player.position === 'FW' ? '25%' : player.position === 'MF' ? '25%' : '5%',
    },
    {
      key: 'defending',
      label: '수비 (DEF)',
      value: player.attributes.defending,
      icon: <Shield className="w-4 h-4 text-indigo-400" />,
      desc: '가로채기(인터셉트), 슬라이딩 태클, 대인 방어력',
      weight: player.position === 'DF' ? '40%' : player.position === 'MF' ? '15%' : '0%',
    },
    {
      key: 'physical',
      label: '피지컬 (PHY)',
      value: player.attributes.physical,
      icon: <Heart className="w-4 h-4 text-rose-500" />,
      desc: '몸싸움 경합, 체력 지속력, 점프력 및 투지',
      weight: player.position === 'DF' ? '25%' : player.position === 'GK' ? '20%' : '15%',
    },
  ];

  if (player.position === 'GK') {
    statRows.push({
      key: 'goalkeeping',
      label: '골키퍼 (GK)',
      value: player.attributes.goalkeeping,
      icon: <Shield className="w-4 h-4 text-amber-500" />,
      desc: '다이빙 선방, 반사신경, 공중볼 핸들링 및 펀칭',
      weight: '65%',
    });
  }

  const growthPct = Math.min(100, Math.round((player.ovr / player.potential) * 100));

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Overview Top Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
            선수 스카우팅 및 능력치 프로필
          </span>
          <h2 className="text-2xl font-bold text-white mt-1">
            {player.name} <span className="text-emerald-400">· {player.position}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            선수의 포지션별 종합 가중치를 적용하여 오버롤(OVR)이 산출되며, 잠재력(POT) 한계치까지 성장이 가능합니다.
          </p>
        </div>

        {/* OVR vs POT */}
        <div className="flex items-center gap-6 bg-slate-950/70 px-6 py-4 rounded-xl border border-slate-800 shrink-0">
          <div className="text-center">
            <span className="text-[11px] text-slate-400 block font-semibold">현재 오버롤</span>
            <span className="font-athletic text-4xl font-black text-amber-300 font-mono tabular-nums">
              {player.ovr}
            </span>
          </div>
          <div className="w-px h-10 bg-slate-800" />
          <div className="text-center">
            <span className="text-[11px] text-slate-400 block font-semibold">최대 잠재력</span>
            <span className="font-athletic text-4xl font-black text-emerald-400 font-mono tabular-nums">
              {player.potential}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Card & Radar (5 cols) + Detailed Breakdown (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-5 flex flex-col items-center gap-6">
          <PlayerCard player={player} size="lg" />

          {/* Radar Chart */}
          <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col items-center">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              능력치 밸런스 헥사곤
            </h3>
            <AttributeRadar attributes={player.attributes} potential={player.potential} />
          </div>
        </div>

        {/* Right Column: Attribute Bars */}
        <div className="lg:col-span-7 space-y-4">
          {/* Potential Progress Bar */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-bold">잠재력 달성률</span>
              <span className="font-mono text-emerald-400 font-bold tabular-nums">
                {player.ovr} / {player.potential} ({growthPct}%)
              </span>
            </div>
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${growthPct}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-500 block">
              남은 성장 여력: 약 +{Math.max(0, player.potential - player.ovr)} 포인트
            </span>
          </div>

          {/* Individual Attributes Detailed Bars */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              세부 능력치 상세 및 가중치
            </h3>

            {statRows.map((row) => (
              <div key={row.key} className="space-y-1.5 pb-3 border-b border-slate-800/60 last:border-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {row.icon}
                    <span className="text-sm font-bold text-white">{row.label}</span>
                    <span className="text-[11px] text-slate-400 font-mono">가중치 {row.weight}</span>
                  </div>
                  <span className="font-mono text-base font-bold text-emerald-400 tabular-nums">
                    {row.value}
                  </span>
                </div>

                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      row.value >= 85
                        ? 'bg-amber-400'
                        : row.value >= 70
                        ? 'bg-emerald-400'
                        : 'bg-sky-400'
                    }`}
                    style={{ width: `${Math.min(100, (row.value / 99) * 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">{row.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
