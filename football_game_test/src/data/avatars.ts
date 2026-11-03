export interface AvatarOption {
  id: string;
  name: string;
  url: string;
  badge: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  {
    id: 'striker_pro',
    name: '골게터 스트라이커',
    url: '/src/assets/images/player_avatar_striker_1793681589785.jpg',
    badge: 'FW',
  },
  {
    id: 'playmaker_pro',
    name: '마에스트로 미드필더',
    url: '/src/assets/images/player_avatar_playmaker_1793681590413.jpg',
    badge: 'MF',
  },
  {
    id: 'defender_rock',
    name: '통곡의 벽 수비수',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=defender-solid&backgroundColor=1e293b',
    badge: 'DF',
  },
  {
    id: 'gk_guardian',
    name: '수호신 골키퍼',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=keeper-reflex&backgroundColor=0f172a',
    badge: 'GK',
  },
];

export const STADIUM_BG = '/src/assets/images/stadium_match_atmosphere_1793681590043.jpg';
export const TROPHY_IMG = '/src/assets/images/football_trophy_glory_1793681590276.jpg';
