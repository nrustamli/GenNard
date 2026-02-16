import { useRef } from 'react';
import type { Mesh } from 'three';
import { CHECKER_RADIUS, CHECKER_HEIGHT } from '../../utils/boardCoordinates';

interface Checker3DProps {
  position: [number, number, number];
  color: string;
  isSelected?: boolean;
  onClick?: () => void;
}

export function Checker3D({ position, color, isSelected = false, onClick }: Checker3DProps) {
  const meshRef = useRef<Mesh>(null);

  return (
    <mesh
      ref={meshRef}
      position={position}
      castShadow
      receiveShadow
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      <cylinderGeometry args={[CHECKER_RADIUS, CHECKER_RADIUS, CHECKER_HEIGHT, 32]} />
      <meshStandardMaterial
        color={color}
        roughness={0.4}
        metalness={0.1}
        emissive={isSelected ? '#ffffff' : '#000000'}
        emissiveIntensity={isSelected ? 0.3 : 0}
      />
      {/* Top ring for visual distinction */}
      <mesh position={[0, CHECKER_HEIGHT / 2 + 0.001, 0]}>
        <ringGeometry args={[CHECKER_RADIUS * 0.5, CHECKER_RADIUS * 0.7, 32]} />
        <meshStandardMaterial
          color={color}
          roughness={0.3}
          metalness={0.3}
          transparent
          opacity={0.6}
        />
      </mesh>
    </mesh>
  );
}
