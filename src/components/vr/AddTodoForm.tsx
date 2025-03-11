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
  const [pulseIntensity, setPulseIntensity] = useState(0.3);
  const [showKeyboard, setShowKeyboard] = useState(false);

  // Virtual keyboard layout
  const keyboardLayout = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.'],
    ['Space', 'Backspace']
  ];

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
    if (key === 'Backspace') {
      setTodoText(prev => prev.slice(0, -1));
    } else if (key === 'Space') {
      setTodoText(prev => prev + ' ');
    } else {
      setTodoText(prev => prev + key);
    }
  };

  const handleAddTodo = () => {
    if (todoText.trim()) {
      addTodo(todoText.trim());
      setTodoText('');
      setIsFormOpen(false);
      setShowKeyboard(false);
      if (onTodoAdded) onTodoAdded();
    }
  };

  const handleOpenForm = () => {
    setIsFormOpen(true);
    setShowKeyboard(true);
  };

  // Memoize form content to prevent unnecessary rerenders
  const formContent = useMemo(() => {
    if (isFormOpen) {
      return (
        <group>
          {/* Form Background */}
          <Box 
            args={[2.5, showKeyboard ? 2.5 : 1.2, 0.05]} 
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
            position={[0, showKeyboard ? 1 : 0.4, 0.06]}
            fontSize={0.15}
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
            args={[2, 0.4, 0.02]}
            position={[0, showKeyboard ? 0.6 : 0, 0.06]}
          >
            <meshStandardMaterial
              color="#FFFFFF"
              metalness={0.1}
              roughness={0.9}
            />
          </Box>
          
          <Text
            position={[0, showKeyboard ? 0.6 : 0, 0.08]}
            fontSize={0.15}
            color="#000000"
            anchorX="center"
            anchorY="middle"
            maxWidth={1.8}
          >
            {todoText || "Enter todo text..."}
          </Text>

          {/* Virtual Keyboard */}
          {showKeyboard && (
            <group position={[0, -0.2, 0.06]}>
              {keyboardLayout.map((row, rowIndex) => (
                <group key={rowIndex} position={[0, -rowIndex * 0.25, 0]}>
                  {row.map((key, keyIndex) => {
                    const keyWidth = key === 'Space' ? 1 : key === 'Backspace' ? 0.8 : 0.2;
                    const spacing = 0.22;
                    const rowOffset = row.length * spacing / 2;
                    const xPos = keyIndex * spacing - rowOffset + (key === 'Space' ? 0.4 : 0);
                    
                    return (
                      <Interactive key={key} onSelect={() => handleKeyPress(key)}>
                        <group position={[xPos, 0, 0]}>
                          <Box args={[keyWidth, 0.2, 0.02]}>
                            <meshStandardMaterial
                              color="#666666"
                              metalness={0.5}
                              roughness={0.2}
                              emissive="#666666"
                              emissiveIntensity={0.2}
                            />
                          </Box>
                          <Text
                            position={[0, 0, 0.02]}
                            fontSize={0.08}
                            color="#FFFFFF"
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
            </group>
          )}

          {/* Action Buttons */}
          <group position={[0, showKeyboard ? -1.5 : -0.3, 0.06]}>
            <Interactive onSelect={() => setIsFormOpen(false)}>
              <group position={[-0.6, 0, 0]}>
                <Box args={[0.5, 0.25, 0.02]}>
                  <meshStandardMaterial
                    color="#FF5A5F"
                    emissive="#FF5A5F"
                    emissiveIntensity={0.3}
                  />
                </Box>
                <Text
                  position={[0, 0, 0.02]}
                  fontSize={0.1}
                  color="#FFFFFF"
                  anchorX="center"
                  anchorY="middle"
                >
                  Cancel
                </Text>
              </group>
            </Interactive>

            <Interactive onSelect={handleAddTodo}>
              <group position={[0.6, 0, 0]}>
                <Box args={[0.5, 0.25, 0.02]}>
                  <meshStandardMaterial
                    color="#2cb67d"
                    emissive="#2cb67d"
                    emissiveIntensity={0.3}
                  />
                </Box>
                <Text
                  position={[0, 0, 0.02]}
                  fontSize={0.1}
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
  }, [isFormOpen, todoText, hovered, pulseIntensity, showKeyboard]);

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
