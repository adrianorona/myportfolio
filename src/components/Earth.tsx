import { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { TextureLoader } from 'three';

const Earth = () => {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  // Load High-Res Textures
  const [colorMap, normalMap, specularMap, cloudsMap, nightMap] = useLoader(TextureLoader, [
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_lights_2048.png',
  ]);

  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();

    if (earthRef.current) {
      earthRef.current.rotation.y = elapsedTime / 6;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = elapsedTime / 6;
    }
  });

  return (
    <>
      <mesh ref={earthRef} position={[0, 0, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshPhongMaterial
          map={colorMap}
          normalMap={normalMap}
          specularMap={specularMap}
          onBeforeCompile={(shader) => {
            shader.uniforms.tNight = { value: nightMap };
            shader.fragmentShader = shader.fragmentShader.replace(
              '#include <map_pars_fragment>',
              `
              #include <map_pars_fragment>
              uniform sampler2D tNight;
              `
            ).replace(
              '#include <dithering_fragment>',
              `
              #include <dithering_fragment>
              
              vec3 nightColor = texture2D(tNight, vMapUv).rgb;
              // Tint the city lights a bright yellow
              nightColor *= vec3(1.0, 0.85, 0.3);
              
              vec3 dayColor = texture2D(map, vMapUv).rgb;
              float dayLuma = dot(dayColor, vec3(0.299, 0.587, 0.114));
              float finalLuma = dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114));
              
              // Determine how intensely the surface is lit by comparing the final color brightness to the base color
              float lightRatio = finalLuma / max(dayLuma, 0.0001);
              
              // Blend the night lights in strictly when the surface loses direct light (twilight threshold)
              float nightBlend = smoothstep(1.0, 0.5, lightRatio);
              
              gl_FragColor.rgb += nightColor * nightBlend * 2.5;
              `
            );
          }}
        />
      </mesh>
      <mesh ref={cloudsRef} position={[0, 0, 0]}>
        <sphereGeometry args={[1.005, 32, 32]} />
        <meshPhongMaterial
          map={cloudsMap}
          transparent={true}
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Atmospheric blue glow/ozone layer */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1.1, 32, 32]} />
        <shaderMaterial
          vertexShader={`
            varying vec3 vNormal;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            varying vec3 vNormal;
            void main() {
              float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 4.0);
              gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity * 1.2;
            }
          `}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          transparent={true}
          depthWrite={false}
        />
      </mesh>
    </>
  );
};

export default Earth;