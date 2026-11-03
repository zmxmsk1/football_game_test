import React, { useState } from 'react';
import { Club, GameState, TransferOffer } from '../types/game';
import { CLUBS, LEAGUES } from '../data/clubs';
import { generateTransferOffers } from '../engine/gameEngine';
import { playSound } from '../utils/audio';
import { DollarSign, Check, X, ArrowUpRight, Shield, Award, AlertCircle } from 'lucide-react';

interface TransferViewProps {
  state: GameState;
  onAcceptOffer: (offer: TransferOffer, newClub: Club) => void;
  onRejectOffer: (offerId: string) => void;
  onRequestTransfer: () => void;
  soundEnabled: boolean;
}

export const TransferView: React.FC<TransferViewProps> = ({
  state,
  onAcceptOffer,
  onRejectOffer,
  onRequestTransfer,
  soundEnabled,
}) => {
  const { player, currentClub, pendingOffers } = state;
  const currentLeague = LEAGUES.find((l) => l.id === currentClub.leagueId) || LEAGUES[2];

  const formatEuro = (val: number) => {
    if (val >= 1000000) return `€${(val / 1000000).toFixed(1)}M`;
    return `€${(val / 1000).toFixed(0)}K`;
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white tracking-wide">계약 및 이적 시장</h2>
          </div>
          <p className="text-xs text-slate-400">
            현재 계약 현황을 점검하고, 타 구단의 영입 제안을 검토하거나 이적을 요청할 수 있습니다.
          </p>
        </div>

        <button
          onClick={() => {
            playSound('click', soundEnabled);
            onRequestTransfer();
          }}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-xl border border-slate-700 transition-colors cursor-pointer flex items-center gap-2 shrink-0"
        >
          <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          <span>구단에 이적 요청서 제출</span>
        </button>
      </div>

      {/* Current Contract Status Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          현재 소속 구단 계약 정보
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
            <span className="text-[11px] text-slate-400 block">소속 구단</span>
            <div className="flex items-center gap-2 mt-1">
              <div
                className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold"
                style={{ backgroundColor: currentClub.badgeColor, color: currentClub.badgeTextColor }}
              >
                {currentClub.shortName.slice(0, 2)}
              </div>
              <span className="font-bold text-sm text-white">{currentClub.name}</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">{currentLeague.name}</span>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
            <span className="text-[11px] text-slate-400 block">계약 잔여 기간</span>
            <span className={`font-mono text-xl font-bold tabular-nums block mt-1 ${player.contractYears <= 1 ? 'text-rose-400' : 'text-amber-300'}`}>
              {player.contractYears}년
            </span>
            <span className="text-[10px] text-slate-400">
              {player.contractYears <= 1 ? '계약 만료 임박 (FA 임박)' : '안정적 계약 상태'}
            </span>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
            <span className="text-[11px] text-slate-400 block">현재 주급</span>
            <span className="font-mono text-xl font-bold text-emerald-400 tabular-nums block mt-1">
              €{player.weeklyWage.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400">연봉 환산 약 €{(player.weeklyWage * 52).toLocaleString()}</span>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
            <span className="text-[11px] text-slate-400 block">현재 시장 가치</span>
            <span className="font-mono text-xl font-bold text-white tabular-nums block mt-1">
              {formatEuro(player.marketValue)}
            </span>
            <span className="text-[10px] text-slate-400">활약도 및 잠재력 반영</span>
          </div>
        </div>
      </div>

      {/* Incoming Transfer Offers Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            도착한 구단별 이적 제안서 ({pendingOffers.length}건)
          </h3>
          <span className="text-xs text-slate-400">
            좋은 경기 평점을 유지할수록 더 높은 티어의 명문 구단에서 제안이 옵니다.
          </span>
        </div>

        {pendingOffers.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-300">현재 대기 중인 공식 영입 제안이 없습니다.</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              정규 경기에서 뛰어난 평점을 기록하거나 시즌을 소화하면 상위 리그 구단 스카우트의 제안서가 도착합니다.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingOffers.map((offer) => {
              const offerClub = CLUBS[offer.clubId];
              if (!offerClub) return null;
              const offerLeague = LEAGUES.find((l) => l.id === offerClub.leagueId);

              const wageDiff = offer.offeredWage - player.weeklyWage;

              return (
                <div
                  key={offer.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Club Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border border-white/20 shadow-md"
                          style={{ backgroundColor: offerClub.badgeColor, color: offerClub.badgeTextColor }}
                        >
                          {offerClub.shortName}
                        </div>
                        <div>
                          <h4 className="font-bold text-base text-white">{offerClub.name}</h4>
                          <span className="text-xs text-slate-400">{offerLeague?.name} · OVR {offerClub.overallRating}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">제안 이적료</span>
                        <span className="font-mono text-sm font-bold text-emerald-400 tabular-nums">
                          {formatEuro(offer.transferFee)}
                        </span>
                      </div>
                    </div>

                    {/* Offer Terms Grid */}
                    <div className="grid grid-cols-3 gap-2 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                      <div>
                        <span className="text-slate-400 block text-[11px]">제안 주급</span>
                        <span className="font-mono font-bold text-white tabular-nums">
                          €{offer.offeredWage.toLocaleString()}
                        </span>
                        <span className={`text-[10px] block ${wageDiff > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                          {wageDiff > 0 ? `+€${wageDiff.toLocaleString()}` : '동결'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">계약 기간</span>
                        <span className="font-bold text-amber-300">{offer.contractYears}년 계약</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">약속된 역할</span>
                        <span className="font-bold text-sky-400 truncate block">{offer.squadRole}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/30 p-2.5 rounded-lg">
                      "{offerClub.description}"
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => {
                        playSound('levelUp', soundEnabled);
                        onAcceptOffer(offer, offerClub);
                      }}
                      className="py-2.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-emerald-500/20"
                    >
                      <Check className="w-4 h-4" />
                      <span>이적 수락</span>
                    </button>

                    <button
                      onClick={() => {
                        playSound('click', soundEnabled);
                        onRejectOffer(offer.id);
                      }}
                      className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                    >
                      <X className="w-4 h-4" />
                      <span>제안 거절</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
