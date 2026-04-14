import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

export default function Sun() {
  const sunRef = useRef<THREE.Mesh>(null);
  
  // Real 3D Sun Texture
  const sunTexture = useTexture('https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/sunmap.jpg');

  // Rotate the sun slowly
  useFrame((state, delta) => {
    if (sunRef.current) {
      sunRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group>
      {/* A huge point light illuminating all planets realistically */}
      <pointLight position={[0, 0, 0]} intensity={4.0} distance={4000} decay={1.5} />
      
      {/* True 3D Sphere Sun */}
      <mesh ref={sunRef} name="sunMesh" position={[0, 0, 0]}>
        <sphereGeometry args={[15, 64, 64]} />
        <meshBasicMaterial map={sunTexture} />
      </mesh>

      {/* Volumetric outer glow */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[15.5, 64, 64]} />
        <meshBasicMaterial 
          color="#ffaa00" 
          transparent={true} 
          opacity={0.3} 
          blending={THREE.AdditiveBlending} 
          side={THREE.BackSide} 
        />
      </mesh>
    </group>
  );
}
