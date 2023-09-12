import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { updateUserWatchTime } from "../lib/api/user.lib";


interface IWatchTimeState {
    watchTime: number;
    timer: NodeJS.Timer | null;
    startTimer: () => void;
    pauseTimer: () => void;
    resetTimer: () => void;
    handleSkip: () => void;
    handlePause: () => void;
    handleCountWatchTime: () => Promise<void>;
}

const useWatchTimeStore = create<IWatchTimeState>()(persist(
    (set, get) => ({
        watchTime: 0,
        timer: null,
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
            
            if (!interval) {
                console.log("No timer found");
            } else {
                clearInterval(interval);
                set({ timer: null });

            }
        },
        resetTimer: () => {
            // get the timer from the store as interval
            const { timer: interval } = get();
            console.log("timer", interval);
            
            
            if (!interval) {
                console.log("No timer found");
            } else {
                clearInterval(interval);
                set({ timer: null, watchTime: 0 });
            }
        },
        handleSkip: () => {
            // get the timer from the store as interval
            const { timer: interval } = get();
            
            if (!interval) {
                console.log("No timer found");
            } else {
                set({ watchTime: 0 });
                clearInterval(interval);
                // Handle skip logic here, e.g., jump to a different part of the video
            }
            
        },
        handlePause: () => {
            // get the timer from the store as interval
            const { timer: interval } = get();
            
            if (!interval) {
                console.log("No timer found");
                
            } else {
                clearInterval(interval);
                // Handle pause logic here, e.g., pause the video playback
            }
            
        },
        handleCountWatchTime: async () => {
            // get the timer from the store as interval
            const { watchTime } = get();
            
            if (watchTime === 30) {
                console.log("30 seconds");
                console.log("<== SENDING TO API ==>");
                // reset the timer
                set({ watchTime: 0 });
                // call the api to update the watch time
                await updateUserWatchTime({})
            }
        },
    }), 
    ({ name: "watchTime-store", storage: createJSONStorage(() => AsyncStorage) })) );

export default useWatchTimeStore;

