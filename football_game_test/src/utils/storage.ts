import { GameState } from '../types/game';

const AUTOSAVE_KEY = 'player_career_autosave_v1';
const SLOT_PREFIX = 'player_career_slot_';

export function saveGameState(state: GameState, slotId?: number): boolean {
  try {
    const key = slotId ? `${SLOT_PREFIX}${slotId}` : AUTOSAVE_KEY;
    const serialized = JSON.stringify(state);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error('Failed to save game state:', error);
    return false;
  }
}

export function loadGameState(slotId?: number): GameState | null {
  try {
    const key = slotId ? `${SLOT_PREFIX}${slotId}` : AUTOSAVE_KEY;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    if (!parsed || !parsed.player || !parsed.player.name) {
      throw new Error('데이터 형식이 올바르지 않습니다.');
    }
    return parsed;
  } catch (error) {
    console.error('Failed to load game state:', error);
    return null;
  }
}

export function hasSavedGame(slotId?: number): boolean {
  const key = slotId ? `${SLOT_PREFIX}${slotId}` : AUTOSAVE_KEY;
  return !!localStorage.getItem(key);
}

export function getSlotInfo(slotId: number): { exists: boolean; playerName?: string; clubName?: string; season?: string; ovr?: number; timestamp?: string } {
  try {
    const raw = localStorage.getItem(`${SLOT_PREFIX}${slotId}`);
    if (!raw) return { exists: false };
    const parsed = JSON.parse(raw) as GameState;
    return {
      exists: true,
      playerName: parsed.player?.name,
      clubName: parsed.currentClub?.name,
      season: parsed.currentSeason,
      ovr: parsed.player?.ovr,
      timestamp: parsed.currentDate,
    };
  } catch {
    return { exists: false };
  }
}

export function deleteSaveSlot(slotId?: number): boolean {
  try {
    const key = slotId ? `${SLOT_PREFIX}${slotId}` : AUTOSAVE_KEY;
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export function exportSaveToJSON(state: GameState) {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(state, null, 2))}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `PlayerCareer_${state.player.name}_${state.currentSeason.replace('/', '-')}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function parseSaveFile(fileContent: string): GameState | null {
  try {
    const parsed = JSON.parse(fileContent) as GameState;
    if (parsed.player && parsed.player.attributes && parsed.currentClub) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}
