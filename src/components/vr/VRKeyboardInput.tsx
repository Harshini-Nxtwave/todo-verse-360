import { Text } from '@react-three/drei';
import { Interactive } from '@react-three/xr';
import { useState, useCallback, forwardRef, useImperativeHandle } from 'react';

interface VRKeyboardInputProps {
  onTextSubmit?: (text: string) => void;
  onTextChange?: (text: string) => void;
  position?: [number, number, number];
  placeholder?: string;
  fontSize?: number;
  color?: string;
}

export interface VRKeyboardInputHandle {
  openKeyboard: () => void;
}

const VRKeyboardInput = forwardRef<VRKeyboardInputHandle, VRKeyboardInputProps>(({
  onTextSubmit,
  onTextChange,
  position = [0, 1.5, -1],
  placeholder = "Click to type",
  fontSize = 0.1,
  color = "white"
}, ref) => {
  const [text, setText] = useState(placeholder);
  const [isActive, setIsActive] = useState(false);

  const openKeyboard = useCallback(() => {
    setIsActive(true);
    const input = document.createElement("input");
    input.type = "text";
    input.style.position = "absolute";
    input.style.top = "-9999px"; // Hide it offscreen
    document.body.appendChild(input);
    input.focus();
    
    input.addEventListener("input", (e) => {
      const newText = (e.target as HTMLInputElement).value;
      setText(newText);
      if (onTextChange) {
        onTextChange(newText);
      }
    });
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (onTextSubmit && text !== placeholder) {
          onTextSubmit(text);
          setText(placeholder);
        }
        document.body.removeChild(input);
        document.removeEventListener('keydown', handleKeyDown);
        setIsActive(false);
      } else if (e.key === 'Escape') {
        setText(placeholder);
        document.body.removeChild(input);
        document.removeEventListener('keydown', handleKeyDown);
        setIsActive(false);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    input.addEventListener("blur", () => {
      if (document.body.contains(input)) {
        document.body.removeChild(input);
      }
      if (onTextSubmit && text !== placeholder) {
        onTextSubmit(text);
      }
      setIsActive(false);
    });
  }, [text, placeholder, onTextSubmit, onTextChange]);

  // Expose the openKeyboard function to parent components
  useImperativeHandle(ref, () => ({
    openKeyboard
  }));

  return (
    <Interactive onSelect={openKeyboard}>
      <Text 
        position={position} 
        fontSize={fontSize} 
        color={isActive ? "#1EAEDB" : color}
      >
        {text}
      </Text>
    </Interactive>
  );
});

export default VRKeyboardInput; 