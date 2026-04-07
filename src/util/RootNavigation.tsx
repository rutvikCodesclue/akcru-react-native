import {createNavigationContainerRef} from '@react-navigation/native';
import {AuthStackParams} from '../navigation/AuthNavigation';
import type {CrummunitySendMITParams} from '../screens/crummunityScreens/CrummunitySendMITScreen';
import type {IComment, IPost, IUserProfile} from '../../types';

export const navigationRef = createNavigationContainerRef<AuthStackParams>();

export function navigate(name: keyof AuthStackParams, params?: any) {
    console.log(`Attempting to navigate to: ${name}`, params);
    if (navigationRef.isReady()) {
        console.log('Navigation ref is ready, navigating...');
        navigationRef.navigate(name, params);
    } else {
        console.warn('Navigation ref is not ready!');
        // Retry after a short delay
        setTimeout(() => {
            if (navigationRef.isReady()) {
                console.log('Navigation ref ready after retry, navigating...');
                navigationRef.navigate(name, params);
            } else {
                console.error('Navigation ref still not ready after retry');
            }
        }, 100);
    }
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
