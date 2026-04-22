/**
 * Runtime notification type values for MIT lifecycle pushes (backed by API string payloads).
 * Declared in `types/index.d.ts` as part of `INotification['type']` union.
 */
export enum NotificationType {
    MITExpiringSoon = 'MITExpiringSoon',
    MITExpired = 'MITExpired',
    MITMovieChanged = 'MITMovieChanged',
    MITCanceled = 'MITCanceled',
}
