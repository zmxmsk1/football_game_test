import React, { useState } from 'react';
import { Position, PreferredFoot } from '../types/game';
import { NATIONALITIES, STARTER_CLUBS } from '../data/clubs';
import { AVATAR_OPTIONS } from '../data/avatars';
import { generateInitialAttributes, calculateOverall } from '../engine/gameEngine';
import { PlayerCard } from './PlayerCard';
import { playSound } from '../utils/audio';
import { Sparkles, ArrowRight } from 'lucide-react';

interface CreatePlayerModalProps {
  onCreate: (params: {
    name: string;
    nationality: string;
    nationalityFlag: string;
    position: Position;
    age: number;
    preferredFoot: PreferredFoot;
    avatarUrl: string;
    starterClubId: string;
  }) => void;
  soundEnabled: boolean;
}

export const CreatePlayerModal: React.FC<CreatePlayerModalProps> = ({ onCreate, soundEnabled }) => {
  const [name, setName] = useState('이강우');
  const [selectedNat, setSelectedNat] = useState(NATIONALITIES[0]);
  const [position, setPosition] = useState<Position>('FW');
  const [age, setAge] = useState(18);
  const [preferredFoot, setPreferredFoot] = useState<PreferredFoot>('오른발');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [selectedClub, setSelectedClub] = useState(STARTER_CLUBS[0]);

  // Derive initial stats preview
  const { attributes, potential } = generateInitialAttributes(position);
  const ovr = calculateOverall(attributes, position);

  const previewPlayer = {
    id: 'preview',
    name: name || '신인 선수',
    nationality: selectedNat.name,
    nationalityFlag: selectedNat.flag,
    position,
    age,
    preferredFoot,
    avatarUrl: selectedAvatar.url,
    ovr,
    potential,
    attributes,
    stamina: 100,
    morale: '최상' as const,
    clubId: selectedClub.id,
    marketValue: 1200000,
    contractYears: 3,
    weeklyWage: 2500,
    squadRole: '선발 주전' as const,
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playSound('levelUp', soundEnabled);
    onCreate({
      name: name.trim() || '신인 선수',
      nationality: selectedNat.name,
      nationalityFlag: selectedNat.flag,
      position,
      age,
      preferredFoot,
      avatarUrl: selectedAvatar.url,
      starterClubId: selectedClub.id,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Top Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-bold text-white tracking-wide">새 선수 생성 및 프로 커리어 시작</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              선수의 기본 프로필, 포지션, 외형 및 입단할 첫 프로 구단을 선택하세요.
            </p>
          </div>
        </div>

        {/* Content Body Grid */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Form: 7 cols */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-5">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                선수 이름
              </label>
              <input
                type="text"
                value={name}
                maxLength={20}
                onChange={(e) => setName(e.target.value)}
                placeholder="선수 이름 입력 (예: 김태풍)"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors text-sm"
                required
              />
            </div>

            {/* Position */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                포지션
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'FW', title: '공격수 (FW)', desc: '골 결정력 & 스피드' },
                  { id: 'MF', title: '미드필더 (MF)', desc: '패스 & 플레이메이킹' },
                  { id: 'DF', title: '수비수 (DF)', desc: '태클 & 피지컬' },
                  { id: 'GK', title: '골키퍼 (GK)', desc: '선방 & 반사신경' },
                ].map((pos) => (
                  <button
                    key={pos.id}
                    type="button"
                    onClick={() => {
                      setPosition(pos.id as Position);
                      playSound('click', soundEnabled);
                    }}
                    className={`p-2.5 text-left rounded-lg border transition-all cursor-pointer ${
                      position === pos.id
                        ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                        : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs">{pos.id}</div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">{pos.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Nationality & Age */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  국적
                </label>
                <select
                  value={selectedNat.code}
                  onChange={(e) => {
                    const found = NATIONALITIES.find((n) => n.code === e.target.value);
                    if (found) setSelectedNat(found);
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
                >
                  {NATIONALITIES.map((n) => (
                    <option key={n.code} value={n.code}>
                      {n.flag} {n.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  데뷔 나이: <span className="text-emerald-400 font-bold">{age}세</span>
                </label>
                <input
                  type="range"
                  min={17}
                  max={21}
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-500 mt-2"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>17세 (고교 특급)</span>
                  <span>21세 (대졸 루키)</span>
                </div>
              </div>
            </div>

            {/* Preferred Foot */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                주발 (선호 발)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['오른발', '왼발', '양발'] as PreferredFoot[]).map((foot) => (
                  <button
                    key={foot}
                    type="button"
                    onClick={() => {
                      setPreferredFoot(foot);
                      playSound('click', soundEnabled);
                    }}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                      preferredFoot === foot
                        ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    {foot}
                  </button>
                ))}
              </div>
            </div>

            {/* Avatar Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                선수 외형 스타일
              </label>
              <div className="grid grid-cols-4 gap-2">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => {
                      setSelectedAvatar(av);
                      playSound('click', soundEnabled);
                    }}
                    className={`relative p-1.5 rounded-lg border transition-all cursor-pointer flex flex-col items-center ${
                      selectedAvatar.id === av.id
                        ? 'border-emerald-500 bg-emerald-950/30 ring-1 ring-emerald-500'
                        : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-md overflow-hidden bg-slate-800">
                      <img src={av.url} alt={av.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] text-slate-300 mt-1 truncate max-w-[80px]">{av.badge} 스타일</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Starter Club */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                입단 구단 선택 (내셔널 라이징 리그)
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                {STARTER_CLUBS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setSelectedClub(c);
                      playSound('click', soundEnabled);
                    }}
                    className={`p-2 rounded-lg border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                      selectedClub.id === c.id
                        ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                        : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 border border-white/20"
                      style={{ backgroundColor: c.badgeColor, color: c.badgeTextColor }}
                    >
                      {c.shortName.slice(0, 2)}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold truncate">{c.name}</div>
                      <div className="text-[10px] text-slate-400">OVR {c.overallRating}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-athletic text-lg font-black rounded-xl tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-[0.99]"
              >
                <span>프로 데뷔 & 커리어 시작하기</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Right Live Preview: 5 cols */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center bg-slate-950/60 border border-slate-800/80 rounded-xl p-5">
            <span className="text-xs text-slate-400 font-semibold mb-3 uppercase tracking-wider">
              선수 카드 실시간 미리보기
            </span>
            <PlayerCard player={previewPlayer} size="md" />
            <div className="mt-4 text-center">
              <div className="text-xs text-slate-300">
                입단 예정: <span className="text-emerald-400 font-bold">{selectedClub.name}</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                기본 계약 3년 · 주급 약 €{previewPlayer.weeklyWage.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
