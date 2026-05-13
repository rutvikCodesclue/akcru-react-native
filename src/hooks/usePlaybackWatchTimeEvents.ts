import {useCallback, useEffect, useRef} from 'react';
import type {MutableRefObject} from 'react';
import {updateWatchTime} from '../lib/api/watchtime.lib';

const PLAYBACK_EVENTS = {
    STARTED: 'PLAYBACK_STARTED',
    PAUSED: 'PLAYBACK_PAUSED',
    RESUMED: 'PLAYBACK_RESUMED',
    COMPLETED: 'PLAYBACK_COMPLETED',
} as const;

type UsePlaybackWatchTimeEventsParams = {
    contentId: string | undefined;
    isEpisode: boolean | undefined;
    /** When true, lifecycle events are not sent (e.g. preroll / opener before main content). */
    suppressPlaybackTrackingRef: MutableRefObject<boolean>;
};

/**
 * Sends watchtime PUTs with PLAYBACK_STARTED / PAUSED / RESUMED / COMPLETED.
 * Uses a ref for position so callbacks stay accurate between renders.
 */
export function usePlaybackWatchTimeEvents({
    contentId,
    isEpisode,
    suppressPlaybackTrackingRef,
}: UsePlaybackWatchTimeEventsParams) {
    const playbackPositionRef = useRef(0);
    const hasSentStartedRef = useRef(false);
    const expectResumeAfterPauseRef = useRef(false);

    useEffect(() => {
        hasSentStartedRef.current = false;
        expectResumeAfterPauseRef.current = false;
        playbackPositionRef.current = 0;
    }, [contentId, isEpisode]);

    const syncProgressPosition = useCallback((seconds: number) => {
        playbackPositionRef.current = Math.max(0, Math.floor(seconds));
    }, []);

    const onPlaybackPlay = useCallback(() => {
        if (!contentId || suppressPlaybackTrackingRef.current) return;
        const t = playbackPositionRef.current;
        if (!hasSentStartedRef.current) {
            hasSentStartedRef.current = true;
            void updateWatchTime(contentId, t, Boolean(isEpisode), PLAYBACK_EVENTS.STARTED);
        } else if (expectResumeAfterPauseRef.current) {
            expectResumeAfterPauseRef.current = false;
            void updateWatchTime(contentId, t, Boolean(isEpisode), PLAYBACK_EVENTS.RESUMED);
        }
    }, [contentId, isEpisode, suppressPlaybackTrackingRef]);

    const onPlaybackPause = useCallback(() => {
        if (!contentId || suppressPlaybackTrackingRef.current) return;
        expectResumeAfterPauseRef.current = true;
        void updateWatchTime(
            contentId,
            playbackPositionRef.current,
            Boolean(isEpisode),
            PLAYBACK_EVENTS.PAUSED,
        );
    }, [contentId, isEpisode, suppressPlaybackTrackingRef]);

    const onPlaybackComplete = useCallback(() => {
        if (!contentId || suppressPlaybackTrackingRef.current) return;
        void updateWatchTime(
            contentId,
            playbackPositionRef.current,
            Boolean(isEpisode),
            PLAYBACK_EVENTS.COMPLETED,
        );
    }, [contentId, isEpisode, suppressPlaybackTrackingRef]);

    return {syncProgressPosition, onPlaybackPlay, onPlaybackPause, onPlaybackComplete, playbackPositionRef};
}
