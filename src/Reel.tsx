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
const SURFACE = '#16161A';
const MUTED = '#9AA3AD';
const FONT = 'Inter, system-ui, -apple-system, sans-serif';

/* ── Film Grain (from Youtube_Automation) ───────── */
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

/* ── Ken Burns background (slow pan/zoom like Youtube_Automation) ── */
const KenBurns: React.FC<{ src: string; durationInFrames: number }> = ({ src, durationInFrames }) => {
    const frame = useCurrentFrame();
    const [failed, setFailed] = React.useState(false);
    const scale = interpolate(frame, [0, durationInFrames], [1.05, 1.2], { extrapolateRight: 'clamp' });
    const tx = interpolate(frame, [0, durationInFrames], [0, 30], { extrapolateRight: 'clamp' });
    const ty = interpolate(frame, [0, durationInFrames], [0, -20], { extrapolateRight: 'clamp' });
    if (failed) return null;
    return (
        <AbsoluteFill>
            <Img
                src={src}
                onError={() => setFailed(true)}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: `scale(${scale}) translate(${tx}px, ${ty}px)`,
                }}
            />
        </AbsoluteFill>
    );
};

/* ── Intro sting (brand name scales in + accent underline) ─── */
const Intro: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps, width } = useVideoConfig();
    const s = spring({ frame, fps, config: { damping: 200 } });
    const scale = interpolate(s, [0, 1], [0.82, 1]);
    const opacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: 'clamp' });
    const underline = interpolate(s, [0, 1], [0, 1]);
    const size = width * 0.09;

    return (
        <AbsoluteFill style={{ backgroundColor: BG, justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ transform: `scale(${scale})`, opacity, textAlign: 'center' }}>
                <div style={{ fontFamily: FONT, fontWeight: 800, letterSpacing: 4, fontSize: size, color: '#fff' }}>
                    COHORT ZERO
                </div>
                <div style={{
                    height: 5, marginTop: 16, width: width * 0.35, marginLeft: 'auto', marginRight: 'auto',
                    background: ACCENT, transform: `scaleX(${underline})`, transformOrigin: 'center', borderRadius: 4,
                }} />
                <div style={{
                    marginTop: 16, color: MUTED, fontFamily: FONT, fontWeight: 500, letterSpacing: 4,
                    textTransform: 'uppercase' as const, fontSize: size * 0.2,
                }}>
                    FOUNDERS' FILES
                </div>
            </div>
        </AbsoluteFill>
    );
};

/* ── Outro end-card (follow CTA + brand) ─── */
const Outro: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps, width } = useVideoConfig();
    const s = spring({ frame, fps, config: { damping: 200 } });
    const y = interpolate(s, [0, 1], [34, 0]);
    const op = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });
    const size = width * 0.05;

    return (
        <AbsoluteFill style={{ backgroundColor: BG, justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ transform: `translateY(${y}px)`, opacity: op, textAlign: 'center' }}>
                <div style={{
                    display: 'inline-block', padding: '18px 42px', borderRadius: 999, background: ACCENT,
                    color: BG, fontWeight: 800, fontSize: size, fontFamily: FONT, letterSpacing: 2,
                }}>
                    ▶ FOLLOW
                </div>
                <div style={{
                    marginTop: 34, color: '#fff', fontWeight: 800, letterSpacing: 4, fontSize: size * 1.3, fontFamily: FONT,
                }}>
                    COHORT ZERO
                </div>
                <div style={{
                    marginTop: 14, color: MUTED, letterSpacing: 3, textTransform: 'uppercase' as const, fontSize: size * 0.5, fontFamily: FONT,
                }}>
                    @cohortzero
                </div>
            </div>
        </AbsoluteFill>
    );
};

/* ── The main Reel component (professional template) ─── */
export const Reel: React.FC<{ scriptData: any }> = ({ scriptData }) => {
    const { fps, width, height, durationInFrames } = useVideoConfig();
    const frame = useCurrentFrame();
    const lines: string[] = scriptData?.script_lines || ['Welcome to Cohort Zero'];

    const INTRO_FRAMES = 60;  // 2s intro
    const OUTRO_FRAMES = 90;  // 3s outro
    const CONTENT_FRAMES = durationInFrames - INTRO_FRAMES - OUTRO_FRAMES;
    const framesPerLine = Math.floor(CONTENT_FRAMES / lines.length);

    return (
        <AbsoluteFill style={{ backgroundColor: BG }}>
            {/* ─── INTRO ─── */}
            <Sequence from={0} durationInFrames={INTRO_FRAMES}>
                <Intro />
            </Sequence>

            {/* ─── MAIN CONTENT ─── */}
            <Sequence from={INTRO_FRAMES} durationInFrames={CONTENT_FRAMES}>
                {/* Background: AI image with Ken Burns pan */}
                <AbsoluteFill style={{ opacity: 0.45 }}>
                    <KenBurns src={staticFile('assets/background.jpg')} durationInFrames={CONTENT_FRAMES} />
                </AbsoluteFill>

                {/* Dark vignette over the background */}
                <AbsoluteFill style={{
                    background: `radial-gradient(ellipse at center, transparent 30%, ${BG} 100%)`,
                }} />

                {/* Lines rendered one at a time with fade transitions */}
                {lines.map((line, i) => {
                    const lineStart = i * framesPerLine;
                    return (
                        <Sequence key={i} from={lineStart} durationInFrames={framesPerLine}>
                            <LineCard
                                text={line}
                                index={i}
                                total={lines.length}
                                width={width}
                                height={height}
                                fps={fps}
                                framesPerLine={framesPerLine}
                            />
                        </Sequence>
                    );
                })}

                {/* Logo watermark at top center */}
                <AbsoluteFill style={{ padding: 50, justifyContent: 'flex-start', alignItems: 'center' }}>
                    <LogoWatermark />
                </AbsoluteFill>
            </Sequence>

            {/* ─── OUTRO ─── */}
            <Sequence from={INTRO_FRAMES + CONTENT_FRAMES} durationInFrames={OUTRO_FRAMES}>
                <Outro />
            </Sequence>

            {/* Film grain over everything */}
            <Grain />
        </AbsoluteFill>
    );
};

/* ── A single line card with glassmorphism + slide-in animation ── */
const LineCard: React.FC<{
    text: string; index: number; total: number; width: number; height: number; fps: number; framesPerLine: number;
}> = ({ text, index, total, width, height, fps, framesPerLine }) => {
    const frame = useCurrentFrame();

    const slideIn = spring({ frame, fps, config: { mass: 0.6, damping: 14, stiffness: 120 } });
    const fadeOut = interpolate(frame, [framesPerLine - 12, framesPerLine], [1, 0], {
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    });
    const fadeIn = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });
    const opacity = Math.min(fadeIn, fadeOut);

    const floatY = Math.sin(frame / 20) * 4;
    const translateY = interpolate(slideIn, [0, 1], [60, 0]);

    const fontSize = Math.round(width * 0.048);
    const isTitle = index === 0;
    const isLast = index === total - 1;

    // Place text at bottom-third (like a proper lower-third) for body lines,
    // center for the first hook line
    const justify = isTitle ? 'center' : 'flex-end';
    const paddingBottom = isTitle ? 0 : 200;

    return (
        <AbsoluteFill style={{
            justifyContent: justify,
            alignItems: 'center',
            padding: `80px 60px ${paddingBottom}px 60px`,
        }}>
            <div style={{
                opacity,
                transform: `translateY(${translateY + floatY}px)`,
                maxWidth: width * 0.88,
                textAlign: isTitle ? 'center' : 'left',
            }}>
                {/* Accent kicker line for the first card */}
                {isTitle && (
                    <div style={{
                        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, marginBottom: 20,
                    }}>
                        <div style={{ height: 2, width: 44 * slideIn, backgroundColor: ACCENT }} />
                        <span style={{
                            fontFamily: FONT, fontSize: Math.round(fontSize * 0.35), fontWeight: 700,
                            letterSpacing: 4, textTransform: 'uppercase' as const, color: ACCENT, opacity: slideIn,
                        }}>
                            BREAKING NEWS
                        </span>
                        <div style={{ height: 2, width: 44 * slideIn, backgroundColor: ACCENT }} />
                    </div>
                )}

                {/* The card body — glassmorphism panel */}
                <div style={{
                    background: isTitle ? 'none' : 'rgba(22, 22, 26, 0.75)',
                    backdropFilter: isTitle ? 'none' : 'blur(24px)',
                    WebkitBackdropFilter: isTitle ? 'none' : 'blur(24px)',
                    borderRadius: isTitle ? 0 : 20,
                    border: isTitle ? 'none' : `1px solid rgba(255,255,255,0.08)`,
                    padding: isTitle ? 0 : '40px 44px',
                }}>
                    <p style={{
                        fontFamily: FONT,
                        fontSize: isTitle ? Math.round(fontSize * 1.6) : fontSize,
                        fontWeight: isTitle ? 800 : 600,
                        color: '#f8fafc',
                        margin: 0,
                        lineHeight: 1.35,
                        letterSpacing: isTitle ? '-1px' : '-0.5px',
                        textShadow: '0 2px 12px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.95)',
                    }}>
                        {text}
                    </p>
                </div>

                {/* Accent underline for title */}
                {isTitle && (
                    <div style={{
                        height: 5, width: `${slideIn * 50}%`, margin: '30px auto 0',
                        backgroundColor: ACCENT, boxShadow: `0 0 26px ${ACCENT}`, borderRadius: 4,
                    }} />
                )}

                {/* Subtle line counter for body cards */}
                {!isTitle && !isLast && (
                    <div style={{
                        display: 'flex', gap: 6, marginTop: 16, justifyContent: 'flex-start',
                    }}>
                        {Array.from({ length: total - 1 }).map((_, j) => (
                            <div key={j} style={{
                                width: j === index ? 28 : 8, height: 4, borderRadius: 2,
                                backgroundColor: j === index ? ACCENT : 'rgba(255,255,255,0.2)',
                                transition: 'width 0.3s',
                            }} />
                        ))}
                    </div>
                )}
            </div>
        </AbsoluteFill>
    );
};

/* ── Logo watermark at top ── */
const LogoWatermark: React.FC = () => {
    const [failed, setFailed] = React.useState(false);
    if (failed) return null;
    return (
        <Img
            src={staticFile('assets/logo.png')}
            onError={() => setFailed(true)}
            style={{ height: 70, objectFit: 'contain', opacity: 0.85 }}
        />
    );
};
