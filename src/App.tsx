import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Earth from './components/Earth';
import InteractiveStars from './components/InteractiveStars';
import Moon from './components/Moon';
import Sun from './components/Sun';
import OtherPlanets from './components/OtherPlanets';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  return (
    <div className="canvas-container">
      <Navbar />
      <Canvas camera={{ position: [0, 0, 3] }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.2} />
          <Earth />
          <Moon />
          <Sun />
          <OtherPlanets />
          <InteractiveStars count={20000} radius={300} depth={60} />
        </Suspense>
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