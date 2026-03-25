import { useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { StyleMode } from '../../../shared/themeTypes';
import { useThemeStore } from '../store/themeStore';
import { useIsMobile } from '../hooks/useIsMobile';

// ── Design tokens ─────────────────────────────────────────
const FONT = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const RED = '#DC2626';             // Primary action
const ORANGE = '#F97316';          // Play Now accent
const TEXT = '#000000';
const TEXT_SEC = '#555555';
const LABEL = '#888888';
const INPUT_BORDER = '#E0E0E0';
const CARD_SHADOW = '0 6px 32px rgba(0,0,0,0.11), 0 2px 8px rgba(0,0,0,0.07)';

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

  const handlePlay = () => navigate('/game');
  const handleSkip = () => navigate('/game');

  const isMobile = useIsMobile();
  const isLoading = status === 'loading';
  const isReady = status === 'ready' && response !== null;
  const canGenerate = !!prompt.trim() && !isLoading;

  const promptSummary = prompt.trim()
    ? `Generate a ${styleMode} backgammon board theme inspired by "${prompt.trim()}". Design unique checker textures, board colors, and player names that evoke this theme.`
    : 'Type a theme above — your full prompt will appear here.';

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: isMobile ? 'flex-start' : 'center',
      fontFamily: FONT,
      overflow: 'auto',
      padding: isMobile ? '24px 16px' : '32px 24px',
      boxSizing: 'border-box',
      /* White base with soft red/orange abstract blur */
      background: `
        radial-gradient(ellipse at 10% 18%, rgba(255, 100, 50, 0.22) 0%, transparent 44%),
        radial-gradient(ellipse at 88% 80%, rgba(220, 38, 38, 0.18) 0%, transparent 44%),
        radial-gradient(ellipse at 80% 10%, rgba(251, 146, 60, 0.16) 0%, transparent 40%),
        radial-gradient(ellipse at 24% 85%, rgba(249, 115, 22, 0.13) 0%, transparent 38%),
        #FFFFFF
      `,
    }}>

      {/* ── Title ────────────────────────────────────────── */}
      <div style={{ textAlign: 'center', marginBottom: isMobile ? 20 : 32 }}>
        <h1
          onClick={() => window.location.reload()}
          style={{
            fontSize: 36,
            fontWeight: 800,
            color: TEXT,
            margin: 0,
            letterSpacing: '-0.5px',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          GenNard
        </h1>
        <p style={{
          fontSize: 15,
          color: TEXT_SEC,
          margin: '8px 0 0',
        }}>
          AI-powered backgammon theme generator
        </p>
      </div>

      {/* ── Two-pane workspace ────────────────────────────── */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 16 : 20,
        alignItems: 'flex-start',
        width: '100%',
        maxWidth: isMobile ? '100%' : 920,
      }}>

        {/* ── Left card: Designer ─────────────────────────── */}
        <div style={{
          flex: isMobile ? '1 1 auto' : '0 0 400px',
          width: isMobile ? '100%' : undefined,
          background: '#FFFFFF',
          borderRadius: 10,
          boxShadow: CARD_SHADOW,
          padding: '28px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: TEXT, margin: 0 }}>
            Designer
          </h2>

          {/* THEME */}
          <Field label="THEME">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && canGenerate && handleGenerate()}
              placeholder='e.g. "Sushi", "Space", "Pirates"'
              maxLength={200}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: 14,
                color: TEXT,
                background: '#FAFAFA',
                border: `1px solid ${INPUT_BORDER}`,
                borderRadius: 4,
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: FONT,
              }}
            />
          </Field>

          {/* STYLE */}
          <Field label="STYLE">
            <div style={{
              display: 'flex',
              border: `1px solid ${INPUT_BORDER}`,
              borderRadius: 4,
              overflow: 'hidden',
            }}>
              {(['classic', 'creative'] as const).map((mode, i) => (
                <button
                  key={mode}
                  onClick={() => setStyleMode(mode)}
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: 'none',
                    borderRight: i === 0 ? `1px solid ${INPUT_BORDER}` : 'none',
                    background: styleMode === mode ? RED : 'transparent',
                    color: styleMode === mode ? '#fff' : TEXT_SEC,
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: styleMode === mode ? 600 : 400,
                    fontFamily: FONT,
                    transition: 'all 0.15s',
                  }}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </Field>

          {/* PROMPT summary */}
          <Field label="PROMPT">
            <textarea
              readOnly
              value={promptSummary}
              rows={4}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: 13,
                color: prompt.trim() ? TEXT : LABEL,
                background: '#FAFAFA',
                border: `1px solid ${INPUT_BORDER}`,
                borderRadius: 4,
                resize: 'none',
                boxSizing: 'border-box',
                fontFamily: FONT,
                lineHeight: 1.65,
                outline: 'none',
              }}
            />
          </Field>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            style={{
              width: '100%',
              padding: '13px',
              fontSize: 15,
              fontWeight: 700,
              color: '#fff',
              background: canGenerate ? RED : '#C5CDD8',
              border: 'none',
              borderRadius: 4,
              cursor: canGenerate ? 'pointer' : 'not-allowed',
              fontFamily: FONT,
              letterSpacing: '0.02em',
              transition: 'background 0.2s',
            }}
          >
            {isLoading ? 'Generating...' : 'Generate'}
          </button>

          {/* Play Now button — white with bold orange stroke */}
          {isReady && (
            <button
              onClick={handlePlay}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: 15,
                fontWeight: 700,
                color: ORANGE,
                background: '#FFFFFF',
                border: `2.5px solid ${ORANGE}`,
                borderRadius: 4,
                cursor: 'pointer',
                fontFamily: FONT,
                letterSpacing: '0.02em',
              }}
            >
              ▶ Play Now
            </button>
          )}

          {/* Skip */}
          <button
            onClick={handleSkip}
            disabled={isLoading}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              color: LABEL,
              fontFamily: FONT,
              textDecoration: 'underline',
              padding: 0,
              textAlign: 'center',
            }}
          >
            Skip — play with default board
          </button>

          {error && (
            <p style={{ color: '#EF4444', fontSize: 13, margin: 0, textAlign: 'center' }}>
              {error}
            </p>
          )}
        </div>

        {/* ── Right card: Preview ──────────────────────────── */}
        <div style={{
          flex: 1,
          background: '#FFFFFF',
          borderRadius: 10,
          boxShadow: CARD_SHADOW,
          padding: '28px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: TEXT, margin: 0 }}>
            Preview
          </h2>

          <PreviewBox
            label={isReady ? response.player1.themeName : 'Player 1'}
            imageUrl={isReady ? response.player1.checkerImageUrl : null}
            isLoading={isLoading}
          />
          <PreviewBox
            label={isReady ? response.player2.themeName : 'Player 2'}
            imageUrl={isReady ? response.player2.checkerImageUrl : null}
            isLoading={isLoading}
          />
        </div>

      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{
        fontSize: 11,
        fontWeight: 700,
        color: '#888888',
        letterSpacing: '0.10em',
        textTransform: 'uppercase',
        fontFamily: '"Inter", -apple-system, sans-serif',
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function PreviewBox({
  label,
  imageUrl,
  isLoading,
}: {
  label: string;
  imageUrl: string | null;
  isLoading: boolean;
}) {
  return (
    <div style={{
      height: 148,
      borderRadius: 6,
      border: `1px solid #E0E0E0`,
      background: '#FAFAFA',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {imageUrl ? (
        <>
          <img
            src={imageUrl}
            alt={label}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '8px 12px',
            textAlign: 'center',
            fontSize: 13,
            fontWeight: 700,
            color: '#fff',
            background: 'rgba(0,0,0,0.50)',
            backdropFilter: 'blur(4px)',
          }}>
            {label}
          </div>
        </>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
          opacity: 0.4,
        }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            border: '2px dashed #AAAAAA',
          }} />
          <span style={{ fontSize: 13, color: '#888', fontFamily: '"Inter", sans-serif' }}>
            {isLoading ? 'Generating...' : label}
          </span>
        </div>
      )}
    </div>
  );
}
