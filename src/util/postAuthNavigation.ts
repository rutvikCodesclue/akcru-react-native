import {isCurrentFlowPpv} from './config';

export type PostAuthEntry = 'signin' | 'signup' | 'returning';

const PPV_CLIENT_TAB_PARAMS = {
    screen: 'UserProfileStack' as const,
    params: {
        screen: 'PpvScreen' as const,
        params: {fromPostAuth: true} as const,
    },
};

function getRegularClientTabParams(entry: PostAuthEntry) {
    if (entry === 'signin') {
        return {screen: 'CrummunityStack' as const};
    }

    return {screen: 'FlickFlirtScreen' as const};
}

/** ClientTabNavigator nested params after auth (sign-in or sign-up). */
export function getPostAuthClientTabParams(entry: PostAuthEntry) {
    if (isCurrentFlowPpv) {
        return PPV_CLIENT_TAB_PARAMS;
    }

    return getRegularClientTabParams(entry);
}

/** NoBottomStack → ClientTabNavigator params after auth. */
export function getPostAuthNoBottomStackParams(entry: PostAuthEntry) {
    return {
        screen: 'ClientTabNavigator' as const,
        params: getPostAuthClientTabParams(entry),
    };
}

/** Route params for PpvScreen while the app is in the locked post-auth PPV flow. */
export function getPpvScreenRouteParams(): {fromPostAuth: true} | undefined {
    return isCurrentFlowPpv ? {fromPostAuth: true} : undefined;
}

/** Root reset state after sign-in. */
export function getPostAuthResetState(entry: PostAuthEntry) {
    return {
        index: 0 as const,
        routes: [
            {
                name: 'NoBottomStack' as const,
                params: getPostAuthNoBottomStackParams(entry),
            },
        ],
    };
}
