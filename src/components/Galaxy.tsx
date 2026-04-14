import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Galaxy() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <mesh>
      <sphereGeometry args={[50, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        side={THREE.BackSide}
        depthWrite={false}
        uniforms={{
          uTime: { value: 0 }
        }}
        vertexShader={`
          varying vec3 vPosition;
          void main() {
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          varying vec3 vPosition;
          uniform float uTime;

          // Standard 3D noise function
          float mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
          vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
          vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}
          float noise(vec3 p){
              vec3 a = floor(p);
              vec3 d = p - a;
              d = d * d * (3.0 - 2.0 * d);
              vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
              vec4 k1 = perm(b.xyxy);
              vec4 k2 = perm(k1.xyxy + b.zzww);
              vec4 c = k2 + a.zzzz;
              vec4 k3 = perm(c);
              vec4 k4 = perm(c + 1.0);
              vec4 o1 = fract(k3 * (1.0 / 41.0));
              vec4 o2 = fract(k4 * (1.0 / 41.0));
              vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
              vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);
              return o4.y * d.y + o4.x * (1.0 - d.y);
          }

          // Fractional Brownian motion
          float fbm(vec3 x) {
              float v = 0.0;
              float a = 0.5;
              vec3 shift = vec3(100);
              for (int i = 0; i < 5; ++i) {
                  v += a * noise(x);
                  x = x * 2.0 + shift;
                  a *= 0.5;
              }
              return v;
          }

          void main() {
            vec3 dir = normalize(vPosition);
            
            vec3 pos = dir * 4.0;
            pos.x += uTime;
            pos.y -= uTime * 0.5;

            // Generate two layers of noise for the nebula clouds
            float n1 = fbm(pos);
            float n2 = fbm(pos * 1.5 - vec3(uTime * 1.5));

            // Deep space background
            vec3 baseColor = vec3(0.02, 0.02, 0.1); 
            // Purple/Vibrant pink nebula
            vec3 color1 = vec3(0.4, 0.05, 0.8);
            // Cyan/Blue bright cores
            vec3 color2 = vec3(0.0, 0.8, 1.0);

            vec3 finalColor = baseColor;
            
            // Blend in the purple clouds
            finalColor = mix(finalColor, color1, smoothstep(0.4, 0.8, n1));
            // Add cyan glowing cores on top
            finalColor = mix(finalColor, color2, smoothstep(0.5, 0.9, n2));

            // Darken it slightly so the earth stands out
            gl_FragColor = vec4(finalColor * 0.6, 1.0);
          }
        `}
      />
    </mesh>
  );
}