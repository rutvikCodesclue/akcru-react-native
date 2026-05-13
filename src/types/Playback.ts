/**
 * Playback lifecycle events (reserved for analytics / session sync).
 */
export enum PlaybackEventType {
    PLAYBACK_STARTED = 'PLAYBACK_STARTED',
    PLAYBACK_PROGRESS = 'PLAYBACK_PROGRESS',
    PLAYBACK_PAUSED = 'PLAYBACK_PAUSED',
    PLAYBACK_RESUMED = 'PLAYBACK_RESUMED',
    PLAYBACK_COMPLETED = 'PLAYBACK_COMPLETED',
    PLAYBACK_EXITED = 'PLAYBACK_EXITED',
}

/**
 * High-level status of a playback session (reserved for state / API).
 */
export enum PlaybackSessionStatus {
    STARTED = 'STARTED',
    PAUSED = 'PAUSED',
    RESUMED = 'RESUMED',
    COMPLETED = 'COMPLETED',
    EXITED = 'EXITED',
}
