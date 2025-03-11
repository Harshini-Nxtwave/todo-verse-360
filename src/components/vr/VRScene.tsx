
import { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment, PerspectiveCamera } from '@react-three/drei';
import { useTodoStore } from '@/store/todoStore';
import TodoCard from './TodoCard';
import AddTodoForm from './AddTodoForm';
import ParticleField from './ParticleField';

const VRScene: React.FC = () => {
  const { todos, fetchInitialTodos, isLoading } = useTodoStore();

  useEffect(() => {
    fetchInitialTodos();
  }, [fetchInitialTodos]);

  const layoutTodos = () => {
    const radius = 8;
    const rows = Math.ceil(todos.length / 4);
    
    return todos.map((todo, i) => {
      const row = Math.floor(i / 4);
      const col = i % 4;
      const angle = (col / 4) * Math.PI * 2;
      
      const x = Math.sin(angle) * radius;
      const y = row * 2 - rows + 3; // Vertical positioning
      const z = Math.cos(angle) * radius;
      
      return (
        <TodoCard
          key={todo.id}
          todo={todo}
          position={[x, y, z]}
          index={i}
        />
      );
    });
  };

  return (
    <Canvas shadows className="bg-vr-bg">
      <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={60} />
      
      <fog attach="fog" args={['#0f0e17', 10, 40]} />
      
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1} 
        castShadow 
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-10, -10, -10]} color="#e53170" intensity={1} />
      <pointLight position={[10, 10, 10]} color="#7f5af0" intensity={1} />
      
      {/* Environment */}
      <Suspense fallback={null}>
        <Environment preset="night" />
      </Suspense>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <ParticleField />
      
      {/* Todo Cards */}
      {!isLoading && layoutTodos()}
      
      {/* Add Todo Form */}
      <AddTodoForm position={[0, 0, 0]} />
      
      {/* Controls */}
      <OrbitControls 
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        zoomSpeed={0.6}
        panSpeed={0.5}
        rotateSpeed={0.5}
        minDistance={5}
        maxDistance={20}
      />
    </Canvas>
  );
};

export default VRScene;
