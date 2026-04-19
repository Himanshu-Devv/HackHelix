// ============================================
// useBrownNoise — Web Audio API brown noise (AudioWorkletNode)
// ============================================
// Uses AudioWorkletNode — NOT the deprecated ScriptProcessorNode
// Brown noise algorithm runs inside an AudioWorklet processor
// Processor code is inlined as a string and loaded via Blob URL
// Falls back to silent mode gracefully if AudioWorklet is unavailable

import { useState, useRef, useCallback, useEffect } from 'react';

const WORKLET_CODE = `
class BrownNoiseProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.lastOut = 0.0;
    this.isPlaying = true;
    this.port.onmessage = (e) => {
      if (e.data.type === 'stop') this.isPlaying = false;
      if (e.data.type === 'start') this.isPlaying = true;
    };
  }
  process(inputs, outputs) {
    const output = outputs[0];
    for (let channel = 0; channel < output.length; channel++) {
      const data = output[channel];
      for (let i = 0; i < data.length; i++) {
        if (!this.isPlaying) {
          data[i] = 0;
          continue;
        }
        const white = Math.random() * 2 - 1;
        this.lastOut = (this.lastOut + (0.02 * white)) / 1.02;
        data[i] = this.lastOut * 3.5;
      }
    }
    return true;
  }
}
registerProcessor('brown-noise-processor', BrownNoiseProcessor);
`;

export default function useBrownNoise() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [volume, setVolumeState] = useState(0.3);
  
  const audioCtxRef = useRef(null);
  const workletNodeRef = useRef(null);
  const gainNodeRef = useRef(null);

  const initAudio = useCallback(async () => {
    try {
      if (audioCtxRef.current) return true;

      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = ctx;

      // Create Blob URL from inline worklet code
      const blob = new Blob([WORKLET_CODE], { type: 'application/javascript' });
      const url = URL.createObjectURL(blob);

      await ctx.audioWorklet.addModule(url);
      URL.revokeObjectURL(url);

      const workletNode = new AudioWorkletNode(ctx, 'brown-noise-processor');
      workletNodeRef.current = workletNode;

      const gainNode = ctx.createGain();
      gainNode.gain.value = volume;
      gainNodeRef.current = gainNode;

      workletNode.connect(gainNode);
      gainNode.connect(ctx.destination);

      return true;
    } catch (e) {
      console.warn('Brown noise: AudioWorklet unavailable, falling back to silent mode', e);
      setIsAvailable(false);
      return false;
    }
  }, [volume]);

  const toggle = useCallback(async () => {
    if (isPlaying) {
      // Stop
      if (workletNodeRef.current) {
        workletNodeRef.current.port.postMessage({ type: 'stop' });
      }
      if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
        await audioCtxRef.current.suspend();
      }
      setIsPlaying(false);
    } else {
      // Start
      const ok = await initAudio();
      if (!ok) return;
      
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        await audioCtxRef.current.resume();
      }
      if (workletNodeRef.current) {
        workletNodeRef.current.port.postMessage({ type: 'start' });
      }
      setIsPlaying(true);
    }
  }, [isPlaying, initAudio]);

  const setVolume = useCallback((v) => {
    setVolumeState(v);
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = v;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (workletNodeRef.current) {
        workletNodeRef.current.disconnect();
      }
      if (gainNodeRef.current) {
        gainNodeRef.current.disconnect();
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  return {
    isPlaying,
    isAvailable,
    volume,
    toggle,
    setVolume,
  };
}
