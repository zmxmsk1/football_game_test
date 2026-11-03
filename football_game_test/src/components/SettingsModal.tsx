import React, { useState } from 'react';
import { GameState } from '../types/game';
import { exportSaveToJSON, getSlotInfo, parseSaveFile } from '../utils/storage';
import { playSound } from '../utils/audio';
import {
  Settings as SettingsIcon,
  Save,
  Download,
  Upload,
  Volume2,
  VolumeX,
  RotateCcw,
  X,
  Check,
  AlertTriangle,
} from 'lucide-react';

interface SettingsModalProps {
  state: GameState;
  onClose: () => void;
  onSaveToSlot: (slotId: number) => void;
  onLoadFromSlot: (slotId: number) => void;
  onImportState: (newState: GameState) => void;
  onResetGame: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  state,
  onClose,
  onSaveToSlot,
  onLoadFromSlot,
  onImportState,
  onResetGame,
  soundEnabled,
  onToggleSound,
}) => {
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleSlotSave = (slotId: number) => {
    playSound('click', soundEnabled);
    onSaveToSlot(slotId);
    setSaveSuccessMsg(`슬롯 ${slotId}에 정상적으로 저장되었습니다.`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleSlotLoad = (slotId: number) => {
    playSound('levelUp', soundEnabled);
    onLoadFromSlot(slotId);
    setSaveSuccessMsg(`슬롯 ${slotId}의 데이터를 불러왔습니다.`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const parsed = parseSaveFile(content);
      if (parsed) {
        playSound('levelUp', soundEnabled);
        onImportState(parsed);
        setSaveSuccessMsg('외부 세이브 파일을 성공적으로 불러왔습니다!');
      } else {
        alert('올바르지 않은 세이브 파일 형식입니다.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base text-white">게임 설정 & 데이터 관리</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {saveSuccessMsg && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Audio Sound Toggle */}
        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <VolumeX className="w-5 h-5 text-slate-500" />
            )}
            <div>
              <span className="font-bold text-xs text-white block">게임 효과음 및 휘슬 사운드</span>
              <span className="text-[11px] text-slate-400">경기 휘슬, 골 환호성, 레벨업 효과음</span>
            </div>
          </div>
          <button
            onClick={onToggleSound}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            {soundEnabled ? 'ON (켜짐)' : 'OFF (꺼짐)'}
          </button>
        </div>

        {/* Save Slots (1, 2, 3) */}
        <div className="space-y-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            세이브 슬롯 관리
          </span>

          {[1, 2, 3].map((slotId) => {
            const slotInfo = getSlotInfo(slotId);

            return (
              <div
                key={slotId}
                className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between gap-3"
              >
                <div>
                  <span className="font-bold text-xs text-white block">슬롯 #{slotId}</span>
                  <span className="text-[11px] text-slate-400">
                    {slotInfo.exists
                      ? `${slotInfo.playerName} (${slotInfo.clubName}) · OVR ${slotInfo.ovr} · ${slotInfo.season}`
                      : '비어 있는 슬롯'}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleSlotSave(slotId)}
                    className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    저장
                  </button>
                  {slotInfo.exists && (
                    <button
                      onClick={() => handleSlotLoad(slotId)}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg border border-slate-700 transition-colors cursor-pointer"
                    >
                      불러오기
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* JSON Export / Import */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => {
              playSound('click', soundEnabled);
              exportSaveToJSON(state);
            }}
            className="p-3 bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-left transition-colors flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-200"
          >
            <Download className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="block font-bold">세이브 파일 다운로드</span>
              <span className="text-[10px] text-slate-500">JSON 내보내기</span>
            </div>
          </button>

          <label className="p-3 bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-left transition-colors flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-200">
            <Upload className="w-4 h-4 text-sky-400 shrink-0" />
            <div>
              <span className="block font-bold">세이브 파일 업로드</span>
              <span className="text-[10px] text-slate-500">JSON 가져오기</span>
            </div>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        {/* Reset / New Career */}
        <div className="pt-3 border-t border-slate-800">
          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="w-full py-2.5 px-3 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>새 커리어로 초기화 (새 게임 시작)</span>
            </button>
          ) : (
            <div className="p-3 bg-rose-950/80 border border-rose-600 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-rose-300 text-xs font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>정말 현재 진행 상황을 초기화하고 새 선수를 만드시겠습니까?</span>
              </div>
              <div className="flex items-center gap-2 justify-end">
                <button
                  onClick={() => setConfirmReset(false)}
                  className="px-3 py-1 bg-slate-800 text-xs text-slate-300 rounded-lg"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    setConfirmReset(false);
                    onResetGame();
                  }}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg"
                >
                  초기화 확인
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
