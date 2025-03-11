
import { useState, useRef } from 'react';
import { Text, Box } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
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
  const [active, setActive] = useState(false);
  const originalPosition = useRef(new Vector3(...position));
  
  // Animate the card
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
    const floatY = Math.sin(time * 0.5 + index * 0.5) * 0.1;
    ref.current.position.y = originalPosition.current.y + floatY;
    
    // Slight rotation
    ref.current.rotation.z = Math.sin(time * 0.3 + index) * 0.05;
  });

  const handleComplete = (e: any) => {
    e.stopPropagation();
    toggleTodo(todo.id);
  };

  const handleDelete = (e: any) => {
    e.stopPropagation();
    deleteTodo(todo.id);
  };

  return (
    <group 
      ref={ref}
      position={position}
      onClick={() => setActive(!active)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Card */}
      <Box 
        args={[3, 1.5, 0.1]} 
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
      
      {/* Todo Text */}
      <Text
        position={[0, 0.2, 0.06]}
        fontSize={0.2}
        maxWidth={2.5}
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
      
      {/* Complete Button */}
      <group position={[-1, -0.4, 0.06]} onClick={handleComplete}>
        <Box args={[0.8, 0.3, 0.05]}>
          <meshStandardMaterial 
            color={todo.completed ? "#1a7f55" : "#5a3dbc"} 
            emissive={todo.completed ? "#1a7f55" : "#5a3dbc"}
            emissiveIntensity={hovered ? 0.5 : 0.2}
          />
        </Box>
        <Text
          position={[0, 0, 0.06]}
          fontSize={0.15}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {todo.completed ? "Completed" : "Complete"}
        </Text>
      </group>
      
      {/* Delete Button */}
      <group position={[1, -0.4, 0.06]} onClick={handleDelete}>
        <Box args={[0.8, 0.3, 0.05]}>
          <meshStandardMaterial 
            color="#e53170" 
            emissive="#e53170"
            emissiveIntensity={hovered ? 0.5 : 0.2}
          />
        </Box>
        <Text
          position={[0, 0, 0.06]}
          fontSize={0.15}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          Delete
        </Text>
      </group>
    </group>
  );
};

export default TodoCard;
