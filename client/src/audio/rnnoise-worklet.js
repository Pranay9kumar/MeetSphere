import { Rnnoise } from '@shiguredo/rnnoise-wasm';

class RnnoiseProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.frame = [];
    this.output = [];
    this.denoiseState = null;
    this.ready = false;
    Rnnoise.load().then((rnnoise) => {
      this.denoiseState = rnnoise.createDenoiseState();
      this.ready = true;
      this.port.postMessage({ type: 'ready' });
    }).catch((error) => {
      this.port.postMessage({ type: 'error', message: error.message });
    });
  }

  processFrame() {
    const frame = new Float32Array(this.frame.splice(0, 480));
    const pcm = frame.map((sample) => Math.max(-32768, Math.min(32767, sample * 32768)));
    this.denoiseState.processFrame(pcm);
    this.output.push(...pcm.map((sample) => sample / 32768));
  }

  process(inputs, outputs) {
    const input = inputs[0]?.[0];
    const output = outputs[0]?.[0];
    if (!input || !output) return true;

    if (!this.ready) {
      output.set(input);
      return true;
    }

    this.frame.push(...input);
    while (this.frame.length >= 480) this.processFrame();
    output.set(this.output.splice(0, output.length));
    return true;
  }

  parameterData() {
    return {};
  }
}

registerProcessor('rnnoise-processor', RnnoiseProcessor);
