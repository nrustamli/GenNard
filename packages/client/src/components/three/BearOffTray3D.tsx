import type { ReactNode } from 'react';
import { Checker3D } from './Checker3D';
import { getBearOffPosition, BOARD_WIDTH, BOARD_DEPTH, BOARD_HEIGHT } from '../../utils/boardCoordinates';

interface BearOffTray3DProps {
  whiteCount: number;
  blackCount: number;
  whiteColor?: string;
  blackColor?: string;
  trayColor?: string;
}

export function BearOffTray3D({
  whiteCount,
  blackCount,
  whiteColor = '#f5f5dc',
  blackColor = '#1a1a1a',
  trayColor = '#3d2211',
}: BearOffTray3DProps) {
  const checkers: ReactNode[] = [];

  for (let i = 0; i < whiteCount; i++) {
    const pos = getBearOffPosition('white', i);
    checkers.push(
      <Checker3D
        key={`off-w-${i}`}
        position={[pos.x, pos.y, pos.z]}
        color={whiteColor}
      />
    );
  }

  for (let i = 0; i < blackCount; i++) {
    const pos = getBearOffPosition('black', i);
    checkers.push(
      <Checker3D
        key={`off-b-${i}`}
        position={[pos.x, pos.y, pos.z]}
        color={blackColor}
      />
    );
  }

  return (
    <group>
      {/* Tray surface */}
      <mesh position={[BOARD_WIDTH / 2 + 0.8, -0.05, 0]}>
        <boxGeometry args={[1.2, BOARD_HEIGHT * 0.5, BOARD_DEPTH]} />
        <meshStandardMaterial color={trayColor} roughness={0.8} />
      </mesh>
      {checkers}
    </group>
  );
}
