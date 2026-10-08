import { Pane } from 'tweakpane';
import type { ParametersType } from './main';

export function createGUI(
  parameters: ParametersType,
  onFftSizeChange: () => void
) {
  const pane = new Pane();

  pane
    .addBinding(parameters, 'fftSize', {
      options: {
        32: 32,
        64: 64,
        128: 128,
        256: 256,
        512: 512,
        1024: 1024,
        2048: 2048,
        4096: 4096,
        8192: 8192,
        16384: 16384,
        32768: 32768,
      },
    })
    .on('change', onFftSizeChange);
  pane.addBinding(parameters, 'color');
  pane.addBinding(parameters, 'colored');
  pane.addBinding(parameters, 'particleCount', {
    min: 200,
    step: 100,
  });
  pane.addBinding(parameters, 'opacity', {
    min: 0,
    step: 0.1,
    max: 1,
  });
  pane.addBinding(parameters, 'radius', {
    min: 0,
    step: 0.1,
    // max: 1,
  });
  pane.addBinding(parameters, 'maxRadius', {
    min: 0,
    step: 100,
    // max: 1,
  });
  return pane;
}
