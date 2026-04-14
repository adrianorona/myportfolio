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
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhongMaterial
          map={colorMap}
          normalMap={normalMap}
          specularMap={specularMap}
          shininess={35}
          specular={new THREE.Color(0x333333)}
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
              // Make city lights a more realistic warm, glowing yellow-white
              nightColor *= vec3(1.2, 1.0, 0.6);
              
              // Find the lit brightness
              float luma = dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114));
              
              // Smooth transition into the dark side (twilight zone)
              float nightBlend = smoothstep(0.25, 0.0, luma);
              
              // Strip out the muddy ambient light on the dark side to make it true space black
              gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.0), nightBlend);
              
              // Add the city lights back over the perfect black
              gl_FragColor.rgb += nightColor * nightBlend * 2.0;
              
              // Add a tiny bit of vibrancy / saturation to the daylight to make it feel more "alive"
              gl_FragColor.rgb = mix(vec3(luma), gl_FragColor.rgb, 1.15);
              `
            );
          }}
        />
      </mesh>
      <mesh ref={cloudsRef} position={[0, 0, 0]}>
        <sphereGeometry args={[1.005, 64, 64]} />
        <meshPhongMaterial
          map={cloudsMap}
          transparent={true}
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Atmospheric blue glow/ozone layer */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1.1, 64, 64]} />
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
              // Brighter, more vibrant fresnel glow extending off the edges
              float intensity = pow(0.65 - dot(vNormal, vec3(0, 0, 1.0)), 4.0);
              gl_FragColor = vec4(0.15, 0.55, 1.0, 1.0) * intensity * 2.0;
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