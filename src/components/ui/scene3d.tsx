
import React, { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, useTexture, Environment, Float } from "@react-three/drei";
import { useInView } from "@/lib/animations";
import * as THREE from "three";

// Animated floating object with scroll responsiveness
const FloatingObject = ({ 
  position, 
  rotation, 
  scale, 
  color, 
  scrollY = 0,
  speed = 1
}: { 
  position: [number, number, number], 
  rotation?: [number, number, number],
  scale?: number,
  color: string,
  scrollY?: number,
  speed?: number
}) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Scroll-based position and rotation changes
    const scrollFactor = scrollY * 0.001;
    
    // Gentle floating animation
    meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.2;
    
    // Rotation affected by scroll
    meshRef.current.rotation.x = (rotation?.[0] || 0) + state.clock.elapsedTime * 0.2 * speed + scrollFactor;
    meshRef.current.rotation.y = (rotation?.[1] || 0) + state.clock.elapsedTime * 0.3 * speed + scrollFactor * 0.7;
    
    // Scale changes with scroll
    const baseScale = scale || 1;
    meshRef.current.scale.setScalar(baseScale + scrollFactor * 0.2);
    
    // Move along z-axis based on scroll
    meshRef.current.position.z = position[2] + scrollFactor * 3;
  });
  
  return (
    <mesh 
      ref={meshRef} 
      position={position}
      rotation={rotation || [0, 0, 0]}
      scale={scale || 1}
    >
      <icosahedronGeometry args={[1, 2]} />
      <meshStandardMaterial 
        color={color} 
        roughness={0.4} 
        metalness={0.7}
        envMapIntensity={1.5}
      />
    </mesh>
  );
};

// Travel-themed objects
const Airplane = ({ position, scrollY = 0 }: { position: [number, number, number], scrollY?: number }) => {
  const meshRef = useRef<THREE.Group>(null!);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    const scrollFactor = scrollY * 0.001;
    
    // Flying motion
    meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.7) * 0.2;
    meshRef.current.position.x = position[0] + Math.cos(state.clock.elapsedTime * 0.5) * 0.5;
    
    // Bank slightly based on direction
    meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    
    // Respond to scroll
    meshRef.current.rotation.y = Math.PI * 0.25 + scrollFactor;
    meshRef.current.position.z = position[2] - scrollFactor * 5;
  });
  
  return (
    <group ref={meshRef} position={position} rotation={[0, Math.PI * 0.25, 0]} visible={true}>
      {/* Simplified airplane shape */}
      <mesh>
        <cylinderGeometry args={[0.2, 0.5, 2, 8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 0, -1]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 1.5, 8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 0.2, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.3, 1, 8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
};

// Map or globe element
const Globe = ({ position, scrollY = 0 }: { position: [number, number, number], scrollY?: number }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    const scrollFactor = scrollY * 0.001;
    
    // Rotate the globe
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.1 + scrollFactor * 2;
    
    // Scale based on scroll
    const scale = 1 + scrollFactor * 0.3;
    meshRef.current.scale.setScalar(scale);
  });
  
  return (
    <mesh ref={meshRef} position={position} visible={true}>
      <sphereGeometry args={[1.5, 32, 32]} />
      <meshStandardMaterial 
        color="#1e88e5" 
        roughness={0.6} 
        metalness={0.2}
        emissive="#0d47a1"
        emissiveIntensity={0.2}
      />
      {/* Continent-like patches */}
      <mesh position={[0.8, 0.5, 1.2]} scale={0.4}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial color="#4caf50" roughness={0.8} />
      </mesh>
      <mesh position={[-0.7, 0.8, 1.1]} scale={0.3}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial color="#4caf50" roughness={0.8} />
      </mesh>
      <mesh position={[0, -1.2, 0.9]} scale={0.5}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial color="#4caf50" roughness={0.8} />
      </mesh>
    </mesh>
  );
};

// Abstract wavy plane that responds to scrolling
const WavyPlane = ({ scrollY = 0 }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    const scrollFactor = scrollY * 0.001;
    
    // Update vertices to create a wave effect that intensifies with scrolling
    const geometry = meshRef.current.geometry as THREE.PlaneGeometry;
    const position = geometry.attributes.position;
    
    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i);
      const y = position.getY(i);
      
      // Create waves that respond to scroll
      const intensity = 0.2 + scrollFactor * 0.5;
      const frequency = 1 + scrollFactor * 2;
      const z = intensity * Math.sin(x * frequency + time * 0.7) * 
               Math.cos(y * frequency + time * 0.6);
      
      position.setZ(i, z);
    }
    
    position.needsUpdate = true;
    
    // Also change color based on scroll
    const material = meshRef.current.material as THREE.MeshStandardMaterial;
    material.opacity = 0.2 + scrollFactor * 0.5;
  });
  
  return (
    <mesh 
      ref={meshRef} 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, -2, 0]} 
      scale={10}
      visible={true}
    >
      <planeGeometry args={[10, 10, 32, 32]} />
      <meshStandardMaterial 
        color="hsl(var(--primary))" 
        transparent 
        opacity={0.2} 
        wireframe 
        side={THREE.DoubleSide} 
      />
    </mesh>
  );
};

// Combined 3D scene with scroll responsiveness
export const Scene3D = ({ className = "", scrollY = 0 }: { className?: string, scrollY?: number }) => {
  const { ref, isInView } = useInView({ once: false });
  
  console.log("Rendering Scene3D, scrollY:", scrollY);
  
  return (
    <div 
      ref={ref} 
      className={`${className} ${isInView ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000`}
      style={{ minHeight: "300px" }} // Ensure minimum height even if container is collapsed
    >
      <Canvas className="w-full h-full outline-none" dpr={[1, 2]}>
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} castShadow />
        
        <PerspectiveCamera 
          makeDefault 
          position={[0, 0, 10]} 
          fov={50} 
        />
        
        <group position={[0, 0, 0]} rotation={[0, scrollY * 0.002, 0]}>
          {/* Primary objects */}
          <Airplane position={[3, 1, -2]} scrollY={scrollY} />
          <Globe position={[0, 0, -5]} scrollY={scrollY} />
          
          {/* Decorative objects */}
          <FloatingObject position={[-3, 1, 0]} color="hsl(var(--primary))" scrollY={scrollY} speed={1.2} />
          <FloatingObject position={[3, -1, -2]} scale={1.5} color="#2dd4bf" rotation={[0.5, 0.2, 0.1]} scrollY={scrollY} speed={0.8} />
          <FloatingObject position={[-2, -2, -1]} scale={0.8} color="#a78bfa" scrollY={scrollY} speed={1.5} />
          
          <WavyPlane scrollY={scrollY} />
        </group>
        
        <Environment preset="sunset" />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          autoRotate 
          autoRotateSpeed={0.5}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
};
