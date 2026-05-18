import {DeviceEventEmitter} from 'react-native';

export const FEED_REFRESH_POST_EVENT = 'feedRefreshPost';
export const FEED_REFRESH_POLL_EVENT = 'feedRefreshPoll';
export const POST_COMMENT_COUNT_DELTA_EVENT = 'postCommentCountDelta';

export function emitFeedPostRefresh(postId: number | string): void {
    DeviceEventEmitter.emit(FEED_REFRESH_POST_EVENT, Number(postId));
}

export function emitFeedPollRefresh(pollId: string): void {
    DeviceEventEmitter.emit(FEED_REFRESH_POLL_EVENT, pollId);
}

export function subscribeFeedPostRefresh(listener: (postId: number) => void) {
    return DeviceEventEmitter.addListener(FEED_REFRESH_POST_EVENT, listener);
}

export function subscribeFeedPollRefresh(listener: (pollId: string) => void) {
    return DeviceEventEmitter.addListener(FEED_REFRESH_POLL_EVENT, listener);
}

export function emitPostCommentCountDelta(postId: number | string, delta: number): void {
    DeviceEventEmitter.emit(POST_COMMENT_COUNT_DELTA_EVENT, {
        postId: Number(postId),
        delta,
    });
}

export function subscribePostCommentCountDelta(
    listener: (payload: {postId: number; delta: number}) => void,
) {
    return DeviceEventEmitter.addListener(POST_COMMENT_COUNT_DELTA_EVENT, listener);
}
