import {createNavigationContainerRef} from '@react-navigation/native';
import {AuthStackParams} from '../navigation/AuthNavigation';

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
