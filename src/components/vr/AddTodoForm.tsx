import { useState, useRef, useEffect, useMemo } from 'react';
import { Text, Box, Html } from '@react-three/drei';
import { Interactive } from '@react-three/xr';
import { useTodoStore } from '@/store/todoStore';
import * as THREE from 'three';

interface AddTodoFormProps {
  position: [number, number, number];
  onTodoAdded?: () => void;
}

const VRKeyboard = ({ onKeyPress, onEnter, onBackspace }: { 
  onKeyPress: (key: string) => void;
  onEnter: () => void;
  onBackspace: () => void;
}) => {
  const keys = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
  ];

  const specialKeys = [
    { label: 'Space', width: 2, action: () => onKeyPress(' ') },
    { label: '⌫', width: 1, action: onBackspace },
    { label: 'Enter', width: 1, action: onEnter }
  ];

  return (
    <group position={[0, -0.8, 0]}>
      {keys.map((row, rowIndex) => (
        <group key={rowIndex} position={[0, -rowIndex * 0.3, 0]}>
          {row.map((key, keyIndex) => {
            const xOffset = (row.length * 0.35) / 2;
            return (
              <Interactive key={key} onSelect={() => onKeyPress(key)}>
                <group position={[keyIndex * 0.35 - xOffset, 0, 0]}>
                  <Box args={[0.3, 0.25, 0.05]}>
                    <meshStandardMaterial color="#444444" />
                  </Box>
                  <Text
                    position={[0, 0, 0.03]}
                    fontSize={0.15}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                  >
                    {key}
                  </Text>
                </group>
              </Interactive>
            );
          })}
        </group>
      ))}
      
      <group position={[0, -keys.length * 0.3, 0]}>
        {specialKeys.map((key, index) => {
          const totalWidth = specialKeys.reduce((acc, k) => acc + k.width, 0) * 0.35;
          const xOffset = totalWidth / 2;
          const xPosition = specialKeys
            .slice(0, index)
            .reduce((acc, k) => acc + k.width * 0.35, 0);
          
          return (
            <Interactive key={key.label} onSelect={key.action}>
              <group position={[xPosition - xOffset, 0, 0]}>
                <Box args={[key.width * 0.35 - 0.05, 0.25, 0.05]}>
                  <meshStandardMaterial color="#666666" />
                </Box>
                <Text
                  position={[0, 0, 0.03]}
                  fontSize={0.12}
                  color="white"
                  anchorX="center"
                  anchorY="middle"
                >
                  {key.label}
                </Text>
              </group>
            </Interactive>
          );
        })}
      </group>
    </group>
  );
};

const AddTodoForm: React.FC<AddTodoFormProps> = ({ position, onTodoAdded }) => {
  const { addTodo } = useTodoStore();
  const [hovered, setHovered] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [todoText, setTodoText] = useState('');
  const ref = useRef<THREE.Group>(null);
  const [pulseIntensity, setPulseIntensity] = useState(0.3);

  // Optimize pulse animation using a more efficient approach
  useEffect(() => {
    if (!isFormOpen) {
      let intensity = 0.3;
      let increasing = true;
      
      const pulseInterval = setInterval(() => {
        if (increasing) {
          intensity += 0.03;
          if (intensity >= 0.8) increasing = false;
        } else {
          intensity -= 0.03;
          if (intensity <= 0.3) increasing = true;
        }
        setPulseIntensity(intensity);
      }, 80);
      
      return () => clearInterval(pulseInterval);
    }
  }, [isFormOpen]);

  const handleKeyPress = (key: string) => {
    setTodoText(prev => prev + key);
  };

  const handleBackspace = () => {
    setTodoText(prev => prev.slice(0, -1));
  };

  const handleAddTodo = () => {
    if (todoText.trim()) {
      addTodo(todoText.trim());
      setTodoText('');
      setIsFormOpen(false);
      if (onTodoAdded) onTodoAdded();
    }
  };

  const handleOpenForm = () => {
    setIsFormOpen(true);
  };

  // Memoize form content to prevent unnecessary rerenders
  const formContent = useMemo(() => {
    if (isFormOpen) {
      return (
        <group>
          {/* Form Background */}
          <Box 
            args={[4, 3, 0.1]} 
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
          
          {/* Title */}
          <Text
            position={[0, 1.2, 0.06]}
            fontSize={0.2}
            color="#FFFFFF"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.01}
            outlineColor="#000000"
          >
            Create New Todo
          </Text>
          
          {/* Input Display */}
          <Box
            args={[3.5, 0.4, 0.05]}
            position={[0, 0.7, 0.06]}
          >
            <meshStandardMaterial
              color="#FFFFFF"
              metalness={0.1}
              roughness={0.9}
            />
          </Box>
          
          <Text
            position={[0, 0.7, 0.12]}
            fontSize={0.2}
            color="#000000"
            anchorX="center"
            anchorY="middle"
            maxWidth={3}
          >
            {todoText || "Type your todo..."}
          </Text>

          {/* VR Keyboard */}
          <VRKeyboard 
            onKeyPress={handleKeyPress}
            onEnter={handleAddTodo}
            onBackspace={handleBackspace}
          />

          {/* Action Buttons */}
          <group position={[0, -1.8, 0.06]}>
            <Interactive onSelect={() => setIsFormOpen(false)}>
              <group position={[-0.8, 0, 0]}>
                <Box args={[0.7, 0.3, 0.05]}>
                  <meshStandardMaterial
                    color="#FF5A5F"
                    emissive="#FF5A5F"
                    emissiveIntensity={0.3}
                  />
                </Box>
                <Text
                  position={[0, 0, 0.03]}
                  fontSize={0.15}
                  color="#FFFFFF"
                  anchorX="center"
                  anchorY="middle"
                >
                  Cancel
                </Text>
              </group>
            </Interactive>

            <Interactive onSelect={handleAddTodo}>
              <group position={[0.8, 0, 0]}>
                <Box args={[0.7, 0.3, 0.05]}>
                  <meshStandardMaterial
                    color="#2cb67d"
                    emissive="#2cb67d"
                    emissiveIntensity={0.3}
                  />
                </Box>
                <Text
                  position={[0, 0, 0.03]}
                  fontSize={0.15}
                  color="#FFFFFF"
                  anchorX="center"
                  anchorY="middle"
                >
                  Add Todo
                </Text>
              </group>
            </Interactive>
          </group>
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
  }, [isFormOpen, todoText, hovered, pulseIntensity]);

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
