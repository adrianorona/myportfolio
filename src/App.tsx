import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import Earth from './components/Earth';
import './App.css';

function App() {
  return (
    <div className="canvas-container">
      <Canvas camera={{ position: [0, 0, 3] }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.2} />
          <directionalLight position={[2, 0, 5]} intensity={3.5} />
          <Earth />
          <Stars 
            radius={300} 
            depth={60} 
            count={20000} 
            factor={7} 
            saturation={0} 
            fade={true} 
          />
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