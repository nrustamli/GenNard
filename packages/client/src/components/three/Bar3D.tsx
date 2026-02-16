import type { ReactNode } from 'react';
import { Checker3D } from './Checker3D';
import { getBarCheckerPosition } from '../../utils/boardCoordinates';

interface Bar3DProps {
  whiteCount: number;
  blackCount: number;
  whiteColor?: string;
  blackColor?: string;
}

export function Bar3D({
  whiteCount,
  blackCount,
  whiteColor = '#f5f5dc',
  blackColor = '#1a1a1a',
}: Bar3DProps) {
  const checkers: ReactNode[] = [];

  for (let i = 0; i < whiteCount; i++) {
    const pos = getBarCheckerPosition('white', i);
    checkers.push(
      <Checker3D
        key={`bar-w-${i}`}
        position={[pos.x, pos.y, pos.z]}
        color={whiteColor}
      />
    );
  }

  for (let i = 0; i < blackCount; i++) {
    const pos = getBarCheckerPosition('black', i);
    checkers.push(
      <Checker3D
        key={`bar-b-${i}`}
        position={[pos.x, pos.y, pos.z]}
        color={blackColor}
      />
    );
  }

  return <group>{checkers}</group>;
}
