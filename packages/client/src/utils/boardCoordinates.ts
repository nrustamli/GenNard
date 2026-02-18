/**
 * Maps backgammon point indices (0-23) to 3D world positions.
 *
 * Board layout (viewed from above):
 *   Top row (z = -BOARD_DEPTH/2):  points 13-24 (indices 12-23), left to right
 *   Bottom row (z = +BOARD_DEPTH/2): points 12-1 (indices 11-0), left to right (reversed)
 *   Bar in the center (x = 0)
 *
 * White home board: indices 0-5 (right side, bottom row)
 * Black home board: indices 18-23 (right side, top row)
 */

export const BOARD_WIDTH = 12.5;
export const BOARD_DEPTH = 10;
export const BOARD_HEIGHT = 0.3;

export const POINT_WIDTH = 0.9;
export const CHECKER_RADIUS = 0.4;
export const CHECKER_HEIGHT = 0.1;
export const BAR_WIDTH = 0.6;

// X positions for the 12 points on each row (left to right)
// 6 points | BAR | 6 points — symmetric around x=0
function getPointXPositions(): number[] {
  const positions: number[] = [];
  const barHalf = BAR_WIDTH / 2;
  const gap = 0.2; // gap between bar edge and nearest point edge
  const firstCenter = barHalf + gap + POINT_WIDTH / 2;

  // Left 6 points (negative x, far left first)
  for (let i = 5; i >= 0; i--) {
    positions.push(-(firstCenter + i * POINT_WIDTH));
  }
  // Right 6 points (positive x, near bar first)
  for (let i = 0; i < 6; i++) {
    positions.push(firstCenter + i * POINT_WIDTH);
  }

  return positions;
}

const X_POSITIONS = getPointXPositions();

export interface PointPosition {
  x: number;
  z: number;
  direction: 'up' | 'down'; // 'up' = triangle pointing toward negative z, 'down' = toward positive z
}

/**
 * Get the 3D position for a given point index (0-23).
 */
export function getPointPosition(index: number): PointPosition {
  // Top row: indices 12-23 (points 13-24), left to right
  if (index >= 12 && index <= 23) {
    const col = index - 12; // 0-11
    return {
      x: X_POSITIONS[col],
      z: -BOARD_DEPTH / 2 + 0.5,
      direction: 'down', // triangles point downward (toward center)
    };
  }

  // Bottom row: indices 11-0 (points 12-1), left to right (reversed)
  const col = 11 - index; // index 11 → col 0, index 0 → col 11
  return {
    x: X_POSITIONS[col],
    z: BOARD_DEPTH / 2 - 0.5,
    direction: 'up', // triangles point upward (toward center)
  };
}

/**
 * Get the 3D position for a checker on a given point, at a given stack position.
 * When totalOnPoint is large, spacing compresses so checkers fit within the triangle.
 */
export function getCheckerPosition(
  pointIndex: number,
  stackIndex: number,
  totalOnPoint: number = 5,
): { x: number; y: number; z: number } {
  const point = getPointPosition(pointIndex);
  const y = BOARD_HEIGHT / 2 + CHECKER_HEIGHT / 2 + stackIndex * CHECKER_HEIGHT;

  // Adaptive spacing: compress when many checkers on one point
  const maxStackDistance = BOARD_DEPTH / 2 - 1.6;
  const normalSpacing = CHECKER_RADIUS * 1.8;
  const spacing = totalOnPoint > 1
    ? Math.min(normalSpacing, maxStackDistance / (totalOnPoint - 1))
    : 0;
  const stackOffset = stackIndex * spacing;

  const z = point.direction === 'up'
    ? point.z - stackOffset
    : point.z + stackOffset;

  return { x: point.x, y, z };
}

/**
 * Get the 3D position for a checker on the bar.
 */
export function getBarCheckerPosition(
  player: 'white' | 'black',
  stackIndex: number,
): { x: number; y: number; z: number } {
  const y = BOARD_HEIGHT / 2 + CHECKER_HEIGHT / 2 + stackIndex * CHECKER_HEIGHT;
  const z = player === 'white' ? 1 : -1;
  return { x: 0, y, z };
}

/**
 * Get the 3D position for a checker in the bear-off tray.
 */
export function getBearOffPosition(
  player: 'white' | 'black',
  stackIndex: number,
): { x: number; y: number; z: number } {
  const x = BOARD_WIDTH / 2 + 0.8;
  const y = BOARD_HEIGHT / 2 + stackIndex * CHECKER_HEIGHT * 0.5;
  const z = player === 'white'
    ? BOARD_DEPTH / 2 - 1 - stackIndex * 0.3
    : -BOARD_DEPTH / 2 + 1 + stackIndex * 0.3;
  return { x, y, z };
}

/**
 * Triangle vertices for a point (triangle shape on the board).
 */
export function getTriangleVertices(index: number): [number, number, number][] {
  const point = getPointPosition(index);
  const halfWidth = POINT_WIDTH / 2 - 0.05;
  const length = BOARD_DEPTH / 2 - 1.5;
  const y = BOARD_HEIGHT / 2 + 0.001; // Slightly above board

  if (point.direction === 'down') {
    // Top row: triangle points downward (toward +z / center)
    return [
      [point.x - halfWidth, y, -BOARD_DEPTH / 2 + 0.1],
      [point.x + halfWidth, y, -BOARD_DEPTH / 2 + 0.1],
      [point.x, y, -BOARD_DEPTH / 2 + 0.1 + length],
    ];
  } else {
    // Bottom row: triangle points upward (toward -z / center)
    return [
      [point.x - halfWidth, y, BOARD_DEPTH / 2 - 0.1],
      [point.x + halfWidth, y, BOARD_DEPTH / 2 - 0.1],
      [point.x, y, BOARD_DEPTH / 2 - 0.1 - length],
    ];
  }
}
