export const ROOM_VALIDATION_CHECK_TIME = 7000;

/** When true, post-auth routes to PpvScreen and PPV IAP uses a static transactionId for API testing. */
export let isCurrentFlowPpv = true;

export function setIsCurrentFlowPpv(enabled: boolean): void {
    isCurrentFlowPpv = enabled;
}
