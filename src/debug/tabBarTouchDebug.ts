/**
 * Dev-only helpers to trace whether bottom-tab presses fire and why navigation might not.
 * Metro filter: TAB_BAR_TOUCH
 */
export const TAB_BAR_TOUCH_TAG = '[TAB_BAR_TOUCH]';

export function logTabBarTouch(message: string, payload?: Record<string, unknown>): void {
    if (!__DEV__) {
        return;
    }
    if (payload && Object.keys(payload).length > 0) {
        console.log(TAB_BAR_TOUCH_TAG, message, payload);
    } else {
        console.log(TAB_BAR_TOUCH_TAG, message);
    }
}
