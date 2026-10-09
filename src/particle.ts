export type Particle = {
  angle: number; // pos sur le cercle
  baseSpeed: number;
  speed: number;
  size: number;
  sensor: number;
  animatedRadius: number;
};

function generateSpeed(orientation: number) {
  return (0.002 + Math.random() * 0.00000006) * orientation;
}

export function generateParticles(particleCount: number) {
  const orientation = Math.random() < 0.5 ? -1 : 1;
  const particles: Particle[] = Array.from({ length: particleCount }, () => {
    const baseSpeed = generateSpeed(orientation);
    return {
      angle: Math.random() * 2 * Math.PI,
      baseSpeed,
      speed: baseSpeed,
      size: Math.random(),
      sensor: 0.2 + Math.random() * 0.8,
      animatedRadius: 0,
    };
  });

  return particles;
}
