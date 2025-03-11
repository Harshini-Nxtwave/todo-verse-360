import { Suspense, useEffect, useState, useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment, 
  PerspectiveCamera, 
  useTexture,
  Box,
  Plane,
  Text
} from '@react-three/drei';
import { VRButton, XR, Controllers, Hands } from '@react-three/xr';
import { useTodoStore } from '@/store/todoStore';
import TodoCard from './TodoCard';
import AddTodoForm from './AddTodoForm';
import * as THREE from 'three';
import { Vector3 } from 'three';

// Lab Room Component
const LabRoom = () => {
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
      
      {/* Walls with softer colors */}
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
        <meshStandardMaterial color="#D3E4FD" /> {/* Soft blue */}
      </Plane>
      
      <Plane 
        args={[20, 7]} 
        position={[-10, 1.5, 0]} 
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow
      >
        <meshStandardMaterial color="#D3E4FD" /> {/* Soft blue */}
      </Plane>
      
      {/* Lab desk - more professional looking */}
      <Box 
        args={[6, 0.1, 2.5]} 
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
      {[[-2.8, -1, -5], [2.8, -1, -5], [-2.8, -1, -3], [2.8, -1, -3]].map((pos, i) => (
        <Box 
          key={i}
          args={[0.1, 2, 0.1]} 
          position={pos as [number, number, number]}
          castShadow
        >
          <meshStandardMaterial color="#403E43" metalness={0.8} roughness={0.2} />
        </Box>
      ))}
      
      {/* Lab Monitor */}
      <Box 
        args={[2, 1.2, 0.1]} 
        position={[0, 1.2, -4]}
        rotation={[0, 0, 0]}
        castShadow
      >
        <meshStandardMaterial 
          color="#0F0E17" 
          emissive="#1EAEDB"
          emissiveIntensity={0.1}
          roughness={0.2} 
          metalness={0.8}
        />
      </Box>
      
      {/* Add a Todo Dashboard label */}
      <Text
        position={[0, 1.5, -4]}
        fontSize={0.2}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#000000"
      >
        Todo Dashboard
      </Text>
      
      {/* Monitor Stand */}
      <Box 
        args={[0.2, 0.5, 0.2]} 
        position={[0, 0.45, -4]}
        castShadow
      >
        <meshStandardMaterial color="#403E43" />
      </Box>
      
      {/* Additional lab equipment - shelves */}
      <Box 
        args={[2, 0.1, 1]} 
        position={[3, 1.5, -9]}
        castShadow
      >
        <meshStandardMaterial color="#8A898C" />
      </Box>
      
      <Box 
        args={[2, 0.1, 1]} 
        position={[-3, 1.5, -9]}
        castShadow
      >
        <meshStandardMaterial color="#8A898C" />
      </Box>
      
      {/* Lab decoration items */}
      <Box 
        args={[0.3, 0.3, 0.3]} 
        position={[3, 1.75, -9]}
        castShadow
      >
        <meshStandardMaterial color="#FDE1D3" /> {/* Soft Peach */}
      </Box>
      
      <Box 
        args={[0.5, 0.2, 0.2]} 
        position={[-3, 1.75, -9]}
        castShadow
      >
        <meshStandardMaterial color="#E5DEFF" /> {/* Soft Purple */}
      </Box>
    </group>
  );
};

const VRScene: React.FC = () => {
  const { todos, fetchInitialTodos, isLoading } = useTodoStore();
  const [todoAdded, setTodoAdded] = useState(false);
  // Move add button to a more visible position
  const addButtonPos = useMemo(() => new Vector3(0, 1.6, -3), []);
  const sceneRef = useRef<THREE.Group>(null);

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

  // Use memoization to prevent unnecessary recalculations
  const todoCards = useMemo(() => {
    if (isLoading) return null;
    
    // Separate active and completed todos
    const activeTodos = todos.filter(todo => !todo.completed);
    const completedTodos = todos.filter(todo => todo.completed);
    
    // Create an organized grid layout
    const gridSpacing = 1.8; // Spacing between cards
    const cardsPerRow = 3; // Number of cards per row
    
    const renderTodoSection = (sectionTodos: Todo[], startPosition: [number, number, number], isCompletedSection: boolean) => {
      return sectionTodos.map((todo, i) => {
        const row = Math.floor(i / cardsPerRow);
        const col = i % cardsPerRow;
        
        const x = startPosition[0] + (col - 1) * gridSpacing;
        const y = startPosition[1];
        const z = startPosition[2] + row * gridSpacing;
        
        return (
          <TodoCard
            key={todo.id}
            todo={todo}
            position={[x, y, z]}
            rotation={[0, 0, 0]}
            index={i}
            isNew={todoAdded && !isCompletedSection && i === 0}
            onTodoAction={() => setTodoAdded(true)}
          />
        );
      });
    };
    
    // Section headers
    const renderSectionHeader = (text: string, position: [number, number, number]) => {
      return (
        <Text
          position={position}
          fontSize={0.25}
          color="#FFFFFF"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="#000000"
        >
          {text}
        </Text>
      );
    };
    
    return (
      <>
        {/* Active Todos Section - Moved closer to the player */}
        {renderSectionHeader("Active Todos", [0, 2.2, -4])}
        {renderTodoSection(activeTodos.slice(0, 9), [0, 1.5, -3.5], false)}
        
        {/* Completed Todos Section - Moved closer but behind active todos */}
        {renderSectionHeader("Completed Todos", [0, 0.7, -1])}
        {renderTodoSection(completedTodos.slice(0, 6), [0, 0, -0.5], true)}
      </>
    );
  }, [todos, isLoading, todoAdded]);

  return (
    <>
      <VRButton />
      <Canvas 
        shadows 
        className="bg-vr-bg" 
        frameloop="demand"
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          stencil: false,
          depth: true
        }}
        dpr={[1, 1.5]}
        camera={{ position: [0, 2, 2], fov: 75 }} // Adjusted camera position
      >
        <XR>
          <ambientLight intensity={0.5} />
          <directionalLight 
            position={[5, 5, 5]} 
            intensity={0.8} 
            castShadow 
            shadow-mapSize={1024}
          />
          
          <Suspense fallback={null}>
            <Environment preset="city" />
            
            <group ref={sceneRef}>
              <LabRoom />
              {todoCards}
              
              {/* Add Todo Form - moved to a more visible position */}
              <AddTodoForm 
                position={[0, 1.6, -3]} 
                onTodoAdded={() => setTodoAdded(true)}
              />
            </group>
          </Suspense>
          
          <Controllers />
          <Hands />
          
          <OrbitControls 
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            zoomSpeed={0.6}
            panSpeed={0.5}
            rotateSpeed={0.5}
            minDistance={2}
            maxDistance={12}
            target={[0, 1.5, -2]} // Updated to look at the todos
            enableDamping
            dampingFactor={0.1}
          />
        </XR>
      </Canvas>
    </>
  );
};

export default VRScene;
