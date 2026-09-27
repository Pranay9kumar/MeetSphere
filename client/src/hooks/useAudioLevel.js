import { useEffect, useState } from 'react';

export default function useAudioLevel(stream, enabled = true) {
  const [level, setLevel] = useState(0);

  useEffect(() => {
    if (!enabled || !stream || typeof AudioContext === 'undefined') {
      setLevel(0);
      return undefined;
    }

    const context = new AudioContext();
    const analyser = context.createAnalyser();
    analyser.fftSize = 64;
    const source = context.createMediaStreamSource(stream);
    const values = new Uint8Array(analyser.frequencyBinCount);
    let frame;
    source.connect(analyser);

    const update = () => {
      analyser.getByteFrequencyData(values);
      const average = values.reduce((sum, value) => sum + value, 0) / values.length;
      setLevel(Math.min(100, Math.round(average)));
      frame = requestAnimationFrame(update);
    };
    update();

    return () => {
      cancelAnimationFrame(frame);
      source.disconnect();
      context.close();
    };
  }, [enabled, stream]);

  return level;
}
