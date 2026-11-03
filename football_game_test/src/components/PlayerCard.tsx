import React from 'react';
import { Player } from '../types/game';
import { CLUBS } from '../data/clubs';

interface PlayerCardProps {
  player: Player;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, size = 'md' }) => {
  const club = CLUBS[player.clubId];

  const sizeClasses = {
    sm: 'w-48 text-xs p-3',
    md: 'w-64 text-sm p-4',
    lg: 'w-80 text-base p-5',
  }[size];

  // Card theme tier based on OVR
  const isElite = player.ovr >= 85;
  const isGold = player.ovr >= 75 && !isElite;

  const cardBorder = isElite
    ? 'border-amber-400/60 shadow-[0_0_25px_rgba(251,191,36,0.25)]'
    : isGold
    ? 'border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
    : 'border-slate-700 shadow-[0_0_15px_rgba(0,0,0,0.5)]';

  const cardGradient = isElite
    ? 'from-amber-950/80 via-slate-900 to-amber-950/60'
    : isGold
    ? 'from-slate-900 via-amber-950/30 to-slate-900'
    : 'from-slate-900 via-slate-900/90 to-slate-950';

  return (
    <div
      className={`relative rounded-2xl border bg-gradient-to-b ${cardBorder} ${cardGradient} ${sizeClasses} select-none transition-transform duration-300 hover:scale-[1.02] flex flex-col justify-between overflow-hidden`}
    >
      {/* Top Header Section: OVR, Position, Nation, Club */}
      <div className="flex items-start justify-between z-10">
        <div className="flex flex-col items-center">
          <span className="font-athletic text-3xl font-extrabold tracking-tight text-amber-300 drop-shadow-md">
            {player.ovr}
          </span>
          <span className="text-xs font-bold text-slate-300 tracking-wider">
            {player.position}
          </span>
          <span className="mt-1 text-base" title={player.nationality}>
            {player.nationalityFlag}
          </span>
          {club && (
            <div
              className="mt-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black border border-white/20 shadow-sm"
              style={{ backgroundColor: club.badgeColor, color: club.badgeTextColor }}
              title={club.name}
            >
              {club.shortName.slice(0, 3)}
            </div>
          )}
        </div>

        {/* Player Avatar Image / Portrait */}
        <div className="relative w-28 h-28 mx-auto -mt-1 rounded-xl overflow-hidden bg-slate-800/80 border border-white/10 flex items-center justify-center">
          {player.avatarUrl ? (
            <img
              src={player.avatarUrl}
              alt={player.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top"
              onError={(e) => {
                // Fallback to stylized SVG avatar
                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/bottts/svg?seed=${player.name}&backgroundColor=0f172a`;
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-400 font-bold">
              {player.position}
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-slate-950/90 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Center: Player Name */}
      <div className="text-center mt-2 z-10">
        <h3 className="font-athletic text-xl font-bold tracking-wide uppercase text-white truncate px-1">
          {player.name}
        </h3>
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
          <span>{club ? club.shortName : '무소속'}</span>
          <span>·</span>
          <span>{player.age}세</span>
          <span>·</span>
          <span>POT {player.potential}</span>
        </div>
      </div>

      {/* Bottom: 6 FIFA Core Attributes Grid */}
      <div className="mt-3 pt-2.5 border-t border-white/10 grid grid-cols-2 gap-x-4 gap-y-1 text-xs z-10 font-medium">
        <div className="flex justify-between items-center text-slate-300">
          <span className="text-[11px] font-bold text-slate-400">PAC</span>
          <span className="font-mono tabular-nums font-bold text-white">{player.attributes.pace}</span>
        </div>
        <div className="flex justify-between items-center text-slate-300">
          <span className="text-[11px] font-bold text-slate-400">DRI</span>
          <span className="font-mono tabular-nums font-bold text-white">{player.attributes.dribbling}</span>
        </div>
        <div className="flex justify-between items-center text-slate-300">
          <span className="text-[11px] font-bold text-slate-400">SHO</span>
          <span className="font-mono tabular-nums font-bold text-white">{player.attributes.shooting}</span>
        </div>
        <div className="flex justify-between items-center text-slate-300">
          <span className="text-[11px] font-bold text-slate-400">DEF</span>
          <span className="font-mono tabular-nums font-bold text-white">{player.attributes.defending}</span>
        </div>
        <div className="flex justify-between items-center text-slate-300">
          <span className="text-[11px] font-bold text-slate-400">PAS</span>
          <span className="font-mono tabular-nums font-bold text-white">{player.attributes.passing}</span>
        </div>
        <div className="flex justify-between items-center text-slate-300">
          <span className="text-[11px] font-bold text-slate-400">PHY</span>
          <span className="font-mono tabular-nums font-bold text-white">{player.attributes.physical}</span>
        </div>
      </div>
    </div>
  );
};
