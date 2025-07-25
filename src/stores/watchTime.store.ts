// watchtime.store.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import useAuthStore from './auth.store';
import {
    fetchWatchTime,
    updateWatchTime as syncWatchTimeWithBackend,
    awardAD,
    fetchRewardInterval,
} from '../lib/api/watchtime.lib';

interface IWatchTimeState {
    // COUNTERS
    watchTime: number; // for resume/backend‐sync
    rewardTime: number; // for AD awards

    timer: number | null;

    // PLAYBACK POSITIONS
    lastPlaybackPositions: {
        [id: string]: {position: number; isEpisode: boolean};
    };

    // ACTIONS
    startTimer: () => void;
    pauseTimer: () => void;
    resetTimer: () => void;

    setLastPlaybackPosition: (id: string, position: number, isEpisode: boolean) => void;
    getLastPlaybackPosition: (id: string, isEpisode: boolean) => Promise<number>;

    handleCountWatchTime: () => Promise<void>;
    syncWatchTime: () => Promise<void>;
    // track when we last sent an AD reward
    lastADTimestamp: number;
    rewardInterval: number;
    loadRewardInterval: () => Promise<void>;
}

// INTERVAL CONSTANTS
const RESUME_SYNC_INTERVAL = 30; // seconds between automatic resume‐syncs

const useWatchTimeStore = create<IWatchTimeState>()(
    persist(
        (set, get) => ({
            watchTime: 0,
            rewardTime: 0,
            timer: null,
            lastPlaybackPositions: {},
            lastADTimestamp: 0,
            rewardInterval: 216, // initial fallback
            loadRewardInterval: async () => {
                // one‐time fetch
                try {
                    const interval = await fetchRewardInterval();
                    set({rewardInterval: interval});
                } catch (err) {
                    console.error(err);
                }
            },

            /** Save a position to state & AsyncStorage immediately on onProgress */
            setLastPlaybackPosition: (id, position, isEpisode) => {
                set(s => ({
                    lastPlaybackPositions: {
                        ...s.lastPlaybackPositions,
                        [id]: {position, isEpisode},
                    },
                }));
                AsyncStorage.setItem(`watchTime_${id}`, JSON.stringify({position, isEpisode}));
            },

            /** Retrieve from AsyncStorage or backend if none saved locally */
            getLastPlaybackPosition: async (id, isEpisode) => {
                const raw = await AsyncStorage.getItem(`watchTime_${id}`);
                let lastPos = raw ? JSON.parse(raw).position : 0;

                if (lastPos === 0) {
                    lastPos = await fetchWatchTime(id, isEpisode);
                    console.log(`Fetched resume position from backend: ${lastPos}`);
                    if (lastPos > 0) {
                        set(s => ({
                            lastPlaybackPositions: {
                                ...s.lastPlaybackPositions,
                                [id]: {position: lastPos, isEpisode},
                            },
                        }));
                        AsyncStorage.setItem(`watchTime_${id}`, JSON.stringify({position: lastPos, isEpisode}));
                    }
                }
                return lastPos;
            },

            /** Starts the second-by-second timer driving both resume-sync & reward */
            startTimer: () => {
                const intervalId = setInterval(async () => {
                    // bump both counters
                    set(s => ({
                        watchTime: s.watchTime + 1,
                        rewardTime: s.rewardTime + 1,
                    }));
                    const {watchTime, rewardTime, lastPlaybackPositions, lastADTimestamp, rewardInterval} = get();
                    const now = Date.now();

                    // ——— every 30s: persist positions to backend ———
                    if (watchTime >= RESUME_SYNC_INTERVAL) {
                        set({watchTime: 0});
                        for (const [id, {position, isEpisode}] of Object.entries(lastPlaybackPositions)) {
                            try {
                                const success = await syncWatchTimeWithBackend(id, position, isEpisode);
                                if (success) {
                                    console.log(`Auto-synced resume for ${isEpisode ? 'episode' : 'movie'} ${id}`);
                                }
                            } catch (err) {
                                console.error('Resume sync error:', err);
                            }
                        }
                    }

                    // ——— every 216s: award 1 AD ———
                    if (rewardTime >= rewardInterval && now - lastADTimestamp >= rewardInterval * 1000) {
                        set({rewardTime: 0, lastADTimestamp: now});
                        try {
                            await awardAD();
                            await useAuthStore.getState().hydrateUser();
                        } catch (err) {
                            console.error('AD reward error:', err);
                        }
                    }
                }, 1000);

                set({timer: intervalId as unknown as number});
            },

            /** Stops the interval */
            pauseTimer: () => {
                const {timer} = get();
                if (timer !== null) {
                    clearInterval(timer);
                    set({timer: null});
                }
            },

            /** Stops & resets both counters */
            resetTimer: () => {
                const {timer} = get();
                if (timer) {
                    clearInterval(timer);
                }
                set({timer: null, watchTime: 0, rewardTime: 0});
            },

            /** Manual trigger for AD award (if you ever need it) */
            handleCountWatchTime: async () => {
                const {rewardTime, rewardInterval} = get();
                if (rewardTime >= rewardInterval) {
                    set({rewardTime: 0});
                    try {
                        await awardAD();
                        await useAuthStore.getState().hydrateUser();
                    } catch (err) {
                        console.error('AD reward error:', err);
                    }
                }
            },

            /** Manual sync of all pending resume positions */
            syncWatchTime: async () => {
                const {lastPlaybackPositions} = get();
                for (const [id, {position, isEpisode}] of Object.entries(lastPlaybackPositions)) {
                    const success = await syncWatchTimeWithBackend(id, position, isEpisode);
                    if (success) {
                        console.log(`Synced watchTime for ${isEpisode ? 'episode' : 'movie'} ${id} successfully.`);
                        set(s => {
                            const updated = {...s.lastPlaybackPositions};
                            delete updated[id];
                            return {lastPlaybackPositions: updated};
                        });
                        AsyncStorage.removeItem(`watchTime_${id}`);
                    }
                }
            },
        }),
        {
            name: 'watchTime-store',
            storage: {
                getItem: async (name) => {
                    const value = await AsyncStorage.getItem(name);
                    return value ? JSON.parse(value) : null;
                },
                setItem: async (name, value) => {
                    await AsyncStorage.setItem(name, JSON.stringify(value));
                },
                removeItem: async (name) => {
                    await AsyncStorage.removeItem(name);
                },
            },
        },
    ),
);

export default useWatchTimeStore;
