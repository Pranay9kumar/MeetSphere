export async function createProcessedAudioTrack(stream) {
  if (!stream || typeof AudioContext === 'undefined' || typeof AudioWorkletNode === 'undefined') {
    throw new Error('AI noise suppression requires AudioWorklet support.');
  }

  const context = new AudioContext();
  const source = context.createMediaStreamSource(stream);
  const destination = context.createMediaStreamDestination();
  const workletUrl = new URL('./rnnoise-worklet.js', import.meta.url);
  let processor;

  try {
    await context.audioWorklet.addModule(workletUrl);
    processor = new AudioWorkletNode(context, 'rnnoise-processor', { numberOfInputs: 1, numberOfOutputs: 1, channelCount: 1 });
    const ready = new Promise((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new Error('RNNoise WASM took too long to initialize.')), 10000);
      processor.port.addEventListener('message', (event) => {
        if (event.data?.type === 'ready') {
          window.clearTimeout(timeout);
          resolve();
        }
        if (event.data?.type === 'error') {
          window.clearTimeout(timeout);
          reject(new Error(event.data.message || 'RNNoise WASM failed to initialize.'));
        }
      });
      processor.port.start();
    });

    source.connect(processor).connect(destination);
    await context.resume();
    await ready;
    return {
      track: destination.stream.getAudioTracks()[0],
      stop: () => {
        source.disconnect();
        processor.disconnect();
        destination.disconnect();
        context.close();
      },
    };
  } catch (error) {
    source.disconnect();
    processor?.disconnect();
    destination.disconnect();
    await context.close();
    throw new Error(`AI noise suppression unavailable: ${error.message}`);
  }
}
