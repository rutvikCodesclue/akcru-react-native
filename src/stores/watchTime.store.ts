import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { updateUserWatchTime } from "../lib/api/user.lib";
import useAuthStore from "./auth.store";
import { updateWatchTime as syncWatchTimeWithBackend } from "../lib/api/watchtime.lib"; // Adjust path as necessary

interface IWatchTimeState {
    watchTime: number;
    timer: NodeJS.Timer | null;
    lastPlaybackPositions: { [movieId: string]: number };
    resumeVideo: (videoRef: React.RefObject<any>, movieId: string) => void;
    startTimer: () => void;
    pauseTimer: () => void;
    resetTimer: () => void;
    setLastPlaybackPosition: (movieId: string, position: number) => void;
    getLastPlaybackPosition: (movieId: string) => number;
    handleCountWatchTime: () => Promise<void>;
    syncWatchTime: () => Promise<void>;
}

const useWatchTimeStore = create<IWatchTimeState>()(persist(
    (set, get) => ({
        watchTime: 0,
        timer: null,
        lastPlaybackPositions: {},
        resumeVideo: (videoRef: React.RefObject<any>, movieId: string) => {
            const lastPlaybackPosition = get().getLastPlaybackPosition(movieId);
            if (videoRef.current && lastPlaybackPosition > 0) {
                videoRef.current.seek(lastPlaybackPosition);
            }
        },
        setLastPlaybackPosition: (movieId: string, position: number) => {
            set(state => ({
                lastPlaybackPositions: { ...state.lastPlaybackPositions, [movieId]: position }
            }));
            // Immediately save to AsyncStorage to ensure data is not lost on app crash
            AsyncStorage.setItem(`watchTime_${movieId}`, JSON.stringify(position));
        },
        getLastPlaybackPosition: (movieId: string) => {
            return get().lastPlaybackPositions[movieId] || 0;
        },
        startTimer: () => {
            const interval = setInterval(async () => {
                set((state) => ({ watchTime: state.watchTime + 1 }));
                await get().handleCountWatchTime();
            }, 1000);
            set({ timer: interval });
        },
        pauseTimer: () => {
            const { timer } = get();
            if (timer) {
                clearInterval(timer);
                set({ timer: null });
            }
        },
        resetTimer: () => {
            const { timer } = get();
            if (timer) {
                clearInterval(timer);
                set({ timer: null, watchTime: 0 });
            }
        },
        handleCountWatchTime: async () => {
            const { watchTime } = get();
            const POINTS_INTERVAL = 30;
            if (watchTime >= POINTS_INTERVAL) {
                set({ watchTime: 0 });
                console.log("<== send user AD for watch time ==>");
                await updateUserWatchTime({}); // Update with the correct API call parameters
                // Rehydrate the auth store to reflect any changes
                await useAuthStore.getState().hydrateUser();
            }
        },
        syncWatchTime: async () => {
            // Sync all movies' watch times with backend
            const { lastPlaybackPositions } = get();
            for (const [movieId, watchTime] of Object.entries(lastPlaybackPositions)) {
                const success = await syncWatchTimeWithBackend(movieId, watchTime);
                if (success) {
                    console.log(`Watch time for movie ${movieId} synced successfully.`);
                    // Optionally reset watch time for this movieId after successful sync
                    set(state => {
                        const updatedPositions = { ...state.lastPlaybackPositions };
                        delete updatedPositions[movieId]; // Remove synced movieId
                        return { lastPlaybackPositions: updatedPositions };
                    });
                    // Clear from AsyncStorage as well
                    AsyncStorage.removeItem(`watchTime_${movieId}`);
                }
            }
        },
    }), 
    { 
        name: "watchTime-store", 
        getStorage: () => AsyncStorage,
        // Specify any additional persist middleware options if necessary
    }
));

export default useWatchTimeStore;
