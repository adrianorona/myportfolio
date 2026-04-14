import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import Earth from './components/Earth';
import InteractiveStars from './components/InteractiveStars';
import Moon from './components/Moon';
import Sun from './components/Sun';
import OtherPlanets from './components/OtherPlanets';
import './App.css';

// A component that handles Earth's physical movement around the Sun,
// while elegantly keeping the camera locked to it!
function EarthSystem() {
  const earthOrbitRef = useRef<THREE.Group>(null);
  
  // Earth's orbital speed around the Sun (between Venus and Mars speeds)
  useFrame((state, delta) => {
    if (earthOrbitRef.current) {
      earthOrbitRef.current.rotation.y += delta * 0.01 * 10; 
    }
  });

  return (
    <group ref={earthOrbitRef}>
      {/* Earth's distance from the Sun is ~107.7 */}
      <group position={[107.7, 0, 0]}>
        
        {/* Make a custom camera that rides ALONG with the Earth */}
        <PerspectiveCamera makeDefault position={[0, 0, 3.5]} fov={75} />
        
        {/* OrbitControls will now pivot safely around this local origin where Earth sits */}
        <OrbitControls 
          enableZoom={true} 
          enablePan={true} 
          enableRotate={true}
          zoomSpeed={0.6}
          panSpeed={0.5}
          rotateSpeed={0.4}
        />

        <Earth />
        <Moon />
      </group>
    </group>
  );
}

function App() {
  return (
    <div className="canvas-container">
      <Canvas>
        <Suspense fallback={null}>
          <ambientLight intensity={0.1} />
          
          <Sun />
          <OtherPlanets />
          <EarthSystem />
          
          {/* Make the background stars wide enough to cover the massive solar system */}
          <InteractiveStars count={25000} radius={1200} depth={300} />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default App;