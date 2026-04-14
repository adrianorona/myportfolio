import { useFrame, useThree } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import * as THREE from 'three';

export default function CameraRig() {
  const scroll = useScroll();
  const { scene } = useThree();
  
  // Reusable vectors for calculating dynamic world positions
  const earthPos = new THREE.Vector3(0, 0, 0);
  const moonWorldPos = new THREE.Vector3();
  const saturnWorldPos = new THREE.Vector3();
  const marsWorldPos = new THREE.Vector3();
  const sunPos = new THREE.Vector3(40, 0, 100);

  // Dynamic Camera positioning vectors
  const targetPos = new THREE.Vector3();
  const targetLook = new THREE.Vector3();
  
  useFrame((state) => {
    // scroll.offset goes from 0 at the top of the page, to 1 at the bottom
    const offset = scroll.offset;
    
    // Retrieve dynamic planet objects by name!
    const moonObj = scene.getObjectByName('Moon');
    const saturnObj = scene.getObjectByName('Planet-Saturn');
    const marsObj = scene.getObjectByName('Planet-Mars');
    
    if (moonObj) moonObj.getWorldPosition(moonWorldPos);
    if (saturnObj) saturnObj.getWorldPosition(saturnWorldPos);
    if (marsObj) marsObj.getWorldPosition(marsWorldPos);
    
    // Dynamic Waypoints for the camera's position in space based on planet world coordinates
    const startPos = new THREE.Vector3(0, 0, 3.5);             // Home: looking at Earth
    
    // About: move extremely close to the Moon, looking directly at its surface
    const midPos1 = moonWorldPos.clone().add(new THREE.Vector3(0, 0.1, 0.8)); 
    
    // Skills: Zooming in on Saturn and its majestic rings!
    // Saturn is large (radius ~9.5), so we position the camera slightly further back
    const midPos2 = saturnWorldPos.clone().add(new THREE.Vector3(0, 5, 25));              
    
    // Projects: Zooming way in on Mars so it fills the view!
    const midPos3 = marsWorldPos.clone().add(new THREE.Vector3(0, 0.2, 1.8));  
    
    // Contact: Extreme zoom out to see the entire solar system curve
    const endPos = new THREE.Vector3(-100, 200, -200);          
    
    // Waypoints for where the camera is LOOKING
    const lookStart = earthPos.clone();              // Look at Earth
    const lookMid1 = moonWorldPos.clone();           // Look at Moon 
    const lookMid2 = saturnWorldPos.clone();         // Look at Saturn
    const lookMid3 = marsWorldPos.clone();           // Look at Mars
    const lookEnd = sunPos.clone();                  // Look straight down at the Sun/Solar system center
    
    // Calculate the camera's current trajectory path based on scroll percentage (5 pages = 4 phases of 0.25)
    if (offset < 0.25) {
      const t = offset / 0.25;
      targetPos.lerpVectors(startPos, midPos1, t);
      targetLook.lerpVectors(lookStart, lookMid1, t); 
    } else if (offset < 0.50) {
      const t = (offset - 0.25) / 0.25;
      targetPos.lerpVectors(midPos1, midPos2, t);
      // Pan look from Moon toward Saturn
      targetLook.lerpVectors(lookMid1, lookMid2, t); 
    } else if (offset < 0.75) {
      const t = (offset - 0.50) / 0.25;
      targetPos.lerpVectors(midPos2, midPos3, t);
      // Pan look from Saturn to Mars
      targetLook.lerpVectors(lookMid2, lookMid3, t);
    } else {
      const t = (offset - 0.75) / 0.25;
      targetPos.lerpVectors(midPos3, endPos, t);
      // Pan to look back at the entire solar system center
      targetLook.lerpVectors(lookMid3, lookEnd, t);
    }
    
    // Smoothly animate the camera to the target position
    state.camera.position.lerp(targetPos, 0.05);
    state.camera.lookAt(targetLook);
  });
  
  return null;
}
