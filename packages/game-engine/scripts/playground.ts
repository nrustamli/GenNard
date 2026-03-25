/**
 * Interactive playground to test the game engine manually.
 * Run with: npx tsx playground.ts
 */
import {
  createNewGame,
  applyDiceRoll,
  gameReducer,
  getLegalMoves,
  calculatePipCount,
} from '../src/index.js';

// Create a new game
const game = createNewGame('playground');
console.log('=== New Game Created ===');
console.log('Current player:', game.currentPlayer);
console.log('Phase:', game.phase);
printBoard(game.points);

// Roll dice (3 and 5)
const rolled = applyDiceRoll(game, 3, 5);
console.log('\n=== Rolled 3-5 ===');
console.log('Moves remaining:', rolled.dice.movesRemaining);

// Get legal moves
const moves = getLegalMoves(rolled.points, rolled.bar, rolled.borneOff, 'white', rolled.dice.movesRemaining);
console.log('\nLegal first moves for white:');
for (const move of moves) {
  const from = move.from === 'bar' ? 'BAR' : `pt${(move.from as number) + 1}`;
  const to = move.to === 'off' ? 'OFF' : `pt${(move.to as number) + 1}`;
  console.log(`  ${from} → ${to} (die: ${move.dieUsed})`);
}

// Make a move: pt8(idx7) → pt3(idx2) with die 5
const move1 = moves.find(m => m.from === 7 && m.dieUsed === 5);
if (move1) {
  const afterMove1 = gameReducer(rolled, { type: 'MOVE_CHECKER', player: 'white', move: move1 });
  console.log(`\n=== White moves pt${(move1.from as number) + 1} → pt${(move1.to as number) + 1} (die ${move1.dieUsed}) ===`);
  console.log('Remaining dice:', afterMove1.dice.movesRemaining);
  printBoard(afterMove1.points);

  // Get next legal moves
  const moves2 = getLegalMoves(afterMove1.points, afterMove1.bar, afterMove1.borneOff, 'white', afterMove1.dice.movesRemaining);
  console.log('\nLegal second moves:');
  for (const m of moves2) {
    const from = m.from === 'bar' ? 'BAR' : `pt${(m.from as number) + 1}`;
    const to = m.to === 'off' ? 'OFF' : `pt${(m.to as number) + 1}`;
    console.log(`  ${from} → ${to} (die: ${m.dieUsed})`);
  }
}

// Pip counts
console.log('\n=== Pip Counts ===');
console.log('White:', calculatePipCount(game.points, game.bar, 'white'));
console.log('Black:', calculatePipCount(game.points, game.bar, 'black'));

// --- Helper ---
function printBoard(points: number[]) {
  console.log('\n  13 14 15 16 17 18 | BAR | 19 20 21 22 23 24');
  const top = points.slice(12, 18).map(fmt).join(' ') + '  |     |  ' + points.slice(18, 24).map(fmt).join(' ');
  console.log('  ' + top);
  console.log('  ─────────────────┼─────┼──────────────────');
  const bot = points.slice(6, 12).reverse().map(fmt).join(' ') + '  |     |  ' + points.slice(0, 6).reverse().map(fmt).join(' ');
  console.log('  ' + bot);
  console.log('  12 11 10  9  8  7 | BAR |  6  5  4  3  2  1');
}

function fmt(n: number): string {
  if (n === 0) return ' .';
  if (n > 0) return `W${n}`;
  return `B${Math.abs(n)}`;
}
