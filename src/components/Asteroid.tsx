import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Asteroid() {
  // Use pure refs for high-performance 60fps animation instead of React state!
  const groupRef = useRef<THREE.Group>(null);
  const asteroidRef = useRef<THREE.Group>(null);
  const explosionGroupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.InstancedMesh>(null);
  const coreParticlesRef = useRef<THREE.InstancedMesh>(null);
  const flashRef = useRef<THREE.Mesh>(null);
  
  const exploded = useRef(false);
  const explosionProgress = useRef(0);
  const speed = useRef(Math.random() * 1.5 + 0.5); 
  
  const generateRandomPos = () => {
    // Push them into the deep background (-15 to -35) or far foreground (10 to 25)
    // This entirely prevents them from ever clipping through the 3D planets which sit at Z ≈ 0 !
    const zDepth = Math.random() > 0.5 
      ? -(Math.random() * 20 + 15) 
      : (Math.random() * 15 + 10);
      
    return new THREE.Vector3(
      Math.random() * 80 - 40,   // Wider X spread: -40 to 40
      Math.random() * 40 - 20,   // Wider Y spread: -20 to 20
      zDepth
    );
  };
  
  const initialPos = useMemo(() => generateRandomPos(), []);

  // Outer rocky particles
  const particleCount = 40;
  const velocities = useMemo(() => Array.from({ length: particleCount }, () => 
    new THREE.Vector3((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2).normalize().multiplyScalar(Math.random() * 0.4 + 0.2)
  ), []);
  const pPositions = useMemo(() => Array.from({ length: particleCount }, () => new THREE.Vector3(0, 0, 0)), []);
  
  // Inner fiery core particles
  const coreParticleCount = 20;
  const coreVelocities = useMemo(() => Array.from({ length: coreParticleCount }, () => 
    new THREE.Vector3((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2).normalize().multiplyScalar(Math.random() * 0.2 + 0.05)
  ), []);
  const corePositions = useMemo(() => Array.from({ length: coreParticleCount }, () => new THREE.Vector3(0, 0, 0)), []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Detailed multi-part asteroid
  const mainGeo = useMemo(() => {
    const geo = new THREE.DodecahedronGeometry(0.15, 1);
    const posAttribute = geo.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < posAttribute.count; i++) {
      v.fromBufferAttribute(posAttribute, i);
      v.normalize().multiplyScalar(0.12 + Math.random() * 0.06); 
      posAttribute.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  const craterGeo = useMemo(() => {
    const geo = new THREE.DodecahedronGeometry(0.08, 0);
    return geo;
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    if (!exploded.current) {
      if (asteroidRef.current) {
        asteroidRef.current.rotation.x += delta * 0.5;
        asteroidRef.current.rotation.y += delta * 0.8;
      }
      
      // Move asteroid
      groupRef.current.position.x -= delta * speed.current;
      
      if (groupRef.current.position.x < -45) {
        groupRef.current.position.copy(generateRandomPos());
        groupRef.current.position.x = 45 + Math.random() * 20; 
      }
    } else {
      if (explosionProgress.current < 1) {
        explosionProgress.current += delta * 1.5; 
        const prog = explosionProgress.current;
        
        // Update outer rocky particles
        if (particlesRef.current) {
          for (let i = 0; i < particleCount; i++) {
            pPositions[i].add(velocities[i]);
            dummy.position.copy(pPositions[i]);
            const scale = Math.max(0, 1 - Math.pow(prog, 2)); // Ease out scale
            dummy.scale.set(scale, scale, scale);
            dummy.rotation.x += delta * 5;
            dummy.rotation.y += delta * 5;
            dummy.updateMatrix();
            particlesRef.current.setMatrixAt(i, dummy.matrix);
          }
          particlesRef.current.instanceMatrix.needsUpdate = true;
          
          if (particlesRef.current.material instanceof THREE.Material) {
              particlesRef.current.material.transparent = true;
              particlesRef.current.material.opacity = 1 - prog;
          }
        }

        // Update inner fiery core particles
        if (coreParticlesRef.current) {
            for (let i = 0; i < coreParticleCount; i++) {
              corePositions[i].add(coreVelocities[i]);
              dummy.position.copy(corePositions[i]);
              const scale = Math.max(0, 1 - Math.pow(prog, 1.5)); 
              dummy.scale.set(scale, scale, scale);
              dummy.updateMatrix();
              coreParticlesRef.current.setMatrixAt(i, dummy.matrix);
            }
            coreParticlesRef.current.instanceMatrix.needsUpdate = true;
        }
        
        if (flashRef.current) {
           (flashRef.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - prog * 3);
        }
        
        if (prog >= 1) {
          // Reset
          exploded.current = false;
          explosionProgress.current = 0;
          if (asteroidRef.current) asteroidRef.current.visible = true;
          if (explosionGroupRef.current) explosionGroupRef.current.visible = false;
          
          const newPos = generateRandomPos();
          newPos.x = 45 + Math.random() * 20; 
          groupRef.current.position.copy(newPos);
          for (let i = 0; i < particleCount; i++) pPositions[i].set(0, 0, 0);
          for (let i = 0; i < coreParticleCount; i++) corePositions[i].set(0, 0, 0);
          // Scale to compensate for background depth!
          speed.current = Math.random() * 3.5 + 1.5;
        }
      }
    }
  });

  return (
    <group ref={groupRef} position={initialPos}>
      {/* Intact Asteroid */}
      <group 
        ref={asteroidRef}
        onClick={(e) => {
          e.stopPropagation();
          exploded.current = true;
          if (asteroidRef.current) asteroidRef.current.visible = false;
          if (explosionGroupRef.current) explosionGroupRef.current.visible = true;
        }}
        onPointerOver={() => document.body.style.cursor='crosshair'} 
        onPointerOut={() => document.body.style.cursor='auto'}
      >
        <mesh geometry={mainGeo}>
          <meshStandardMaterial color="#444444" roughness={0.9} metalness={0.2} />
        </mesh>
        <mesh geometry={craterGeo} position={[0.08, 0.08, 0.05]} rotation={[Math.random(), Math.random(), 0]}>
          <meshStandardMaterial color="#333333" roughness={1.0} metalness={0.1} />
        </mesh>
        <mesh geometry={craterGeo} position={[-0.08, -0.05, 0.08]} rotation={[Math.random(), Math.random(), 0]}>
          <meshStandardMaterial color="#222222" roughness={1.0} metalness={0.1} />
        </mesh>
      </group>

      {/* Explosion Components */}
      <group ref={explosionGroupRef} visible={false}>
        <instancedMesh ref={particlesRef} args={[undefined as any, undefined as any, particleCount]}>
          <dodecahedronGeometry args={[0.05, 0]} />
          <meshStandardMaterial color="#555555" roughness={0.9} />
        </instancedMesh>
        
        <instancedMesh ref={coreParticlesRef} args={[undefined as any, undefined as any, coreParticleCount]}>
           <dodecahedronGeometry args={[0.08, 0]} />
           <meshStandardMaterial color="#ff5500" emissive="#ffaa00" emissiveIntensity={3} transparent={true} opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} />
        </instancedMesh>
        
        <mesh ref={flashRef}>
           <sphereGeometry args={[0.2, 16, 16]} />
           <meshBasicMaterial color="#ffffff" transparent={true} opacity={1} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}
