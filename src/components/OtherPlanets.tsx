import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

const SUN_POS = new THREE.Vector3(40, 0, 100);
const BASE_URL = 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/';

interface PlanetData {
  name: string;
  size: number;
  distance: number;
  speed: number;
  textureMap: string;
  ringMap?: string;
  color?: string;
}

const planetData: PlanetData[] = [
  { name: 'Mercury', size: 0.38, distance: 35, speed: 0.04, textureMap: 'mercurymap.jpg' },
  { name: 'Venus', size: 0.95, distance: 65, speed: 0.015, textureMap: 'venusmap.jpg' },
  { name: 'Mars', size: 0.53, distance: 150, speed: 0.008, textureMap: 'marsmap1k.jpg' },
  { name: 'Jupiter', size: 11.2, distance: 280, speed: 0.002, textureMap: 'jupitermap.jpg' },
  { name: 'Saturn', size: 9.45, distance: 400, speed: 0.0009, textureMap: 'saturnmap.jpg', ringMap: 'saturnringcolor.jpg', color: '#eeddcc' },
  { name: 'Uranus', size: 4.0, distance: 550, speed: 0.0004, textureMap: 'uranusmap.jpg', ringMap: 'uranusringcolour.jpg', color: '#aaccff' },
  { name: 'Neptune', size: 3.88, distance: 700, speed: 0.0001, textureMap: 'neptunemap.jpg' },
  { name: 'Pluto', size: 0.18, distance: 850, speed: 0.00005, textureMap: 'plutomap1k.jpg' }
];

function DetailedPlanet({ data }: { data: PlanetData }) {
  const planetMeshRef = useRef<THREE.Mesh>(null);
  
  // Load the planet's surface texture
  const texture = useTexture(BASE_URL + data.textureMap);
  
  // Load the ring texture if it exists
  const ringTexture = useTexture(data.ringMap ? BASE_URL + data.ringMap : BASE_URL + data.textureMap);

  // Slowly rotate the planet on its own axis
  useFrame((state, delta) => {
    if (planetMeshRef.current) {
      planetMeshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group position={[data.distance, 0, 0]}>
      {/* The main planet sphere */}
      <mesh ref={planetMeshRef}>
        <sphereGeometry args={[data.size, 64, 64]} />
        <meshStandardMaterial 
          map={texture} 
          roughness={0.7} 
          metalness={0.0} 
        />
      </mesh>

      {/* The Rings (if applicable) */}
      {data.ringMap && (
        <mesh rotation-x={Math.PI / 2.2}>
          <ringGeometry args={[data.size * 1.4, data.size * 2.2, 64]} />
          <meshStandardMaterial 
            map={ringTexture}
            color={data.color}
            side={THREE.DoubleSide} 
            transparent={true} 
            opacity={0.8}
            roughness={0.8}
          />
        </mesh>
      )}

      {/* Faint distant glow for massive gas giants */}
      {data.size > 5 && (
        <pointLight distance={data.size * 3} intensity={0.5} color={data.color || '#ffffff'} />
      )}
    </group>
  );
}

export default function OtherPlanets() {
  const orbitsRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (!orbitsRef.current) return;
    
    orbitsRef.current.children.forEach((orbitGroup, i) => {
      // Rotate the entire orbit group around the Sun
      orbitGroup.rotation.y += planetData[i].speed * 10 * delta; 
    });
  });

  return (
    <group position={[SUN_POS.x, SUN_POS.y, SUN_POS.z]}>
      <group ref={orbitsRef}>
        {planetData.map((planet) => (
          <group key={planet.name}>
            <DetailedPlanet data={planet} />
          </group>
        ))}
      </group>
    </group>
  );
}
