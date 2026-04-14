import { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { TextureLoader } from 'three';

export default function Earth() {
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
            shader.uniforms.uSunDirection = { value: new THREE.Vector3(2, 0, 5).normalize() };

            // Pass the absolute object-space normal to the fragment shader
            shader.vertexShader = shader.vertexShader.replace(
              'void main() {',
              `
              varying vec3 vObjectNormal;
              void main() {
              `
            ).replace(
              '#include <beginnormal_vertex>',
              `
              #include <beginnormal_vertex>
              // Get the actual world-space normal of this rotating mesh, not just plain local 'normal'
              vObjectNormal = normalize((modelMatrix * vec4(objectNormal, 0.0)).xyz);
              `
            );

            shader.fragmentShader = shader.fragmentShader.replace(
              '#include <map_pars_fragment>',
              `
              #include <map_pars_fragment>
              uniform sampler2D tNight;
              uniform vec3 uSunDirection;
              varying vec3 vObjectNormal;
              `
            ).replace(
              '#include <dithering_fragment>',
              `
              #include <dithering_fragment>
              
              // Only sample the red channel to extract true brightness, bypassing ANY purple/blue noise in the map!
              float nightLight = texture2D(tNight, vMapUv).r;
              // Crush low-intensity grey values to pitch black, leaving only bright actual city lights
              nightLight = pow(nightLight, 4.0);
              
              vec3 cityLights = vec3(nightLight) * vec3(1.3, 1.0, 0.4); // Warm glowing golden lights
              
              // We compare world-space normal against sun direction for perfect fixed-light orientation relative to camera
              float dayIntensity = dot(normalize(vObjectNormal), normalize(uSunDirection));
              
              float dayBlend = smoothstep(-0.15, 0.15, dayIntensity);
              float nightBlend = smoothstep(0.1, -0.15, dayIntensity);
              
              // Keep a very dim, cool midnight blue tint of the actual Earth base texture so continents are faintly visible at night 
              vec3 baseTexture = texture2D(map, vMapUv).rgb;
              vec3 starlightIllumination = baseTexture * vec3(0.08, 0.12, 0.2); // Extremely dark blue
              
              // Only apply pure black over the dark side if you wanted it fully dead, instead we mix the starlight glow in
              gl_FragColor.rgb = mix(starlightIllumination, gl_FragColor.rgb, dayBlend);
              
              // Add city lights directly over the darkened area
              gl_FragColor.rgb += cityLights * nightBlend * 8.0;
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
          onBeforeCompile={(shader) => {
            shader.uniforms.uSunDirection = { value: new THREE.Vector3(2, 0, 5).normalize() };
            shader.vertexShader = shader.vertexShader.replace(
              'void main() {',
              `
              varying vec3 vObjectNormal;
              void main() {
              `
            ).replace(
              '#include <beginnormal_vertex>',
              `
              #include <beginnormal_vertex>
              vObjectNormal = normalize((modelMatrix * vec4(objectNormal, 0.0)).xyz);
              `
            );
            shader.fragmentShader = shader.fragmentShader.replace(
              '#include <map_pars_fragment>',
              `
              #include <map_pars_fragment>
              uniform vec3 uSunDirection;
              varying vec3 vObjectNormal;
              `
            ).replace(
              '#include <dithering_fragment>',
              `
              #include <dithering_fragment>
              float dayIntensity = dot(normalize(vObjectNormal), normalize(uSunDirection));
              float dayBlend = smoothstep(-0.25, 0.1, dayIntensity);
              gl_FragColor.rgb *= dayBlend;
              `
            );
          }}
        />
      </mesh>

      {/* Atmospheric blue glow/ozone layer */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1.1, 64, 64]} />
        <shaderMaterial
          uniforms={{
            uSunDirection: { value: new THREE.Vector3(2, 0, 5).normalize() }
          }}
          vertexShader={`
            varying vec3 vNormal;
            varying vec3 vObjectNormal;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              vObjectNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform vec3 uSunDirection;
            varying vec3 vNormal;
            varying vec3 vObjectNormal;
            void main() {
              float dayIntensity = dot(normalize(vObjectNormal), normalize(uSunDirection));
              float dayBlend = smoothstep(-0.4, 0.15, dayIntensity);
              float intensity = pow(0.65 - dot(vNormal, vec3(0, 0, 1.0)), 4.0);
              gl_FragColor = vec4(0.15, 0.55, 1.0, 1.0) * intensity * 2.0 * dayBlend;
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
}