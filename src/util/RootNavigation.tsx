import {
    CommonActions,
    createNavigationContainerRef,
    NavigationProp,
    ParamListBase,
} from '@react-navigation/native';
import {AuthStackParams} from '../navigation/AuthNavigation';
import {getPpvScreenRouteParams} from './postAuthNavigation';
import type {CrummunitySendMITParams} from '../screens/crummunityScreens/CrummunitySendMITScreen';
import type {IComment, IMovie, IPoll, IPollComment, IPost, IUserProfile} from '../../types';

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

export type NavigateToTrailerPlayerParams = {
    id: string;
    trailerURL?: string;
    landscapeURL?: string;
    title?: string;
    /** When true, play `movieURL` (full feature) instead of `trailerURL` after fetch. */
    playFullMovie?: boolean;
    /** PPV full-movie playback — used to show the post-watch thank-you screen on exit. */
    fromPpvFlow?: boolean;
};

export type NavigateToPpvThankYouParams = {
    movie: IMovie;
};

/**
 * `TrailerPlayer` is registered on `NoBottomStack`, not on nested tab stacks such as `UserProfileStack`.
 * Route through the root navigator from PPV and other deeply nested screens.
 */
export function navigateToTrailerPlayer(
    params: NavigateToTrailerPlayerParams,
    navigation?: NavigationProp<ParamListBase>,
) {
    const action = CommonActions.navigate({
        name: 'NoBottomStack',
        merge: true,
        params: {
            screen: 'TrailerPlayer',
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
                    screen: 'TrailerPlayer',
                    params,
                });
                return;
            }
            nav = nav.getParent?.();
        }
    }

    navigate('NoBottomStack', {
        screen: 'TrailerPlayer',
        params,
    });
}

/**
 * After a PPV screening, route back into the profile tab on the thank-you screen.
 */
export function navigateToPpvThankYouScreen(params: NavigateToPpvThankYouParams) {
    const ppvScreenParams = getPpvScreenRouteParams();
    const ppvScreenRoute = ppvScreenParams
        ? {name: 'PpvScreen' as const, params: ppvScreenParams}
        : {name: 'PpvScreen' as const};

    const action = CommonActions.reset({
        index: 0,
        routes: [
            {
                name: 'ClientTabNavigator',
                state: {
                    routes: [
                        {name: 'FlickFlirtScreen'},
                        {name: 'CrummunityStack'},
                        {name: 'AkcruButtonStack'},
                        {name: 'MITChatStack'},
                        {
                            name: 'UserProfileStack',
                            state: {
                                index: 1,
                                routes: [ppvScreenRoute, {name: 'PpvThankYouScreen', params}],
                            },
                        },
                    ],
                    index: 4,
                },
            },
        ],
    });

    if (navigationRef.isReady()) {
        navigationRef.dispatch(action);
        return;
    }

    navigate('ClientTabNavigator', {
        screen: 'UserProfileStack',
        params: {
            screen: 'PpvThankYouScreen',
            params,
        },
    });
}

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
    const action = CommonActions.reset({
        index: 0,
        routes: [
            {
                name: 'NoBottomStack',
                params: {
                    screen: 'UserMITHubScreen',
                    params: {index},
                },
            },
        ],
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
                (nav as {dispatch: (action: object) => void}).dispatch(action);
                return;
            }
            nav = nav.getParent?.();
        }
    }

    navigate('NoBottomStack', {
        screen: 'UserMITHubScreen',
        params: {index},
    });
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
        navigationRef.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [
                    {
                        name: 'NoBottomStack',
                        params: {
                            screen: 'UserMITHubScreen',
                            params: {index},
                        },
                    },
                ],
            }),
        );
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

/** `NewPoll` lives on `NoBottomStack`, not on `CrummunityStack`. */
export function navigateToNewPoll() {
    const go = () => {
        if (!navigationRef.isReady()) {
            return;
        }
        navigationRef.navigate('NoBottomStack', {
            screen: 'NewPoll',
        });
    };
    go();
    if (!navigationRef.isReady()) {
        setTimeout(go, 120);
    }
}

/** `NewPollComment` lives on `NoBottomStack`, not on `CrummunityStack`. */
export function navigateToNewPollComment(pollId: number | string) {
    const go = () => {
        if (!navigationRef.isReady()) {
            return;
        }
        navigationRef.navigate('NoBottomStack', {
            screen: 'NewPollComment',
            params: {pollId},
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
            params: {
                ...params,
                postId: params.post?.id != null ? Number(params.post.id) : undefined,
            },
        });
    };
    go();
    if (!navigationRef.isReady()) {
        setTimeout(go, 120);
    }
}

/** `PollScreen` is on `NoBottomStack`, not on `CrummunityStack`. */
export type NavigateToPollScreenParams = {
    poll: IPoll;
    isLikedByCurrentUser?: boolean;
    comment?: IPollComment;
};

export function navigateToPollScreen(params: NavigateToPollScreenParams) {
    const go = () => {
        if (!navigationRef.isReady()) {
            return;
        }
        navigationRef.dispatch(
            CommonActions.navigate({
                name: 'NoBottomStack',
                params: {
                    screen: 'PollScreen',
                    params: {
                        ...params,
                        pollId: params.poll.id,
                    },
                },
            }),
        );
    };
    go();
    if (!navigationRef.isReady()) {
        setTimeout(go, 120);
    }
}

/** `ReportUser` is on `NoBottomStack`, not on `CrummunityStack`. */
export type NavigateToReportUserParams =
    | {userID: string}
    | {
          authorId: string;
          authorUsername?: string;
          authorFirstName?: string;
          authorProfilePicture?: string;
          authorBadge?: string;
      };

export function navigateToReportUser(params: NavigateToReportUserParams) {
    const go = () => {
        if (!navigationRef.isReady()) {
            return;
        }
        navigationRef.navigate('NoBottomStack', {
            screen: 'ReportUser',
            params,
        });
    };
    go();
    if (!navigationRef.isReady()) {
        setTimeout(go, 120);
    }
}
