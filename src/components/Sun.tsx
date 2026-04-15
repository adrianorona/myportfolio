import { useRef } from 'react';
import { Billboard } from '@react-three/drei';
import * as THREE from 'three';

export default function Sun() {
  const sunRef = useRef<THREE.Mesh>(null);

  return (
    <group>
      {/* 
        This is the actual light illuminating the Earth and Moon. 
        It shares the exact direction as the [2, 0, 5] vector used in the Earth shaders.
      */}
      <directionalLight position={[20, 0, 50]} intensity={3.5} />
      
      {/* 
        Billboard makes the plane always face the camera perfectly.
        We use a custom shader to draw a procedural glowing star so it has no hard edges!
      */}
      <Billboard position={[40, 0, 100]}>
        <mesh ref={sunRef}>
          {/* A large plane to hold the procedural sun glow */}
          <planeGeometry args={[40, 40]} />
          <shaderMaterial
            transparent={true}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            fragmentShader={`
              varying vec2 vUv;
              void main() {
                // Distance from center of the plane
                float d = distance(vUv, vec2(0.5));
                
                // Super bright, tiny white core
                float core = 1.0 - smoothstep(0.0, 0.02, d);
                
                // Intense yellow inner glow
                float innerGlow = 1.0 - smoothstep(0.0, 0.1, d);
                
                // Vast, warm orange outer corona/flare
                float outerGlow = 1.0 - smoothstep(0.0, 0.5, d);
                
                // Composite the layers
                vec3 color = vec3(0.0);
                color += core * vec3(1.0, 1.0, 1.0);           // Pure white
                color += innerGlow * vec3(1.0, 0.9, 0.4);      // Yellow
                color += outerGlow * vec3(1.0, 0.4, 0.0) * 0.6;// Orange
                
                // Fade out softly at the edges
                float alpha = clamp(core + innerGlow + outerGlow, 0.0, 1.0);
                
                gl_FragColor = vec4(color, alpha * 2.0);
              }
            `}
            vertexShader={`
              varying vec2 vUv;
              void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `}
          />
        </mesh>
      </Billboard>
    </group>
  );
}
