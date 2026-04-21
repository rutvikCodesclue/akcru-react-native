import {
    CommonActions,
    createNavigationContainerRef,
    NavigationProp,
    ParamListBase,
} from '@react-navigation/native';
import {AuthStackParams} from '../navigation/AuthNavigation';
import type {CrummunitySendMITParams} from '../screens/crummunityScreens/CrummunitySendMITScreen';
import type {IComment, IPost, IUserProfile} from '../../types';

export const navigationRef = createNavigationContainerRef<AuthStackParams>();

/**
 * Opens the UserNotification screen inside NoBottomStack (Auth root).
 * Uses the container ref first; if not ready, walks parents to the stack that
 * registers NoBottomStack (useNavigation often resolves to ClientStack, which
 * cannot handle this route by name).
 */
export type UserMITHubNavigateParams = {index?: number};

/**
 * Opens UserMITHubScreen on NoBottomStack (same stack as UserNotification).
 */
export type NavigateToMITDateScheduleParams = {
    id: string;
    title?: string;
    portraitURL?: string;
    year?: number;
    userId?: string;
};

/**
 * `MITDateSchedule` is registered on `NoBottomStack`, not on `ClientStack` / `UserProfileStack`.
 * Navigating by name from `ContentDetailScreen` in a nested tab stack fails; route through root.
 */
export function navigateToMITDateSchedule(
    params: NavigateToMITDateScheduleParams,
    navigation?: NavigationProp<ParamListBase>,
) {
    const action = CommonActions.navigate({
        name: 'NoBottomStack',
        merge: true,
        params: {
            screen: 'MITDateSchedule',
            params,
        },
    });

    if (navigationRef.isReady()) {
        navigationRef.dispatch(action);
        return;
    }

    if (navigation) {
        let nav: NavigationProp<ParamListBase> | undefined = navigation;
        for (let i = 0; i < 12 && nav; i++) {
            const state = nav.getState?.();
            const routeNames = state?.routeNames as string[] | undefined;
            if (routeNames?.includes('NoBottomStack')) {
                (nav as {navigate: (name: string, params?: object) => void}).navigate('NoBottomStack', {
                    screen: 'MITDateSchedule',
                    params,
                });
                return;
            }
            nav = nav.getParent?.();
        }
    }

    navigate('NoBottomStack', {
        screen: 'MITDateSchedule',
        params,
    });
}

export function navigateToUserMITHubScreen(
    navigation?: NavigationProp<ParamListBase>,
    hubParams?: UserMITHubNavigateParams,
) {
    const index = hubParams?.index ?? 0;
    const action = CommonActions.navigate({
        name: 'NoBottomStack',
        merge: true,
        params: {
            screen: 'UserMITHubScreen',
            params: {index},
        },
    });

    if (navigationRef.isReady()) {
        navigationRef.dispatch(action);
        return;
    }

    if (navigation) {
        let nav: NavigationProp<ParamListBase> | undefined = navigation;
        for (let i = 0; i < 12 && nav; i++) {
            const state = nav.getState?.();
            const routeNames = state?.routeNames as string[] | undefined;
            if (routeNames?.includes('NoBottomStack')) {
                (nav as {navigate: (name: string, params?: object) => void}).navigate('NoBottomStack', {
                    screen: 'UserMITHubScreen',
                    params: {index},
                });
                return;
            }
            nav = nav.getParent?.();
        }
    }

    navigate('NoBottomStack', {screen: 'UserMITHubScreen', params: {index}});
}

export function navigateToUserNotificationScreen(navigation?: NavigationProp<ParamListBase>) {
    const action = CommonActions.navigate({
        name: 'NoBottomStack',
        merge: true,
        params: {
            screen: 'UserNotification',
        },
    });

    if (navigationRef.isReady()) {
        navigationRef.dispatch(action);
        return;
    }

    if (navigation) {
        let nav: NavigationProp<ParamListBase> | undefined = navigation;
        for (let i = 0; i < 12 && nav; i++) {
            const state = nav.getState?.();
            const routeNames = state?.routeNames as string[] | undefined;
            if (routeNames?.includes('NoBottomStack')) {
                (nav as {navigate: (name: string, params?: object) => void}).navigate('NoBottomStack', {
                    screen: 'UserNotification',
                });
                return;
            }
            nav = nav.getParent?.();
        }
    }

    // Last resort: notifications list on ClientStack (same tab stack as Home)
    if (navigation) {
        const local = navigation.getState?.();
        if (local?.routeNames?.includes('UserNotifications')) {
            (navigation as {navigate: (name: string) => void}).navigate('UserNotifications');
            return;
        }
    }

    navigate('NoBottomStack', {screen: 'UserNotification'});
}

export function navigate(name: keyof AuthStackParams, params?: any) {
    console.log(`Attempting to navigate to: ${name}`, params);
    if (navigationRef.isReady()) {
        console.log('Navigation ref is ready, navigating...');
        navigationRef.navigate(name, params);
        return;
    }
    console.warn('Navigation ref is not ready!');
    let attempts = 0;
    const maxAttempts = 25;
    const id = setInterval(() => {
        attempts++;
        if (navigationRef.isReady()) {
            clearInterval(id);
            console.log('Navigation ref ready after retry, navigating...');
            navigationRef.navigate(name, params);
        } else if (attempts >= maxAttempts) {
            clearInterval(id);
            console.error('Navigation ref still not ready after retries');
        }
    }, 100);
}

export function reset(state: any) {
    console.log('Attempting to reset navigation state:', state);
    if (navigationRef.isReady()) {
        console.log('Navigation ref is ready, resetting...');
        navigationRef.reset(state);
    } else {
        console.warn('Navigation ref is not ready for reset!');
    }
}

/**
 * `UserMITHubScreen` is registered on `NoBottomStack`, not on `CrummunityStack`.
 * Navigating by name from nested tab/stack fails; route through the root navigator.
 */
export function navigateToUserMITHub(index = 0) {
    const go = () => {
        if (!navigationRef.isReady()) {
            return;
        }
        navigationRef.navigate('NoBottomStack', {
            screen: 'UserMITHubScreen',
            params: {index},
        });
    };
    go();
    if (!navigationRef.isReady()) {
        setTimeout(go, 120);
    }
}

/** `NewComment` lives on `NoBottomStack`, not on `CrummunityStack`. */
export function navigateToNewComment(postId: number | string) {
    const go = () => {
        if (!navigationRef.isReady()) {
            return;
        }
        navigationRef.navigate('NoBottomStack', {
            screen: 'NewComment',
            params: {postId},
        });
    };
    go();
    if (!navigationRef.isReady()) {
        setTimeout(go, 120);
    }
}

/** `NewPost` lives on `NoBottomStack`, not on `CrummunityStack`. */
export function navigateToNewPost() {
    const go = () => {
        if (!navigationRef.isReady()) {
            return;
        }
        navigationRef.navigate('NoBottomStack', {
            screen: 'NewPost',
        });
    };
    go();
    if (!navigationRef.isReady()) {
        setTimeout(go, 120);
    }
}

/** `CrummunitySendMITScreen` is on `NoBottomStack`, not on `CrummunityStack`. */
export function navigateToCrummunitySendMIT(params: CrummunitySendMITParams) {
    const go = () => {
        if (!navigationRef.isReady()) {
            return;
        }
        navigationRef.navigate('NoBottomStack', {
            screen: 'CrummunitySendMITScreen',
            params,
        });
    };
    go();
    if (!navigationRef.isReady()) {
        setTimeout(go, 120);
    }
}

/** `PostScreen` is on `NoBottomStack`, not on `ClientStack`, `AkcruButtonStack`, `CrummunityStack`, etc. */
export type NavigateToPostScreenParams = {
    post: IPost;
    isLikedByCurrentUser?: boolean;
    comment?: IComment;
    author?: IUserProfile;
};

export function navigateToPostScreen(params: NavigateToPostScreenParams) {
    const go = () => {
        if (!navigationRef.isReady()) {
            return;
        }
        navigationRef.navigate('NoBottomStack', {
            screen: 'PostScreen',
            params,
        });
    };
    go();
    if (!navigationRef.isReady()) {
        setTimeout(go, 120);
    }
}
