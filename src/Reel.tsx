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

    if (failed) {
        // Fallback to static background if specific one fails
        return <AbsoluteFill style={{ backgroundColor: BG }}><Img src={staticFile('assets/background.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', opacity}} /></AbsoluteFill>;
    }
    
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

/* ── Animated Chart Overlay ── */
const AnimatedChart: React.FC<{ data: any; fps: number }> = ({ data, fps }) => {
    const frame = useCurrentFrame();
    if (!data || !data.labels || !data.values) return null;

    const maxVal = Math.max(...data.values);
    
    const containerSlide = spring({ frame, fps, config: { mass: 0.6, damping: 14, stiffness: 120 } });
    
    return (
        <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 220, pointerEvents: 'none' }}>
            <div style={{
                width: '80%',
                background: 'rgba(10, 10, 11, 0.8)',
                backdropFilter: 'blur(10px)',
                borderRadius: 16,
                padding: '24px 32px',
                border: '1px solid rgba(255,255,255,0.05)',
                transform: `translateY(${interpolate(containerSlide, [0, 1], [40, 0])}px)`,
                opacity: containerSlide,
                display: 'flex',
                flexDirection: 'column',
                gap: 16
            }}>
                <div style={{ color: MUTED, fontSize: 18, fontWeight: 700, fontFamily: FONT, letterSpacing: 1, textTransform: 'uppercase' }}>
                    {data.title || "Data"}
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', height: 120, gap: 16 }}>
                    {data.values.map((val: number, i: number) => {
                        const barAnim = spring({ frame: frame - 10 - (i * 5), fps, config: { damping: 12 } });
                        const barHeight = interpolate(barAnim, [0, 1], [0, (val / maxVal) * 100]);
                        return (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                                <div style={{ color: '#fff', fontWeight: 800, fontSize: 24, fontFamily: FONT, opacity: barAnim }}>
                                    {val}
                                </div>
                                <div style={{
                                    width: '100%',
                                    height: `${barHeight}%`,
                                    background: ACCENT,
                                    borderRadius: 4,
                                    boxShadow: `0 0 15px ${ACCENT}40`
                                }} />
                                <div style={{ color: MUTED, fontSize: 16, fontFamily: FONT, fontWeight: 600 }}>
                                    {data.labels[i]}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
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
                    marginTop: 10, color: MUTED, letterSpacing: 3, textTransform: 'uppercase',
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
    
    // Fallback to legacy script_lines if slides don't exist
    let slides = scriptData?.slides;
    if (!slides && scriptData?.script_lines) {
        slides = scriptData.script_lines.map((line: string, i: number) => ({
            type: i === 0 ? "hook" : "text",
            content: line
        }));
    } else if (!slides) {
        slides = [{ type: "hook", content: "Welcome to Cohort Zero" }];
    }

    const OUTRO_FRAMES = 75; // 2.5s outro
    const CONTENT_FRAMES = durationInFrames - OUTRO_FRAMES;
    const framesPerLine = Math.floor(CONTENT_FRAMES / slides.length);

    return (
        <AbsoluteFill style={{ backgroundColor: BG }}>
            {/* ─── MAIN CONTENT (starts immediately — no intro!) ─── */}
            <Sequence from={0} durationInFrames={CONTENT_FRAMES}>
                
                {/* 1. Multi-Scene Dynamic Backgrounds */}
                {slides.map((_: any, i: number) => {
                    const lineStart = i * framesPerLine;
                    return (
                        <Sequence key={`bg-${i}`} from={lineStart} durationInFrames={framesPerLine}>
                            <KenBurns src={staticFile(`assets/bg_${i}.jpg`)} durationInFrames={framesPerLine} />
                        </Sequence>
                    );
                })}

                {/* Dark vignette */}
                <AbsoluteFill style={{
                    background: `radial-gradient(ellipse at center, transparent 20%, ${BG} 95%)`,
                }} />

                {/* 2. Text Content */}
                {slides.map((slide: any, i: number) => {
                    const lineStart = i * framesPerLine;
                    return (
                        <Sequence key={`text-${i}`} from={lineStart} durationInFrames={framesPerLine}>
                            <LineCard text={slide.content} type={slide.type} stat={slide.highlight_number} author={slide.author}
                                index={i} width={width} height={height} fps={fps} framesPerLine={framesPerLine} />
                        </Sequence>
                    );
                })}
                
                {/* 3. Auto-Generated Chart (Show on the last non-hook slide if available) */}
                {scriptData?.chart_data && (
                    <Sequence from={(slides.length - 1) * framesPerLine} durationInFrames={framesPerLine}>
                        <AnimatedChart data={scriptData.chart_data} fps={fps} />
                    </Sequence>
                )}

                {/* Logo watermark */}
                <LogoWatermark />

                {/* Progress dots at the bottom */}
                {slides.map((_: any, i: number) => {
                    const lineStart = i * framesPerLine;
                    return (
                        <Sequence key={`dot-${i}`} from={lineStart} durationInFrames={framesPerLine}>
                            <ProgressDots current={i} total={slides.length} width={width} height={height} />
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
    text: string; type: string; stat?: string; author?: string; index: number; width: number; height: number; fps: number; framesPerLine: number;
}> = ({ text, type, stat, author, index, width, height, fps, framesPerLine }) => {
    const frame = useCurrentFrame();

    const slideIn = spring({ frame, fps, config: { mass: 0.6, damping: 14, stiffness: 120 } });
    const fadeOut = interpolate(frame, [framesPerLine - 10, framesPerLine], [1, 0], {
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    });
    const opacity = fadeOut;
    const translateY = interpolate(slideIn, [0, 1], [40, 0]);

    const isHook = type === 'hook' || index === 0;
    const fontSize = isHook ? Math.round(width * 0.065) : Math.round(width * 0.048);

    const words = text.split(' ');
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
                {/* Hook Accent */}
                {isHook && (
                    <div style={{
                        width: 60 * slideIn, height: 4, backgroundColor: ACCENT,
                        margin: '0 auto 24px', borderRadius: 2, boxShadow: `0 0 20px ${ACCENT}66`,
                    }} />
                )}

                {/* Stat Highlight */}
                {type === 'stat' && stat && (
                    <div style={{ color: ACCENT, fontSize: width * 0.12, fontWeight: 900, fontFamily: FONT, letterSpacing: -2, marginBottom: 16 }}>
                        {stat}
                    </div>
                )}
                
                {/* Quote marks */}
                {type === 'quote' && (
                    <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: width * 0.15, fontWeight: 900, fontFamily: FONT, lineHeight: 0.5, marginBottom: 10 }}>
                        "
                    </div>
                )}

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
                        fontStyle: type === 'quote' ? 'italic' : 'normal',
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
                            const wordStartFrame = 10 + (i * framesPerWord);
                            const wordOp = interpolate(
                                frame,
                                [wordStartFrame, wordStartFrame + 2],
                                [0.3, 1],
                                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                            );
                            
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
                    
                    {/* Quote Author */}
                    {type === 'quote' && author && (
                        <div style={{ marginTop: 24, color: MUTED, fontSize: width * 0.04, fontWeight: 700, fontFamily: FONT }}>
                            — {author}
                        </div>
                    )}
                </div>

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
