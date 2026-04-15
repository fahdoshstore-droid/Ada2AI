import { useState, useCallback, useRef } from 'react';
import html2canvas from 'html2canvas';

export interface UseScreenCaptureOptions {
  /** 'dom' uses html2canvas (works everywhere), 'screen' uses getDisplayMedia (requires user permission) */
  captureType?: 'dom' | 'screen';
  /** Image quality 0-1, default 0.8 */
  quality?: number;
  /** Callback when capture completes */
  onCapture?: (dataUrl: string) => void;
  /** Callback when capture fails */
  onError?: (error: Error) => void;
}

export interface UseScreenCaptureReturn {
  /** Capture a specific element or the whole page. Returns base64 data URL. */
  capture: (targetElement?: HTMLElement) => Promise<string>;
  /** True while capturing */
  isCapturing: boolean;
  /** Last error */
  error: string | null;
  /** Whether getDisplayMedia (screen capture) is available */
  isScreenCaptureSupported: boolean;
  /** Reset error state */
  clearError: () => void;
}

/**
 * Hook for capturing the screen or DOM elements.
 * DOM mode (html2canvas) works in all browsers without permission.
 * Screen mode (getDisplayMedia) requires user permission and is not supported in Safari.
 */
export function useScreenCapture(options: UseScreenCaptureOptions = {}): UseScreenCaptureReturn {
  const {
    captureType = 'dom',
    quality = 0.8,
    onCapture,
    onError,
  } = options;

  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const isScreenCaptureSupported = typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getDisplayMedia;

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const captureDOM = useCallback(async (targetElement?: HTMLElement): Promise<string> => {
    const target = targetElement || document.body;

    const canvas = await html2canvas(target, {
      useCORS: true,
      allowTaint: true,
      scale: 2, // Higher resolution for Claude Vision
      backgroundColor: null,
      logging: false,
    });

    return canvas.toDataURL('image/png', quality);
  }, [quality]);

  const captureScreen = useCallback(async (): Promise<string> => {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      throw new Error('Screen capture not supported in this browser');
    }

    // Request screen capture
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        displaySurface: 'browser',
      },
      audio: false,
    });

    streamRef.current = stream;

    // Create video element to capture frame
    const video = document.createElement('video');
    video.srcObject = stream;
    video.autoplay = true;

    await new Promise<void>((resolve) => {
      video.onloadeddata = () => resolve();
    });

    // Wait a frame to ensure video is rendered
    await new Promise(resolve => requestAnimationFrame(resolve));

    // Draw to canvas
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(video, 0, 0);

    // Stop all tracks
    stream.getTracks().forEach(track => track.stop());
    streamRef.current = null;

    return canvas.toDataURL('image/png', quality);
  }, [quality]);

  const capture = useCallback(async (targetElement?: HTMLElement): Promise<string> => {
    setIsCapturing(true);
    setError(null);

    try {
      let dataUrl: string;

      if (captureType === 'screen' && isScreenCaptureSupported) {
        dataUrl = await captureScreen();
      } else {
        dataUrl = await captureDOM(targetElement);
      }

      onCapture?.(dataUrl);
      return dataUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Capture failed';
      setError(message);
      onError?.(err instanceof Error ? err : new Error(message));

      // Fallback to DOM capture if screen capture fails
      if (captureType === 'screen') {
        try {
          const fallback = await captureDOM(targetElement);
          onCapture?.(fallback);
          return fallback;
        } catch {
          throw new Error(message);
        }
      }

      throw new Error(message);
    } finally {
      setIsCapturing(false);
    }
  }, [captureType, isScreenCaptureSupported, captureScreen, captureDOM, onCapture, onError]);

  return {
    capture,
    isCapturing,
    error,
    isScreenCaptureSupported,
    clearError,
  };
}