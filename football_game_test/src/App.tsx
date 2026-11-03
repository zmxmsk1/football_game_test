import React, { useState, useEffect } from 'react';
import { Club, GameState, MatchResult, Player, Position, PreferredFoot, TrainingResult, TransferOffer } from './types/game';
import { createNewGame, advanceSeason, simulateLeagueRound, generateTransferOffers, calculateMarketValue } from './engine/gameEngine';
import { loadGameState, saveGameState, deleteSaveSlot } from './utils/storage';
import { playSound } from './utils/audio';

import { Header, ActiveTab } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { AttributesView } from './components/AttributesView';
import { TrainingView } from './components/TrainingView';
import { LeagueTableView } from './components/LeagueTableView';
import { TransferView } from './components/TransferView';
import { CareerHistoryView } from './components/CareerHistoryView';
import { CreatePlayerModal } from './components/CreatePlayerModal';
import { MatchSimulationView } from './components/MatchSimulationView';
import { MatchResultModal } from './components/MatchResultModal';
import { SeasonSummaryModal } from './components/SeasonSummaryModal';
import { SettingsModal } from './components/SettingsModal';
import { getNextOpponent } from './engine/gameEngine';
import { CLUBS, LEAGUES } from './data/clubs';

export default function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isSimulatingMatch, setIsSimulatingMatch] = useState(false);
  const [activeMatchResult, setActiveMatchResult] = useState<MatchResult | null>(null);
  const [showSeasonSummary, setShowSeasonSummary] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  // Load game state on mount
  useEffect(() => {
    const saved = loadGameState();
    if (saved && saved.player && saved.currentClub) {
      setGameState(saved);
      setSoundEnabled(saved.settings?.soundEnabled ?? true);
    } else {
      setShowCreateModal(true);
    }
  }, []);

  // Auto-save whenever game state changes
  useEffect(() => {
    if (gameState) {
      saveGameState(gameState);
    }
  }, [gameState]);

  const showNotification = (msg: string) => {
    setBannerNotice(msg);
    setTimeout(() => setBannerNotice(null), 4000);
  };

  const handleCreatePlayer = (params: {
    name: string;
    nationality: string;
    nationalityFlag: string;
    position: Position;
    age: number;
    preferredFoot: PreferredFoot;
    avatarUrl: string;
    starterClubId: string;
  }) => {
    const newGame = createNewGame(params);
    newGame.settings.soundEnabled = soundEnabled;
    setGameState(newGame);
    setShowCreateModal(false);
    setActiveTab('dashboard');
    showNotification(`축하합니다! ${newGame.currentClub.name}에 입단하여 프로 커리어가 시작되었습니다.`);
  };

  const handleMatchComplete = (result: MatchResult) => {
    if (!gameState) return;

    // Simulate rest of the league for this round
    const updatedStandings = simulateLeagueRound(
      gameState.currentClub.leagueId,
      result,
      gameState.standings
    );

    // Update player post match stats
    const updatedPlayer: Player = {
      ...gameState.player,
      stamina: result.postMatchStamina,
      morale: result.postMatchMorale,
      marketValue: calculateMarketValue(
        gameState.player.ovr,
        gameState.player.potential,
        gameState.player.age,
        result.playerRating
      ),
    };

    const nextRound = gameState.currentRound + 1;
    const isSeasonEnd = nextRound > gameState.totalRounds;

    // Potential milestone checks
    const updatedMilestones = [...gameState.unlockedMilestones];
    if (result.goals >= 3 && !updatedMilestones.includes('해트트릭 달성')) {
      updatedMilestones.push('해트트릭 달성');
    }
    if (result.playerRating >= 9.0 && !updatedMilestones.includes('경기 평점 9.0+ 달성')) {
      updatedMilestones.push('경기 평점 9.0+ 달성');
    }

    // Generate potential transfer bids every few rounds
    const newOffers =
      nextRound % 3 === 0
        ? generateTransferOffers(updatedPlayer, gameState.currentClub, result.playerRating)
        : gameState.pendingOffers;

    const nextState: GameState = {
      ...gameState,
      player: updatedPlayer,
      standings: updatedStandings,
      matchHistory: [...gameState.matchHistory, result],
      currentRound: nextRound,
      pendingOffers: newOffers,
      unlockedMilestones: updatedMilestones,
    };

    setGameState(nextState);
    setIsSimulatingMatch(false);
    setActiveMatchResult(result);

    if (isSeasonEnd) {
      setShowSeasonSummary(true);
    }
  };

  const handleTrainingComplete = (updatedPlayer: Player, result: TrainingResult) => {
    if (!gameState) return;
    setGameState({
      ...gameState,
      player: updatedPlayer,
    });
  };

  const handleRest = () => {
    if (!gameState) return;
    const restored = Math.min(100, gameState.player.stamina + 35);
    playSound('levelUp', soundEnabled);
    setGameState({
      ...gameState,
      player: {
        ...gameState.player,
        stamina: restored,
        morale: gameState.player.morale === '침체' ? '보통' : '최상',
      },
    });
    showNotification('충분한 휴식과 수면을 취하여 체력 +35를 회복했습니다.');
  };

  const handleAcceptTransfer = (offer: TransferOffer, newClub: Club) => {
    if (!gameState) return;

    const isDifferentLeague = newClub.leagueId !== gameState.currentClub.leagueId;

    const updatedPlayer: Player = {
      ...gameState.player,
      clubId: newClub.id,
      weeklyWage: offer.offeredWage,
      contractYears: offer.contractYears,
      squadRole: offer.squadRole,
    };

    const updatedMilestones = [...gameState.unlockedMilestones];
    const milestoneText = `${newClub.name}으로 이적 성공`;
    if (!updatedMilestones.includes(milestoneText)) {
      updatedMilestones.push(milestoneText);
    }

    setGameState({
      ...gameState,
      player: updatedPlayer,
      currentClub: newClub,
      pendingOffers: gameState.pendingOffers.filter((o) => o.id !== offer.id),
      unlockedMilestones: updatedMilestones,
    });

    showNotification(`이적 완료! ${newClub.name}의 새로운 유니폼을 입게 되었습니다!`);
    setActiveTab('dashboard');
  };

  const handleRejectOffer = (offerId: string) => {
    if (!gameState) return;
    setGameState({
      ...gameState,
      pendingOffers: gameState.pendingOffers.filter((o) => o.id !== offerId),
    });
    showNotification('이적 제안을 정중히 거절했습니다.');
  };

  const handleRequestTransfer = () => {
    if (!gameState) return;
    const newOffers = generateTransferOffers(gameState.player, gameState.currentClub, 7.8);
    setGameState({
      ...gameState,
      pendingOffers: newOffers,
    });
    showNotification('구단에 공식 이적 요청서를 제출했습니다. 에이전트가 새 영입 제안을 모색합니다.');
  };

  const handleAdvanceSeason = () => {
    if (!gameState) return;
    const advanced = advanceSeason(gameState);
    setGameState(advanced);
    setShowSeasonSummary(false);
    showNotification(`${advanced.currentSeason} 새 시즌이 공식 개막했습니다!`);
    setActiveTab('dashboard');
  };

  const handleResetGame = () => {
    deleteSaveSlot();
    setGameState(null);
    setShowSettingsModal(false);
    setShowCreateModal(true);
  };

  if (!gameState) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        {showCreateModal && (
          <CreatePlayerModal onCreate={handleCreatePlayer} soundEnabled={soundEnabled} />
        )}
      </div>
    );
  }

  const nextOpponent = getNextOpponent(gameState.currentClub, gameState.currentRound);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenSettings={() => setShowSettingsModal(true)}
        soundEnabled={soundEnabled}
        onToggleSound={() => {
          const nextVal = !soundEnabled;
          setSoundEnabled(nextVal);
          if (gameState) {
            setGameState({
              ...gameState,
              settings: { ...gameState.settings, soundEnabled: nextVal },
            });
          }
        }}
        playerName={gameState.player.name}
        season={gameState.currentSeason}
        round={gameState.currentRound}
      />

      {/* Temporary Floating Alert Banner */}
      {bannerNotice && (
        <div className="fixed top-16 inset-x-0 z-40 flex justify-center pointer-events-none px-4">
          <div className="bg-emerald-950/90 border border-emerald-500 text-emerald-300 text-xs font-semibold py-2.5 px-5 rounded-full shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2">
            {bannerNotice}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            state={gameState}
            onStartMatch={() => setIsSimulatingMatch(true)}
            onGoTraining={() => setActiveTab('training')}
            onRest={handleRest}
            onGoTransfers={() => setActiveTab('transfers')}
            onGoHistory={() => setActiveTab('history')}
            onSaveGame={() => {
              saveGameState(gameState);
              playSound('click', soundEnabled);
              showNotification('현재 게임 진행 상황이 자동 저장되었습니다.');
            }}
            soundEnabled={soundEnabled}
          />
        )}

        {activeTab === 'attributes' && <AttributesView player={gameState.player} />}

        {activeTab === 'training' && (
          <TrainingView
            player={gameState.player}
            soundEnabled={soundEnabled}
            onTrainingComplete={handleTrainingComplete}
          />
        )}

        {activeTab === 'standings' && <LeagueTableView state={gameState} />}

        {activeTab === 'transfers' && (
          <TransferView
            state={gameState}
            onAcceptOffer={handleAcceptTransfer}
            onRejectOffer={handleRejectOffer}
            onRequestTransfer={handleRequestTransfer}
            soundEnabled={soundEnabled}
          />
        )}

        {activeTab === 'history' && <CareerHistoryView state={gameState} />}
      </main>

      {/* Match Live Simulation Modal View */}
      {isSimulatingMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
          <MatchSimulationView
            player={gameState.player}
            currentClub={gameState.currentClub}
            opponentClub={nextOpponent}
            round={gameState.currentRound}
            season={gameState.currentSeason}
            soundEnabled={soundEnabled}
            onMatchComplete={handleMatchComplete}
          />
        </div>
      )}

      {/* Post-Match Result Breakdown Modal */}
      {activeMatchResult && (
        <MatchResultModal
          result={activeMatchResult}
          player={gameState.player}
          currentClub={gameState.currentClub}
          opponentClub={nextOpponent}
          onClose={() => setActiveMatchResult(null)}
        />
      )}

      {/* Season Summary Modal */}
      {showSeasonSummary && (
        <SeasonSummaryModal state={gameState} onAdvance={handleAdvanceSeason} />
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal
          state={gameState}
          onClose={() => setShowSettingsModal(false)}
          onSaveToSlot={(slotId) => {
            saveGameState(gameState, slotId);
          }}
          onLoadFromSlot={(slotId) => {
            const loaded = loadGameState(slotId);
            if (loaded) {
              setGameState(loaded);
              showNotification(`슬롯 #${slotId} 세이브를 불러왔습니다.`);
            }
          }}
          onImportState={(newState) => {
            setGameState(newState);
            setShowSettingsModal(false);
            showNotification('외부 세이브 파일을 불러왔습니다.');
          }}
          onResetGame={handleResetGame}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-slate-900 bg-slate-950 text-center text-xs text-slate-500">
        <p>PLAYER CAREER · 축구 선수 육성 & 커리어 시뮬레이션 게임</p>
      </footer>
    </div>
  );
}
