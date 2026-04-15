/**
 * DHEEB Eye — Web-native AI companion with voice, vision, and cursor-pointing
 *
 * Usage:
 *   import { EyeOverlay, EyeEngine, useVoiceInput, useScreenCapture, useTTS } from '@/components/Eye';
 *
 *   const engine = new EyeEngine({ context: 'coach', ...callbacks });
 *   <EyeOverlay engine={engine} language="ar" />
 */

// Types
export type {
  EyeAction,
  EyeActionType,
  EyeCallbacks,
  EyeConfig,
  EyeContext,
  EyeHighlight,
  EyeArrow,
  EyeSession,
  EyeState,
  CursorPoint,
  FactCheckVerdict,
  FactCheckHighlight,
  HighlightColor,
  HighlightZone,
  VisionAnalysisResult,
  VisionObject,
} from './types';

export { DEFAULT_EYE_CONFIG } from './types';

// Engine
export { EyeEngine } from './EyeEngine';

// Hooks
export { useVoiceInput } from './useVoiceInput';
export type { UseVoiceInputOptions, UseVoiceInputReturn } from './useVoiceInput';

export { useScreenCapture } from './useScreenCapture';
export type { UseScreenCaptureOptions, UseScreenCaptureReturn } from './useScreenCapture';

export { useTTS } from './useTTS';
export type { UseTTSOptions, UseTTSReturn } from './useTTS';

// Components
export { EyeCursor } from './EyeCursor';
export type { EyeCursorProps } from './EyeCursor';

export { EyeOverlay } from './EyeOverlay';
export type { EyeOverlayProps } from './EyeOverlay';