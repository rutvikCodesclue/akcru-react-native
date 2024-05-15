import AsyncStorage from '@react-native-async-storage/async-storage';
import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {updateUserWatchTime} from '../lib/api/user.lib';
import useAuthStore from './auth.store';
import {fetchWatchTime, updateWatchTime as syncWatchTimeWithBackend} from '../lib/api/watchtime.lib';

interface IWatchTimeState {
    watchTime: number;
    timer: NodeJS.Timer | null;
    lastPlaybackPositions: {[movieId: string]: number};
    startTimer: () => void;
    pauseTimer: () => void;
    resetTimer: () => void;
    setLastPlaybackPosition: (movieId: string, position: number) => void;
    getLastPlaybackPosition: (movieId: string) => Promise<number>;

    handleCountWatchTime: () => Promise<void>;
    syncWatchTime: () => Promise<void>;
}

const useWatchTimeStore = create<IWatchTimeState>()(
    persist(
        (set, get) => ({
            watchTime: 0,
            timer: null,
            lastPlaybackPositions: {},
            setLastPlaybackPosition: (movieId: string, position: number) => {
                set(state => ({
                    lastPlaybackPositions: {...state.lastPlaybackPositions, [movieId]: position},
                }));

                AsyncStorage.setItem(`watchTime_${movieId}`, JSON.stringify(position));
            },
            getLastPlaybackPosition: async (movieId: string): Promise<number> => {
                const asyncStoragePosition = await AsyncStorage.getItem(`watchTime_${movieId}`);
                let lastPlaybackPosition = asyncStoragePosition ? JSON.parse(asyncStoragePosition) : 0;

                if (lastPlaybackPosition === 0) {
                    lastPlaybackPosition = await fetchWatchTime(movieId);
                    console.log(
                        `getLastPlaybackPosition - log from store - Fetched position from backend: ${lastPlaybackPosition}`,
                    );
                    if (lastPlaybackPosition > 0) {
                        set(state => ({
                            lastPlaybackPositions: {...state.lastPlaybackPositions, [movieId]: lastPlaybackPosition},
                        }));

                        AsyncStorage.setItem(`watchTime_${movieId}`, JSON.stringify(lastPlaybackPosition));
                    }
                }
                return lastPlaybackPosition;
            },
            startTimer: () => {
                const interval = setInterval(async () => {
                    set(state => ({watchTime: state.watchTime + 1}));
                    await get().handleCountWatchTime();
                }, 1000);
                set({timer: interval});
            },
            pauseTimer: () => {
                const {timer} = get();
                if (timer) {
                    clearInterval(timer);
                    set({timer: null});
                }
            },
            resetTimer: () => {
                const {timer} = get();
                if (timer) {
                    clearInterval(timer);
                    set({timer: null, watchTime: 0});
                }
            },
            handleCountWatchTime: async () => {
                const {watchTime} = get();
                const POINTS_INTERVAL = 30;
                if (watchTime >= POINTS_INTERVAL) {
                    set({watchTime: 0});
                    console.log('<== send user AD for watch time ==>');
                    await updateUserWatchTime({});

                    await useAuthStore.getState().hydrateUser();
                }
            },
            syncWatchTime: async () => {
                const {lastPlaybackPositions} = get();
                for (const [movieId, watchTime] of Object.entries(lastPlaybackPositions)) {
                    const success = await syncWatchTimeWithBackend(movieId, watchTime);
                    if (success) {
                        console.log(`Watch time for movie ${movieId} synced successfully.`);

                        set(state => {
                            const updatedPositions = {...state.lastPlaybackPositions};
                            delete updatedPositions[movieId];
                            return {lastPlaybackPositions: updatedPositions};
                        });

                        AsyncStorage.removeItem(`watchTime_${movieId}`);
                    }
                }
            },
        }),
        {
            name: 'watchTime-store',
            getStorage: () => AsyncStorage,
        },
    ),
);

export default useWatchTimeStore;
