import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import Earth from './components/Earth';
import InteractiveStars from './components/InteractiveStars';
import Moon from './components/Moon';
import Sun from './components/Sun';
import OtherPlanets from './components/OtherPlanets';
import './App.css';

// A component that simulates Earth's orbit by doing the mathematical inverse!
// It moves the universe around an Earth that stays perfectly fixed at [0,0,0].
function SolarSystemRig() {
  const rigRef = useRef<THREE.Group>(null);
  const earthOrbitRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (!rigRef.current || !earthOrbitRef.current) return;
    
    // The "Earth Year" speed
    earthOrbitRef.current.rotation.y += delta * 0.05; 
    
    // Find where Earth "would" be in a normal heliocentric model
    const currentAngle = earthOrbitRef.current.rotation.y;
    const distance = 107.7;
    const ex = Math.sin(currentAngle) * distance;
    const ez = Math.cos(currentAngle) * distance;
    
    // Instead of moving Earth, we shift the entire Universe backward by Earth's position!
    // This perfectly glues Earth to [0,0,0] so the Camera and OrbitControls feel amazing.
    rigRef.current.position.set(-ex, 0, -ez);
  });

  return (
    <group ref={rigRef}>
      {/* 
        The Sun and Planets are inside the Rig, meaning they orbit [0,0,0] together.
        When the Rig shifts, they all drift past the screen dynamically! 
      */}
      <Sun />
      <OtherPlanets />
      
      {/* 
        This group rotates the Earth precisely to match the Rig offset. 
        It naturally holds Earth identically at World Origin [0,0,0] at all times.
      */}
      <group ref={earthOrbitRef}>
        <group position={[0, 0, 107.7]}>
          <Earth />
          <Moon />
        </group>
      </group>
      
      <InteractiveStars count={25000} radius={1200} depth={300} />
    </group>
  );
}

function App() {
  return (
    <div className="canvas-container">
      <Canvas camera={{ position: [0, 0, 3.5] }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.1} />
          <SolarSystemRig />
        </Suspense>
        {/* Because Earth is kept strictly at World Origin [0,0,0], standard controls work flawlessly. */}
        <OrbitControls 
          enableZoom={true} 
          enablePan={true} 
          enableRotate={true}
          zoomSpeed={0.6}
          panSpeed={0.5}
          rotateSpeed={0.4}
        />
      </Canvas>
    </div>
  );
}

export default App;