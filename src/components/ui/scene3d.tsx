
import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, useTexture, Environment } from "@react-three/drei";
import { useInView } from "@/lib/animations";
import * as THREE from "three";

// Animated floating object with scroll responsiveness
const FloatingObject = ({ 
  position, 
  rotation, 
  scale, 
  color, 
  scrollY = 0 
}: { 
  position: [number, number, number], 
  rotation?: [number, number, number],
  scale?: number,
  color: string,
  scrollY?: number
}) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Gentle floating animation
    meshRef.current.position.y += Math.sin(state.clock.elapsedTime) * 0.002;
    
    // Respond to scroll
    const scrollFactor = scrollY * 0.001;
    meshRef.current.rotation.x = 0.003 * state.clock.elapsedTime + scrollFactor;
    meshRef.current.rotation.y = 0.002 * state.clock.elapsedTime + scrollFactor * 0.5;
    
    // Subtle position shift based on scroll
    meshRef.current.position.z = position[2] + scrollFactor * 2;
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
      />
    </mesh>
  );
};

// Abstract plane with displacement that responds to scrolling
const WavyPlane = ({ scrollY = 0 }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    const scrollFactor = scrollY * 0.0005;
    
    // Update vertices to create a wave effect
    const geometry = meshRef.current.geometry as THREE.PlaneGeometry;
    const position = geometry.attributes.position;
    
    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i);
      const y = position.getY(i);
      
      // Create gentle waves that intensify with scrolling
      const z = 0.2 * Math.sin(x * 2 + time * 0.7 + scrollFactor) * 
               Math.cos(y * 2 + time * 0.6 + scrollFactor);
      
      position.setZ(i, z);
    }
    
    position.needsUpdate = true;
  });
  
  return (
    <mesh 
      ref={meshRef} 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, -3, 0]} 
      scale={10}
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
  const { ref, isInView } = useInView({ once: true });
  
  return (
    <div 
      ref={ref} 
      className={`${className} ${isInView ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000`}
    >
      <Canvas className="w-full h-full outline-none" dpr={[1, 2]} shadows>
        <PerspectiveCamera 
          makeDefault 
          position={[0, 0, 10 + scrollY * 0.02]} 
          fov={50 - scrollY * 0.02} 
        />
        <fog attach="fog" args={['#ffffff', 10, 25]} />
        
        <ambientLight intensity={0.8} />
        <directionalLight 
          position={[5, 8, 5]} 
          intensity={1} 
          castShadow 
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        
        <group position={[0, 0, 0]} rotation={[0, scrollY * 0.001, 0]}>
          <FloatingObject position={[-3, 1, 0]} color="hsl(var(--primary))" scrollY={scrollY} />
          <FloatingObject position={[3, -1, -2]} scale={1.5} color="#2dd4bf" rotation={[0.5, 0.2, 0.1]} scrollY={scrollY} />
          <FloatingObject position={[0, 2, -4]} scale={2} color="#fcd34d" rotation={[0.2, 0.4, 0.1]} scrollY={scrollY} />
          <FloatingObject position={[-2, -2, -1]} scale={0.8} color="#a78bfa" scrollY={scrollY} />
          <WavyPlane scrollY={scrollY} />
        </group>
        
        <Environment preset="sunset" />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          autoRotate 
          autoRotateSpeed={0.5 + scrollY * 0.001}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
    </div>
  );
};
