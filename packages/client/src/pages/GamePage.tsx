import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createNewGame, gameReducer, getLegalMoves } from '@gennard/game-engine';
import type { GameState, Move } from '@gennard/game-engine';
import { BoardScene } from '../components/three/BoardScene';
import { useTextureLoader } from '../hooks/useTextureLoader';
import { useIsMobile } from '../hooks/useIsMobile';

const FONT = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const TEXT = '#212121';
const TEXT_SEC = '#6E6E6E';
const BORDER = '#E8E8E8';

export function GamePage() {
  const [gameState, setGameState] = useState<GameState>(() => createNewGame('demo'));
  const theme = useTextureLoader();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [selectedChecker, setSelectedChecker] = useState<{
    point: number | 'bar';
    player: 'white' | 'black';
  } | null>(null);

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

  const currentPlayerName = gameState.currentPlayer === 'white'
    ? theme.player1Name
    : theme.player2Name;
  const currentPlayerColor = gameState.currentPlayer === 'white'
    ? theme.colors.player1Accent
    : theme.colors.player2Accent;

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', fontFamily: FONT }}>
      <BoardScene
        gameState={gameState}
        theme={theme}
        highlightedPoints={highlightedPoints}
        selectedChecker={selectedChecker}
        onPointClick={handlePointClick}
        onCheckerClick={handleCheckerClick}
      />

      {/* ── Top left: header + back arrow ──────────────── */}
      <div style={{
        position: 'absolute',
        top: 16,
        left: 16,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 7,
      }}>
        {/* GenNard title */}
        <div style={{
          fontSize: 17,
          fontWeight: 800,
          color: '#FFFFFF',
          letterSpacing: '-0.3px',
          textShadow: '0 1px 8px rgba(0,0,0,0.55)',
          userSelect: 'none',
        }}>
          GenNard
        </div>

        {/* Back arrow button */}
        <button
          onClick={() => navigate('/')}
          title="Back to menu"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '5px 11px 5px 8px',
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(8px)',
            border: `1px solid ${BORDER}`,
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 500,
            color: TEXT,
            fontFamily: FONT,
            boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
          }}
        >
          <IconChevronLeft />
          Back
        </button>
      </div>

      {/* ── Top center: move instructions ─────────────── */}
      {gameState.phase === 'moving' && (
        <div style={{
          position: 'absolute',
          top: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '7px 18px',
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(8px)',
          borderRadius: 50,
          border: `1px solid ${BORDER}`,
          fontSize: 13,
          color: TEXT_SEC,
          whiteSpace: 'nowrap',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          {selectedChecker
            ? 'Click a highlighted point to move'
            : 'Click a checker to select'}
        </div>
      )}

      {/* ── Top right: theme badge ─────────────────────── */}
      {theme.player1Name !== 'White' && !isMobile && (
        <div style={{
          position: 'absolute',
          top: 16,
          right: 16,
          padding: '7px 14px',
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(8px)',
          borderRadius: 50,
          border: `1px solid ${BORDER}`,
          fontSize: 13,
          color: TEXT_SEC,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          <span style={{ color: theme.colors.player1Accent, fontWeight: 500 }}>
            {theme.player1Name}
          </span>
          <span>vs</span>
          <span style={{ color: theme.colors.player2Accent, fontWeight: 500 }}>
            {theme.player2Name}
          </span>
        </div>
      )}

      {/* ── Borne-off: white (left) ────────────────────── */}
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
          padding: '8px 6px',
          background: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(8px)',
          borderRadius: 20,
          border: `1px solid ${BORDER}`,
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          {Array.from({ length: gameState.borneOff.white }, (_, i) => (
            <div key={i} style={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: theme.colors.player1Accent,
              border: '1px solid rgba(0,0,0,0.1)',
            }} />
          ))}
        </div>
      )}

      {/* ── Borne-off: black (right) ───────────────────── */}
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
          padding: '8px 6px',
          background: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(8px)',
          borderRadius: 20,
          border: `1px solid ${BORDER}`,
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          {Array.from({ length: gameState.borneOff.black }, (_, i) => (
            <div key={i} style={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: theme.colors.player2Accent,
              border: '1px solid rgba(0,0,0,0.15)',
            }} />
          ))}
        </div>
      )}

      {/* ── Bottom floating control bar ────────────────── */}
      <div style={{
        position: 'absolute',
        bottom: isMobile ? 16 : 24,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 10,
        padding: isMobile ? '8px 14px' : '10px 18px',
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        borderRadius: 50,
        border: `1px solid ${BORDER}`,
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        maxWidth: isMobile ? 'calc(100vw - 32px)' : undefined,
      }}>

        {gameState.phase === 'game_over' ? (
          <span style={{ fontSize: 15, fontWeight: 600, color: TEXT }}>
            {gameState.winner === 'white' ? theme.player1Name : theme.player2Name} wins!
            {gameState.winType !== 'normal' && (
              <span style={{ fontSize: 12, fontWeight: 400, color: TEXT_SEC, marginLeft: 6 }}>
                ({gameState.winType})
              </span>
            )}
          </span>
        ) : (
          <>
            {/* Current player indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: currentPlayerColor,
                border: '1px solid rgba(0,0,0,0.15)',
                display: 'inline-block',
                flexShrink: 0,
              }} />
              <span style={{ fontSize: 14, color: TEXT, fontWeight: 500 }}>
                {currentPlayerName}
              </span>
            </div>

            {/* Separator */}
            {(gameState.phase === 'rolling' || !!gameState.dice.roll) && (
              <span style={{ width: 1, height: 16, background: BORDER, display: 'block' }} />
            )}

            {/* Roll dice button */}
            {gameState.phase === 'rolling' && (
              <button
                onClick={handleRollDice}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 16px',
                  fontSize: 14,
                  fontWeight: 500,
                  background: TEXT,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 50,
                  cursor: 'pointer',
                  fontFamily: FONT,
                }}
              >
                <IconDice />
                Roll Dice
              </button>
            )}

            {/* Dice value chips */}
            {gameState.dice.roll && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <DieChip value={gameState.dice.roll.die1} />
                <DieChip value={gameState.dice.roll.die2} />
                {gameState.dice.movesRemaining.length > 0 && (
                  <span style={{ fontSize: 12, color: TEXT_SEC, marginLeft: 2 }}>
                    {gameState.dice.movesRemaining.length} left
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────

function DieChip({ value }: { value: number }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 28,
      height: 28,
      borderRadius: 7,
      background: '#212121',
      color: '#fff',
      fontSize: 14,
      fontWeight: 700,
      fontFamily: '"Inter", -apple-system, sans-serif',
    }}>
      {value}
    </span>
  );
}

// ── Icons ─────────────────────────────────────────────────

function IconChevronLeft() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function IconDice() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="3" ry="3" />
      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="15.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}
