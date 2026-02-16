import type { ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import type { GameState } from '@gennard/game-engine';
import { Lighting } from './Lighting';
import { CameraController } from './CameraController';
import { Board3D } from './Board3D';
import { Point3D } from './Point3D';
import { Checker3D } from './Checker3D';
import { Bar3D } from './Bar3D';
import { BearOffTray3D } from './BearOffTray3D';
import { Dice3D } from './Dice3D';
import { getCheckerPosition } from '../../utils/boardCoordinates';

interface BoardSceneProps {
  gameState: GameState;
  highlightedPoints?: Set<number>;
  selectedChecker?: { point: number | 'bar'; player: 'white' | 'black' } | null;
  onPointClick?: (index: number) => void;
  onCheckerClick?: (point: number | 'bar', player: 'white' | 'black') => void;
}

const DARK_POINT_COLOR = '#8B4513';
const LIGHT_POINT_COLOR = '#D2691E';
const WHITE_CHECKER_COLOR = '#f5f5dc';
const BLACK_CHECKER_COLOR = '#1a1a1a';

export function BoardScene({
  gameState,
  highlightedPoints = new Set(),
  selectedChecker = null,
  onPointClick,
  onCheckerClick,
}: BoardSceneProps) {
  // Build checker elements from game state
  const checkerElements: ReactNode[] = [];

  for (let i = 0; i < 24; i++) {
    const count = Math.abs(gameState.points[i]);
    const player = gameState.points[i] > 0 ? 'white' : 'black';
    const color = player === 'white' ? WHITE_CHECKER_COLOR : BLACK_CHECKER_COLOR;

    for (let s = 0; s < count; s++) {
      const pos = getCheckerPosition(i, s);
      const isSelected =
        selectedChecker?.point === i && selectedChecker?.player === player && s === count - 1;

      checkerElements.push(
        <Checker3D
          key={`checker-${i}-${s}`}
          position={[pos.x, pos.y, pos.z]}
          color={color}
          isSelected={isSelected}
          onClick={s === count - 1 ? () => onCheckerClick?.(i, player) : undefined}
        />
      );
    }
  }

  return (
    <Canvas
      camera={{ position: [0, 10, 8], fov: 45 }}
      shadows
      style={{ width: '100%', height: '100%' }}
    >
      <color attach="background" args={['#1a1a2e']} />
      <Lighting />
      <CameraController />

      <Board3D />

      {/* Triangular points */}
      {Array.from({ length: 24 }, (_, i) => (
        <Point3D
          key={`point-${i}`}
          index={i}
          color={i % 2 === 0 ? DARK_POINT_COLOR : LIGHT_POINT_COLOR}
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
        whiteColor={WHITE_CHECKER_COLOR}
        blackColor={BLACK_CHECKER_COLOR}
      />

      {/* Bear-off tray */}
      <BearOffTray3D
        whiteCount={gameState.borneOff.white}
        blackCount={gameState.borneOff.black}
        whiteColor={WHITE_CHECKER_COLOR}
        blackColor={BLACK_CHECKER_COLOR}
      />

      {/* Dice */}
      <Dice3D
        die1={gameState.dice.roll?.die1 ?? null}
        die2={gameState.dice.roll?.die2 ?? null}
      />
    </Canvas>
  );
}
