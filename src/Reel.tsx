import React from 'react';
import {
    AbsoluteFill,
    Img,
    Sequence,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
    staticFile,
} from 'remotion';

/* ── Cohort Zero Brand Tokens ───────────────────── */
const ACCENT = '#E11D48';
const BG = '#0A0A0B';
const MUTED = '#9AA3AD';
const FONT = 'Inter, system-ui, -apple-system, sans-serif';

/* ── Film Grain ───────── */
const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.06 }) => {
    const frame = useCurrentFrame();
    const seed = frame % 97;
    return (
        <AbsoluteFill style={{ opacity, mixBlendMode: 'overlay', pointerEvents: 'none' }}>
            <div style={{ width: 480, height: 270, transform: 'scale(4)', transformOrigin: 'top left', imageRendering: 'pixelated' as const }}>
                <svg width={480} height={270}>
                    <filter id="filmgrain">
                        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={seed} stitchTiles="stitch" />
                        <feColorMatrix type="saturate" values="0" />
                    </filter>
                    <rect width={480} height={270} filter="url(#filmgrain)" />
                </svg>
            </div>
        </AbsoluteFill>
    );
};

/* ── Ken Burns background with pulsing/dimming ── */
const KenBurns: React.FC<{ src: string; durationInFrames: number }> = ({ src, durationInFrames }) => {
    const frame = useCurrentFrame();
    const [failed, setFailed] = React.useState(false);
    
    // Slow Ken Burns
    const scale = interpolate(frame, [0, durationInFrames], [1.05, 1.2], { extrapolateRight: 'clamp' });
    const tx = interpolate(frame, [0, durationInFrames], [0, 30], { extrapolateRight: 'clamp' });
    const ty = interpolate(frame, [0, durationInFrames], [0, -20], { extrapolateRight: 'clamp' });
    
    // Subtle breathing pulse for retention
    const pulse = Math.sin(frame / 20) * 0.15; 
    const opacity = 0.45 + pulse;

    if (failed) return null;
    return (
        <AbsoluteFill style={{ backgroundColor: BG }}>
            <Img src={src} onError={() => setFailed(true)} style={{
                width: '100%', height: '100%', objectFit: 'cover',
                transform: `scale(${scale}) translate(${tx}px, ${ty}px)`,
                opacity
            }} />
        </AbsoluteFill>
    );
};

/* ── Logo watermark (small, top-left, always visible) ── */
const LogoWatermark: React.FC = () => {
    const [failed, setFailed] = React.useState(false);
    if (failed) return null;
    return (
        <AbsoluteFill style={{ padding: '50px 0 0 50px', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
            <Img src={staticFile('assets/logo.png')} onError={() => setFailed(true)}
                style={{ height: 55, objectFit: 'contain', opacity: 0.7 }} />
        </AbsoluteFill>
    );
};

/* ── Outro end-card (short, 2.5s) ─── */
const Outro: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps, width } = useVideoConfig();
    const s = spring({ frame, fps, config: { damping: 200 } });
    const y = interpolate(s, [0, 1], [34, 0]);
    const op = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });
    const size = width * 0.045;

    return (
        <AbsoluteFill style={{ backgroundColor: BG, justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ transform: `translateY(${y}px)`, opacity: op, textAlign: 'center' }}>
                <div style={{
                    display: 'inline-block', padding: '16px 38px', borderRadius: 999, background: ACCENT,
                    color: BG, fontWeight: 800, fontSize: size, fontFamily: FONT, letterSpacing: 2,
                }}>
                    ▶ FOLLOW @cohortzero
                </div>
                <div style={{
                    marginTop: 28, color: '#fff', fontWeight: 800, letterSpacing: 4, fontSize: size * 1.2, fontFamily: FONT,
                }}>
                    COHORT ZERO
                </div>
                <div style={{
                    marginTop: 10, color: MUTED, letterSpacing: 3, textTransform: 'uppercase' as const,
                    fontSize: size * 0.45, fontFamily: FONT,
                }}>
                    Founders' Files
                </div>
            </div>
        </AbsoluteFill>
    );
};

/* ── Main Reel: NO INTRO — hook first, outro last ─── */
export const Reel: React.FC<{ scriptData: any }> = ({ scriptData }) => {
    const { fps, width, height, durationInFrames } = useVideoConfig();
    const lines: string[] = scriptData?.script_lines || ['Welcome to Cohort Zero'];

    const OUTRO_FRAMES = 75; // 2.5s outro
    const CONTENT_FRAMES = durationInFrames - OUTRO_FRAMES;
    const framesPerLine = Math.floor(CONTENT_FRAMES / lines.length);

    return (
        <AbsoluteFill style={{ backgroundColor: BG }}>
            {/* ─── MAIN CONTENT (starts immediately — no intro!) ─── */}
            <Sequence from={0} durationInFrames={CONTENT_FRAMES}>
                
                {/* Dynamic Background */}
                <AbsoluteFill>
                    <KenBurns src={staticFile('assets/background.jpg')} durationInFrames={CONTENT_FRAMES} />
                </AbsoluteFill>

                {/* Dark vignette */}
                <AbsoluteFill style={{
                    background: `radial-gradient(ellipse at center, transparent 20%, ${BG} 95%)`,
                }} />

                {/* Lines rendered one at a time */}
                {lines.map((line, i) => {
                    const lineStart = i * framesPerLine;
                    return (
                        <Sequence key={i} from={lineStart} durationInFrames={framesPerLine}>
                            <LineCard text={line} index={i} total={lines.length}
                                width={width} height={height} fps={fps} framesPerLine={framesPerLine} />
                        </Sequence>
                    );
                })}

                {/* Logo watermark */}
                <LogoWatermark />

                {/* Progress dots at the bottom */}
                {lines.map((_, i) => {
                    const lineStart = i * framesPerLine;
                    return (
                        <Sequence key={`dot-${i}`} from={lineStart} durationInFrames={framesPerLine}>
                            <ProgressDots current={i} total={lines.length} width={width} height={height} />
                        </Sequence>
                    );
                })}
            </Sequence>

            {/* ─── OUTRO (short CTA) ─── */}
            <Sequence from={CONTENT_FRAMES} durationInFrames={OUTRO_FRAMES}>
                <Outro />
            </Sequence>

            <Grain />
        </AbsoluteFill>
    );
};

/* ── Line Card with Word-by-Word Reveal ── */
const LineCard: React.FC<{
    text: string; index: number; total: number; width: number; height: number; fps: number; framesPerLine: number;
}> = ({ text, index, total, width, height, fps, framesPerLine }) => {
    const frame = useCurrentFrame();

    const slideIn = spring({ frame, fps, config: { mass: 0.6, damping: 14, stiffness: 120 } });
    const fadeOut = interpolate(frame, [framesPerLine - 10, framesPerLine], [1, 0], {
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    });
    const opacity = fadeOut; // Only fade out at the end, slide-in handles the start
    const translateY = interpolate(slideIn, [0, 1], [40, 0]);

    const isHook = index === 0;
    const fontSize = isHook ? Math.round(width * 0.065) : Math.round(width * 0.048);

    // Split text for word-by-word highlight
    const words = text.split(' ');
    // Reveal a new word every 3 frames (~10 words a second reading speed)
    const framesPerWord = 3; 
    
    return (
        <AbsoluteFill style={{
            justifyContent: 'center', alignItems: 'center',
            padding: '120px 60px 200px 60px',
        }}>
            <div style={{
                opacity,
                transform: `translateY(${translateY}px)`,
                maxWidth: width * 0.88,
                textAlign: 'center',
            }}>
                {/* Accent bar above the hook */}
                {isHook && (
                    <div style={{
                        width: 60 * slideIn, height: 4, backgroundColor: ACCENT,
                        margin: '0 auto 24px', borderRadius: 2, boxShadow: `0 0 20px ${ACCENT}66`,
                    }} />
                )}

                {/* Glassmorphism card for body lines, clean text for hook */}
                <div style={{
                    background: isHook ? 'none' : 'rgba(22, 22, 26, 0.7)',
                    backdropFilter: isHook ? 'none' : 'blur(20px)',
                    WebkitBackdropFilter: isHook ? 'none' : 'blur(20px)',
                    borderRadius: isHook ? 0 : 16,
                    border: isHook ? 'none' : '1px solid rgba(255,255,255,0.06)',
                    padding: isHook ? 0 : '36px 40px',
                }}>
                    <p style={{
                        fontFamily: FONT,
                        fontSize,
                        fontWeight: isHook ? 800 : 600,
                        color: '#f8fafc',
                        margin: 0,
                        lineHeight: 1.35,
                        letterSpacing: isHook ? '-1px' : '-0.3px',
                        textShadow: '0 2px 16px rgba(0,0,0,0.95), 0 0 4px rgba(0,0,0,0.9)',
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        gap: '0.25em'
                    }}>
                        {words.map((word, i) => {
                            // Calculate opacity for word-by-word reveal
                            const wordStartFrame = 10 + (i * framesPerWord); // Start after card slide-in
                            const wordOp = interpolate(
                                frame,
                                [wordStartFrame, wordStartFrame + 2], // 2 frames to fade in
                                [0.3, 1], // Dimmed until read
                                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                            );
                            
                            // Emphasize specific words (numbers, ALL CAPS, or quoted words)
                            const isEmphasized = /^[A-Z0-9$%\-"]+$/.test(word.replace(/[^A-Za-z0-9]/g, '')) && word.length > 2;

                            return (
                                <span key={i} style={{ 
                                    opacity: wordOp,
                                    color: (isEmphasized && wordOp === 1) ? ACCENT : '#f8fafc',
                                    transition: 'color 0.1s'
                                }}>
                                    {word}
                                </span>
                            );
                        })}
                    </p>
                </div>

                {/* Accent underline under hook */}
                {isHook && (
                    <div style={{
                        width: `${slideIn * 40}%`, height: 4, margin: '28px auto 0',
                        backgroundColor: ACCENT, boxShadow: `0 0 20px ${ACCENT}`, borderRadius: 2,
                    }} />
                )}
            </div>
        </AbsoluteFill>
    );
};

/* ── Progress Dots ── */
const ProgressDots: React.FC<{ current: number; total: number; width: number; height: number }> = ({
    current, total, width, height,
}) => {
    return (
        <AbsoluteFill style={{
            justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 80,
        }}>
            <div style={{ display: 'flex', gap: 6 }}>
                {Array.from({ length: total }).map((_, j) => (
                    <div key={j} style={{
                        width: j === current ? 24 : 8, height: 4, borderRadius: 2,
                        backgroundColor: j === current ? ACCENT : 'rgba(255,255,255,0.2)',
                    }} />
                ))}
            </div>
        </AbsoluteFill>
    );
};
