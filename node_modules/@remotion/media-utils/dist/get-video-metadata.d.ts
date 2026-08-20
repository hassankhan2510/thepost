import type { VideoMetadata } from './types';
/**
 * @description Takes a src to a video, loads it and returns metadata for the specified source.
 * @see [Documentation](https://remotion.dev/docs/get-video-metadata)
 * @deprecated Use Mediabunny instead: https://www.remotion.dev/docs/mediabunny/metadata
 */
export declare const getVideoMetadata: (src: string) => Promise<VideoMetadata>;
