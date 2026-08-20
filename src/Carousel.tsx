import React from 'react';
import { AbsoluteFill, Img, useCurrentFrame, staticFile } from 'remotion';

/* ── Cohort Zero Brand Tokens ───────────────────── */
const ACCENT = '#E11D48';
const BG = '#0A0A0B';
const MUTED = '#9AA3AD';
const FONT = 'Inter, system-ui, -apple-system, sans-serif';

/* ── Animated Chart Overlay (Static Version) ── */
const StaticChart: React.FC<{ data: any }> = ({ data }) => {
    if (!data || !data.labels || !data.values) return null;
    const maxVal = Math.max(...data.values);
    
    return (
        <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 220 }}>
            <div style={{
                width: '80%',
                background: 'rgba(10, 10, 11, 0.8)',
                backdropFilter: 'blur(10px)',
                borderRadius: 16,
                padding: '24px 32px',
                border: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: 16
            }}>
                <div style={{ color: MUTED, fontSize: 22, fontWeight: 700, fontFamily: FONT, letterSpacing: 1, textTransform: 'uppercase' }}>
                    {data.title || "Data"}
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', height: 200, gap: 16 }}>
                    {data.values.map((val: number, i: number) => {
                        const barHeight = (val / maxVal) * 100;
                        return (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                                <div style={{ color: '#fff', fontWeight: 800, fontSize: 32, fontFamily: FONT }}>
                                    {val}
                                </div>
                                <div style={{
                                    width: '100%',
                                    height: `${barHeight}%`,
                                    background: ACCENT,
                                    borderRadius: 4,
                                    boxShadow: `0 0 15px ${ACCENT}40`
                                }} />
                                <div style={{ color: MUTED, fontSize: 20, fontFamily: FONT, fontWeight: 600 }}>
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

/* ── Main Carousel Composition ─── */
export const Carousel: React.FC<{ scriptData: any }> = ({ scriptData }) => {
    const frame = useCurrentFrame();
    
    // Each frame is one slide
    let slides = scriptData?.slides || [];
    
    // Safety fallback
    if (slides.length === 0) {
        slides = [{ type: "hook", content: "No slides available" }];
    }

    // Determine if we are on the CTA slide
    const isOutro = frame >= slides.length;
    const slide = isOutro ? null : slides[frame];
    
    if (isOutro) {
        return (
            <AbsoluteFill style={{ backgroundColor: BG, justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        display: 'inline-block', padding: '24px 48px', borderRadius: 999, background: ACCENT,
                        color: BG, fontWeight: 800, fontSize: 40, fontFamily: FONT, letterSpacing: 2,
                    }}>
                        ▶ FOLLOW @cohortzero
                    </div>
                    <div style={{
                        marginTop: 40, color: '#fff', fontWeight: 800, letterSpacing: 4, fontSize: 50, fontFamily: FONT,
                    }}>
                        COHORT ZERO
                    </div>
                    <div style={{
                        marginTop: 15, color: MUTED, letterSpacing: 3, textTransform: 'uppercase',
                        fontSize: 24, fontFamily: FONT,
                    }}>
                        Founders' Files
                    </div>
                </div>
            </AbsoluteFill>
        );
    }

    const { type, content, highlight_number, author } = slide;
    const isHook = type === 'hook' || frame === 0;
    const fontSize = isHook ? 65 : 45;

    return (
        <AbsoluteFill style={{ backgroundColor: BG }}>
            {/* Background */}
            <AbsoluteFill>
                <Img src={staticFile(`assets/bg_${frame}.jpg`)} 
                     style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }} 
                     onError={(e) => {
                         // Fallback to static background if specific one fails
                         e.currentTarget.src = staticFile('assets/background.jpg');
                     }}
                />
            </AbsoluteFill>

            {/* Dark vignette */}
            <AbsoluteFill style={{
                background: `radial-gradient(ellipse at center, transparent 20%, ${BG} 95%)`,
            }} />

            {/* Logo */}
            <AbsoluteFill style={{ padding: '60px', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                <Img src={staticFile('assets/logo.png')} style={{ height: 65, objectFit: 'contain', opacity: 0.8 }} />
            </AbsoluteFill>

            {/* Content Box */}
            <AbsoluteFill style={{
                justifyContent: 'center', alignItems: 'center',
                padding: '120px 80px 200px 80px',
            }}>
                <div style={{
                    maxWidth: 1080 * 0.85,
                    textAlign: 'center',
                }}>
                    {isHook && (
                        <div style={{
                            width: 80, height: 6, backgroundColor: ACCENT,
                            margin: '0 auto 32px', borderRadius: 3, boxShadow: `0 0 20px ${ACCENT}66`,
                        }} />
                    )}

                    {type === 'stat' && highlight_number && (
                        <div style={{ color: ACCENT, fontSize: 130, fontWeight: 900, fontFamily: FONT, letterSpacing: -2, marginBottom: 24 }}>
                            {highlight_number}
                        </div>
                    )}
                    
                    {type === 'quote' && (
                        <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 160, fontWeight: 900, fontFamily: FONT, lineHeight: 0.5, marginBottom: 20 }}>
                            "
                        </div>
                    )}

                    <div style={{
                        background: isHook ? 'none' : 'rgba(22, 22, 26, 0.7)',
                        backdropFilter: isHook ? 'none' : 'blur(20px)',
                        WebkitBackdropFilter: isHook ? 'none' : 'blur(20px)',
                        borderRadius: isHook ? 0 : 20,
                        border: isHook ? 'none' : '1px solid rgba(255,255,255,0.06)',
                        padding: isHook ? 0 : '48px 56px',
                    }}>
                        <p style={{
                            fontFamily: FONT,
                            fontSize,
                            fontWeight: isHook ? 800 : 600,
                            fontStyle: type === 'quote' ? 'italic' : 'normal',
                            color: '#f8fafc',
                            margin: 0,
                            lineHeight: 1.4,
                            letterSpacing: isHook ? '-1px' : '-0.3px',
                            textShadow: '0 4px 20px rgba(0,0,0,0.9)',
                        }}>
                            {content}
                        </p>
                        
                        {type === 'quote' && author && (
                            <div style={{ marginTop: 32, color: MUTED, fontSize: 32, fontWeight: 700, fontFamily: FONT }}>
                                — {author}
                            </div>
                        )}
                    </div>

                    {isHook && (
                        <div style={{
                            width: '40%', height: 6, margin: '40px auto 0',
                            backgroundColor: ACCENT, boxShadow: `0 0 20px ${ACCENT}`, borderRadius: 3,
                        }} />
                    )}
                </div>
            </AbsoluteFill>

            {/* Chart */}
            {scriptData?.chart_data && frame === slides.length - 1 && (
                <StaticChart data={scriptData.chart_data} />
            )}

            {/* Slide Progress Indicator */}
            <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 80 }}>
                <div style={{ color: MUTED, fontSize: 24, fontWeight: 600, fontFamily: FONT }}>
                    {frame + 1} / {slides.length + 1}
                </div>
            </AbsoluteFill>

            {/* CTA Arrow */}
            <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'flex-end', padding: '0 80px 80px 0' }}>
                <div style={{ color: ACCENT, fontSize: 32, fontWeight: 800, fontFamily: FONT }}>
                    SWIPE &rarr;
                </div>
            </AbsoluteFill>
        </AbsoluteFill>
    );
};
