export type Position = 'GK' | 'DF' | 'MF' | 'FW';

export type PreferredFoot = '오른발' | '왼발' | '양발';

export type Morale = '최상' | '좋음' | '보통' | '불안' | '침체';

export type SquadRole = '핵심 주전' | '선발 주전' | '로테이션' | '유망주 백업';

export interface PlayerAttributes {
  pace: number;      // 속도 (PAC)
  shooting: number;  // 슈팅 (SHO)
  passing: number;   // 패스 (PAS)
  dribbling: number; // 드리블 (DRI)
  defending: number; // 수비 (DEF)
  physical: number;  // 피지컬 / 체력 (PHY)
  goalkeeping: number; // 골키퍼 (GK)
}

export interface Player {
  id: string;
  name: string;
  nationality: string;
  nationalityFlag: string;
  position: Position;
  age: number;
  preferredFoot: PreferredFoot;
  avatarUrl: string;
  ovr: number;
  potential: number;
  attributes: PlayerAttributes;
  stamina: number; // 0 - 100
  morale: Morale;
  clubId: string;
  marketValue: number; // in Euros (€)
  contractYears: number;
  weeklyWage: number; // in Euros (€)
  squadRole: SquadRole;
}

export interface Club {
  id: string;
  name: string;
  shortName: string;
  leagueId: string;
  badgeColor: string;
  badgeTextColor: string;
  stadiumName: string;
  stadiumCapacity: number;
  overallRating: number;
  attackRating: number;
  midfieldRating: number;
  defenseRating: number;
  prestige: number; // 1 - 5 stars
  budget: number;
  description: string;
}

export interface League {
  id: string;
  name: string;
  tier: number;
  nation: string;
  clubIds: string[];
}

export interface LeagueStanding {
  clubId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
}

export interface MatchEvent {
  minute: number;
  type: 'goal' | 'assist' | 'shot' | 'shot_saved' | 'tackle' | 'save' | 'yellow_card' | 'red_card' | 'decision_prompt' | 'commentary';
  text: string;
  isPlayerInvolved: boolean;
  scoringClubId?: string;
  playerName?: string;
}

export interface MatchDecisionOption {
  id: string;
  label: string;
  description: string;
  statCheck: keyof PlayerAttributes;
  difficulty: number; // 1-100 threshold
  successResult: {
    eventText: string;
    scoreGoal?: boolean;
    makeAssist?: boolean;
    ratingBonus: number;
  };
  failResult: {
    eventText: string;
    ratingPenalty: number;
  };
}

export interface MatchDecisionPrompt {
  minute: number;
  title: string;
  situation: string;
  options: MatchDecisionOption[];
}

export interface MatchResult {
  id: string;
  date: string;
  season: string;
  round: number;
  homeClubId: string;
  awayClubId: string;
  homeScore: number;
  awayScore: number;
  playedMinutes: number;
  isStarter: boolean;
  playerRating: number;
  goals: number;
  assists: number;
  shots: number;
  shotsOnTarget: number;
  passSuccessRate: number;
  tackles: number;
  saves: number;
  postMatchStamina: number;
  postMatchMorale: Morale;
  events: MatchEvent[];
}

export interface SeasonStats {
  season: string;
  clubId: string;
  leagueId: string;
  appearances: number;
  goals: number;
  assists: number;
  motmCount: number;
  cleanSheets: number;
  yellowCards: number;
  averageRating: number;
  trophiesWon: string[];
}

export interface TransferOffer {
  id: string;
  clubId: string;
  offeredWage: number;
  contractYears: number;
  squadRole: SquadRole;
  transferFee: number;
  expiresInRounds: number;
}

export type TrainingType = 'pace' | 'shooting' | 'passing' | 'dribbling' | 'defending' | 'physical' | 'recovery';
export type TrainingIntensity = 'light' | 'normal' | 'intense';

export interface TrainingResult {
  trainingType: TrainingType;
  intensity: TrainingIntensity;
  attributeGains: Partial<PlayerAttributes>;
  staminaCost: number;
  moraleChange: number;
  message: string;
  successType: 'great' | 'normal' | 'minor';
}

export interface GameState {
  version: number;
  currentDate: string;
  currentSeason: string;
  currentRound: number;
  totalRounds: number;
  player: Player;
  currentClub: Club;
  standings: Record<string, LeagueStanding>; // clubId -> standing
  matchHistory: MatchResult[];
  seasonHistory: SeasonStats[];
  trophies: string[];
  pendingOffers: TransferOffer[];
  managerTrust: number; // 0 - 100
  unlockedMilestones: string[];
  settings: {
    soundEnabled: boolean;
    simSpeed: 'slow' | 'normal' | 'fast';
  };
}
