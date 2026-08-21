import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';

/* ── Brand Tokens ───────────────── */
const BG = '#0A0A0B';
const SURFACE = '#16161A';
const MUTED = '#71767B';
const TEXT_PRIMARY = '#E7E9EA';
const TEXT_SECONDARY = '#9AA3AD';
const ACCENT = '#1D9BF0'; // Subtle blue for highlights
const FONT = 'Inter, system-ui, -apple-system, sans-serif';

/* ── Subtle Noise Grain ── */
const Grain: React.FC = () => (
    <AbsoluteFill style={{ opacity: 0.05, mixBlendMode: 'overlay', pointerEvents: 'none' }}>
        <div style={{ width: 480, height: 480, transform: 'scale(3)', transformOrigin: 'top left', imageRendering: 'pixelated' as const }}>
            <svg width={480} height={480}>
                <filter id="tweetgrain">
                    <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={42} stitchTiles="stitch" />
                    <feColorMatrix type="saturate" values="0" />
                </filter>
                <rect width={480} height={480} filter="url(#tweetgrain)" />
            </svg>
        </div>
    </AbsoluteFill>
);

export const TweetCard: React.FC<{
    tweetData: {
        displayName: string;
        username: string;
        tweet: string;
        avatarFile: string;
        verified: boolean;
    };
}> = ({ tweetData }) => {
    const { displayName, username, tweet, avatarFile } = tweetData;

    // Calculate font size based on text length to keep it perfectly balanced
    const tweetLen = tweet.length;
    let fontSize = 48;
    let lineHeight = 1.35;
    
    if (tweetLen > 220) {
        fontSize = 38;
    } else if (tweetLen > 150) {
        fontSize = 42;
    } else if (tweetLen < 80) {
        fontSize = 56;
        lineHeight = 1.25;
    }

    return (
        <AbsoluteFill style={{ backgroundColor: BG }}>
            {/* Background Glow Effect */}
            <AbsoluteFill style={{
                background: `radial-gradient(circle at 80% 20%, rgba(29, 155, 240, 0.15) 0%, transparent 50%)`,
            }} />
            <AbsoluteFill style={{
                background: `radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.03) 0%, transparent 50%)`,
            }} />

            {/* Main Content Area */}
            <AbsoluteFill style={{
                padding: '100px 90px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
            }}>
                
                {/* Decorative Quote Mark / Accent Line */}
                <div style={{
                    width: 60,
                    height: 6,
                    backgroundColor: ACCENT,
                    borderRadius: 4,
                    marginBottom: 40,
                    opacity: 0.8,
                }} />

                {/* The Core Insight / Text (The Hero) */}
                <div style={{
                    color: TEXT_PRIMARY,
                    fontSize,
                    fontFamily: FONT,
                    fontWeight: 500,
                    lineHeight,
                    letterSpacing: '-0.5px',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    flexGrow: 1,
                    display: 'flex',
                    alignItems: 'center',
                }}>
                    <div>{tweet}</div>
                </div>

                {/* Separator Line */}
                <div style={{
                    width: '100%',
                    height: 1,
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    marginTop: 40,
                    marginBottom: 40,
                }} />

                {/* Creator Byline (Footer branding) */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 20,
                }}>
                    {/* Avatar */}
                    <div style={{
                        width: 68,
                        height: 68,
                        borderRadius: '50%',
                        overflow: 'hidden',
                        flexShrink: 0,
                        border: '2px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                    }}>
                        <Img
                            src={staticFile(`assets/${avatarFile}`)}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }}
                        />
                    </div>

                    {/* Name + Handle */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{
                            color: TEXT_PRIMARY,
                            fontSize: 24,
                            fontWeight: 700,
                            fontFamily: FONT,
                            letterSpacing: '-0.3px',
                        }}>
                            {displayName}
                        </span>
                        <span style={{
                            color: TEXT_SECONDARY,
                            fontSize: 18,
                            fontFamily: FONT,
                            fontWeight: 400,
                            letterSpacing: '0.5px',
                            textTransform: 'uppercase',
                        }}>
                            {username.replace('@', '')}
                        </span>
                    </div>
                </div>

            </AbsoluteFill>

            {/* Premium Film Grain */}
            <Grain />
        </AbsoluteFill>
    );
};
