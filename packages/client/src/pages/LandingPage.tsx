import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { StyleMode } from '../../../../shared/themeTypes';
import { useThemeStore } from '../store/themeStore';

const BORDO = '#4c1130';
const BLUE = '#11304c';
const YELLOW = '#fdb73e';

export function LandingPage() {
  const [prompt, setPrompt] = useState('');
  const [styleMode, setStyleMode] = useState<StyleMode>('creative');
  const generate = useThemeStore((s) => s.generate);
  const status = useThemeStore((s) => s.status);
  const error = useThemeStore((s) => s.error);
  const response = useThemeStore((s) => s.response);
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    await generate(prompt.trim(), styleMode);
  };

  const handlePlay = () => {
    navigate('/game');
  };

  const handleSkip = () => {
    navigate('/game');
  };

  const isLoading = status === 'loading';
  const isReady = status === 'ready' && response !== null;

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#eeeeee',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* Aura gradient blobs */}
      <div style={{
        position: 'absolute',
        top: '-20%',
        left: '-10%',
        width: 600,
        height: 600,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${BORDO}18 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-25%',
        right: '-10%',
        width: 700,
        height: 700,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${BLUE}18 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        top: '30%',
        right: '15%',
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${YELLOW}20 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Main layout: left menu + right previews */}
      <div style={{
        display: 'flex',
        gap: 48,
        alignItems: 'center',
        position: 'relative',
      }}>
        {/* Left — menu */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: 360,
        }}>
          <h1 style={{
            fontSize: 56,
            fontWeight: 700,
            color: BORDO,
            marginBottom: 8,
            letterSpacing: '-1px',
          }}>
            GenNard
          </h1>
          <p style={{
            fontSize: 15,
            color: BLUE,
            opacity: 0.7,
            marginBottom: 40,
          }}>
            AI-generated backgammon — type a theme and play
          </p>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            width: '100%',
          }}>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleGenerate()}
              placeholder='Try "Sushi", "Space", "Pirates"...'
              maxLength={200}
              disabled={isLoading}
              style={{
                padding: '14px 16px',
                fontSize: 17,
                borderRadius: 10,
                border: `1.5px solid ${BLUE}22`,
                background: '#ffffff',
                color: BORDO,
                outline: 'none',
                textAlign: 'center',
              }}
            />

            {/* Style mode toggle */}
            <div style={{
              display: 'flex',
              gap: 8,
              justifyContent: 'center',
            }}>
              {(['classic', 'creative'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setStyleMode(mode)}
                  disabled={isLoading}
                  style={{
                    padding: '8px 22px',
                    fontSize: 13,
                    fontWeight: 600,
                    borderRadius: 8,
                    border: styleMode === mode ? 'none' : `1.5px solid ${BLUE}22`,
                    cursor: 'pointer',
                    background: styleMode === mode ? BLUE : 'transparent',
                    color: styleMode === mode ? '#fff' : BLUE,
                    transition: 'all 0.2s',
                  }}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isLoading}
              style={{
                padding: '14px 24px',
                fontSize: 17,
                fontWeight: 700,
                borderRadius: 10,
                border: 'none',
                cursor: prompt.trim() && !isLoading ? 'pointer' : 'not-allowed',
                background: prompt.trim() && !isLoading
                  ? `linear-gradient(135deg, ${BORDO}, ${BLUE})`
                  : '#ccc',
                color: '#fff',
                transition: 'opacity 0.2s',
              }}
            >
              {isLoading ? 'Generating...' : 'Generate'}
            </button>

            {/* Play button — appears after generation */}
            {isReady && (
              <button
                onClick={handlePlay}
                style={{
                  padding: '14px 24px',
                  fontSize: 17,
                  fontWeight: 700,
                  borderRadius: 10,
                  border: 'none',
                  cursor: 'pointer',
                  background: YELLOW,
                  color: BORDO,
                  transition: 'opacity 0.2s',
                }}
              >
                Play
              </button>
            )}

            {/* Skip */}
            <button
              onClick={handleSkip}
              disabled={isLoading}
              style={{
                padding: '10px',
                fontSize: 13,
                background: 'transparent',
                border: `1.5px solid ${BLUE}22`,
                borderRadius: 8,
                color: BLUE,
                opacity: 0.6,
                cursor: 'pointer',
              }}
            >
              Skip — play with default board
            </button>

            {error && (
              <p style={{ color: '#c0392b', textAlign: 'center', fontSize: 13 }}>
                {error}
              </p>
            )}
          </div>
        </div>

        {/* Right — preview boxes */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          width: 240,
        }}>
          {/* White checker preview */}
          <PreviewBox
            label={isReady ? response.player1.themeName : 'White'}
            imageUrl={isReady ? response.player1.checkerImageUrl : null}
            isLoading={isLoading}
            borderColor={BLUE}
          />

          {/* Black checker preview */}
          <PreviewBox
            label={isReady ? response.player2.themeName : 'Black'}
            imageUrl={isReady ? response.player2.checkerImageUrl : null}
            isLoading={isLoading}
            borderColor={BLUE}
          />
        </div>
      </div>
    </div>
  );
}

function PreviewBox({
  label,
  imageUrl,
  isLoading,
  borderColor,
}: {
  label: string;
  imageUrl: string | null;
  isLoading: boolean;
  borderColor: string;
}) {
  return (
    <div style={{
      width: 240,
      height: 200,
      borderRadius: 12,
      border: `1.5px solid ${borderColor}22`,
      background: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={label}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          opacity: 0.4,
        }}>
          {isLoading ? (
            <span style={{ fontSize: 13, color: borderColor }}>Generating...</span>
          ) : (
            <>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                border: `2px dashed ${borderColor}44`,
              }} />
              <span style={{ fontSize: 13, color: borderColor }}>{label}</span>
            </>
          )}
        </div>
      )}
      {imageUrl && (
        <div style={{
          position: 'absolute' as const,
          bottom: 0,
          left: 0,
          right: 0,
          padding: '6px 0',
          textAlign: 'center',
          fontSize: 12,
          fontWeight: 600,
          color: '#fff',
          background: 'rgba(0,0,0,0.45)',
        }}>
          {label}
        </div>
      )}
    </div>
  );
}
