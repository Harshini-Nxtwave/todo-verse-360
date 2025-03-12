import { useState, useRef, useEffect, useMemo } from 'react';
import { Text, Box, Html } from '@react-three/drei';
import { Interactive, useXR } from '@react-three/xr';
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
  const { session } = useXR();

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

  const handleAddTodo = () => {
    if (todoText.trim()) {
      addTodo(todoText.trim());
      setTodoText('');
      setIsFormOpen(false);
      if (onTodoAdded) onTodoAdded();
    }
  };

  const handleOpenForm = async () => {
    setIsFormOpen(true);
    
    // Request the VR keyboard if available
    if (session) {
      try {
        // Try to get the XR input source
        const inputSource = Array.from(session.inputSources).find(
          source => source.targetRayMode === 'tracked-pointer'
        );

        if (inputSource && 'requestVirtualKeyboard' in navigator.xr) {
          const keyboard = await (navigator.xr as any).requestVirtualKeyboard({
            inputSource,
            type: 'text',
          });

          keyboard.addEventListener('input', (event: any) => {
            setTodoText(event.data);
          });

          keyboard.addEventListener('accept', () => {
            handleAddTodo();
          });

          keyboard.addEventListener('cancel', () => {
            setIsFormOpen(false);
          });
        }
      } catch (error) {
        console.warn('Virtual keyboard not available:', error);
      }
    }
  };

  const formContent = useMemo(() => {
    if (isFormOpen) {
      return (
        <group>
          {/* Form Background */}
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
          
          {/* Input Display */}
          <Box
            args={[2, 0.4, 0.02]}
            position={[0, 0, 0.06]}
          >
            <meshStandardMaterial
              color="#FFFFFF"
              metalness={0.1}
              roughness={0.9}
            />
          </Box>
          
          <Text
            position={[0, 0, 0.08]}
            fontSize={0.15}
            color="#000000"
            anchorX="center"
            anchorY="middle"
            maxWidth={1.8}
          >
            {todoText || "Type your todo..."}
          </Text>

          {/* Action Buttons */}
          <group position={[0, -0.3, 0.06]}>
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
