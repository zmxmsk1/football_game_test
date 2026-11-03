import {
  Club,
  GameState,
  LeagueStanding,
  MatchDecisionOption,
  MatchDecisionPrompt,
  MatchEvent,
  MatchResult,
  Player,
  PlayerAttributes,
  Position,
  PreferredFoot,
  SquadRole,
  TrainingIntensity,
  TrainingResult,
  TrainingType,
  TransferOffer,
} from '../types/game';
import { CLUBS, LEAGUES } from '../data/clubs';

export function calculateOverall(attributes: PlayerAttributes, position: Position): number {
  let ovr = 0;
  switch (position) {
    case 'FW':
      ovr =
        attributes.shooting * 0.35 +
        attributes.pace * 0.25 +
        attributes.dribbling * 0.25 +
        attributes.passing * 0.10 +
        attributes.physical * 0.05;
      break;
    case 'MF':
      ovr =
        attributes.passing * 0.30 +
        attributes.dribbling * 0.25 +
        attributes.shooting * 0.15 +
        attributes.defending * 0.15 +
        attributes.physical * 0.15;
      break;
    case 'DF':
      ovr =
        attributes.defending * 0.40 +
        attributes.physical * 0.25 +
        attributes.pace * 0.15 +
        attributes.passing * 0.15 +
        attributes.dribbling * 0.05;
      break;
    case 'GK':
      ovr =
        attributes.goalkeeping * 0.65 +
        attributes.physical * 0.20 +
        attributes.pace * 0.10 +
        attributes.passing * 0.05;
      break;
  }
  return Math.min(99, Math.max(40, Math.round(ovr)));
}

export function calculateMarketValue(ovr: number, potential: number, age: number, avgRating = 7.0): number {
  // Base exponential value curve by OVR
  let baseValue = 100000;
  if (ovr < 65) {
    baseValue = 150000 + (ovr - 50) * 45000;
  } else if (ovr < 75) {
    baseValue = 1000000 + Math.pow(ovr - 65, 2.2) * 280000;
  } else if (ovr < 85) {
    baseValue = 10000000 + Math.pow(ovr - 75, 2.5) * 1200000;
  } else {
    baseValue = 55000000 + Math.pow(ovr - 85, 2.6) * 5500000;
  }

  // Age multiplier: young players with high potential are worth a premium
  let ageMultiplier = 1.0;
  if (age <= 21) {
    const potGap = Math.max(0, potential - ovr);
    ageMultiplier = 1.35 + potGap * 0.035;
  } else if (age <= 25) {
    ageMultiplier = 1.2;
  } else if (age <= 29) {
    ageMultiplier = 1.0;
  } else if (age <= 33) {
    ageMultiplier = 0.75 - (age - 30) * 0.08;
  } else {
    ageMultiplier = 0.35;
  }

  // Form multiplier
  let formMultiplier = 1.0;
  if (avgRating >= 7.8) formMultiplier = 1.3;
  else if (avgRating >= 7.2) formMultiplier = 1.15;
  else if (avgRating < 6.5) formMultiplier = 0.85;

  return Math.round((baseValue * ageMultiplier * formMultiplier) / 10000) * 10000;
}

export function calculateWeeklyWage(marketValue: number, prestige: number): number {
  const baseWeekly = Math.max(1200, Math.round((marketValue * 0.0022) / 100) * 100);
  const prestigeBonus = 1 + (prestige - 1) * 0.12;
  return Math.round(baseWeekly * prestigeBonus);
}

export function generateInitialAttributes(position: Position): { attributes: PlayerAttributes; potential: number } {
  // Base initial starting stats for rookie pro (OVR ~ 63-68, POT ~ 82-94)
  const baseStats: PlayerAttributes = {
    pace: 62,
    shooting: 55,
    passing: 58,
    dribbling: 60,
    defending: 52,
    physical: 64,
    goalkeeping: 30,
  };

  switch (position) {
    case 'FW':
      baseStats.shooting = 68 + Math.floor(Math.random() * 5);
      baseStats.pace = 71 + Math.floor(Math.random() * 5);
      baseStats.dribbling = 67 + Math.floor(Math.random() * 4);
      baseStats.passing = 58 + Math.floor(Math.random() * 4);
      baseStats.physical = 62 + Math.floor(Math.random() * 4);
      baseStats.defending = 38 + Math.floor(Math.random() * 4);
      baseStats.goalkeeping = 20;
      break;
    case 'MF':
      baseStats.passing = 70 + Math.floor(Math.random() * 5);
      baseStats.dribbling = 68 + Math.floor(Math.random() * 4);
      baseStats.shooting = 62 + Math.floor(Math.random() * 4);
      baseStats.defending = 58 + Math.floor(Math.random() * 4);
      baseStats.pace = 65 + Math.floor(Math.random() * 4);
      baseStats.physical = 66 + Math.floor(Math.random() * 4);
      baseStats.goalkeeping = 20;
      break;
    case 'DF':
      baseStats.defending = 72 + Math.floor(Math.random() * 5);
      baseStats.physical = 70 + Math.floor(Math.random() * 4);
      baseStats.pace = 63 + Math.floor(Math.random() * 4);
      baseStats.passing = 59 + Math.floor(Math.random() * 4);
      baseStats.dribbling = 54 + Math.floor(Math.random() * 4);
      baseStats.shooting = 42 + Math.floor(Math.random() * 4);
      baseStats.goalkeeping = 25;
      break;
    case 'GK':
      baseStats.goalkeeping = 71 + Math.floor(Math.random() * 5);
      baseStats.physical = 68 + Math.floor(Math.random() * 4);
      baseStats.passing = 56 + Math.floor(Math.random() * 4);
      baseStats.pace = 52 + Math.floor(Math.random() * 4);
      baseStats.defending = 35;
      baseStats.shooting = 25;
      baseStats.dribbling = 35;
      break;
  }

  const initialOvr = calculateOverall(baseStats, position);
  const potential = Math.min(96, Math.max(initialOvr + 14, 82 + Math.floor(Math.random() * 11)));

  return { attributes: baseStats, potential };
}

export function initializeStandings(leagueId: string): Record<string, LeagueStanding> {
  const league = LEAGUES.find((l) => l.id === leagueId) || LEAGUES[2];
  const standings: Record<string, LeagueStanding> = {};

  league.clubIds.forEach((clubId) => {
    standings[clubId] = {
      clubId,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDiff: 0,
      points: 0,
    };
  });

  return standings;
}

export function createNewGame(params: {
  name: string;
  nationality: string;
  nationalityFlag: string;
  position: Position;
  age: number;
  preferredFoot: PreferredFoot;
  avatarUrl: string;
  starterClubId: string;
}): GameState {
  const { attributes, potential } = generateInitialAttributes(params.position);
  const initialOvr = calculateOverall(attributes, params.position);
  const club = CLUBS[params.starterClubId] || CLUBS['seoul_phoenix'];
  const marketVal = calculateMarketValue(initialOvr, potential, params.age);
  const wage = calculateWeeklyWage(marketVal, club.prestige);

  const player: Player = {
    id: `player_${Date.now()}`,
    name: params.name.trim() || '신성 공격수',
    nationality: params.nationality,
    nationalityFlag: params.nationalityFlag,
    position: params.position,
    age: params.age,
    preferredFoot: params.preferredFoot,
    avatarUrl: params.avatarUrl,
    ovr: initialOvr,
    potential,
    attributes,
    stamina: 100,
    morale: '최상',
    clubId: club.id,
    marketValue: marketVal,
    contractYears: 3,
    weeklyWage: wage,
    squadRole: initialOvr >= 66 ? '선발 주전' : '로테이션',
  };

  const standings = initializeStandings(club.leagueId);

  return {
    version: 1,
    currentDate: '2026-08-15',
    currentSeason: '2026/27',
    currentRound: 1,
    totalRounds: 14, // 8 clubs = 14 rounds for clean season loop
    player,
    currentClub: club,
    standings,
    matchHistory: [],
    seasonHistory: [],
    trophies: [],
    pendingOffers: [],
    managerTrust: 75,
    unlockedMilestones: ['프로 계약 체결'],
    settings: {
      soundEnabled: true,
      simSpeed: 'normal',
    },
  };
}

export function executeTraining(player: Player, type: TrainingType, intensity: TrainingIntensity): { player: Player; result: TrainingResult } {
  let staminaCost = 15;
  let gainChance = 0.75;
  let maxPossibleGain = 1;

  if (intensity === 'light') {
    staminaCost = 10;
    gainChance = 0.6;
    maxPossibleGain = 1;
  } else if (intensity === 'normal') {
    staminaCost = 18;
    gainChance = 0.75;
    maxPossibleGain = 1;
  } else if (intensity === 'intense') {
    staminaCost = 28;
    gainChance = 0.88;
    maxPossibleGain = 2;
  }

  // Age effect: aging reduces growth chance
  if (player.age > 28) {
    gainChance *= Math.max(0.3, 1 - (player.age - 28) * 0.12);
  } else if (player.age <= 21) {
    gainChance = Math.min(0.96, gainChance * 1.15);
  }

  // Potential ceiling
  const updatedAttributes = { ...player.attributes };
  const attributeGains: Partial<PlayerAttributes> = {};
  let successType: 'great' | 'normal' | 'minor' = 'normal';
  let message = '';

  if (type === 'recovery') {
    // Rest and recovery drill
    const restoredStamina = Math.min(100, player.stamina + 28);
    return {
      player: {
        ...player,
        stamina: restoredStamina,
        morale: player.morale === '침체' ? '보통' : player.morale === '불안' ? '좋음' : '최상',
      },
      result: {
        trainingType: type,
        intensity,
        attributeGains: {},
        staminaCost: 0,
        moraleChange: +1,
        message: '가벼운 마사지와 스트레칭으로 피로를 풀고 체력을 크게 회복했습니다 (+28 체력).',
        successType: 'great',
      },
    };
  }

  const attrKeyMap: Record<TrainingType, keyof PlayerAttributes> = {
    pace: 'pace',
    shooting: 'shooting',
    passing: 'passing',
    dribbling: 'dribbling',
    defending: 'defending',
    physical: 'physical',
    recovery: 'physical',
  };

  const targetStat = attrKeyMap[type];
  const currentStatVal = updatedAttributes[targetStat];

  if (currentStatVal >= player.potential) {
    message = `해당 능력치(${currentStatVal})가 현재 잠재력 한계치(${player.potential})에 도달하여 추가 성장이 제한됩니다.`;
    successType = 'minor';
  } else {
    const roll = Math.random();
    if (roll < gainChance) {
      const isGreat = roll < 0.25 && maxPossibleGain > 1;
      const gainAmount = isGreat ? 2 : 1;
      const newStat = Math.min(player.potential, currentStatVal + gainAmount);
      const actualGain = newStat - currentStatVal;

      if (actualGain > 0) {
        updatedAttributes[targetStat] = newStat;
        attributeGains[targetStat] = actualGain;
        successType = actualGain > 1 ? 'great' : 'normal';
        message =
          actualGain > 1
            ? `훈련 대성공! 코칭스태프의 극찬과 함께 ${targetStat.toUpperCase()} 능력이 +${actualGain} 급상승했습니다!`
            : `훈련 성공! 꾸준한 반복 훈련으로 ${targetStat.toUpperCase()} 능력이 +${actualGain} 상승했습니다.`;
      } else {
        message = '훈련을 성실히 마쳤으나 추가 성장은 미미했습니다.';
        successType = 'minor';
      }
    } else {
      message = '컨디션 난조로 인해 유의미한 기술 향상을 거두지 못했습니다.';
      successType = 'minor';
    }
  }

  const newOvr = calculateOverall(updatedAttributes, player.position);
  const newStamina = Math.max(5, player.stamina - staminaCost);
  const newMarketValue = calculateMarketValue(newOvr, player.potential, player.age);

  return {
    player: {
      ...player,
      attributes: updatedAttributes,
      ovr: newOvr,
      stamina: newStamina,
      marketValue: newMarketValue,
    },
    result: {
      trainingType: type,
      intensity,
      attributeGains,
      staminaCost,
      moraleChange: successType === 'great' ? 1 : 0,
      message,
      successType,
    },
  };
}

export function getNextOpponent(club: Club, round: number): Club {
  const league = LEAGUES.find((l) => l.id === club.leagueId) || LEAGUES[2];
  const opponents = league.clubIds.filter((id) => id !== club.id);
  // Round-robin index calculation
  const opponentIndex = (round - 1) % opponents.length;
  const oppId = opponents[opponentIndex];
  return CLUBS[oppId] || CLUBS['busan_wave'];
}

export function createDecisionPrompt(minute: number, position: Position): MatchDecisionPrompt {
  if (position === 'FW') {
    return {
      minute,
      title: '결정적 공격 찬스!',
      situation: '페널티 에어리어 가장자리에서 수비수를 제치고 골키퍼와 1:1에 가까운 각도를 만들었습니다!',
      options: [
        {
          id: 'shoot_finesse',
          label: '골문 구석 감아차기',
          description: '정교한 슈팅으로 파포스트 구석을 노립니다.',
          statCheck: 'shooting',
          difficulty: 66,
          successResult: {
            eventText: '환상적인 감아차기가 골망 구석을 흔들었습니다! 원더골!',
            scoreGoal: true,
            ratingBonus: 1.2,
          },
          failResult: {
            eventText: '감아찬 슈팅이 살짝 빗나가며 골대 옆 그물을 때렸습니다.',
            ratingPenalty: 0.2,
          },
        },
        {
          id: 'pass_tapin',
          label: '침투하는 동료에게 컷백 패스',
          description: '무리하지 않고 빈 공간의 동료에게 완벽한 찬스를 내줍니다.',
          statCheck: 'passing',
          difficulty: 58,
          successResult: {
            eventText: '수비를 완벽히 속이는 킬러 컷백! 동료가 가볍게 밀어넣었습니다! 도움 기록!',
            makeAssist: true,
            ratingBonus: 1.0,
          },
          failResult: {
            eventText: '컷백 패스가 상대 수비수의 발끝에 걸려 차단되었습니다.',
            ratingPenalty: 0.1,
          },
        },
        {
          id: 'dribble_past_gk',
          label: '골키퍼 제치기 드리블',
          description: '골키퍼까지 완전히 제친 후 빈 골대에 골을 넣으려 합니다.',
          statCheck: 'dribbling',
          difficulty: 74,
          successResult: {
            eventText: '현란한 페인팅으로 골키퍼를 완벽히 속이고 빈 골대에 볼을 넣었습니다!',
            scoreGoal: true,
            ratingBonus: 1.5,
          },
          failResult: {
            eventText: '골키퍼의 긴 팔에 공이 걸리며 찬스가 무산되었습니다.',
            ratingPenalty: 0.3,
          },
        },
      ],
    };
  } else if (position === 'MF') {
    return {
      minute,
      title: '미드필더 빌드업 선택!',
      situation: '중원에서 볼을 잡았을 때 전방과 측면으로 동료들이 쇄도하고 있습니다.',
      options: [
        {
          id: 'through_ball',
          label: '수비 라인을 허무는 킬패스',
          description: '상대 센터백 사이를 찌르는 침투 스루패스를 시도합니다.',
          statCheck: 'passing',
          difficulty: 65,
          successResult: {
            eventText: '마법 같은 스루패스가 수비진을 붕괴시켰고 공격수가 득점에 성공했습니다! 도움 추가!',
            makeAssist: true,
            ratingBonus: 1.1,
          },
          failResult: {
            eventText: '스루패스의 강도가 다소 강해 골키퍼 품에 안겼습니다.',
            ratingPenalty: 0.2,
          },
        },
        {
          id: 'long_range_shot',
          label: '중거리 대포알 슈팅',
          description: '예상치 못한 타이밍에 중거리 벼락 슈팅을 때립니다.',
          statCheck: 'shooting',
          difficulty: 70,
          successResult: {
            eventText: '강력한 중거리 슛이 골대 상단 구석에 꽂혔습니다! 환상적인 원더골!',
            scoreGoal: true,
            ratingBonus: 1.3,
          },
          failResult: {
            eventText: '슈팅이 크로스바 위로 높게 솟구쳤습니다.',
            ratingPenalty: 0.2,
          },
        },
        {
          id: 'press_break',
          label: '탈압박 후 안정적인 볼 배급',
          description: '상대 압박을 부드럽게 벗겨내고 템포를 조율합니다.',
          statCheck: 'dribbling',
          difficulty: 60,
          successResult: {
            eventText: '감각적인 턴으로 상대 미드필더 둘을 벗겨내며 경기 템포를 장악했습니다.',
            ratingBonus: 0.6,
          },
          failResult: {
            eventText: '상대의 거센 압박에 볼을 빼앗겼으나 수비진이 위기를 넘겼습니다.',
            ratingPenalty: 0.2,
          },
        },
      ],
    };
  } else if (position === 'DF') {
    return {
      minute,
      title: '실점 위기! 수비 결단',
      situation: '상대 에이스 공격수가 위험 지역으로 돌파해 들어오고 있습니다!',
      options: [
        {
          id: 'slide_tackle',
          label: '정확한 슬라이딩 태클',
          description: '공만 깔끔하게 걷어내는 결정적 슬라이딩 태클을 시도합니다.',
          statCheck: 'defending',
          difficulty: 64,
          successResult: {
            eventText: '완벽한 타이밍의 슬라이딩 태클! 공만 정확히 걷어내며 홈 관중의 기립박수를 받습니다!',
            ratingBonus: 1.1,
          },
          failResult: {
            eventText: '태클 타이밍이 늦어 옐로카드를 받고 프리킥을 허용했습니다.',
            ratingPenalty: 0.4,
          },
        },
        {
          id: 'body_block',
          label: '몸싸움으로 공격로 차단',
          description: '강력한 피지컬로 상대 공격수를 밀어내며 볼을 탈환합니다.',
          statCheck: 'physical',
          difficulty: 62,
          successResult: {
            eventText: '압도적인 피지컬로 상대 공격수를 튕겨내고 안전하게 골키퍼에게 패스했습니다.',
            ratingBonus: 0.9,
          },
          failResult: {
            eventText: '몸싸움에서 중심을 잃으며 슈팅 공간을 내주었습니다.',
            ratingPenalty: 0.3,
          },
        },
      ],
    };
  } else {
    // GK
    return {
      minute,
      title: '골키퍼 수퍼 세이브 기회!',
      situation: '상대 공격수가 노마크 상태에서 문전 바로 앞에서 강슛을 날렸습니다!',
      options: [
        {
          id: 'reflex_dive',
          label: '동물적인 반사신경 다이빙',
          description: '본능적으로 몸을 날려 골문 구석으로 향하는 공을 쳐냅니다.',
          statCheck: 'goalkeeping',
          difficulty: 65,
          successResult: {
            eventText: '손끝으로 쳐내는 미친 슈퍼세이브! 실점을 막아냈습니다!',
            ratingBonus: 1.4,
          },
          failResult: {
            eventText: '몸을 날렸으나 슈팅 속도가 너무 빨라 골망이 흔들렸습니다.',
            ratingPenalty: 0.3,
          },
        },
        {
          id: 'rush_out',
          label: '과감한 전진 각도 좁히기',
          description: '빠르게 각도를 좁혀 공격수의 슈팅 각을 지워버립니다.',
          statCheck: 'pace',
          difficulty: 62,
          successResult: {
            eventText: '과감한 전진으로 슈팅 각도를 완전히 지워 슈팅이 몸에 맞고 굴절되었습니다!',
            ratingBonus: 1.2,
          },
          failResult: {
            eventText: '각도를 좁혔으나 상대의 로빙슛에 허를 찔렸습니다.',
            ratingPenalty: 0.3,
          },
        },
      ],
    };
  }
}

export function simulateMatch(params: {
  player: Player;
  currentClub: Club;
  opponentClub: Club;
  round: number;
  season: string;
  isStarter: boolean;
  decisionResults?: { option: MatchDecisionOption; success: boolean }[];
}): MatchResult {
  const { player, currentClub, opponentClub, round, season, isStarter, decisionResults } = params;

  const events: MatchEvent[] = [];
  let homeScore = 0;
  let awayScore = 0;

  let goals = 0;
  let assists = 0;
  let shots = 0;
  let shotsOnTarget = 0;
  let passSuccessRate = 80 + Math.floor(Math.random() * 14);
  let tackles = 0;
  let saves = 0;
  let baseRating = 6.4 + Math.random() * 0.6;

  const playedMinutes = isStarter ? (player.stamina < 30 ? 65 : 90) : 30;

  // Rating impact from player attributes
  const ovrBonus = (player.ovr - 65) * 0.04;
  baseRating += ovrBonus;

  // Morale impact
  if (player.morale === '최상') baseRating += 0.3;
  else if (player.morale === '침체') baseRating -= 0.4;

  events.push({
    minute: 1,
    type: 'commentary',
    text: `심판의 킥오프 휘슬과 함께 ${currentClub.name} vs ${opponentClub.name}의 경기가 시작되었습니다!`,
    isPlayerInvolved: false,
  });

  // Calculate team base scores
  const clubAttackDiff = currentClub.attackRating - opponentClub.defenseRating;
  const oppAttackDiff = opponentClub.attackRating - currentClub.defenseRating;

  let myTeamGoals = Math.max(0, Math.floor((clubAttackDiff + 10) / 10 + Math.random() * 2.2));
  let oppTeamGoals = Math.max(0, Math.floor((oppAttackDiff + 10) / 10 + Math.random() * 2.1));

  // If user played decision prompts
  if (decisionResults && decisionResults.length > 0) {
    decisionResults.forEach((dec) => {
      if (dec.success) {
        baseRating += dec.option.successResult.ratingBonus;
        if (dec.option.successResult.scoreGoal) {
          goals += 1;
          myTeamGoals += 1;
          shots += 1;
          shotsOnTarget += 1;
        }
        if (dec.option.successResult.makeAssist) {
          assists += 1;
          myTeamGoals += 1;
        }
        events.push({
          minute: 40 + Math.floor(Math.random() * 35),
          type: dec.option.successResult.scoreGoal ? 'goal' : dec.option.successResult.makeAssist ? 'assist' : 'tackle',
          text: `[결정적 플레이] ${dec.option.successResult.eventText}`,
          isPlayerInvolved: true,
          scoringClubId: currentClub.id,
          playerName: player.name,
        });
      } else {
        baseRating -= dec.option.failResult.ratingPenalty;
        events.push({
          minute: 45 + Math.floor(Math.random() * 30),
          type: 'commentary',
          text: `[아쉬운 기회] ${dec.option.failResult.eventText}`,
          isPlayerInvolved: true,
        });
      }
    });
  }

  // Simulate timeline events based on position and active minutes
  const timelineMinutes = [12, 24, 38, 51, 67, 78, 88];

  timelineMinutes.forEach((m) => {
    if (m > playedMinutes) return;

    if (player.position === 'FW') {
      shots += 1;
      const onTargetChance = player.attributes.shooting * 0.009;
      if (Math.random() < onTargetChance) {
        shotsOnTarget += 1;
        // Chance to score
        const scoreChance = player.attributes.shooting * 0.005;
        if (Math.random() < scoreChance && goals < 2) {
          goals += 1;
          myTeamGoals = Math.max(myTeamGoals, goals);
          events.push({
            minute: m,
            type: 'goal',
            text: `GOOOAL! ${player.name} 선수가 수비 라인을 무너뜨리고 침착하게 골망을 흔듭니다!`,
            isPlayerInvolved: true,
            scoringClubId: currentClub.id,
            playerName: player.name,
          });
          baseRating += 1.1;
        } else {
          events.push({
            minute: m,
            type: 'shot_saved',
            text: `${player.name} 선수의 날카로운 유효 슈팅! 상대 골키퍼가 가까스로 쳐냅니다.`,
            isPlayerInvolved: true,
          });
          baseRating += 0.2;
        }
      }
    } else if (player.position === 'MF') {
      if (Math.random() < 0.35) {
        tackles += 1;
        events.push({
          minute: m,
          type: 'tackle',
          text: `${player.name} 선수가 중원에서 상대의 전진 패스를 정확하게 인터셉트합니다.`,
          isPlayerInvolved: true,
        });
        baseRating += 0.25;
      }
      if (Math.random() < 0.25 && assists < 2) {
        assists += 1;
        myTeamGoals += 1;
        events.push({
          minute: m,
          type: 'assist',
          text: `${player.name} 선수의 환상적인 대각선 스루패스! 동료 공격수가 득점으로 연결합니다!`,
          isPlayerInvolved: true,
          scoringClubId: currentClub.id,
          playerName: player.name,
        });
        baseRating += 0.9;
      }
    } else if (player.position === 'DF') {
      tackles += 1;
      const tackleSuccess = Math.random() < player.attributes.defending * 0.01;
      if (tackleSuccess) {
        events.push({
          minute: m,
          type: 'tackle',
          text: `${player.name} 선수의 철벽 수비! 상대 공격수의 슈팅 각도를 완벽하게 차단합니다.`,
          isPlayerInvolved: true,
        });
        baseRating += 0.4;
      }
    } else if (player.position === 'GK') {
      saves += 1;
      events.push({
        minute: m,
        type: 'save',
        text: `${player.name} 골키퍼의 동물적인 반사 세이브! 골문 구석으로 향하던 공을 쳐냅니다.`,
        isPlayerInvolved: true,
      });
      baseRating += 0.5;
    }
  });

  // Finalize score
  homeScore = myTeamGoals;
  awayScore = oppTeamGoals;

  // Add random opponent goals if any
  if (awayScore > 0 && !events.some((e) => e.scoringClubId === opponentClub.id)) {
    events.push({
      minute: 34 + Math.floor(Math.random() * 40),
      type: 'goal',
      text: `${opponentClub.name}의 역습 공격 전개! 날카로운 슈팅으로 득점에 성공합니다.`,
      isPlayerInvolved: false,
      scoringClubId: opponentClub.id,
    });
  }

  // Final match end event
  events.push({
    minute: 90,
    type: 'commentary',
    text: `경기 종료 휘슬! 최종 스코어 ${currentClub.name} ${homeScore} : ${awayScore} ${opponentClub.name}`,
    isPlayerInvolved: false,
  });

  // Sort events by minute
  events.sort((a, b) => a.minute - b.minute);

  // Clamp player rating between 5.5 and 10.0
  const finalRating = Math.min(10.0, Math.max(5.5, Math.round(baseRating * 10) / 10));

  // Stamina consumption
  const staminaDrain = isStarter ? 24 + Math.floor(Math.random() * 8) : 14;
  const postMatchStamina = Math.max(10, player.stamina - staminaDrain);

  // Morale calculation
  let postMatchMorale = player.morale;
  if (homeScore > awayScore && finalRating >= 7.0) {
    postMatchMorale = '최상';
  } else if (homeScore < awayScore && finalRating < 6.5) {
    postMatchMorale = player.morale === '최상' ? '좋음' : '불안';
  }

  return {
    id: `match_${Date.now()}`,
    date: `2026-09-${String(round * 7).padStart(2, '0')}`,
    season,
    round,
    homeClubId: currentClub.id,
    awayClubId: opponentClub.id,
    homeScore,
    awayScore,
    playedMinutes,
    isStarter,
    playerRating: finalRating,
    goals,
    assists,
    shots,
    shotsOnTarget,
    passSuccessRate,
    tackles,
    saves,
    postMatchStamina,
    postMatchMorale,
    events,
  };
}

export function simulateLeagueRound(leagueId: string, currentMatch: MatchResult, currentStandings: Record<string, LeagueStanding>): Record<string, LeagueStanding> {
  const league = LEAGUES.find((l) => l.id === leagueId) || LEAGUES[2];
  const updatedStandings = { ...currentStandings };

  // Update standings for user match
  const userHome = updatedStandings[currentMatch.homeClubId];
  const userAway = updatedStandings[currentMatch.awayClubId];

  if (userHome && userAway) {
    userHome.played += 1;
    userHome.goalsFor += currentMatch.homeScore;
    userHome.goalsAgainst += currentMatch.awayScore;
    userHome.goalDiff = userHome.goalsFor - userHome.goalsAgainst;

    userAway.played += 1;
    userAway.goalsFor += currentMatch.awayScore;
    userAway.goalsAgainst += currentMatch.homeScore;
    userAway.goalDiff = userAway.goalsFor - userAway.goalsAgainst;

    if (currentMatch.homeScore > currentMatch.awayScore) {
      userHome.won += 1;
      userHome.points += 3;
      userAway.lost += 1;
    } else if (currentMatch.homeScore === currentMatch.awayScore) {
      userHome.drawn += 1;
      userHome.points += 1;
      userAway.drawn += 1;
      userAway.points += 1;
    } else {
      userHome.lost += 1;
      userAway.won += 1;
      userAway.points += 3;
    }
  }

  // Simulate other pairs
  const otherClubs = league.clubIds.filter(
    (id) => id !== currentMatch.homeClubId && id !== currentMatch.awayClubId
  );

  for (let i = 0; i < otherClubs.length; i += 2) {
    if (i + 1 >= otherClubs.length) break;
    const homeId = otherClubs[i];
    const awayId = otherClubs[i + 1];

    const homeClub = CLUBS[homeId];
    const awayClub = CLUBS[awayId];

    if (!homeClub || !awayClub) continue;

    const homeStrength = homeClub.overallRating + 2; // Home advantage
    const awayStrength = awayClub.overallRating;

    const diff = homeStrength - awayStrength;
    const homeGoals = Math.max(0, Math.floor((diff + 10) / 10 + Math.random() * 2));
    const awayGoals = Math.max(0, Math.floor((-diff + 10) / 10 + Math.random() * 2));

    const hStand = updatedStandings[homeId];
    const aStand = updatedStandings[awayId];

    if (hStand && aStand) {
      hStand.played += 1;
      hStand.goalsFor += homeGoals;
      hStand.goalsAgainst += awayGoals;
      hStand.goalDiff = hStand.goalsFor - hStand.goalsAgainst;

      aStand.played += 1;
      aStand.goalsFor += awayGoals;
      aStand.goalsAgainst += homeGoals;
      aStand.goalDiff = aStand.goalsFor - aStand.goalsAgainst;

      if (homeGoals > awayGoals) {
        hStand.won += 1;
        hStand.points += 3;
        aStand.lost += 1;
      } else if (homeGoals === awayGoals) {
        hStand.drawn += 1;
        hStand.points += 1;
        aStand.drawn += 1;
        aStand.points += 1;
      } else {
        hStand.lost += 1;
        aStand.won += 1;
        aStand.points += 3;
      }
    }
  }

  return updatedStandings;
}

export function generateTransferOffers(player: Player, currentClub: Club, avgRating: number): TransferOffer[] {
  const offers: TransferOffer[] = [];
  const currentLeague = LEAGUES.find((l) => l.id === currentClub.leagueId) || LEAGUES[2];

  // Higher chance if player is performing well or high OVR
  const candidateClubs: Club[] = [];

  // If in tier 3 and OVR >= 72 or avgRating >= 7.3, tier 2 clubs notice
  if (currentLeague.tier === 3) {
    if (player.ovr >= 70 || avgRating >= 7.2) {
      const tier2League = LEAGUES[1];
      tier2League.clubIds.forEach((id) => candidateClubs.push(CLUBS[id]));
    }
    // Also domestic top clubs in same tier
    currentLeague.clubIds
      .filter((id) => id !== currentClub.id && CLUBS[id].overallRating >= currentClub.overallRating)
      .forEach((id) => candidateClubs.push(CLUBS[id]));
  } else if (currentLeague.tier === 2) {
    if (player.ovr >= 80 || avgRating >= 7.5) {
      const tier1League = LEAGUES[0];
      tier1League.clubIds.forEach((id) => candidateClubs.push(CLUBS[id]));
    }
    currentLeague.clubIds
      .filter((id) => id !== currentClub.id)
      .forEach((id) => candidateClubs.push(CLUBS[id]));
  } else {
    // Tier 1 world clubs
    currentLeague.clubIds
      .filter((id) => id !== currentClub.id)
      .forEach((id) => candidateClubs.push(CLUBS[id]));
  }

  if (candidateClubs.length === 0) return [];

  // Pick 1 to 2 interested clubs
  const shuffled = [...candidateClubs].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, Math.min(2, shuffled.length));

  selected.forEach((c) => {
    let squadRole: SquadRole = '선발 주전';
    if (player.ovr >= c.overallRating + 2) squadRole = '핵심 주전';
    else if (player.ovr < c.overallRating - 4) squadRole = '유망주 백업';
    else squadRole = '로테이션';

    const wage = Math.round(calculateWeeklyWage(player.marketValue, c.prestige) * (1.1 + Math.random() * 0.3));

    offers.push({
      id: `offer_${c.id}_${Date.now()}`,
      clubId: c.id,
      offeredWage: wage,
      contractYears: 3 + Math.floor(Math.random() * 2),
      squadRole,
      transferFee: Math.round(player.marketValue * (1.15 + Math.random() * 0.25)),
      expiresInRounds: 3,
    });
  });

  return offers;
}

export function advanceSeason(state: GameState): GameState {
  const currentYear = parseInt(state.currentSeason.split('/')[0], 10);
  const nextSeason = `${currentYear + 1}/${String(currentYear + 2).slice(2)}`;

  // Calculate current season stats
  const seasonMatches = state.matchHistory.filter((m) => m.season === state.currentSeason);
  const totalApps = seasonMatches.length;
  const totalGoals = seasonMatches.reduce((acc, m) => acc + m.goals, 0);
  const totalAssists = seasonMatches.reduce((acc, m) => acc + m.assists, 0);
  const avgRating = totalApps > 0 ? seasonMatches.reduce((acc, m) => acc + m.playerRating, 0) / totalApps : 7.0;

  // Determine champion
  const sortedStandings = Object.values(state.standings).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.goalDiff - a.goalDiff;
  });

  const isChampion = sortedStandings.length > 0 && sortedStandings[0].clubId === state.currentClub.id;
  const newTrophies = [...state.trophies];
  const newMilestones = [...state.unlockedMilestones];

  if (isChampion) {
    const trophyName = `${state.currentSeason} 리그 챔피언 트로피`;
    newTrophies.push(trophyName);
    newMilestones.push(`${state.currentSeason} 리그 우승 달성`);
  }

  if (totalGoals >= 10) {
    newMilestones.push(`${state.currentSeason} 시즌 두 자릿수 득점`);
  }

  // Age progression
  const newAge = state.player.age + 1;
  const updatedAttributes = { ...state.player.attributes };

  // Aging physics (age 31+ slight physical drop)
  if (newAge >= 31) {
    updatedAttributes.pace = Math.max(40, updatedAttributes.pace - 1);
    updatedAttributes.physical = Math.max(45, updatedAttributes.physical - 1);
  }

  const newOvr = calculateOverall(updatedAttributes, state.player.position);
  const newContractYears = Math.max(0, state.player.contractYears - 1);

  const updatedPlayer: Player = {
    ...state.player,
    age: newAge,
    attributes: updatedAttributes,
    ovr: newOvr,
    contractYears: newContractYears,
    stamina: 100, // fully rested during off-season
    morale: '최상',
    marketValue: calculateMarketValue(newOvr, state.player.potential, newAge, avgRating),
  };

  const newSeasonStat = {
    season: state.currentSeason,
    clubId: state.currentClub.id,
    leagueId: state.currentClub.leagueId,
    appearances: totalApps,
    goals: totalGoals,
    assists: totalAssists,
    motmCount: seasonMatches.filter((m) => m.playerRating >= 8.5).length,
    cleanSheets: seasonMatches.filter((m) => m.awayScore === 0).length,
    yellowCards: 0,
    averageRating: Math.round(avgRating * 10) / 10,
    trophiesWon: isChampion ? ['리그 우승'] : [],
  };

  // Reset standings for the new season
  const freshStandings = initializeStandings(state.currentClub.leagueId);

  return {
    ...state,
    currentSeason: nextSeason,
    currentRound: 1,
    currentDate: `${currentYear + 1}-08-15`,
    player: updatedPlayer,
    standings: freshStandings,
    seasonHistory: [newSeasonStat, ...state.seasonHistory],
    trophies: newTrophies,
    unlockedMilestones: newMilestones,
    pendingOffers: generateTransferOffers(updatedPlayer, state.currentClub, avgRating),
  };
}
