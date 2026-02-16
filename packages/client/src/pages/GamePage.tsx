import { useState, useMemo } from 'react';
import { createNewGame, applyDiceRoll, gameReducer, getLegalMoves } from '@gennard/game-engine';
import type { GameState, Move } from '@gennard/game-engine';
import { BoardScene } from '../components/three/BoardScene';

export function GamePage() {
  const [gameState, setGameState] = useState<GameState>(() => createNewGame('demo'));

  const [selectedChecker, setSelectedChecker] = useState<{
    point: number | 'bar';
    player: 'white' | 'black';
  } | null>(null);

  // Calculate legal moves for current selection
  const legalMoves = useMemo(() => {
    if (gameState.phase !== 'moving') return [];
    return getLegalMoves(
      gameState.points,
      gameState.bar,
      gameState.borneOff,
      gameState.currentPlayer,
      gameState.dice.movesRemaining,
    );
  }, [gameState]);

  // Highlighted points = valid destinations for selected checker
  const highlightedPoints = useMemo(() => {
    const set = new Set<number>();
    if (!selectedChecker) return set;

    for (const move of legalMoves) {
      if (move.from === selectedChecker.point && move.to !== 'off') {
        set.add(move.to as number);
      }
    }
    return set;
  }, [selectedChecker, legalMoves]);

  const handleRollDice = () => {
    if (gameState.phase !== 'rolling') return;
    const newState = gameReducer(gameState, {
      type: 'ROLL_DICE',
      player: gameState.currentPlayer,
    });
    setGameState(newState);
    setSelectedChecker(null);
  };

  const handleCheckerClick = (point: number | 'bar', player: 'white' | 'black') => {
    if (gameState.phase !== 'moving') return;
    if (player !== gameState.currentPlayer) return;

    // Check if this checker has any legal moves
    const hasLegalMove = legalMoves.some(m => m.from === point);
    if (!hasLegalMove) return;

    setSelectedChecker({ point, player });
  };

  const handlePointClick = (index: number) => {
    if (!selectedChecker) return;
    if (!highlightedPoints.has(index)) return;

    // Find the matching move
    const move = legalMoves.find(
      m => m.from === selectedChecker.point && m.to === index,
    );
    if (!move) return;

    const newState = gameReducer(gameState, {
      type: 'MOVE_CHECKER',
      player: gameState.currentPlayer,
      move,
    });
    setGameState(newState);
    setSelectedChecker(null);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <BoardScene
        gameState={gameState}
        highlightedPoints={highlightedPoints}
        selectedChecker={selectedChecker}
        onPointClick={handlePointClick}
        onCheckerClick={handleCheckerClick}
      />

      {/* UI Overlay */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 16,
        alignItems: 'center',
      }}>
        {/* Current player indicator */}
        <div style={{
          padding: '8px 16px',
          background: 'rgba(0,0,0,0.7)',
          borderRadius: 8,
          fontSize: 14,
        }}>
          <span style={{
            display: 'inline-block',
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: gameState.currentPlayer === 'white' ? '#f5f5dc' : '#1a1a1a',
            border: '1px solid #666',
            marginRight: 8,
            verticalAlign: 'middle',
          }} />
          {gameState.currentPlayer === 'white' ? 'White' : 'Black'}'s turn
        </div>

        {/* Roll dice button */}
        {gameState.phase === 'rolling' && (
          <button
            onClick={handleRollDice}
            style={{
              padding: '10px 24px',
              fontSize: 16,
              fontWeight: 'bold',
              background: '#D2691E',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            Roll Dice
          </button>
        )}

        {/* Dice display */}
        {gameState.dice.roll && (
          <div style={{
            padding: '8px 16px',
            background: 'rgba(0,0,0,0.7)',
            borderRadius: 8,
            fontSize: 18,
            fontWeight: 'bold',
          }}>
            🎲 {gameState.dice.roll.die1} - {gameState.dice.roll.die2}
            {gameState.dice.movesRemaining.length > 0 && (
              <span style={{ fontSize: 12, marginLeft: 8, opacity: 0.7 }}>
                ({gameState.dice.movesRemaining.join(', ')} left)
              </span>
            )}
          </div>
        )}

        {/* Game over */}
        {gameState.phase === 'game_over' && (
          <div style={{
            padding: '10px 24px',
            background: 'rgba(0,0,0,0.8)',
            borderRadius: 8,
            fontSize: 18,
            fontWeight: 'bold',
            color: '#ffd700',
          }}>
            {gameState.winner === 'white' ? 'White' : 'Black'} wins!
            {gameState.winType !== 'normal' && ` (${gameState.winType})`}
          </div>
        )}
      </div>

      {/* Instructions */}
      {gameState.phase === 'moving' && (
        <div style={{
          position: 'absolute',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '6px 14px',
          background: 'rgba(0,0,0,0.6)',
          borderRadius: 6,
          fontSize: 13,
          opacity: 0.8,
        }}>
          {selectedChecker
            ? 'Click a highlighted point to move'
            : 'Click a checker to select it'}
        </div>
      )}
    </div>
  );
}
