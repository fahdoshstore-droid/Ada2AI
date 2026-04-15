import type {
  EyeAction,
  EyeActionType,
  EyeCallbacks,
  EyeConfig,
  EyeContext,
  EyeSession,
  EyeState,
  VisionAnalysisResult,
} from './types';
import { DEFAULT_EYE_CONFIG } from './types';

/**
 * DHEEB Eye Engine — Orchestrates voice → vision → TTS → cursor flow.
 *
 * This is a plain TypeScript class (not a React hook) so it persists across renders
 * via useRef. React hooks (useVoiceInput, useTTS, useScreenCapture) are used
 * inside the EyeOverlay component which bridges React state to the engine.
 */
export class EyeEngine {
  private config: EyeConfig;
  private callbacks: EyeCallbacks;
  private session: EyeSession | null = null;
  private state: EyeState = 'idle';
  private sessionIdCounter = 0;

  constructor(config: Partial<EyeConfig> & EyeCallbacks) {
    const { onStateChange, onActionComplete, onSessionEnd, onError, onTranscript, onVisionResult } = config;
    this.callbacks = {
      onStateChange,
      onActionComplete,
      onSessionEnd,
      onError,
      onTranscript,
      onVisionResult,
    };
    this.config = { ...DEFAULT_EYE_CONFIG, ...config };
  }

  // ── State Management ──────────────────────────────────────────────

  getState(): EyeState {
    return this.state;
  }

  getSession(): EyeSession | null {
    return this.session;
  }

  subscribe(listener: (state: EyeState, session: EyeSession | null) => void): () => void {
    // Simple pub/sub — the EyeOverlay component uses this for re-renders
    let active = true;
    const originalOnChange = this.callbacks.onStateChange;

    this.callbacks.onStateChange = (newState: EyeState) => {
      originalOnChange?.(newState);
      if (active) {
        listener(newState, this.session);
      }
    };

    return () => {
      active = false;
      this.callbacks.onStateChange = originalOnChange;
    };
  }

  private setState(newState: EyeState): void {
    this.state = newState;
    this.callbacks.onStateChange?.(newState);
  }

  // ── Voice Flow ────────────────────────────────────────────────────

  /**
   * Called when voice input produces a transcript.
   * This is invoked from the EyeOverlay component which uses useVoiceInput hook.
   */
  handleTranscript(transcript: string, isFinal: boolean): void {
    this.callbacks.onTranscript?.(transcript, isFinal);

    if (isFinal && this.session) {
      this.session.transcript = this.session.transcript
        ? `${this.session.transcript} ${transcript}`
        : transcript;
    }
  }

  // ── Vision Flow ───────────────────────────────────────────────────

  /**
   * Send a captured image to the Claude Vision endpoint for analysis.
   * Returns structured VisionAnalysisResult.
   */
  async analyzeFrame(imageDataUrl: string, prompt?: string): Promise<VisionAnalysisResult> {
    this.setState('thinking');

    try {
      const endpoint = this.config.visionEndpoint || '/api/eye/vision';

      // Strip data URL prefix to get pure base64
      const base64Data = imageDataUrl.replace(/^data:image\/(png|jpeg|webp);base64,/, '');

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          transcript: this.session?.transcript || '',
          context: this.config.context,
          prompt,
        }),
      });

      if (!response.ok) {
        throw new Error(`Vision API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      const visionResult: VisionAnalysisResult = {
        description: data.description || '',
        descriptionAr: data.descriptionAr || data.description || '',
        objects: data.objects || [],
        suggestions: data.suggestions || [],
        suggestionsAr: data.suggestionsAr || data.suggestions || [],
      };

      if (this.session) {
        this.session.visionResult = visionResult;
      }

      this.callbacks.onVisionResult?.(visionResult);
      this.setState('idle');
      return visionResult;

    } catch (error) {
      this.setState('error');
      this.callbacks.onError?.(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Capture and analyze in one call.
   * The actual capture is done by useScreenCapture hook inside EyeOverlay,
   * then passed here. This is a convenience method.
   */
  async captureAndAnalyze(imageDataUrl: string, prompt?: string): Promise<VisionAnalysisResult> {
    return this.analyzeFrame(imageDataUrl, prompt);
  }

  // ── Action Execution ──────────────────────────────────────────────

  /**
   * Execute an array of EyeActions sequentially.
   * Each action type triggers the appropriate behavior.
   * Auto-advances between actions with configurable delay.
   */
  async executeActions(actions: EyeAction[]): Promise<void> {
    this.session = {
      id: `eye-${++this.sessionIdCounter}`,
      actions,
      currentIndex: 0,
      state: 'idle',
      startedAt: Date.now(),
    };

    for (let i = 0; i < actions.length; i++) {
      if (!this.session) break; // Session was reset

      this.session.currentIndex = i;
      await this.executeAction(actions[i]);
      this.callbacks.onActionComplete?.(actions[i]);

      // Auto-advance delay between actions
      if (i < actions.length - 1 && this.config.autoAdvance) {
        await this.delay(this.config.autoAdvanceDelay);
      }
    }

    if (this.session) {
      this.session.completedAt = Date.now();
      this.callbacks.onSessionEnd?.(this.session);
    }

    this.setState('idle');
  }

  /**
   * Execute a single EyeAction.
   */
  async executeAction(action: EyeAction): Promise<void> {
    switch (action.type as EyeActionType) {
      case 'speak':
        // TTS is handled by the EyeOverlay component via useTTS hook
        // The engine sets state, the component handles actual speech
        this.setState('speaking');
        break;

      case 'point':
        // Cursor pointing is handled by EyeCursor component
        this.setState('pointing');
        break;

      case 'highlight':
        // Highlighting is handled by HighlightOverlay component
        this.setState('pointing');
        break;

      case 'factcheck':
        // Fact-check overlay is handled by FactCheckOverlay component
        this.setState('pointing');
        break;

      case 'listen':
        // Voice capture is handled by EyeOverlay via useVoiceInput
        this.setState('listening');
        break;

      case 'capture':
        // Screen capture is handled by EyeOverlay via useScreenCapture
        this.setState('thinking');
        break;

      case 'analyze':
        // Vision analysis — the component calls engine.analyzeFrame()
        this.setState('thinking');
        break;
    }
  }

  // ── Utility ───────────────────────────────────────────────────────

  reset(): void {
    this.session = null;
    this.setState('idle');
  }

  updateConfig(partial: Partial<EyeConfig>): void {
    this.config = { ...this.config, ...partial };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}