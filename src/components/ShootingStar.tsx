import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function ShootingStar() {
  const starRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.InstancedMesh>(null);
  
  const [exploded, setExploded] = useState(false);
  const [explosionProgress, setExplosionProgress] = useState(0);
  const [waiting, setWaiting] = useState(false);
  const [waitTime, setWaitTime] = useState(0);

  // Spawns the star high above and slightly behind/around the Earth
  const generateRandomSpawn = () => new THREE.Vector3(
    (Math.random() - 0.5) * 10,  // Random X
    6 + Math.random() * 4,       // High Y
    (Math.random() - 0.5) * 6 - 2 // Random Z
  );

  // Targets a location near/on the Earth surface
  const generateTarget = () => new THREE.Vector3(
    (Math.random() - 0.5) * 1.5,
    Math.random() * 0.5,
    (Math.random() - 0.5) * 1.5
  );

  const [pos, setPos] = useState(generateRandomSpawn);
  const [target, setTarget] = useState(generateTarget);
  // Velocity points from spawn to target
  const velocity = useMemo(() => new THREE.Vector3().subVectors(target, pos).normalize().multiplyScalar(6), [pos, target]);

  const particleCount = 40;
  const explosionVelocities = useMemo(() => Array.from({ length: particleCount }, () => 
    new THREE.Vector3((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2).normalize().multiplyScalar(Math.random() * 0.5 + 0.1)
  ), [pos]);
  const pPositions = useMemo(() => Array.from({ length: particleCount }, () => new THREE.Vector3(0, 0, 0)), [pos]);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, delta) => {
    if (waiting) {
      if (waitTime > 0) {
        setWaitTime(w => w - delta);
      } else {
        // Respawn!
        setWaiting(false);
        const newSpawn = generateRandomSpawn();
        const newTarget = generateTarget();
        setPos(newSpawn);
        setTarget(newTarget);
        velocity.copy(new THREE.Vector3().subVectors(newTarget, newSpawn).normalize().multiplyScalar(6 + Math.random() * 4)); // Random speed between 6-10
      }
      return;
    }

    if (!exploded) {
      if (starRef.current) {
        // Point the star along its velocity path to stretch the geometry!
        starRef.current.lookAt(target);
      }
      setPos(p => {
         const np = new THREE.Vector3(p.x + velocity.x * delta, p.y + velocity.y * delta, p.z + velocity.z * delta);
         // If it gets close enough to the target coordinates (near Earth), EXPLODE!
         if (np.distanceTo(target) < 0.5 || np.length() < 1.1) {
            setExploded(true);
         }
         return np;
      });
    } else {
      if (particlesRef.current && explosionProgress < 1) {
        let prog = explosionProgress + delta * 2; // Explode fast! (0.5s)
        setExplosionProgress(prog);
        
        for (let i = 0; i < particleCount; i++) {
          pPositions[i].add(explosionVelocities[i]);
          dummy.position.copy(pPositions[i]);
          const scale = Math.max(0, 1 - prog); // Shrink over time
          dummy.scale.set(scale, scale, scale);
          dummy.updateMatrix();
          particlesRef.current.setMatrixAt(i, dummy.matrix);
        }
        particlesRef.current.instanceMatrix.needsUpdate = true;
        
        if (prog >= 1) {
          // Finished exploding. Wait for a random few seconds before shooting another star!
          setExploded(false);
          setExplosionProgress(0);
          for (let i = 0; i < particleCount; i++) {
            pPositions[i].set(0, 0, 0);
          }
          setWaiting(true);
          setWaitTime(Math.random() * 3 + 2); // Wait 2-5 seconds
        }
      }
    }
  });

  return (
    <group position={pos}>
      {!waiting && !exploded && (
        <mesh ref={starRef}>
          {/* Stretched cylinder to look like a streak of light! */}
          <cylinderGeometry args={[0.02, 0.02, 1.5, 8]} />
          <meshBasicMaterial color="#ffffff" />
          
          {/* A glowing aura around the streak */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 1.6, 8]} />
            <meshBasicMaterial color="#00aaff" transparent={true} opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        </mesh>
      )}
      {!waiting && exploded && (
        <instancedMesh ref={particlesRef} args={[undefined as any, undefined as any, particleCount]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          {/* A brilliant blue/white explosive flash! */}
          <meshBasicMaterial color="#00ffff" transparent={true} opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false}/>
        </instancedMesh>
      )}
    </group>
  );
}
