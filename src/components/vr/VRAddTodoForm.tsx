import { useState, useRef, useEffect } from 'react';
import { Text, Box } from '@react-three/drei';
import { Interactive } from '@react-three/xr';
import { useTodoStore } from '@/store/todoStore';
import VRKeyboardInput, { VRKeyboardInputHandle } from './VRKeyboardInput';
import * as THREE from 'three';

interface VRAddTodoFormProps {
  position: [number, number, number];
  onTodoAdded?: () => void;
}

const VRAddTodoForm: React.FC<VRAddTodoFormProps> = ({ position, onTodoAdded }) => {
  const { addTodo } = useTodoStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const ref = useRef<THREE.Group>(null);
  const keyboardRef = useRef<VRKeyboardInputHandle>(null);
  const [todoText, setTodoText] = useState('');

  const handleAddTodo = (todoText: string) => {
    if (todoText && todoText.trim()) {
      addTodo(todoText.trim());
      setIsFormOpen(false);
      if (onTodoAdded) onTodoAdded();
    }
  };

  // Capture input text as it's typed
  const handleTextChange = (text: string) => {
    setTodoText(text);
  };

  // Handle manual submission via button
  const handleSubmit = () => {
    if (todoText && todoText.trim()) {
      addTodo(todoText.trim());
      setIsFormOpen(false);
      setTodoText('');
      if (onTodoAdded) onTodoAdded();
    }
  };

  // Auto open keyboard when form is opened
  useEffect(() => {
    if (isFormOpen && keyboardRef.current) {
      // Small delay to ensure component is mounted
      const timer = setTimeout(() => {
        keyboardRef.current?.openKeyboard();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isFormOpen]);

  return (
    <group ref={ref} position={position}>
      {!isFormOpen ? (
        <Interactive onSelect={() => setIsFormOpen(true)}>
          <group>
            <Box args={[1.6, 0.6, 0.05]} castShadow>
              <meshStandardMaterial 
                color="#1EAEDB"
                metalness={0.5}
                roughness={0.2}
                emissive="#1EAEDB"
                emissiveIntensity={0.5}
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
      ) : (
        <group>
          {/* Form Background */}
          <Box args={[2.2, 1.2, 0.05]} castShadow>
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
          
          {/* VR Keyboard Input */}
          <group position={[0, 0.1, 0.06]}>
            <VRKeyboardInput 
              ref={keyboardRef}
              position={[0, 0, 0]} 
              placeholder="Type your todo..."
              fontSize={0.15}
              color="#000000"
              onTextSubmit={handleAddTodo}
              onTextChange={handleTextChange}
            />
          </group>

          {/* Action Buttons */}
          <group position={[0, -0.3, 0.06]}>
            {/* Add Button */}
            <Interactive onSelect={handleSubmit}>
              <group position={[-0.6, 0, 0]}>
                <Box args={[0.8, 0.25, 0.02]}>
                  <meshStandardMaterial
                    color="#4CAF50"
                    emissive="#4CAF50"
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

            {/* Cancel Button */}
            <Interactive onSelect={() => setIsFormOpen(false)}>
              <group position={[0.6, 0, 0]}>
                <Box args={[0.8, 0.25, 0.02]}>
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
          </group>
        </group>
      )}
    </group>
  );
};

export default VRAddTodoForm; 