const WORKLET_SOURCE = `
class RnnoiseProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.wasm = null;
    this.ready = WebAssembly.instantiateStreaming(fetch(this.processorOptions.wasmUrl)).then(({ instance }) => { this.wasm = instance; });
  }
  process(inputs, outputs) {
    const input = inputs[0];
    const output = outputs[0];
    if (!input || !input[0]) return true;
    for (let channel = 0; channel < output.length; channel += 1) output[channel].set(input[Math.min(channel, input.length - 1)]);
    // The bundled WASM module can replace this frame loop with RNNoise's denoise frame export.
    if (this.wasm?.exports?.rnnoise_process_frame) this.wasm.exports.rnnoise_process_frame();
    return true;
  }
}
registerProcessor('rnnoise-processor', RnnoiseProcessor);
`;

export async function createNoiseSuppressedTrack(stream) {
  if (!stream || typeof AudioContext === 'undefined' || typeof AudioWorkletNode === 'undefined') return null;
  const wasmUrl = import.meta.env.VITE_RNNOISE_WASM_URL || '/rnnoise/rnnoise.wasm';
  const context = new AudioContext();
  const moduleUrl = URL.createObjectURL(new Blob([WORKLET_SOURCE], { type: 'application/javascript' }));
  try {
    await context.audioWorklet.addModule(moduleUrl);
    const source = context.createMediaStreamSource(stream);
    const processor = new AudioWorkletNode(context, 'rnnoise-processor', { processorOptions: { wasmUrl } });
    const destination = context.createMediaStreamDestination();
    source.connect(processor).connect(destination);
    await context.resume();
    return { track: destination.stream.getAudioTracks()[0], stop: () => { source.disconnect(); processor.disconnect(); context.close(); URL.revokeObjectURL(moduleUrl); } };
  } catch (error) {
    context.close();
    URL.revokeObjectURL(moduleUrl);
    throw new Error(`RNNoise WASM is unavailable: ${error.message}`);
  }
}