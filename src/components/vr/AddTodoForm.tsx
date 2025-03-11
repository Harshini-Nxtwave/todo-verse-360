
import { useState, useRef } from 'react';
import { Text, Box, Html } from '@react-three/drei';
import { Interactive } from '@react-three/xr';
import { useTodoStore } from '@/store/todoStore';
import * as THREE from 'three';

interface AddTodoFormProps {
  position: [number, number, number];
}

const AddTodoForm: React.FC<AddTodoFormProps> = ({ position }) => {
  const { addTodo } = useTodoStore();
  const [hovered, setHovered] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [todoText, setTodoText] = useState('');
  const ref = useRef<THREE.Group>(null);

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (todoText.trim()) {
      addTodo(todoText.trim());
      setTodoText('');
      setIsFormOpen(false);
    }
  };

  return (
    <group 
      ref={ref}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {!isFormOpen ? (
        <Interactive onSelect={() => setIsFormOpen(true)}>
          <group>
            <Box 
              args={[2, 0.6, 0.05]} 
              castShadow
            >
              <meshStandardMaterial 
                color="#7f5af0"
                metalness={0.5}
                roughness={0.2}
                emissive="#7f5af0"
                emissiveIntensity={hovered ? 0.5 : 0.2}
              />
            </Box>
            
            <Text
              position={[0, 0, 0.06]}
              fontSize={0.2}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.02}
              outlineColor="#000000"
            >
              + Add New Todo
            </Text>
          </group>
        </Interactive>
      ) : (
        <group>
          <Box 
            args={[2.5, 1.2, 0.05]} 
            castShadow
          >
            <meshStandardMaterial 
              color="#0f0e17"
              metalness={0.5}
              roughness={0.2}
              emissive="#7f5af0"
              emissiveIntensity={0.1}
            />
          </Box>
          
          <Text
            position={[0, 0.4, 0.06]}
            fontSize={0.15}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#000000"
          >
            Create New Todo
          </Text>
          
          <Html position={[0, 0, 0.1]} transform scale={0.15} rotation-x={0}>
            <form onSubmit={handleAddTodo} className="w-[500px]">
              <input
                type="text"
                value={todoText}
                onChange={(e) => setTodoText(e.target.value)}
                placeholder="Enter todo text..."
                className="vr-input mb-4"
                autoFocus
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
      )}
    </group>
  );
};

export default AddTodoForm;
