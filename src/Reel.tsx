import React from 'react';
import { AbsoluteFill, Img, useVideoConfig, useCurrentFrame, spring, staticFile } from 'remotion';

export const Reel: React.FC<{ scriptData: any }> = ({ scriptData }) => {
    const { fps, width } = useVideoConfig();
    const frame = useCurrentFrame();

    const opacity = spring({
        frame,
        fps,
        config: { damping: 100 }
    });

    return (
        <AbsoluteFill style={{ backgroundColor: 'black' }}>
            <AbsoluteFill style={{ opacity: 0.5 }}>
                {/* Fallback styling for background */}
                <div style={{
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(to bottom, #111, #333)',
                    position: 'absolute'
                }} />
                {/* Background AI Image */}
                <Img 
                    src={staticFile('assets/background.jpg')} 
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                    }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
            </AbsoluteFill>

            <AbsoluteFill style={{ padding: 60, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{
                    opacity,
                    transform: `translateY(${100 - opacity * 100}px)`,
                    color: 'white',
                    fontSize: width === 1080 ? 60 : 80,
                    fontWeight: 'bold',
                    fontFamily: 'sans-serif',
                    textAlign: 'center',
                    textShadow: '2px 2px 10px rgba(0,0,0,0.8)'
                }}>
                    {scriptData?.script_lines?.map((line: string, i: number) => (
                        <div key={i} style={{ marginBottom: 30 }}>{line}</div>
                    ))}
                </div>
            </AbsoluteFill>

            {/* Logo */}
            <AbsoluteFill style={{ padding: 40, justifyContent: 'flex-start', alignItems: 'center' }}>
                <Img 
                    src={staticFile('assets/logo.png')}
                    style={{ height: 120, objectFit: 'contain' }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
            </AbsoluteFill>
        </AbsoluteFill>
    );
};
