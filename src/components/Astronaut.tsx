import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { useRef } from 'react';

export default function Astronaut() {
  const groupRef = useRef<THREE.Group>(null);
  
  // A subtle breathing/waving animation plus a slow floating orbit!
  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Internal bobbing and rotation
      groupRef.current.rotation.x = 0.2 + Math.sin(clock.elapsedTime * 0.5) * 0.1;
      groupRef.current.rotation.y = -Math.PI / 4 + Math.sin(clock.elapsedTime * 0.2) * 0.1;
      
      // Moving in a wide circular orbit outside the Moon's radius (Moon is 0.27 radius)
      groupRef.current.position.x = Math.cos(clock.elapsedTime * 0.4) * 0.45;
      groupRef.current.position.y = 0.1 + Math.sin(clock.elapsedTime * 0.5) * 0.2;
      groupRef.current.position.z = Math.sin(clock.elapsedTime * 0.4) * 0.45;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={1.5} floatIntensity={2} floatingRange={[-0.05, 0.05]}>
      <group ref={groupRef} scale={0.06}>
        
        {/* === Helmet & Head === */}
        <group position={[0, 1.8, 0]}>
          {/* Main Helmet Sphere */}
          <mesh>
            <sphereGeometry args={[0.55, 32, 32]} />
            <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.1} />
          </mesh>
          {/* Gold Reflective Visor */}
          <mesh position={[0, 0.05, 0.25]} rotation={[-0.1, 0, 0]}>
            <boxGeometry args={[0.75, 0.45, 0.6]} />
            <meshStandardMaterial color="#ffcc00" roughness={0.1} metalness={1.0} envMapIntensity={2} />
          </mesh>
          {/* Side Earpieces/Comms */}
          <mesh position={[0.55, 0, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
            <meshStandardMaterial color="#444444" roughness={0.6} />
          </mesh>
          <mesh position={[-0.55, 0, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
            <meshStandardMaterial color="#444444" roughness={0.6} />
          </mesh>
          {/* Antenna */}
          <mesh position={[-0.4, 0.5, 0]} rotation={[0, 0, 0.2]}>
            <cylinderGeometry args={[0.01, 0.01, 0.5, 8]} />
            <meshStandardMaterial color="#aaaaaa" metalness={0.8} />
          </mesh>
          <mesh position={[-0.45, 0.75, 0]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.5} />
          </mesh>
        </group>
        
        {/* === Torso & Suit Details === */}
        <group position={[0, 0.7, 0]}>
          {/* Main Torso */}
          <mesh>
            <capsuleGeometry args={[0.45, 0.7, 16, 16]} />
            <meshStandardMaterial color="#f0f0f0" roughness={0.8} />
          </mesh>
          {/* Control Panel / Chest Plate */}
          <mesh position={[0, 0.15, 0.42]}>
            <boxGeometry args={[0.4, 0.4, 0.1]} />
            <meshStandardMaterial color="#cccccc" roughness={0.5} />
          </mesh>
          {/* Chest Buttons */}
          <mesh position={[-0.1, 0.2, 0.48]}>
            <boxGeometry args={[0.08, 0.08, 0.02]} />
            <meshStandardMaterial color="#ff0000" />
          </mesh>
          <mesh position={[0.1, 0.2, 0.48]}>
            <boxGeometry args={[0.08, 0.08, 0.02]} />
            <meshStandardMaterial color="#0088ff" />
          </mesh>
          {/* Belt */}
          <mesh position={[0, -0.4, 0]}>
            <torusGeometry args={[0.46, 0.05, 16, 32]} />
            <meshStandardMaterial color="#555555" roughness={0.7} />
          </mesh>
        </group>

        {/* === Backpack / Life Support === */}
        <group position={[0, 0.9, -0.5]}>
          {/* Main Tank */}
          <mesh>
            <boxGeometry args={[0.7, 1.1, 0.4]} />
            <meshStandardMaterial color="#dddddd" roughness={0.6} />
          </mesh>
          {/* Side Thrusters */}
          <mesh position={[0.4, -0.4, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.1, 0.1, 0.2, 16]} />
            <meshStandardMaterial color="#333333" roughness={0.8} />
          </mesh>
          <mesh position={[-0.4, -0.4, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.1, 0.1, 0.2, 16]} />
            <meshStandardMaterial color="#333333" roughness={0.8} />
          </mesh>
        </group>
        
        {/* === Arms & Hands === */}
        {/* Left Arm */}
        <group position={[-0.6, 1.1, 0]} rotation={[0, 0, 0.4]}>
          <mesh position={[0, -0.3, 0]}>
            <capsuleGeometry args={[0.15, 0.5, 16, 16]} />
            <meshStandardMaterial color="#eeeeee" roughness={0.8} />
          </mesh>
          {/* Left Glove */}
          <mesh position={[0, -0.7, 0]}>
            <sphereGeometry args={[0.18, 16, 16]} />
            <meshStandardMaterial color="#444444" roughness={0.7} />
          </mesh>
        </group>
        
        {/* Right Arm (Waving up!) */}
        <group position={[0.6, 1.1, 0]} rotation={[0, 0, -2.5]}>
          <mesh position={[0, -0.3, 0]}>
            <capsuleGeometry args={[0.15, 0.5, 16, 16]} />
            <meshStandardMaterial color="#eeeeee" roughness={0.8} />
          </mesh>
          {/* Right Glove */}
          <mesh position={[0, -0.7, 0]}>
            <sphereGeometry args={[0.18, 16, 16]} />
            <meshStandardMaterial color="#444444" roughness={0.7} />
          </mesh>
        </group>
        
        {/* === Legs & Boots === */}
        {/* Left Leg */}
        <group position={[-0.25, 0, 0]}>
          <mesh position={[0, -0.4, 0]}>
            <capsuleGeometry args={[0.18, 0.6, 16, 16]} />
            <meshStandardMaterial color="#dddddd" roughness={0.8} />
          </mesh>
          {/* Left Boot */}
          <mesh position={[0, -0.8, 0.1]}>
            <boxGeometry args={[0.25, 0.2, 0.4]} />
            <meshStandardMaterial color="#333333" roughness={0.9} />
          </mesh>
        </group>
        
        {/* Right Leg (Slightly bent) */}
        <group position={[0.25, 0.1, 0.2]} rotation={[-0.3, 0, 0]}>
          <mesh position={[0, -0.4, 0]}>
            <capsuleGeometry args={[0.18, 0.6, 16, 16]} />
            <meshStandardMaterial color="#dddddd" roughness={0.8} />
          </mesh>
          {/* Right Boot */}
          <mesh position={[0, -0.8, 0.1]}>
            <boxGeometry args={[0.25, 0.2, 0.4]} />
            <meshStandardMaterial color="#333333" roughness={0.9} />
          </mesh>
        </group>

      </group>
    </Float>
  );
}
