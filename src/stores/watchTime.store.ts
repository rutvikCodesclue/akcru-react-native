import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { updateUserWatchTime } from "../lib/api/user.lib";
import useAuthStore from "./auth.store";

interface IWatchTimeState {
    watchTime: number;
    timer: NodeJS.Timer | null;
    lastPlaybackPosition: number;
    resumeVideo: (videoRef: React.RefObject<Video>) => void;
    startTimer: () => void;
    pauseTimer: () => void;
    resetTimer: () => void;
    handleCountWatchTime: () => Promise<void>;
    setLastPlaybackPosition: (position: number) => void; // Add this line
    getLastPlaybackPosition: () => number; // Add this line
}

const POINTS_INTERVAL = 30; // time in seconds to send user AD for watching content

const useWatchTimeStore = create<IWatchTimeState>()(persist(
    (set, get) => ({
        watchTime: 0,
        timer: null as NodeJS.Timer | null, // Update the type to allow null
        lastPlaybackPosition: 0, // Initialize with 0
        resumeVideo: (videoRef: React.RefObject<Video>) => {
            if (videoRef.current) {
                const lastPlaybackPosition = get().getLastPlaybackPosition();
                videoRef.current.seek(lastPlaybackPosition);
                // Optionally, you can start the timer again if needed
                // get().startTimer();
            }
        },
        // Other properties...
        setLastPlaybackPosition: (position: number) => {
            set({ lastPlaybackPosition: position });
        },
        getLastPlaybackPosition: () => {
            return get().lastPlaybackPosition;
        },
        startTimer: () => {
            const interval = setInterval(async () => {
                set((state) => ({ watchTime: state.watchTime + 1 }));

                // handle count watch time logic
                await get().handleCountWatchTime();
            }, 1000);
            set({ timer: interval });
        },
        pauseTimer: () => {
            // get the timer from the store as interval
            const { timer: interval } = get();
            
            if (interval) {
                clearInterval(interval);
                set({ timer: null }); // Update the value to null
            }
        },
        resetTimer: () => {
            // get the timer from the store as interval
            const { timer: interval } = get();
            
            if (interval) {
                clearInterval(interval);
                set({ timer: null, watchTime: 0 }); // Update the value to null
            }
        },
        handleSkip: () => {
            // get the timer from the store as interval
            const { timer: interval } = get();
            
            if (interval) {
                set({ watchTime: 0 });
                clearInterval(interval);
                // Handle skip logic here, e.g., jump to a different part of the video
            }
            
        },
        handlePause: () => {
            // get the timer from the store as interval
            const { timer: interval } = get();
            
            if (interval) {
                clearInterval(interval);
                get().setLastPlaybackPosition(currentPlaybackPosition);
                // Handle pause logic here, e.g., pause the video playback
            }
            
        },
        handleCountWatchTime: async () => {
            // get the timer from the store as interval
            const { watchTime } = get();
            
            if (watchTime === POINTS_INTERVAL) {
                // reset the timer
                set({ watchTime: 0 });
                console.log("<== send user AD for watch time ==>");
                
                // call the api to update the watch time
                await updateUserWatchTime({})
                // HACK: hydrate the entire user store to increment the AD in header
                // TODO: find a more efficient way to do this
                await useAuthStore.getState().hydrateUser();
            }
        },
        handlePlay: () => {
            // Get the last playback position
            const lastPlaybackPosition = get().getLastPlaybackPosition();
            // Resume the video from the last playback position
        },
    }), 
    ({ name: "watchTime-store", storage: createJSONStorage(() => AsyncStorage) })) );

export default useWatchTimeStore;

