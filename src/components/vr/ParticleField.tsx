
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleFieldProps {
  count?: number;
  size?: number;
  color?: string;
  speed?: number;
}

const ParticleField: React.FC<ParticleFieldProps> = ({
  count = 2000,
  size = 0.05,
  color = '#7f5af0',
  speed = 0.05
}) => {
  const mesh = useRef<THREE.Points>(null);
  const particlePositions = useRef<Float32Array>();
  const particleSpeeds = useRef<Float32Array>();

  if (!particlePositions.current) {
    particlePositions.current = new Float32Array(count * 3);
    particleSpeeds.current = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      particlePositions.current[i3] = (Math.random() - 0.5) * 50;
      particlePositions.current[i3 + 1] = (Math.random() - 0.5) * 30;
      particlePositions.current[i3 + 2] = (Math.random() - 0.5) * 50;
      
      particleSpeeds.current[i] = Math.random() * speed;
    }
  }

  useFrame(() => {
    if (!mesh.current || !particlePositions.current || !particleSpeeds.current) return;
    
    const positions = mesh.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3 + 1] -= particleSpeeds.current[i];
      
      // Reset particles that go too far down
      if (positions[i3 + 1] < -15) {
        positions[i3 + 1] = 15;
        positions[i3] = (Math.random() - 0.5) * 50;
        positions[i3 + 2] = (Math.random() - 0.5) * 50;
      }
    }
    
    mesh.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={particlePositions.current}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        color={color}
        sizeAttenuation={true}
        transparent={true}
        alphaTest={0.5}
        opacity={0.8}
      />
    </points>
  );
};

export default ParticleField;
