
import { useState, useRef, useEffect } from 'react';
import { Text, Box } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Interactive } from '@react-three/xr';
import { Vector3 } from 'three';
import { useTodoStore } from '@/store/todoStore';
import * as THREE from 'three';
import { Todo } from '@/types/todo';

interface TodoCardProps {
  todo: Todo;
  position: [number, number, number];
  rotation?: [number, number, number];
  index: number;
  isNew?: boolean;
  onTodoAction?: () => void;
}

const TodoCard: React.FC<TodoCardProps> = ({ 
  todo, 
  position, 
  rotation = [0, 0, 0], 
  index, 
  isNew = false,
  onTodoAction
}) => {
  const { toggleTodo, deleteTodo } = useTodoStore();
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const originalPosition = useRef(new Vector3(...position));
  const [animateHighlight, setAnimateHighlight] = useState(isNew);
  
  // Highlight new todos
  useEffect(() => {
    if (isNew) {
      setAnimateHighlight(true);
      const timer = setTimeout(() => {
        setAnimateHighlight(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isNew]);
  
  useFrame((state, delta) => {
    if (!ref.current) return;
    
    // Hover effect
    if (hovered) {
      ref.current.scale.lerp(new Vector3(1.1, 1.1, 1.1), 0.1);
    } else {
      ref.current.scale.lerp(new Vector3(1, 1, 1), 0.1);
    }
    
    // New todo highlight animation
    if (animateHighlight) {
      const pulseIntensity = (Math.sin(state.clock.getElapsedTime() * 5) + 1) / 2;
      if (ref.current.children[0] instanceof THREE.Mesh) {
        const material = ref.current.children[0].material as THREE.MeshStandardMaterial;
        material.emissiveIntensity = 0.2 + pulseIntensity * 0.8;
      }
    }
    
    // Subtle floating animation
    const time = state.clock.getElapsedTime();
    const floatY = Math.sin(time * 0.5 + index * 0.5) * 0.03;
    ref.current.position.y = originalPosition.current.y + floatY;
  });

  const handleComplete = () => {
    toggleTodo(todo.id);
    if (onTodoAction) onTodoAction();
  };

  const handleDelete = () => {
    deleteTodo(todo.id);
    if (onTodoAction) onTodoAction();
  };

  // Color based on completion status
  const cardColor = todo.completed ? "#2cb67d" : "#33C3F0";
  const statusText = todo.completed ? "Complete" : "In Progress";

  return (
    <group 
      ref={ref}
      position={position}
      rotation={rotation}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <Interactive onSelect={handleComplete}>
        <Box 
          args={[1.6, 0.8, 0.05]} 
          castShadow
        >
          <meshStandardMaterial 
            color={cardColor}
            metalness={0.5}
            roughness={0.2}
            emissive={cardColor}
            emissiveIntensity={hovered || animateHighlight ? 0.6 : 0.2}
            transparent
            opacity={0.9}
          />
        </Box>
      </Interactive>
      
      {/* Status Indicator */}
      <Box 
        args={[0.3, 0.3, 0.02]}
        position={[-0.6, 0.2, 0.06]}
      >
        <meshStandardMaterial 
          color={todo.completed ? "#2cb67d" : "#403E43"}
          emissive={todo.completed ? "#2cb67d" : "#33C3F0"}
          emissiveIntensity={0.5}
        />
      </Box>
      
      {/* Todo Text */}
      <Text
        position={[0, 0.05, 0.06]}
        fontSize={0.12}
        maxWidth={1.4}
        lineHeight={1.2}
        textAlign="left"
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#000000"
      >
        {todo.title}
      </Text>
      
      {/* Status Text */}
      <Text
        position={[-0.1, -0.25, 0.06]}
        fontSize={0.08}
        color="#FFFFFF"
        anchorX="left"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#000000"
      >
        Status: {statusText}
      </Text>
      
      {/* Delete Button */}
      <Interactive onSelect={handleDelete}>
        <group position={[0.55, -0.25, 0.06]}>
          <Box args={[0.3, 0.15, 0.03]}>
            <meshStandardMaterial 
              color="#0FA0CE" 
              emissive="#0FA0CE"
              emissiveIntensity={hovered ? 0.5 : 0.2}
            />
          </Box>
          <Text
            position={[0, 0, 0.03]}
            fontSize={0.06}
            color="#FFFFFF"
            anchorX="center"
            anchorY="middle"
          >
            Delete
          </Text>
        </group>
      </Interactive>
    </group>
  );
};

export default TodoCard;
