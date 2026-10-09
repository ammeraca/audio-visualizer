import { Pane } from 'tweakpane';
import type { ParametersType } from './main';

export function createGUI(
  parameters: ParametersType,
  onFftSizeChange: () => void,
  onParticleCountChange: () => void
) {
  const pane = new Pane();

  pane
    .addBinding(parameters, 'globalCompositeOperation', {
      options: {
        sourceOver: 'sourceOver',
        lighter: 'lighter',
        lighten: 'lighten',
        multiply: 'multiply',
        overlay: 'overlay',
        hue: 'hue',
        saturation: 'saturation',
      },
    })
    .on('change', onFftSizeChange);
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
  pane.addBinding(parameters, 'freq');
  pane.addBinding(parameters, 'color');
  pane.addBinding(parameters, 'colored');
  pane
    .addBinding(parameters, 'particleCount', {
      min: 200,
      step: 100,
    })
    .on('change', onParticleCountChange);
  pane.addBinding(parameters, 'opacity', {
    min: 0,
    step: 0.1,
    max: 1,
  });
  pane.addBinding(parameters, 'particleSize', {
    min: 1,
    step: 1,
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
  pane.addBinding(parameters, 'easing', {
    min: 0,
    step: 0.1,
    // max: 1,
  });
  pane.addBinding(parameters, 'voice');
  pane.addBinding(parameters, 'melody');
  pane.addBinding(parameters, 'kick');
  return pane;
}
