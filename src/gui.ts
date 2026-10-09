import { Pane } from 'tweakpane';
import type { ParametersType } from './main';

export function createGUI(
  parameters: ParametersType,
  onFftSizeChange: () => void,
  onParticleCountChange: () => void,
  randomizeParticles: () => void
) {
  const pane = new Pane();
  const fBasic = pane.addFolder({
    title: 'Basic',
  });
  const fParticles = pane.addFolder({
    title: 'Particles',
  });
  const fMusic = pane.addFolder({
    title: 'Music',
  });

  fParticles
    .addBinding(parameters, 'style', {
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
  fBasic
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
  fBasic.addBinding(parameters, 'freq');
  // fParticles.addBinding(parameters, 'color');
  fParticles.addBinding(parameters, 'colored');
  fParticles.addBinding(parameters, 'frictioned');
  fParticles
    .addBinding(parameters, 'particleCount', {
      min: 200,
      step: 100,
    })
    .on('change', onParticleCountChange);
  fBasic.addBinding(parameters, 'opacity', {
    min: 0,
    step: 0.01,
    max: 1,
  });
  fParticles.addBinding(parameters, 'particleSize', {
    min: 1,
    step: 1,
  });
  fParticles.addBinding(parameters, 'radius', {
    min: 0,
    step: 10,
    // max: 1,
  });
  fParticles.addBinding(parameters, 'maxRadius', {
    min: 0,
    step: 100,
    // max: 1,
  });
  fParticles.addBinding(parameters, 'easing', {
    min: 0,
    step: 0.1,
    // max: 1,
  });
  fMusic.addBinding(parameters, 'voice');
  fMusic.addBinding(parameters, 'melody');
  fMusic.addBinding(parameters, 'kick');
  fParticles.addButton({ title: 'Randomize' }).on('click', randomizeParticles);
  fParticles.addBinding(parameters, 'squared');
  return pane;
}

// fParticles.addButton({ title: 'Randomize' }).on('click', randomizeParticles);
