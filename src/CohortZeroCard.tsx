import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';

/* ── Cohort Zero Brand Tokens ───────────────────── */
const ACCENT = '#E11D48';
const BG = '#0A0A0B';
const MUTED = '#9AA3AD';
const FONT = 'Inter, system-ui, -apple-system, sans-serif';

/* ── Film Grain ───────── */
const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.08 }) => {
    return (
        <AbsoluteFill style={{ opacity, mixBlendMode: 'overlay', pointerEvents: 'none' }}>
            <div style={{ width: 480, height: 270, transform: 'scale(4)', transformOrigin: 'top left', imageRendering: 'pixelated' as const }}>
                <svg width={480} height={270}>
                    <filter id="filmgrain">
                        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={42} stitchTiles="stitch" />
                        <feColorMatrix type="saturate" values="0" />
                    </filter>
                    <rect width={480} height={270} filter="url(#filmgrain)" />
                </svg>
            </div>
        </AbsoluteFill>
    );
};

export const CohortZeroCard: React.FC<{
    scriptData: {
        hook: string;
        content_rich_summary: string;
    };
}> = ({ scriptData }) => {
    
    // Fallbacks if data is missing
    const hook = scriptData?.hook || "The Reality of Building Startups";
    const content = scriptData?.content_rich_summary || "It takes more than a good idea to build a unicorn. You need mechanics, execution, and an unbreakable filter for bad ideas.";

    return (
        <AbsoluteFill style={{ backgroundColor: BG }}>
            
            {/* Background Image */}
            <AbsoluteFill>
                <Img src={staticFile('assets/bg_0.jpg')} 
                     style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }} 
                     onError={(e) => {
                         // Fallback to static background if dynamic one fails
                         e.currentTarget.src = staticFile('assets/background.jpg');
                     }}
                />
            </AbsoluteFill>

            {/* Dark Vignette to make text readable */}
            <AbsoluteFill style={{
                background: `radial-gradient(ellipse at center, transparent 0%, ${BG} 110%)`,
            }} />
            <AbsoluteFill style={{
                background: `linear-gradient(to bottom, rgba(10,10,11,0.1) 0%, rgba(10,10,11,0.8) 100%)`,
            }} />

            {/* Top Logo */}
            <AbsoluteFill style={{ padding: '70px 80px', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                <Img src={staticFile('assets/logo.png')} style={{ height: 60, objectFit: 'contain', opacity: 0.9 }} />
            </AbsoluteFill>

            {/* Main Content Box */}
            <AbsoluteFill style={{
                justifyContent: 'center', 
                alignItems: 'center',
                padding: '180px 80px',
            }}>
                <div style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 40,
                }}>
                    
                    {/* Hook Section */}
                    <div>
                        <div style={{
                            width: 80, height: 8, backgroundColor: ACCENT,
                            marginBottom: 40, borderRadius: 4, boxShadow: `0 0 20px ${ACCENT}66`,
                        }} />
                        <h1 style={{
                            color: '#ffffff',
                            fontFamily: FONT,
                            fontSize: 72,
                            fontWeight: 800,
                            lineHeight: 1.15,
                            letterSpacing: '-1.5px',
                            margin: 0,
                            textShadow: '0 4px 24px rgba(0,0,0,0.8)',
                        }}>
                            {hook}
                        </h1>
                    </div>

                    {/* Rich Content Summary */}
                    <div style={{
                        background: 'rgba(22, 22, 26, 0.75)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        borderRadius: 24,
                        border: '1px solid rgba(255,255,255,0.08)',
                        padding: '56px 64px',
                        boxShadow: '0 12px 64px rgba(0,0,0,0.6)',
                    }}>
                        <p style={{
                            fontFamily: FONT,
                            fontSize: 38,
                            fontWeight: 500,
                            color: '#E7E9EA',
                            margin: 0,
                            lineHeight: 1.5,
                            letterSpacing: '-0.3px',
                            whiteSpace: 'pre-wrap',
                        }}>
                            {content}
                        </p>
                    </div>

                </div>
            </AbsoluteFill>

            {/* Footer Branding */}
            <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 70 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ color: '#ffffff', fontWeight: 800, letterSpacing: 4, fontSize: 32, fontFamily: FONT }}>
                        COHORT ZERO
                    </div>
                    <div style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: ACCENT }} />
                    <div style={{ color: MUTED, letterSpacing: 3, textTransform: 'uppercase', fontSize: 22, fontFamily: FONT, fontWeight: 600 }}>
                        Founders' Files
                    </div>
                </div>
            </AbsoluteFill>

            {/* Grain Overlay */}
            <Grain />
        </AbsoluteFill>
    );
};
