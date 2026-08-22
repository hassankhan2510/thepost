import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';

/* ── Brand Tokens ───────────────── */
const BG_GRADIENT_START = '#0f172a';
const BG_GRADIENT_END = '#020617';
const CARD_BG = 'rgba(20, 25, 35, 0.6)';
const CARD_BORDER = 'rgba(255, 255, 255, 0.1)';
const TEXT_PRIMARY = '#F8FAFC';
const TEXT_SECONDARY = '#94A3B8';
const ACCENT = '#38BDF8';
const FONT = 'Inter, -apple-system, system-ui, sans-serif';

/* ── Verified Badge ── */
const VerifiedBadge: React.FC = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.5 12.536V11.464L20.25 9.071L20.571 5.893L17.5 5.036L15.679 2.5L12 3.893L8.321 2.5L6.5 5.036L3.429 5.893L3.75 9.071L1.5 11.464V12.536L3.75 14.929L3.429 18.107L6.5 18.964L8.321 21.5L12 20.107L15.679 21.5L17.5 18.964L20.571 18.107L20.25 14.929L22.5 12.536Z" fill="#1D9BF0"/>
        <path d="M10.865 16.326L6.75 12.062L8.257 10.5L10.865 13.197L16.242 7.625L17.75 9.187L10.865 16.326Z" fill="white"/>
    </svg>
);

export const TweetCard: React.FC<{
    tweetData: {
        displayName: string;
        username: string;
        tweet: string | { heading: string; body: string };
        avatarFile: string;
        verified: boolean;
    };
}> = ({ tweetData }) => {
    const { displayName, username, tweet, avatarFile, verified } = tweetData;

    // Calculate total text length for scaling
    const isStructured = typeof tweet === 'object' && tweet !== null;
    const tweetLen = isStructured ? (tweet.heading.length + tweet.body.length) : (tweet as string).length;
    
    // Aggressive Smart Text Scaling
    let fontSize = 40;
    let lineHeight = 1.4;
    
    if (tweetLen > 800) {
        fontSize = 22;
        lineHeight = 1.5;
    } else if (tweetLen > 600) {
        fontSize = 26;
        lineHeight = 1.45;
    } else if (tweetLen > 450) {
        fontSize = 28;
        lineHeight = 1.4;
    } else if (tweetLen > 300) {
        fontSize = 30;
        lineHeight = 1.4;
    } else if (tweetLen > 200) {
        fontSize = 36;
        lineHeight = 1.35;
    } else if (tweetLen < 100) {
        fontSize = 50;
        lineHeight = 1.3;
    }

    return (
        <AbsoluteFill style={{
            background: `linear-gradient(135deg, ${BG_GRADIENT_START} 0%, ${BG_GRADIENT_END} 100%)`,
            display: 'flex',
            justifyContent: 'center', // We keep this but bound the max height of the card
            alignItems: 'center',
            padding: 40, // Reduced padding to give the card more room
        }}>
            {/* Ambient Background Glows */}
            <div style={{
                position: 'absolute', width: 600, height: 600,
                background: 'radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, rgba(0,0,0,0) 70%)',
                top: -100, right: -100, borderRadius: '50%',
            }} />
            <div style={{
                position: 'absolute', width: 800, height: 800,
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, rgba(0,0,0,0) 70%)',
                bottom: -200, left: -200, borderRadius: '50%',
            }} />

            {/* The Glass Tweet Card */}
            <div style={{
                width: '100%',
                maxWidth: 960,
                maxHeight: 1000, // Forces the card to NEVER overflow the 1080 canvas
                backgroundColor: CARD_BG,
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
                borderRadius: 32,
                border: `1px solid ${CARD_BORDER}`,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                padding: '40px 50px',
                display: 'flex',
                flexDirection: 'column',
                gap: 24, // Tighter gap
                zIndex: 10,
            }}>
                
                {/* Header: Avatar, Name, Handle, Verified */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexShrink: 0 }}>
                    <div style={{
                        width: 90, height: 90, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
                    }}>
                        <Img src={staticFile(`assets/${avatarFile}`)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexGrow: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ color: TEXT_PRIMARY, fontSize: 32, fontWeight: 700, fontFamily: FONT, letterSpacing: '-0.5px' }}>
                                {displayName}
                            </span>
                            {verified && <VerifiedBadge />}
                        </div>
                        <span style={{ color: TEXT_SECONDARY, fontSize: 22, fontFamily: FONT, fontWeight: 400 }}>
                            {username}
                        </span>
                    </div>

                </div>

                {/* Tweet Body (Scrollable if absolutely necessary, but shouldn't be with smart scaling) */}
                <div style={{
                    color: TEXT_PRIMARY,
                    fontFamily: FONT,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 20,
                    paddingTop: 10,
                }}>
                    {isStructured ? (
                        <>
                            {/* Intelligent AI Heading */}
                            <div style={{ 
                                fontSize: fontSize * 1.15, 
                                fontWeight: 800, 
                                color: ACCENT, 
                                lineHeight: 1.2,
                                letterSpacing: '-0.5px'
                            }}>
                                {tweet.heading}
                            </div>
                            {/* Intelligent AI Body */}
                            <div style={{ 
                                fontSize: fontSize, 
                                fontWeight: 400, 
                                lineHeight: lineHeight,
                                color: 'rgba(255,255,255,0.95)'
                            }}>
                                {tweet.body}
                            </div>
                        </>
                    ) : (
                        <div style={{ fontSize: fontSize, fontWeight: 400, lineHeight: lineHeight }}>
                            {tweet as string}
                        </div>
                    )}
                </div>


            </div>
        </AbsoluteFill>
    );
};
