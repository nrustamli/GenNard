import { useState, useMemo } from 'react';
import { createNewGame, gameReducer, getLegalMoves } from '@gennard/game-engine';
import type { GameState, Move } from '@gennard/game-engine';
import { BoardScene } from '../components/three/BoardScene';
import { useTextureLoader } from '../hooks/useTextureLoader';

export function GamePage() {
  const [gameState, setGameState] = useState<GameState>(() => createNewGame('demo'));
  const theme = useTextureLoader();

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

    const hasLegalMove = legalMoves.some((m: Move) => m.from === point);
    if (!hasLegalMove) return;

    setSelectedChecker({ point, player });
  };

  const handlePointClick = (index: number) => {
    if (!selectedChecker) return;
    if (!highlightedPoints.has(index)) return;

    const move = legalMoves.find(
      (m: Move) => m.from === selectedChecker.point && m.to === index,
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
        theme={theme}
        highlightedPoints={highlightedPoints}
        selectedChecker={selectedChecker}
        onPointClick={handlePointClick}
        onCheckerClick={handleCheckerClick}
      />

      {/* White borne-off (left) */}
      {gameState.borneOff.white > 0 && (
        <div style={{
          position: 'absolute',
          left: 16,
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
        }}>
          {Array.from({ length: gameState.borneOff.white }, (_, i) => (
            <div key={i} style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: theme.colors.player1Accent,
              border: '1.5px solid #aaa',
            }} />
          ))}
        </div>
      )}

      {/* Black borne-off (right) */}
      {gameState.borneOff.black > 0 && (
        <div style={{
          position: 'absolute',
          right: 16,
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
        }}>
          {Array.from({ length: gameState.borneOff.black }, (_, i) => (
            <div key={i} style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: theme.colors.player2Accent,
              border: '1.5px solid #666',
            }} />
          ))}
        </div>
      )}

      {/* Theme info */}
      {theme.player1Name !== 'White' && (
        <div style={{
          position: 'absolute',
          top: 20,
          right: 20,
          padding: '8px 14px',
          background: 'rgba(255,255,255,0.85)',
          borderRadius: 8,
          fontSize: 14,
          color: '#333',
        }}>
          <span style={{ color: theme.colors.player1Accent }}>{theme.player1Name}</span>
          {' vs '}
          <span style={{ color: theme.colors.player2Accent }}>{theme.player2Name}</span>
        </div>
      )}

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
          background: 'rgba(255,255,255,0.85)',
          borderRadius: 8,
          fontSize: 14,
          color: '#333',
        }}>
          <span style={{
            display: 'inline-block',
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: gameState.currentPlayer === 'white'
              ? theme.colors.player1Accent
              : theme.colors.player2Accent,
            border: '1px solid #666',
            marginRight: 8,
            verticalAlign: 'middle',
          }} />
          {gameState.currentPlayer === 'white' ? theme.player1Name : theme.player2Name}'s turn
        </div>

        {/* Roll dice button */}
        {gameState.phase === 'rolling' && (
          <button
            onClick={handleRollDice}
            style={{
              padding: '10px 24px',
              fontSize: 16,
              fontWeight: 'bold',
              background: '#e63946',
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
            background: 'rgba(255,255,255,0.85)',
            borderRadius: 8,
            fontSize: 18,
            fontWeight: 'bold',
            color: '#333',
          }}>
            {gameState.dice.roll.die1} - {gameState.dice.roll.die2}
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
            background: 'rgba(255,255,255,0.9)',
            borderRadius: 8,
            fontSize: 18,
            fontWeight: 'bold',
            color: '#694934',
          }}>
            {gameState.winner === 'white' ? theme.player1Name : theme.player2Name} wins!
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
          background: 'rgba(255,255,255,0.85)',
          borderRadius: 6,
          fontSize: 13,
          color: '#555',
        }}>
          {selectedChecker
            ? 'Click a highlighted point to move'
            : 'Click a checker to select it'}
        </div>
      )}
    </div>
  );
}
