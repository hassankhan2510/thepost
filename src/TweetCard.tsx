import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';

/* ── Brand Tokens (matching Reel.tsx) ───────────────── */
const BG = '#0A0A0B';
const SURFACE = '#16161A';
const MUTED = '#71767B';
const TEXT_PRIMARY = '#E7E9EA';
const TEXT_SECONDARY = '#71767B';
const BLUE_TICK = '#1D9BF0';
const FONT = 'Inter, system-ui, -apple-system, sans-serif';

/* ── Subtle Noise Grain (lighter version for static image) ── */
const Grain: React.FC = () => (
    <AbsoluteFill style={{ opacity: 0.04, mixBlendMode: 'overlay', pointerEvents: 'none' }}>
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

/* ── Verified Badge SVG ── */
const VerifiedBadge: React.FC<{ size?: number }> = ({ size = 22 }) => (
    <svg viewBox="0 0 22 22" width={size} height={size} style={{ marginLeft: 6, flexShrink: 0 }}>
        <path
            d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.274-.586-.705-1.084-1.246-1.439-.54-.354-1.17-.551-1.816-.569-.646.018-1.275.215-1.816.57-.54.354-.972.852-1.246 1.438-.607-.223-1.264-.27-1.897-.14-.634.131-1.218.437-1.687.882-.445.47-.75 1.053-.882 1.687-.13.633-.083 1.29.14 1.897-.586.274-1.084.705-1.439 1.246-.354.54-.551 1.17-.569 1.816.018.646.215 1.275.57 1.816.354.54.852.972 1.438 1.246-.223.607-.27 1.264-.14 1.897.131.634.437 1.218.882 1.687.47.445 1.053.75 1.687.882.633.13 1.29.083 1.897-.14.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.646-.018 1.275-.215 1.816-.57.54-.354.972-.852 1.246-1.438.607.223 1.264.27 1.897.14.634-.131 1.218-.437 1.687-.882.445-.47.75-1.053.882-1.687.13-.633.083-1.29-.14-1.897.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816z"
            fill={BLUE_TICK}
        />
        <path
            d="M9.585 14.929l-3.28-3.28 1.168-1.168 2.112 2.112 4.716-4.716 1.168 1.168-5.884 5.884z"
            fill="#fff"
        />
    </svg>
);

/* ── Engagement Icons ── */
const EngagementBar: React.FC = () => {
    const iconStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        color: MUTED,
        fontSize: 15,
        fontFamily: FONT,
        fontWeight: 500,
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '16px 0',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            maxWidth: '85%',
        }}>
            {/* Reply */}
            <div style={iconStyle}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth={1.8}>
                    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                </svg>
            </div>
            {/* Retweet */}
            <div style={iconStyle}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth={1.8}>
                    <path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 014-4h14" />
                    <path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 01-4 4H3" />
                </svg>
            </div>
            {/* Like / Heart */}
            <div style={iconStyle}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth={1.8}>
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
            </div>
            {/* Views / Impressions */}
            <div style={iconStyle}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth={1.8}>
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
                    <circle cx={12} cy={12} r={3} />
                </svg>
            </div>
            {/* Share / Bookmark */}
            <div style={iconStyle}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth={1.8}>
                    <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                    <polyline points="16 6 12 2 8 6" />
                    <line x1={12} y1={2} x2={12} y2={15} />
                </svg>
            </div>
        </div>
    );
};

/* ── Main TweetCard Composition ── */
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

    // Generate a realistic-looking timestamp
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 || 12;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const timeStr = `${h12}:${String(minutes).padStart(2, '0')} ${ampm} · ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;

    // Calculate font size based on tweet length
    const tweetLen = tweet.length;
    let fontSize = 38;
    if (tweetLen > 200) fontSize = 30;
    else if (tweetLen > 150) fontSize = 33;
    else if (tweetLen > 100) fontSize = 36;

    return (
        <AbsoluteFill style={{ backgroundColor: BG }}>
            {/* Subtle gradient overlay */}
            <AbsoluteFill style={{
                background: `linear-gradient(165deg, rgba(29,155,240,0.03) 0%, transparent 40%, rgba(29,155,240,0.02) 100%)`,
            }} />

            {/* Main content card */}
            <AbsoluteFill style={{
                padding: '80px 72px',
                justifyContent: 'center',
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0,
                    background: SURFACE,
                    borderRadius: 24,
                    padding: '48px 52px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 8px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
                }}>
                    {/* Header: Avatar + Name + Handle */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                        marginBottom: 28,
                    }}>
                        {/* Avatar */}
                        <div style={{
                            width: 56,
                            height: 56,
                            borderRadius: '50%',
                            overflow: 'hidden',
                            flexShrink: 0,
                            border: '2px solid rgba(255,255,255,0.1)',
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
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span style={{
                                    color: TEXT_PRIMARY,
                                    fontSize: 20,
                                    fontWeight: 700,
                                    fontFamily: FONT,
                                    letterSpacing: '-0.2px',
                                }}>
                                    {displayName}
                                </span>
                                {verified && <VerifiedBadge size={20} />}
                            </div>
                            <span style={{
                                color: TEXT_SECONDARY,
                                fontSize: 16,
                                fontFamily: FONT,
                                fontWeight: 400,
                            }}>
                                {username}
                            </span>
                        </div>

                        {/* X Logo (top right) */}
                        <div style={{ marginLeft: 'auto' }}>
                            <svg width={28} height={28} viewBox="0 0 24 24" fill={TEXT_PRIMARY}>
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                        </div>
                    </div>

                    {/* Tweet Body */}
                    <div style={{
                        color: TEXT_PRIMARY,
                        fontSize,
                        fontFamily: FONT,
                        fontWeight: 400,
                        lineHeight: 1.45,
                        letterSpacing: '-0.3px',
                        marginBottom: 28,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                    }}>
                        {tweet}
                    </div>

                    {/* Timestamp */}
                    <div style={{
                        color: TEXT_SECONDARY,
                        fontSize: 15,
                        fontFamily: FONT,
                        fontWeight: 400,
                        marginBottom: 20,
                        paddingBottom: 16,
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                    }}>
                        {timeStr}
                    </div>

                    {/* Engagement Bar */}
                    <EngagementBar />
                </div>
            </AbsoluteFill>

            {/* Film grain */}
            <Grain />
        </AbsoluteFill>
    );
};
