import { createGUI } from './gui';
import { generateParticles, type Particle } from './particle';
import './style.css';

export type ParametersType = {
  fftSize: number;
  color: string;
  colored: boolean;
  particleCount: number;
  opacity: number;
  radius: number;
  maxRadius: number;
};

const canvas = document.querySelector('canvas')!;
const context = canvas.getContext('2d')!;
const audioElement = document.querySelector('audio')!;

resize();

const parameters: ParametersType = {
  fftSize: 1024,
  color: '#ff0000',
  colored: true,
  particleCount: 2000,
  opacity: 0.1,
  radius: 1,
  maxRadius: Math.min(canvas.width, canvas.height) / 2,
};

let audioContext: AudioContext;
let playing = false;
let analyser: AnalyserNode;
let analyserBuffer: Uint8Array<ArrayBuffer>;
let freqBuffer: Uint8Array<ArrayBuffer>;

addEventListener('resize', resize);

addEventListener('click', async () => {
  audioContext || (await createContext());
  playing ? {} : play();
  resize();
  tick();
});

async function createContext() {
  audioContext = new AudioContext();

  const mediaSourceNode = audioContext.createMediaElementSource(audioElement);
  analyser = audioContext.createAnalyser();
  analyser.fftSize = parameters.fftSize;
  analyserBuffer = new Uint8Array(analyser.frequencyBinCount); // Notre tableau de données !
  freqBuffer = new Uint8Array(analyser.frequencyBinCount); // Notre tableau de données !

  mediaSourceNode.connect(analyser);
  mediaSourceNode.connect(audioContext.destination);
}

function updateFftSize() {
  if (!analyser) return;
  analyser.fftSize = parameters.fftSize;
  analyserBuffer = new Uint8Array(analyser.fftSize);
  freqBuffer = new Uint8Array(analyser.fftSize);
}

createGUI(parameters, updateFftSize);

const particles = generateParticles(parameters.particleCount);

function render() {
  analyser.getByteTimeDomainData(analyserBuffer); // écupérer les données et les copier dans notre tableau

  context.fillStyle = `rgba(0, 0, 0, ${parameters.opacity})`;
  context.fillRect(0, 0, canvas.width, canvas.height);

  let kick = detectFreq(20, 60);
  let voice = detectFreq(100, 300);
  // animateParticles(particles, getVolume(analyserBuffer), parameters.colored);
  animateParticles(0.3, particles, kick, parameters.colored);
  animateParticles(0.1, particles, voice, false);
}

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function tick() {
  requestAnimationFrame(tick);
  render();
}

function play() {
  playing = true;
  audioElement.play();
}

function pause() {
  playing = false;
  audioElement.pause();
}

function getVolume(array: Uint8Array<ArrayBuffer>) {
  let sum = 0;
  for (let i = 0; i < array.length; i++) {
    const v = (array[i] - 128) / 128; // chaque freq entre 1 et -1, -1 étant le silence
    sum += v * v;
  }
  return Math.sqrt(sum / array.length) * Math.random();
}

// HELP: https://blog.addpipe.com/understanding-audio-frequency-analysis-in-javascript-a-guide-to-using-analysernode-and-getbytefrequencydata/
function detectFreq(minFreq: number, maxFreq: number) {
  // Hz range

  analyser.getByteFrequencyData(freqBuffer);

  // On récupère la fréquence
  const frequencyPerBin = audioContext.sampleRate / 2 / analyser.fftSize;

  const startIndex = Math.floor(minFreq / frequencyPerBin); // startIndex = Math.floor(20 / 21.53) ≈ 0
  const endIndex = Math.floor(maxFreq / frequencyPerBin);

  const kickData = freqBuffer.slice(startIndex, endIndex);

  return getVolume(kickData) > 0.5 ? 1 : 0;
}

function generateColor() {
  const hue = (performance.now() * 0.02) % 360; // 0.02 = vitesse du changement
  return `hsl(${hue}, 80%, 60%)`;
}

function animateParticles(
  radius: number,
  particles: Particle[],
  volume: number,
  colored?: boolean
) {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  // context.filter = 'brightness(1.75)';
  for (const particle of particles) {
    // var plusOrMinus = Math.random() < 0.5 ? -1 : 1;
    particle.angle += particle.speed; // horaire si positif

    particle.animatedRadius =
      volume * particle.sensor * parameters.maxRadius * Math.random();

    const r =
      radius * parameters.radius * parameters.maxRadius +
      particle.animatedRadius;
    const x = cx + Math.cos(particle.angle) * r; // pos sur le cercle en largeur
    const y = cy + Math.sin(particle.angle) * r; // same en hauteur

    context.beginPath();
    colored
      ? (context.fillStyle = generateColor())
      : (context.fillStyle = 'white');
    // context.shadowColor = 'white';
    // context.shadowBlur = 5;
    context.arc(x, y, particle.size, 0, 2 * Math.PI, true); // 2π = un cercle complet, le point peut se placer partout sur le cercle
    context.fill();
    context.closePath();
  }
}
