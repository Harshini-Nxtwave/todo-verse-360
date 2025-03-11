
import { useState, useRef } from 'react';
import { Text, Box, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Interactive } from '@react-three/xr';
import { Vector3 } from 'three';
import { useTodoStore } from '@/store/todoStore';
import * as THREE from 'three';
import { Todo } from '@/types/todo';

interface TodoCardProps {
  todo: Todo;
  position: [number, number, number];
  index: number;
}

const TodoCard: React.FC<TodoCardProps> = ({ todo, position, index }) => {
  const { toggleTodo, deleteTodo } = useTodoStore();
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const originalPosition = useRef(new Vector3(...position));
  
  useFrame((state, delta) => {
    if (!ref.current) return;
    
    // Hover effect
    if (hovered) {
      ref.current.scale.lerp(new Vector3(1.1, 1.1, 1.1), 0.1);
    } else {
      ref.current.scale.lerp(new Vector3(1, 1, 1), 0.1);
    }
    
    // Floating animation
    const time = state.clock.getElapsedTime();
    const floatY = Math.sin(time * 0.5 + index * 0.5) * 0.05;
    ref.current.position.y = originalPosition.current.y + floatY;
  });

  const handleComplete = () => {
    toggleTodo(todo.id);
  };

  const handleDelete = () => {
    deleteTodo(todo.id);
  };

  return (
    <group 
      ref={ref}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <Interactive onSelect={handleComplete}>
        <Box 
          args={[2, 1, 0.05]} 
          castShadow
        >
          <meshStandardMaterial 
            color={todo.completed ? "#2cb67d" : "#7f5af0"} 
            metalness={0.5}
            roughness={0.2}
            emissive={todo.completed ? "#2cb67d" : "#7f5af0"}
            emissiveIntensity={hovered ? 0.5 : 0.2}
          />
        </Box>
      </Interactive>
      
      {/* Todo Text */}
      <Text
        position={[0, 0.1, 0.06]}
        fontSize={0.15}
        maxWidth={1.8}
        lineHeight={1.2}
        textAlign="center"
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {todo.title}
      </Text>
      
      {/* Delete Button */}
      <Interactive onSelect={handleDelete}>
        <group position={[0.7, -0.3, 0.06]}>
          <Box args={[0.4, 0.2, 0.05]}>
            <meshStandardMaterial 
              color="#e53170" 
              emissive="#e53170"
              emissiveIntensity={hovered ? 0.5 : 0.2}
            />
          </Box>
          <Text
            position={[0, 0, 0.06]}
            fontSize={0.08}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            Delete
          </Text>
        </group>
      </Interactive>
      
      {/* Status Indicator */}
      <Text
        position={[-0.7, -0.3, 0.06]}
        fontSize={0.08}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#000000"
      >
        {todo.completed ? "Done" : "Todo"}
      </Text>
    </group>
  );
};

export default TodoCard;
