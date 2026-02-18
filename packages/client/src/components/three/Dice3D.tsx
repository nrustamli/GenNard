import { useRef } from 'react';
import type { Mesh } from 'three';
import { RoundedBox } from '@react-three/drei';

interface Dice3DProps {
  die1: number | null;
  die2: number | null;
  position?: [number, number, number];
}

const PIP_POSITIONS: Record<number, [number, number][]> = {
  1: [[0, 0]],
  2: [[-0.12, -0.12], [0.12, 0.12]],
  3: [[-0.12, -0.12], [0, 0], [0.12, 0.12]],
  4: [[-0.12, -0.12], [0.12, -0.12], [-0.12, 0.12], [0.12, 0.12]],
  5: [[-0.12, -0.12], [0.12, -0.12], [0, 0], [-0.12, 0.12], [0.12, 0.12]],
  6: [[-0.12, -0.15], [0.12, -0.15], [-0.12, 0], [0.12, 0], [-0.12, 0.15], [0.12, 0.15]],
};

function DiceCube({ value, position }: { value: number; position: [number, number, number] }) {
  const meshRef = useRef<Mesh>(null);
  const size = 0.5;

  return (
    <group position={position}>
      {/* Dice body — rounded corners */}
      <RoundedBox ref={meshRef} args={[size, size, size]} radius={0.08} smoothness={4} castShadow>
        <meshStandardMaterial color="#cc2222" roughness={0.4} />
      </RoundedBox>

      {/* Pips on top face */}
      {PIP_POSITIONS[value]?.map((pos, i) => (
        <mesh
          key={i}
          position={[pos[0], size / 2 + 0.001, pos[1]]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <circleGeometry args={[0.04, 16]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ))}
    </group>
  );
}

export function Dice3D({ die1, die2, position = [0, 0.4, -6] }: Dice3DProps) {
  if (die1 === null || die2 === null) return null;

  return (
    <group position={position}>
      <DiceCube value={die1} position={[-0.5, 0, 0]} />
      <DiceCube value={die2} position={[0.5, 0, 0]} />
    </group>
  );
}
