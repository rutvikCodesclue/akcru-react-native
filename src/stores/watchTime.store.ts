import AsyncStorage from '@react-native-async-storage/async-storage';
import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {updateUserWatchTime} from '../lib/api/user.lib';
import useAuthStore from './auth.store';
import {fetchWatchTime, updateWatchTime as syncWatchTimeWithBackend} from '../lib/api/watchtime.lib';

interface IWatchTimeState {
    watchTime: number;
    timer: NodeJS.Timer | null;
    lastPlaybackPositions: {[id: string]: {position: number; isEpisode: boolean}};
    startTimer: () => void;
    pauseTimer: () => void;
    resetTimer: () => void;
    setLastPlaybackPosition: (id: string, position: number, isEpisode: boolean) => void;
    getLastPlaybackPosition: (id: string, isEpisode: boolean) => Promise<number>;
    handleCountWatchTime: () => Promise<void>;
    syncWatchTime: () => Promise<void>;
}

const useWatchTimeStore = create<IWatchTimeState>()(
    persist(
        (set, get) => ({
            watchTime: 0,
            timer: null,
            lastPlaybackPositions: {},
            setLastPlaybackPosition: (id: string, position: number, isEpisode: boolean) => {
                set(state => ({
                    lastPlaybackPositions: {
                        ...state.lastPlaybackPositions,
                        [id]: {position, isEpisode},
                    },
                }));

                AsyncStorage.setItem(`watchTime_${id}`, JSON.stringify({position, isEpisode}));
            },
            getLastPlaybackPosition: async (id: string, isEpisode: boolean): Promise<number> => {
                const asyncStoragePosition = await AsyncStorage.getItem(`watchTime_${id}`);
                let lastPlaybackPosition = asyncStoragePosition ? JSON.parse(asyncStoragePosition).position : 0;

                if (lastPlaybackPosition === 0) {
                    lastPlaybackPosition = await fetchWatchTime(id, isEpisode);
                    console.log(
                        `getLastPlaybackPosition - log from store - Fetched position from backend: ${lastPlaybackPosition}`,
                    );
                    if (lastPlaybackPosition > 0) {
                        set(state => ({
                            lastPlaybackPositions: {
                                ...state.lastPlaybackPositions,
                                [id]: {position: lastPlaybackPosition, isEpisode},
                            },
                        }));

                        AsyncStorage.setItem(
                            `watchTime_${id}`,
                            JSON.stringify({position: lastPlaybackPosition, isEpisode}),
                        );
                    }
                }
                return lastPlaybackPosition;
            },
            startTimer: () => {
                const interval = setInterval(async () => {
                    set(state => ({watchTime: state.watchTime + 1}));
                    const {watchTime} = get();
                    const POINTS_INTERVAL = 30;
                    if (watchTime >= POINTS_INTERVAL) {
                        set({watchTime: 0});
                        console.log('<== send user AD for watch time ==>');
                        await updateUserWatchTime({});
                        await useAuthStore.getState().hydrateUser();
                    }
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
                for (const [id, {position, isEpisode}] of Object.entries(lastPlaybackPositions)) {
                    const success = await syncWatchTimeWithBackend(id, position, isEpisode);
                    if (success) {
                        console.log(`Watch time for ${isEpisode ? 'episode' : 'movie'} ${id} synced successfully.`);

                        set(state => {
                            const updatedPositions = {...state.lastPlaybackPositions};
                            delete updatedPositions[id];
                            return {lastPlaybackPositions: updatedPositions};
                        });

                        AsyncStorage.removeItem(`watchTime_${id}`);
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
