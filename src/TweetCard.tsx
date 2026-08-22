import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';

/* ── Brand Tokens ───────────────── */
const BG_GRADIENT_START = '#0f172a'; // Deep slate
const BG_GRADIENT_END = '#020617';   // Pitch black slate
const CARD_BG = 'rgba(20, 25, 35, 0.6)'; // Translucent dark
const CARD_BORDER = 'rgba(255, 255, 255, 0.1)';
const TEXT_PRIMARY = '#F8FAFC';
const TEXT_SECONDARY = '#94A3B8';
const ACCENT = '#38BDF8'; // Twitter/X Blueish
const FONT = 'Inter, -apple-system, system-ui, sans-serif';

/* ── Verified Badge Component ── */
const VerifiedBadge: React.FC = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.5 12.536V11.464L20.25 9.071L20.571 5.893L17.5 5.036L15.679 2.5L12 3.893L8.321 2.5L6.5 5.036L3.429 5.893L3.75 9.071L1.5 11.464V12.536L3.75 14.929L3.429 18.107L6.5 18.964L8.321 21.5L12 20.107L15.679 21.5L17.5 18.964L20.571 18.107L20.25 14.929L22.5 12.536Z" fill="#1D9BF0"/>
        <path d="M10.865 16.326L6.75 12.062L8.257 10.5L10.865 13.197L16.242 7.625L17.75 9.187L10.865 16.326Z" fill="white"/>
    </svg>
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
    const { displayName, username, tweet, avatarFile, verified } = tweetData;

    // Smart Text Scaling (Handles massive text walls gracefully)
    const tweetLen = tweet.length;
    let fontSize = 48;
    let lineHeight = 1.4;
    
    if (tweetLen > 600) {
        fontSize = 26;
        lineHeight = 1.5;
    } else if (tweetLen > 400) {
        fontSize = 32;
        lineHeight = 1.45;
    } else if (tweetLen > 220) {
        fontSize = 38;
        lineHeight = 1.4;
    } else if (tweetLen < 80) {
        fontSize = 56;
        lineHeight = 1.3;
    }

    return (
        <AbsoluteFill style={{
            background: `linear-gradient(135deg, ${BG_GRADIENT_START} 0%, ${BG_GRADIENT_END} 100%)`,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 80,
        }}>
            {/* Ambient Background Glows */}
            <div style={{
                position: 'absolute',
                width: 600,
                height: 600,
                background: 'radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, rgba(0,0,0,0) 70%)',
                top: -100,
                right: -100,
                borderRadius: '50%',
            }} />
            <div style={{
                position: 'absolute',
                width: 800,
                height: 800,
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, rgba(0,0,0,0) 70%)',
                bottom: -200,
                left: -200,
                borderRadius: '50%',
            }} />

            {/* The Glass Tweet Card */}
            <div style={{
                width: '100%',
                maxWidth: 920,
                backgroundColor: CARD_BG,
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
                borderRadius: 32,
                border: `1px solid ${CARD_BORDER}`,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                padding: '60px 70px',
                display: 'flex',
                flexDirection: 'column',
                gap: 32,
                zIndex: 10,
            }}>
                
                {/* Header: Avatar, Name, Handle, Verified */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <div style={{
                        width: 90,
                        height: 90,
                        borderRadius: '50%',
                        overflow: 'hidden',
                        flexShrink: 0,
                    }}>
                        <Img
                            src={staticFile(`assets/${avatarFile}`)}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexGrow: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{
                                color: TEXT_PRIMARY,
                                fontSize: 32,
                                fontWeight: 700,
                                fontFamily: FONT,
                                letterSpacing: '-0.5px',
                            }}>
                                {displayName}
                            </span>
                            {verified && <VerifiedBadge />}
                        </div>
                        <span style={{
                            color: TEXT_SECONDARY,
                            fontSize: 22,
                            fontFamily: FONT,
                            fontWeight: 400,
                        }}>
                            {username}
                        </span>
                    </div>
                    
                    {/* Twitter/X Logo Watermark */}
                    <svg width="40" height="40" viewBox="0 0 24 24" fill={TEXT_SECONDARY} opacity="0.3" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18.244 2.25H21.552L14.325 10.51L22.827 21.75H16.17L10.956 14.933L4.99 21.75H1.68L9.41 12.915L1.254 2.25H8.08L12.793 8.481L18.244 2.25ZM17.083 19.77H18.916L7.084 4.126H5.117L17.083 19.77Z" />
                    </svg>
                </div>

                {/* Tweet Body */}
                <div style={{
                    color: TEXT_PRIMARY,
                    fontSize,
                    fontFamily: FONT,
                    fontWeight: 400,
                    lineHeight,
                    letterSpacing: '-0.2px',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                }}>
                    {tweet}
                </div>

                {/* Engagement Footer (Static/Aesthetic) */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 40,
                    marginTop: 10,
                    borderTop: `1px solid ${CARD_BORDER}`,
                    paddingTop: 30,
                    color: TEXT_SECONDARY,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                        <span style={{ fontSize: 20, fontFamily: FONT }}>{Math.floor(Math.random() * 50) + 10}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 1l4 4-4 4"></path><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><path d="M7 23l-4-4 4-4"></path><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
                        <span style={{ fontSize: 20, fontFamily: FONT }}>{Math.floor(Math.random() * 100) + 20}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                        <span style={{ fontSize: 20, fontFamily: FONT }}>{Math.floor(Math.random() * 900) + 100}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
                        <span style={{ fontSize: 20, fontFamily: FONT }}>
                            {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} · {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                    </div>
                </div>

            </div>
        </AbsoluteFill>
    );
};
