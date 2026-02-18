import type { Texture } from 'three';
import { BOARD_WIDTH, BOARD_DEPTH, BOARD_HEIGHT, BAR_WIDTH } from '../../utils/boardCoordinates';

interface Board3DProps {
  colors?: {
    boardFrame: string;
    boardSurface: string;
    barColor?: string;
  };
  boardTexture?: Texture | null;
}

const DEFAULT_COLORS = {
  boardFrame: '#5C3317',
  boardSurface: '#2d1810',
};

export function Board3D({ colors = DEFAULT_COLORS, boardTexture }: Board3DProps) {
  const frameThickness = 0.4;
  const frameHeight = BOARD_HEIGHT + 0.1;

  return (
    <group>
      {/* Board playing surface */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[BOARD_WIDTH, BOARD_HEIGHT, BOARD_DEPTH]} />
        <meshStandardMaterial
          color={boardTexture ? '#ffffff' : colors.boardSurface}
          map={boardTexture ?? undefined}
          roughness={0.8}
        />
      </mesh>

      {/* Frame - top */}
      <mesh position={[0, frameHeight / 2 - BOARD_HEIGHT / 2, -BOARD_DEPTH / 2 - frameThickness / 2]}>
        <boxGeometry args={[BOARD_WIDTH + frameThickness * 2, frameHeight, frameThickness]} />
        <meshStandardMaterial color={colors.boardFrame} roughness={0.6} />
      </mesh>

      {/* Frame - bottom */}
      <mesh position={[0, frameHeight / 2 - BOARD_HEIGHT / 2, BOARD_DEPTH / 2 + frameThickness / 2]}>
        <boxGeometry args={[BOARD_WIDTH + frameThickness * 2, frameHeight, frameThickness]} />
        <meshStandardMaterial color={colors.boardFrame} roughness={0.6} />
      </mesh>

      {/* Frame - left */}
      <mesh position={[-BOARD_WIDTH / 2 - frameThickness / 2, frameHeight / 2 - BOARD_HEIGHT / 2, 0]}>
        <boxGeometry args={[frameThickness, frameHeight, BOARD_DEPTH + frameThickness * 2]} />
        <meshStandardMaterial color={colors.boardFrame} roughness={0.6} />
      </mesh>

      {/* Frame - right */}
      <mesh position={[BOARD_WIDTH / 2 + frameThickness / 2, frameHeight / 2 - BOARD_HEIGHT / 2, 0]}>
        <boxGeometry args={[frameThickness, frameHeight, BOARD_DEPTH + frameThickness * 2]} />
        <meshStandardMaterial color={colors.boardFrame} roughness={0.6} />
      </mesh>

      {/* Center bar */}
      <mesh position={[0, frameHeight / 2 - BOARD_HEIGHT / 2, 0]}>
        <boxGeometry args={[BAR_WIDTH, frameHeight, BOARD_DEPTH]} />
        <meshStandardMaterial color={colors.barColor ?? colors.boardFrame} roughness={0.6} />
      </mesh>
    </group>
  );
}
