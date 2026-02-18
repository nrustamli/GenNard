import type { ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import type { GameState } from '@gennard/game-engine';
import type { ResolvedTheme } from '../../theme/types';
import { DEFAULT_THEME } from '../../theme/defaults';
import { Lighting } from './Lighting';
import { CameraController } from './CameraController';
import { Board3D } from './Board3D';
import { Point3D } from './Point3D';
import { Checker3D } from './Checker3D';
import { Bar3D } from './Bar3D';
import { Dice3D } from './Dice3D';
import { getCheckerPosition } from '../../utils/boardCoordinates';

interface BoardSceneProps {
  gameState: GameState;
  theme?: ResolvedTheme;
  highlightedPoints?: Set<number>;
  selectedChecker?: { point: number | 'bar'; player: 'white' | 'black' } | null;
  onPointClick?: (index: number) => void;
  onCheckerClick?: (point: number | 'bar', player: 'white' | 'black') => void;
}

export function BoardScene({
  gameState,
  theme = DEFAULT_THEME,
  highlightedPoints = new Set(),
  selectedChecker = null,
  onPointClick,
  onCheckerClick,
}: BoardSceneProps) {
  const { colors, textures } = theme;

  // Build checker elements from game state
  const checkerElements: ReactNode[] = [];

  for (let i = 0; i < 24; i++) {
    const count = Math.abs(gameState.points[i]);
    const player = gameState.points[i] > 0 ? 'white' : 'black';
    const color = player === 'white' ? colors.player1Accent : colors.player2Accent;
    const texture = player === 'white' ? textures.checker1 : textures.checker2;

    for (let s = 0; s < count; s++) {
      const pos = getCheckerPosition(i, s, count);
      const isSelected =
        selectedChecker?.point === i && selectedChecker?.player === player && s === count - 1;

      checkerElements.push(
        <Checker3D
          key={`checker-${i}-${s}`}
          position={[pos.x, pos.y, pos.z]}
          color={color}
          texture={texture}
          isSelected={isSelected}
          onClick={s === count - 1 ? () => onCheckerClick?.(i, player) : undefined}
        />
      );
    }
  }

  return (
    <Canvas
      camera={{ position: [0, 14, 10], fov: 45 }}
      shadows
      style={{ width: '100%', height: '100%' }}
    >
      <color attach="background" args={[colors.backgroundColor]} />
      <Lighting />
      <CameraController />

      <Board3D
        colors={{
          boardFrame: colors.boardFrame,
          boardSurface: colors.boardLight,
          barColor: colors.barColor,
        }}
        boardTexture={textures.board}
      />

      {/* Triangular points */}
      {Array.from({ length: 24 }, (_, i) => (
        <Point3D
          key={`point-${i}`}
          index={i}
          color={colors.boardDark}
          isHighlighted={highlightedPoints.has(i)}
          onClick={() => onPointClick?.(i)}
        />
      ))}

      {/* Checkers on points */}
      {checkerElements}

      {/* Bar checkers */}
      <Bar3D
        whiteCount={gameState.bar.white}
        blackCount={gameState.bar.black}
        whiteColor={colors.player1Accent}
        blackColor={colors.player2Accent}
      />

      {/* Dice — above the board, top center */}
      <Dice3D
        die1={gameState.dice.roll?.die1 ?? null}
        die2={gameState.dice.roll?.die2 ?? null}
        position={[0, 0.4, -7]}
      />
    </Canvas>
  );
}
