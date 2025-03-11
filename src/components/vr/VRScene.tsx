
import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment, 
  PerspectiveCamera, 
  useTexture,
  Box,
  Plane
} from '@react-three/drei';
import { VRButton, XR, Controllers, Hands } from '@react-three/xr';
import { useTodoStore } from '@/store/todoStore';
import TodoCard from './TodoCard';
import AddTodoForm from './AddTodoForm';
import * as THREE from 'three';

// Lab Room Component
const LabRoom = () => {
  // Create a simple lab environment
  return (
    <group>
      {/* Floor */}
      <Plane 
        args={[20, 20]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -2, 0]}
        receiveShadow
      >
        <meshStandardMaterial 
          color="#F1F1F1" 
          roughness={0.8} 
          metalness={0.2}
        />
      </Plane>
      
      {/* Ceiling */}
      <Plane 
        args={[20, 20]} 
        rotation={[Math.PI / 2, 0, 0]} 
        position={[0, 5, 0]}
      >
        <meshStandardMaterial color="#FFFFFF" />
      </Plane>
      
      {/* Walls */}
      <Plane 
        args={[20, 7]} 
        position={[0, 1.5, -10]}
        receiveShadow
      >
        <meshStandardMaterial color="#F6F6F7" />
      </Plane>
      
      <Plane 
        args={[20, 7]} 
        position={[0, 1.5, 10]} 
        rotation={[0, Math.PI, 0]}
        receiveShadow
      >
        <meshStandardMaterial color="#F6F6F7" />
      </Plane>
      
      <Plane 
        args={[20, 7]} 
        position={[10, 1.5, 0]} 
        rotation={[0, -Math.PI / 2, 0]}
        receiveShadow
      >
        <meshStandardMaterial color="#F6F6F7" />
      </Plane>
      
      <Plane 
        args={[20, 7]} 
        position={[-10, 1.5, 0]} 
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow
      >
        <meshStandardMaterial color="#F6F6F7" />
      </Plane>
      
      {/* Lab Desk */}
      <Box 
        args={[6, 0.1, 2]} 
        position={[0, 0, -4]}
        receiveShadow
        castShadow
      >
        <meshStandardMaterial 
          color="#8A898C" 
          roughness={0.2} 
          metalness={0.8}
        />
      </Box>
      
      {/* Desk Legs */}
      {[[-2.8, -1, -4.8], [2.8, -1, -4.8], [-2.8, -1, -3.2], [2.8, -1, -3.2]].map((pos, i) => (
        <Box 
          key={i}
          args={[0.1, 2, 0.1]} 
          position={pos}
          castShadow
        >
          <meshStandardMaterial color="#403E43" metalness={0.8} roughness={0.2} />
        </Box>
      ))}
      
      {/* Lab Equipment - Monitor-like display */}
      <Box 
        args={[2, 1.5, 0.1]} 
        position={[0, 1.4, -4]}
        rotation={[0, 0, 0]}
        castShadow
      >
        <meshStandardMaterial 
          color="#0F0E17" 
          emissive="#1EAEDB"
          emissiveIntensity={0.2}
          roughness={0.2} 
          metalness={0.8}
        />
      </Box>
      
      {/* Monitor Stand */}
      <Box 
        args={[0.2, 0.5, 0.2]} 
        position={[0, 0.45, -4]}
        castShadow
      >
        <meshStandardMaterial color="#403E43" />
      </Box>
    </group>
  );
};

const VRScene: React.FC = () => {
  const { todos, fetchInitialTodos, isLoading } = useTodoStore();
  const [todoAdded, setTodoAdded] = useState(false);

  useEffect(() => {
    fetchInitialTodos();
  }, [fetchInitialTodos]);

  // Reset todoAdded state after 2 seconds
  useEffect(() => {
    if (todoAdded) {
      const timer = setTimeout(() => {
        setTodoAdded(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [todoAdded]);

  const layoutTodos = () => {
    // Create a curved wall layout to display todos
    const radius = 3.5;
    const angleStep = Math.PI / (Math.max(6, todos.length));
    const startAngle = -Math.PI / 2 - (angleStep * (Math.min(todos.length, 12) - 1)) / 2;
    
    return todos.slice(0, 12).map((todo, i) => {
      const angle = startAngle + i * angleStep;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      // Calculate height based on completion status
      const y = todo.completed ? 0.5 : 1.5;
      
      return (
        <TodoCard
          key={todo.id}
          todo={todo}
          position={[x, y, z]}
          rotation={[0, Math.PI - angle, 0]}
          index={i}
          isNew={todoAdded && i === 0}
          onTodoAction={() => setTodoAdded(true)}
        />
      );
    });
  };

  return (
    <>
      <VRButton />
      <Canvas shadows className="bg-vr-bg" frameloop="demand">
        <XR>
          <PerspectiveCamera makeDefault position={[0, 1.6, 2.5]} fov={60} />
          
          {/* Enhanced Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight 
            position={[5, 5, 5]} 
            intensity={0.6} 
            castShadow 
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[0, 4, 0]} color="#FFFFFF" intensity={0.6} castShadow />
          
          {/* Lab Room Environment */}
          <Suspense fallback={null}>
            <Environment preset="warehouse" />
            <LabRoom />
          </Suspense>
          
          {/* Todo Cards */}
          {!isLoading && layoutTodos()}
          
          {/* Add Todo Form */}
          <AddTodoForm 
            position={[0, 1.6, -2]} 
            onTodoAdded={() => setTodoAdded(true)}
          />
          
          {/* VR Controllers */}
          <Controllers />
          <Hands />
          
          {/* Controls for non-VR mode */}
          <OrbitControls 
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            zoomSpeed={0.6}
            panSpeed={0.5}
            rotateSpeed={0.5}
            minDistance={1}
            maxDistance={10}
            target={[0, 1, 0]}
          />
        </XR>
      </Canvas>
    </>
  );
};

export default VRScene;
