import { useState, useRef, useEffect, useMemo } from 'react';
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
  const scaleTarget = useRef(new Vector3(1, 1, 1));
  const currentScale = useRef(new Vector3(1, 1, 1));
  
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
  
  // Optimized frame update - use lerping for smoother transitions
  useFrame((state, delta) => {
    if (!ref.current) return;
    
    // Set scale target based on hover state
    if (hovered) {
      scaleTarget.current.set(1.1, 1.1, 1.1);
    } else {
      scaleTarget.current.set(1, 1, 1);
    }
    
    // Smooth scale transition
    currentScale.current.lerp(scaleTarget.current, 0.1);
    ref.current.scale.copy(currentScale.current);
    
    // New todo highlight animation - optimized to reduce calculations
    if (animateHighlight && ref.current.children[0] instanceof THREE.Mesh) {
      const material = ref.current.children[0].material as THREE.MeshStandardMaterial;
      const pulseIntensity = (Math.sin(state.clock.getElapsedTime() * 3) + 1) / 2;
      material.emissiveIntensity = 0.2 + pulseIntensity * 0.6;
    }
    
    // Subtle floating animation - optimized with lower frequency
    const time = state.clock.getElapsedTime();
    const floatY = Math.sin(time * 0.3 + index * 0.5) * 0.03;
    
    // Update position with less jitter
    if (ref.current) {
      ref.current.position.y = originalPosition.current.y + floatY;
    }
  });

  const handleComplete = () => {
    toggleTodo(todo.id);
    if (onTodoAction) onTodoAction();
  };

  const handleDelete = () => {
    deleteTodo(todo.id);
    if (onTodoAction) onTodoAction();
  };

  // Enhanced colors based on completion status
  const cardColor = todo.completed ? "#2cb67d" : "#3A86FF";
  const statusText = todo.completed ? "Complete" : "In Progress";
  const cardOpacity = todo.completed ? 0.8 : 0.95; // Completed todos slightly more transparent

  // Memoize the card content to reduce rerenders
  const cardContent = useMemo(() => (
    <>
      <Interactive onSelect={handleComplete}>
        <Box 
          args={[1.5, 0.8, 0.05]} 
          castShadow
        >
          <meshStandardMaterial 
            color={cardColor}
            metalness={0.5}
            roughness={0.2}
            emissive={cardColor}
            emissiveIntensity={hovered || animateHighlight ? 0.6 : 0.2}
            transparent
            opacity={cardOpacity}
          />
        </Box>
      </Interactive>
      
      {/* Completion Checkbox */}
      <Interactive onSelect={handleComplete}>
        <group position={[-0.55, 0.2, 0.06]}>
          <Box 
            args={[0.2, 0.2, 0.02]}
          >
            <meshStandardMaterial 
              color={todo.completed ? "#2cb67d" : "#FFFFFF"}
              emissive={todo.completed ? "#2cb67d" : "#FFFFFF"}
              emissiveIntensity={0.5}
            />
          </Box>
          {todo.completed && (
            <Text
              position={[0, 0, 0.03]}
              fontSize={0.15}
              color="#FFFFFF"
              anchorX="center"
              anchorY="middle"
            >
              ✓
            </Text>
          )}
        </group>
      </Interactive>
      
      {/* Todo Title - with better readability */}
      <Text
        position={[0.05, 0.15, 0.06]}
        fontSize={0.13}
        maxWidth={1.3}
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
      
      {/* Status */}
      <Box 
        args={[0.4, 0.15, 0.01]}
        position={[-0.5, -0.2, 0.06]}
      >
        <meshStandardMaterial 
          color={todo.completed ? "#2cb67d" : "#FF9800"}
          emissive={todo.completed ? "#2cb67d" : "#FF9800"}
          emissiveIntensity={0.3}
          transparent
          opacity={0.9}
        />
      </Box>
      
      <Text
        position={[-0.5, -0.2, 0.08]}
        fontSize={0.07}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
      >
        {statusText}
      </Text>
      
      {/* Delete Button */}
      <Interactive onSelect={handleDelete}>
        <group position={[0.5, -0.2, 0.06]}>
          <Box args={[0.3, 0.15, 0.03]}>
            <meshStandardMaterial 
              color="#FF5A5F" 
              emissive="#FF5A5F"
              emissiveIntensity={hovered ? 0.5 : 0.2}
            />
          </Box>
          <Text
            position={[0, 0, 0.03]}
            fontSize={0.07}
            color="#FFFFFF"
            anchorX="center"
            anchorY="middle"
          >
            Delete
          </Text>
        </group>
      </Interactive>
    </>
  ), [todo.title, statusText, cardColor, cardOpacity, todo.completed, hovered, animateHighlight, handleComplete, handleDelete]);

  return (
    <group 
      ref={ref}
      position={position}
      rotation={rotation}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {cardContent}
    </group>
  );
};

export default TodoCard;
