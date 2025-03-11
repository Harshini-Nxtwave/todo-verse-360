
import { useState, useRef, useEffect, useMemo } from 'react';
import { Text, Box, Html } from '@react-three/drei';
import { Interactive } from '@react-three/xr';
import { useTodoStore } from '@/store/todoStore';
import * as THREE from 'three';

interface AddTodoFormProps {
  position: [number, number, number];
  onTodoAdded?: () => void;
}

const AddTodoForm: React.FC<AddTodoFormProps> = ({ position, onTodoAdded }) => {
  const { addTodo } = useTodoStore();
  const [hovered, setHovered] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [todoText, setTodoText] = useState('');
  const ref = useRef<THREE.Group>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [pulseIntensity, setPulseIntensity] = useState(0.3);

  // Optimize pulse animation using a more efficient approach
  useEffect(() => {
    if (!isFormOpen) {
      let intensity = 0.3;
      let increasing = true;
      
      // Use less frequent updates for better performance
      const pulseInterval = setInterval(() => {
        if (increasing) {
          intensity += 0.03;
          if (intensity >= 0.8) increasing = false;
        } else {
          intensity -= 0.03;
          if (intensity <= 0.3) increasing = true;
        }
        setPulseIntensity(intensity);
      }, 80); // Slower interval for better performance
      
      return () => clearInterval(pulseInterval);
    }
  }, [isFormOpen]);

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (todoText.trim()) {
      addTodo(todoText.trim());
      setTodoText('');
      setIsFormOpen(false);
      if (onTodoAdded) onTodoAdded();
    }
  };

  // Focus input when form opens
  const handleOpenForm = () => {
    setIsFormOpen(true);
    // Use setTimeout to ensure the HTML has rendered before focusing
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };
  
  // Close form on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFormOpen) {
        setIsFormOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFormOpen]);

  // Memoize form content to prevent unnecessary rerenders
  const formContent = useMemo(() => {
    if (isFormOpen) {
      return (
        <group>
          <Box 
            args={[2.2, 1.2, 0.05]} 
            castShadow
          >
            <meshStandardMaterial 
              color="#403E43"
              metalness={0.5}
              roughness={0.2}
              emissive="#1EAEDB"
              emissiveIntensity={0.1}
            />
          </Box>
          
          <Text
            position={[0, 0.4, 0.06]}
            fontSize={0.15}
            color="#FFFFFF"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.01}
            outlineColor="#000000"
          >
            Create New Todo
          </Text>
          
          <Html position={[0, 0, 0.1]} transform scale={0.24} rotation-x={0}>
            <form onSubmit={handleAddTodo} className="w-[500px]">
              <input
                type="text"
                value={todoText}
                onChange={(e) => setTodoText(e.target.value)}
                placeholder="Enter todo text..."
                className="vr-input mb-4"
                ref={inputRef}
              />
              
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="vr-button bg-vr-accent"
                >
                  Cancel
                </button>
                
                <button type="submit" className="vr-button">
                  Add Todo
                </button>
              </div>
            </form>
          </Html>
        </group>
      );
    }
    
    return (
      <Interactive onSelect={handleOpenForm}>
        <group>
          <Box 
            args={[1.6, 0.6, 0.05]} 
            castShadow
          >
            <meshStandardMaterial 
              color="#1EAEDB"
              metalness={0.5}
              roughness={0.2}
              emissive="#1EAEDB"
              emissiveIntensity={hovered ? 0.8 : pulseIntensity}
            />
          </Box>
          
          <Text
            position={[0, 0, 0.06]}
            fontSize={0.18}
            color="#FFFFFF"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.01}
            outlineColor="#000000"
          >
            + Add New Todo
          </Text>
        </group>
      </Interactive>
    );
  }, [isFormOpen, todoText, hovered, pulseIntensity, handleOpenForm]);

  return (
    <group 
      ref={ref}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {formContent}
    </group>
  );
};

export default AddTodoForm;
