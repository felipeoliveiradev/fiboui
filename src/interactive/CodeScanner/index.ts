import React, { ReactElement, useEffect, useRef, useState } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps } from '../../core/types';

interface DetectedBarcode {
  rawValue?: string;
}

interface BarcodeDetectorLike {
  detect: (source: HTMLVideoElement) => Promise<DetectedBarcode[]>;
}

type BarcodeDetectorCtor = new (options?: { formats?: string[] }) => BarcodeDetectorLike;

const BARCODE_FORMATS = ['qr_code', 'ean_13', 'ean_8', 'code_128', 'code_39', 'upc_a', 'upc_e'];

function readBarcodeDetector(): BarcodeDetectorCtor | undefined {
  const ctor = (globalThis as { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector;
  return typeof ctor === 'function' ? ctor : undefined;
}

function readGetUserMedia():
  | ((constraints: MediaStreamConstraints) => Promise<MediaStream>)
  | undefined {
  if (typeof navigator === 'undefined') return undefined;
  const media = navigator.mediaDevices;
  const getUserMedia = media?.getUserMedia;
  return typeof getUserMedia === 'function' ? getUserMedia.bind(media) : undefined;
}

interface CodeScannerViewProps {
  label: string;
  className?: string;
  style?: React.CSSProperties;
  onScan?: (value: string) => void;
}

const CodeScannerView = React.memo(function CodeScannerView(props: CodeScannerViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const stopRef = useRef(false);
  const onScanRef = useRef(props.onScan);
  onScanRef.current = props.onScan;
  const [status, setStatus] = useState<string | null>(null);

  function stopStream() {
    stopRef.current = true;
    const stream = streamRef.current;
    streamRef.current = null;
    if (!stream) return;
    for (const track of stream.getTracks()) track.stop();
  }

  useEffect(() => () => stopStream(), []);

  async function start() {
    const getUserMedia = readGetUserMedia();
    if (!getUserMedia) {
      setStatus('Camera unavailable');
      return;
    }

    stopRef.current = false;
    setStatus(null);
    let stream: MediaStream;
    try {
      stream = await getUserMedia({ video: { facingMode: 'environment' } });
    } catch {
      if (!readGetUserMedia()) setStatus('Camera unavailable');
      return;
    }

    if (stopRef.current) {
      for (const track of stream.getTracks()) track.stop();
      return;
    }

    streamRef.current = stream;
    const video = videoRef.current;
    if (video) {
      try {
        video.srcObject = stream;
        const playing = video.play?.();
        if (playing && typeof playing.catch === 'function') void playing.catch(() => undefined);
      } catch {
        /* preview is optional when the environment has no media element */
      }
    }
    if (stopRef.current || !video) return;

    const Detector = readBarcodeDetector();
    if (!Detector) return;
    const detector = new Detector({ formats: BARCODE_FORMATS });

    const loop = async () => {
      if (stopRef.current) return;
      try {
        const codes = await detector.detect(video);
        const value = codes.find((code) => Boolean(code.rawValue))?.rawValue;
        if (value) {
          onScanRef.current?.(value);
          stopStream();
          return;
        }
      } catch {
        /* frame not ready */
      }
      if (!stopRef.current && typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(() => {
          void loop();
        });
      }
    };

    void loop();
  }

  return React.createElement(
    'div',
    {
      className: ['fibo-code-scanner', props.className].filter(Boolean).join(' '),
      style: { display: 'flex', flexDirection: 'column', gap: 8, ...props.style },
    },
    React.createElement(
      'button',
      {
        type: 'button',
        className: 'fibo-code-scanner-trigger',
        onClick: () => {
          void start();
        },
      },
      props.label,
    ),
    React.createElement('video', {
      ref: videoRef,
      className: 'fibo-code-scanner-video',
      muted: true,
      playsInline: true,
      style: { width: '100%', maxHeight: 240, background: '#0F172A', borderRadius: 8 },
    }),
    status ? React.createElement('p', { className: 'fibo-code-scanner-status' }, status) : null,
  );
});

class CodeScannerBuilder extends FiboBuilder {
  private _label = 'Scan';
  private _onScan?: (value: string) => void;

  label(text: string): this {
    this._label = text;
    return this;
  }

  onScan(handler: (value: string) => void): this {
    this._onScan = handler;
    return this;
  }

  build(): ReactElement {
    const { className: extraClass, style: extraStyle, ...rest } = this._props;
    return React.createElement(CodeScannerView, {
      label: this._label,
      onScan: this._onScan,
      className: [this.getClassName(), extraClass].filter(Boolean).join(' ') || undefined,
      style: { ...this.getStyle(), ...(extraStyle as React.CSSProperties | undefined) },
      ...rest,
    });
  }
}

export const CodeScanner = createBuilder(CodeScannerBuilder);

export interface CodeScannerProps extends BaseProps {
  label?: string;
  onScan?: (value: string) => void;
}
