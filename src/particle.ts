export type Particle = {
  angle: number; // pos sur le cercle
  speed: number;
  size: number;
  sensor: number;
  animatedRadius: number;
};

function generateSpeed() {
  var plusOrMinus = Math.random() < 0.5 ? -1 : 1;
  return 0.002 + Math.random() * 0.006 * plusOrMinus;
}

export function generateParticles(particleCount: number) {
  const particles: Particle[] = Array.from({ length: particleCount }, () => ({
    angle: Math.random() * 2 * Math.PI,
    speed: generateSpeed(),
    size: Math.random(),
    sensor: 0.2 + Math.random() * 0.8,
    animatedRadius: 0,
  }));

  return particles;
}
