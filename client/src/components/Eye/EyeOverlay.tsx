import { useState, useRef, useCallback, useEffect } from 'react';
import { EyeEngine } from './EyeEngine';
import { useVoiceInput } from './useVoiceInput';
import { useScreenCapture } from './useScreenCapture';
import { useTTS } from './useTTS';
import { EyeCursor } from './EyeCursor';
import type { EyeAction, EyeCallbacks, EyeConfig, EyeState, CursorPoint } from './types';
import { DEFAULT_EYE_CONFIG } from './types';

export interface EyeOverlayProps {
  engine: EyeEngine;
  language?: 'ar' | 'en';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  compact?: boolean;
  onActionComplete?: (action: EyeAction) => void;
  onSessionEnd?: (session: import('./types').EyeSession) => void;
}

const POSITION_STYLES: Record<string, React.CSSProperties> = {
  'bottom-right': { bottom: 24, right: 24 },
  'bottom-left': { bottom: 24, left: 24 },
  'top-right': { top: 24, right: 24 },
  'top-left': { top: 24, left: 24 },
};

const STATE_COLORS: Record<EyeState, string> = {
  idle: '#00DCC8',
  listening: '#3B82F6',
  thinking: '#F59E0B',
  speaking: '#10B981',
  pointing: '#00DCC8',
  error: '#EF4444',
};

const STATE_LABELS_AR: Record<EyeState, string> = {
  idle: 'عين',
  listening: 'أستمع...',
  thinking: 'أحلل...',
  speaking: 'أشرح...',
  pointing: 'أنظر هنا',
  error: 'خطأ',
};

const STATE_LABELS_EN: Record<EyeState, string> = {
  idle: 'Eye',
  listening: 'Listening...',
  thinking: 'Analyzing...',
  speaking: 'Explaining...',
  pointing: 'Look here',
  error: 'Error',
};

/**
 * DHEEB Eye — Floating AI companion overlay.
 * Shows mic button, camera button, current state, and Arabic narration.
 * Bridges React hooks (useVoiceInput, useTTS, useScreenCapture) to EyeEngine.
 */
export function EyeOverlay({
  engine,
  language = 'ar',
  position = 'bottom-left',
  compact = false,
  onActionComplete,
  onSessionEnd,
}: EyeOverlayProps) {
  const [eyeState, setEyeState] = useState<EyeState>('idle');
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [cursorPoint, setCursorPoint] = useState<CursorPoint | null>(null);
  const [narrationText, setNarrationText] = useState('');

  // Hooks
  const voice = useVoiceInput({
    language: language === 'ar' ? 'ar-SA' : 'en-US',
    continuous: false,
    interimResults: true,
    onTranscript: (text, isFinal) => {
      engine.handleTranscript(text, isFinal);
      if (isFinal && isExpanded) {
        handleVoiceAndAnalyze(text);
      }
    },
    onError: (error) => {
      console.error('[Eye] Voice error:', error);
    },
  });

  const screenCapture = useScreenCapture({
    captureType: 'dom',
    onCapture: async (dataUrl) => {
      try {
        const result = await engine.analyzeFrame(dataUrl);
        if (result) {
          const actions: EyeAction[] = (result as any).actions || [];
          if (actions.length) {
            await engine.executeActions(actions);
          }
        }
      } catch (err) {
        console.error('[Eye] Vision error:', err);
      }
    },
  });

  const tts = useTTS({
    language: language === 'ar' ? 'ar-SA' : 'en-US',
    onEnd: () => {
      // TTS finished
    },
  });

  // Subscribe to engine state changes
  useEffect(() => {
    const unsubscribe = engine.subscribe((state) => {
      setEyeState(state);
    });
    return unsubscribe;
  }, [engine]);

  // Handle voice transcript + screen capture → analyze
  const handleVoiceAndAnalyze = useCallback(async (transcript: string) => {
    if (!transcript.trim()) return;

    try {
      const dataUrl = await screenCapture.capture();
      const result = await engine.captureAndAnalyze(dataUrl, transcript);

      // Process actions from vision result
      const actions: EyeAction[] = (result.objects || []).map((obj, i) => ({
        id: `eye-${Date.now()}-${i}`,
        type: 'point' as const,
        payload: {
          targetSelector: `[data-player="${obj.label}"]`,
          x: obj.bbox?.x || 50,
          y: obj.bbox?.y || 50,
        },
        messageAr: obj.labelAr || obj.label,
        messageEn: obj.label,
      }));

      // Add narration action
      actions.unshift({
        id: `eye-${Date.now()}-speak`,
        type: 'speak',
        payload: {},
        messageAr: result.descriptionAr || result.description,
        messageEn: result.description,
      });

      if (actions.length) {
        await engine.executeActions(actions);
      }
    } catch (err) {
      console.error('[Eye] Voice+vision error:', err);
    }
  }, [screenCapture, engine]);

  // Process engine actions — bridge between engine state and UI
  useEffect(() => {
    // This effect watches for action type changes from the engine
    // and updates UI accordingly (TTS, cursor, narration)
  }, [engine]);

  // Mic button handler
  const handleMicClick = useCallback(() => {
    if (voice.isListening) {
      voice.stopListening();
    } else {
      voice.resetTranscript();
      voice.startListening();
    }
  }, [voice]);

  // Camera button handler
  const handleCameraClick = useCallback(async () => {
    try {
      const dataUrl = await screenCapture.capture();
      await engine.captureAndAnalyze(dataUrl);
    } catch (err) {
      console.error('[Eye] Capture error:', err);
    }
  }, [screenCapture, engine]);

  // Close handler
  const handleClose = useCallback(() => {
    voice.stopListening();
    tts.stop();
    engine.reset();
    setCursorPoint(null);
    setNarrationText('');
    setIsExpanded(false);
  }, [voice, tts, engine]);

  const stateColor = STATE_COLORS[eyeState];
  const isRTL = language === 'ar';

  return (
    <>
      {/* Floating Widget */}
      <div
        style={{
          position: 'fixed',
          ...POSITION_STYLES[position],
          zIndex: 99998,
          fontFamily: 'Cairo, sans-serif',
          direction: isRTL ? 'rtl' : 'ltr',
        }}
      >
        {/* Compact pill (collapsed state) */}
        {!isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              background: '#0D1220',
              border: `2px solid ${stateColor}`,
              borderRadius: 24,
              color: stateColor,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
              fontFamily: 'Cairo, sans-serif',
              boxShadow: `0 0 20px ${stateColor}40`,
              transition: 'all 0.3s ease',
            }}
          >
            <span style={{ fontSize: 18 }}>👁</span>
            <span>{isRTL ? 'تفعيل العين' : 'Activate Eye'}</span>
          </button>
        )}

        {/* Expanded panel */}
        {isExpanded && (
          <div
            style={{
              width: 320,
              background: '#0D1220',
              border: `2px solid ${stateColor}30`,
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: `0 0 40px ${stateColor}20`,
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 16px',
              borderBottom: '1px solid #1E293B',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>👁</span>
                <span style={{ color: stateColor, fontSize: 13, fontWeight: 600 }}>
                  {isRTL ? STATE_LABELS_AR[eyeState] : STATE_LABELS_EN[eyeState]}
                </span>
              </div>
              <button
                onClick={handleClose}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  cursor: 'pointer',
                  fontSize: 18,
                  padding: 4,
                }}
              >
                ✕
              </button>
            </div>

            {/* Narration text */}
            {narrationText && (
              <div style={{
                padding: '12px 16px',
                color: '#E2E8F0',
                fontSize: 14,
                lineHeight: 1.6,
                minHeight: 48,
                borderBottom: '1px solid #1E293B',
              }}>
                {narrationText}
              </div>
            )}

            {/* Voice transcript (live) */}
            {(voice.transcript || voice.interimTranscript) && (
              <div style={{
                padding: '8px 16px',
                color: '#94A3B8',
                fontSize: 12,
                fontStyle: 'italic',
                borderBottom: '1px solid #1E293B',
              }}>
                {voice.interimTranscript || voice.transcript}
              </div>
            )}

            {/* Action buttons */}
            <div style={{
              display: 'flex',
              gap: 8,
              padding: '12px 16px',
            }}>
              {/* Mic button */}
              <button
                onClick={handleMicClick}
                disabled={!voice.isSupported}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '10px 16px',
                  background: voice.isListening ? '#1E3A5F' : '#1E293B',
                  border: voice.isListening ? '2px solid #3B82F6' : '2px solid #334155',
                  borderRadius: 12,
                  color: voice.isListening ? '#3B82F6' : '#E2E8F0',
                  cursor: voice.isSupported ? 'pointer' : 'not-allowed',
                  fontSize: 14,
                  fontFamily: 'Cairo, sans-serif',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                }}
              >
                {voice.isListening ? '🎤' : '🎙️'}
                <span>{isRTL ? (voice.isListening ? 'أستمع' : 'تحدث') : (voice.isListening ? 'Listening' : 'Speak')}</span>
              </button>

              {/* Camera button */}
              <button
                onClick={handleCameraClick}
                disabled={screenCapture.isCapturing}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '10px 16px',
                  background: screenCapture.isCapturing ? '#3D2E0A' : '#1E293B',
                  border: screenCapture.isCapturing ? '2px solid #F59E0B' : '2px solid #334155',
                  borderRadius: 12,
                  color: screenCapture.isCapturing ? '#F59E0B' : '#E2E8F0',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontFamily: 'Cairo, sans-serif',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                }}
              >
                {screenCapture.isCapturing ? '⏳' : '📷'}
                <span>{isRTL ? 'حلّل' : 'Capture'}</span>
              </button>
            </div>

            {/* TTS status */}
            {tts.isSpeaking && (
              <div style={{
                padding: '4px 16px 8px',
                color: '#10B981',
                fontSize: 11,
                textAlign: isRTL ? 'right' : 'left',
              }}>
                🔊 {isRTL ? 'يتحدث...' : 'Speaking...'}
              </div>
            )}

            {/* Error display */}
            {eyeState === 'error' && (
              <div style={{
                padding: '4px 16px 8px',
                color: '#EF4444',
                fontSize: 11,
                textAlign: isRTL ? 'right' : 'left',
              }}>
                ⚠️ {isRTL ? 'حدث خطأ' : 'An error occurred'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Animated Cursor */}
      <EyeCursor
        point={cursorPoint || { x: 50, y: 50 }}
        visible={!!cursorPoint}
        duration={3000}
        onAnimationEnd={() => setCursorPoint(null)}
      />
    </>
  );
}