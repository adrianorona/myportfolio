import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import Astronaut from './Astronaut';

export default function Moon() {
  const moonGroupRef = useRef<THREE.Group>(null);
  const moonMeshRef = useRef<THREE.Mesh>(null);

  // Using a public high-res moon texture from three.js examples
  const [moonTexture] = useTexture([
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg'
  ]);

  useFrame((_, delta) => {
    if (moonGroupRef.current) {
      // Orbit around the Earth
      moonGroupRef.current.rotation.y += delta * 0.1;
    }
    if (moonMeshRef.current) {
      // Rotate the moon on its own axis
      moonMeshRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group ref={moonGroupRef}>
      <mesh name="Moon" ref={moonMeshRef} position={[4, 0, 0]}>
        <sphereGeometry args={[0.27, 32, 32]} />
        <meshStandardMaterial 
          map={moonTexture} 
          roughness={1} 
          metalness={0} 
        />
        {/* Adorable little astronaut floating near the moon! */}
        <Astronaut />
      </mesh>
    </group>
  );
}
