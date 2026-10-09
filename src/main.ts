import { createGUI } from './gui';
import { generateParticles, type Particle } from './particle';
import './style.css';

export type ParametersType = {
  fftSize: number;
  freq: boolean;
  color: string;
  colored: boolean;
  particleSize: number;
  particleCount: number;
  opacity: number;
  radius: number;
  maxRadius: number;
  style: GlobalCompositeOperation;
  easing: number;
  voice: boolean;
  melody: boolean;
  kick: boolean;
  streak: boolean;
};

const canvas = document.querySelector('canvas')!;
const context = canvas.getContext('2d')!;
const audioElement = document.querySelector('audio')!;

resize();

const parameters: ParametersType = {
  fftSize: 512,
  freq: false,
  color: '#ff0000',
  streak: false,
  colored: true,
  particleSize: 1,
  particleCount: 2000,
  opacity: 0.1,
  radius: 800,
  maxRadius: Math.min(canvas.width, canvas.height) / 4,
  style: 'source-over',
  easing: 0.5,
  voice: true,
  melody: true,
  kick: true,
  // squared: false, FIXME:
};

let audioContext: AudioContext;
let playing = false;
let started = false;
let analyser: AnalyserNode;
let analyserBuffer: Uint8Array<ArrayBuffer>;
let freqBuffer: Uint8Array<ArrayBuffer>;
let particles = generateParticles(parameters.particleCount);
let baseColor = 0;

addEventListener('resize', resize);

addEventListener('click', async (e) => {
  if ((e.target as HTMLElement).closest('.tp-dfwv')) return;

  audioContext || (await createContext());
  playing ? pause() : play();
  resize();
  if (!started) {
    started = true;
    tick();
  }
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

function updateParticles() {
  particles = generateParticles(parameters.particleCount);
}

const pane = createGUI(
  parameters,
  updateFftSize,
  updateParticles,
  randomizeParticles
);
pane;

let kick = 0;
let voice = 0;
let melody = 0;

function render() {
  if (!playing) return;
  parameters.freq ? drawFreq() : {};
  analyser.getByteTimeDomainData(analyserBuffer); // écupérer les données et les copier dans notre tableau

  context.fillStyle = `rgba(0, 0, 0, ${parameters.opacity})`;
  context.fillRect(0, 0, canvas.width, canvas.height);

  kick = detectFreq(30, 80);
  voice = detectFreq(150, 800);
  melody = detectFreq(255, 15000);
  if (parameters.kick)
    animateParticles(0.5, particles, kick, 200, parameters.colored); // 0.5 radius
  if (parameters.voice)
    animateParticles(0.1, particles, voice, 0, parameters.colored);
  if (parameters.melody)
    animateParticles(0.3, particles, melody, 20, parameters.colored);
}

function drawFreq() {
  context.lineWidth = 1;
  context.strokeStyle = '#fff';

  context.beginPath();

  const sliceWidth = canvas.width / analyserBuffer.length;
  let x = 0;

  for (let i = 0; i < analyserBuffer.length; i++) {
    const v = analyserBuffer[i] / 128;
    const y = (v * canvas.height) / 2;

    if (i === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }

    x += sliceWidth;
  }

  context.lineTo(canvas.width, canvas.height / 2);
  context.stroke();
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
  return Math.sqrt(sum / array.length);
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

function generateColor(variance: number) {
  const hue =
    (baseColor * variance + performance.now() * 0.02 * variance) % 360; // 0.02 = vitesse du changement
  return `hsl(${hue}, 80%, 60%)`;
}

function animateParticles(
  radius: number,
  particles: Particle[],
  volume: number,
  baseColor: number,
  colored?: boolean
) {
  if (volume === 0) return;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  for (const particle of particles) {
    const targetSpeed = particle.baseSpeed * (1 + volume);
    particle.speed = (targetSpeed - particle.speed) * parameters.easing;

    particle.angle += particle.speed;

    particle.animatedRadius = parameters.streak
      ? volume * particle.sensor * parameters.maxRadius
      : volume * particle.sensor * parameters.maxRadius * Math.random();

    const r = radius * parameters.radius + particle.animatedRadius;
    const x = cx + Math.cos(particle.angle) * r + Math.random(); // pos sur le cercle en largeur
    const y = cy + Math.sin(particle.angle) * r + Math.random(); // same en hauteur

    context.beginPath();

    colored
      ? (context.fillStyle = generateColor(radius))
      : (context.fillStyle = 'white');
    context.globalCompositeOperation = parameters.style; // FIXME: overlay ?

    context.arc(x, y, parameters.particleSize, 0, 2 * Math.PI, true); // 2π = un cercle complet, le point peut se placer partout sur le cercle
    context.fill();
    context.closePath();
  }
}

const rand = (min: number, max: number) => min + Math.random() * (max - min);

// Nombre aléatoire qui respecte le step du slider
const randomWithStep = (min: number, max: number, step: number) => {
  const count = Math.floor((max - min) / step);
  return min + Math.floor(Math.random() * (count + 1)) * step;
};

function randomizeParticles() {
  baseColor = randomWithStep(0, 360, 1);
  parameters.colored = Math.random() < 0.5;
  parameters.streak = Math.random() < 0.5;
  parameters.particleCount = randomWithStep(200, 2000, 100);
  parameters.particleSize = randomWithStep(1, 4, 1);
  parameters.radius = randomWithStep(0, 500, 10);
  parameters.maxRadius = randomWithStep(100, 500, 10);
  parameters.easing = Math.round(rand(0.1, 2) * 10) / 10;
  parameters.opacity = randomWithStep(0.1, 1, 0.01);
  pane.refresh();
  updateParticles();
}
