
import { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment, PerspectiveCamera } from '@react-three/drei';
import { VRButton, XR, Controllers, Hands } from '@react-three/xr';
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
    const radius = 4; // Reduced radius for better VR view
    const rows = Math.ceil(todos.length / 4);
    
    return todos.map((todo, i) => {
      const row = Math.floor(i / 4);
      const col = i % 4;
      const angle = (col / 4) * Math.PI * 2;
      
      const x = Math.sin(angle) * radius;
      const y = row * 1.5 - rows + 2; // Adjusted vertical spacing
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
    <>
      <VRButton />
      <Canvas shadows className="bg-vr-bg">
        <XR>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={70} />
          
          <fog attach="fog" args={['#0f0e17', 5, 20]} />
          
          {/* Enhanced Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight 
            position={[5, 5, 5]} 
            intensity={0.8} 
            castShadow 
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[-5, -5, -5]} color="#e53170" intensity={0.5} />
          <pointLight position={[5, 5, 5]} color="#7f5af0" intensity={0.5} />
          
          {/* Environment */}
          <Suspense fallback={null}>
            <Environment preset="night" />
            <Stars radius={50} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
            <ParticleField />
          </Suspense>
          
          {/* Todo Cards */}
          {!isLoading && layoutTodos()}
          
          {/* Add Todo Form */}
          <AddTodoForm position={[0, 1, -2]} />
          
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
            minDistance={3}
            maxDistance={10}
          />
        </XR>
      </Canvas>
    </>
  );
};

export default VRScene;
