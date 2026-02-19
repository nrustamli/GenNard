import type { Texture } from 'three';
import { CHECKER_RADIUS, CHECKER_HEIGHT } from '../../utils/boardCoordinates';

interface Checker3DProps {
  position: [number, number, number];
  color: string;
  texture?: Texture | null;
  isSelected?: boolean;
  onClick?: () => void;
}

export function Checker3D({ position, color, texture, isSelected = false, onClick }: Checker3DProps) {
  return (
    <mesh
      position={position}
      receiveShadow
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      <cylinderGeometry args={[CHECKER_RADIUS, CHECKER_RADIUS, CHECKER_HEIGHT, 32]} />
      <meshStandardMaterial
        color={texture ? '#ffffff' : color}
        map={texture ?? undefined}
        roughness={0.4}
        metalness={0.1}
        emissive={isSelected ? '#22aa22' : '#000000'}
        emissiveIntensity={isSelected ? 0.5 : 0}
      />
    </mesh>
  );
}
