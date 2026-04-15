import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface InteractiveStarsProps {
  count?: number;
  radius?: number;
  depth?: number;
}

export default function InteractiveStars({ count = 20000, radius = 300, depth = 60 }: InteractiveStarsProps) {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate initial star positions
  const [positions, velocities, drifts, colors, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const drf = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    const color = new THREE.Color();
    
    for (let i = 0; i < count; i++) {
      const r = radius + depth * Math.random();
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      
      vel[i * 3] = 0;
      vel[i * 3 + 1] = 0;
      vel[i * 3 + 2] = 0;

      // Give each star a very slow constant random drift velocity
      drf[i * 3] = (Math.random() - 0.5) * 0.02;
      drf[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
      drf[i * 3 + 2] = (Math.random() - 0.5) * 0.02;

      // Slight natural color variations
      color.setHSL(Math.random(), 0.2, Math.random() * 0.5 + 0.5);
      cols[i * 3] = color.r;
      cols[i * 3 + 1] = color.g;
      cols[i * 3 + 2] = color.b;

      // Varying sizes
      sz[i] = Math.random() * 3.0; // Randomize the scale of each star
    }
    return [pos, vel, drf, cols, sz];
  }, [count, radius, depth]);

  const raycaster = new THREE.Raycaster();
  const v = new THREE.Vector3();
  const vel = new THREE.Vector3();
  const closestPoint = new THREE.Vector3();
  const dir = new THREE.Vector3();

  useFrame((state) => {
    if (!pointsRef.current) return;
    
    // Raycast from camera through mouse
    raycaster.setFromCamera(state.pointer, state.camera);
    const ray = raycaster.ray;
    
    const posAttribute = pointsRef.current.geometry.attributes.position;
    const posArray = posAttribute.array as Float32Array;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      v.set(posArray[i3], posArray[i3 + 1], posArray[i3 + 2]);
      vel.set(velocities[i3], velocities[i3 + 1], velocities[i3 + 2]);
      
      // Find closest point on the mouse ray to the star
      ray.closestPointToPoint(v, closestPoint);
      
      // Distance from star to the ray line
      const distSq = closestPoint.distanceToSquared(v);
      
      // If the interaction ray is close to the star, push it away
      if (distSq < 1500 && distSq > 0.1) { 
        // the closer it is, the harder it repels out (like pushing sand)
        const force = (1500 - distSq) / 1000;
        dir.subVectors(v, closestPoint).normalize().multiplyScalar(force * 0.5); 
        vel.add(dir); // Apply force to velocity
      }
      
      // Apply velocity to position so the star actually drifts through space (from interaction)
      v.add(vel);
      
      // Apply constant random drift so they are always slowly moving autonomously
      v.x += drifts[i3];
      v.y += drifts[i3 + 1];
      v.z += drifts[i3 + 2];
      
      // Apply friction/drag so that the sand eventually stops fast drifting
      vel.multiplyScalar(0.92);
      
      // Update both arrays
      posArray[i3] = v.x;
      posArray[i3 + 1] = v.y;
      posArray[i3 + 2] = v.z;
      
      velocities[i3] = vel.x;
      velocities[i3 + 1] = vel.y;
      velocities[i3 + 2] = vel.z;
    }
    
    posAttribute.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <shaderMaterial
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        transparent={true}
        vertexColors={true}
        vertexShader={`
          attribute float size;
          varying vec3 vColor;
          void main() {
            vColor = color;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (200.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          varying vec3 vColor;
          void main() {
            // Draw a soft circle fade around each star rather than harsh square pixels
            float d = distance(gl_PointCoord, vec2(0.5, 0.5));
            float alpha = 1.0 - smoothstep(0.1, 0.5, d);
            gl_FragColor = vec4(vColor, alpha * 0.8);
          }
        `}
      />
    </points>
  );
}