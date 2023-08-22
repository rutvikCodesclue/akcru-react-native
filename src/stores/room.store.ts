import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { AuthResponse, Session} from '@supabase/supabase-js'
import { HMSSDK, HMSUpdateListenerActions } from '@100mslive/react-native-hms';
import { MutableRefObject, useRef } from "react";

interface IRoomStore {
    hmsInstance: HMSSDK | undefined;
    initHMS: () => Promise<void>;
    destroyHMS: () => Promise<void>;
}


const useRoomStore = create<IRoomStore>()(persist(
    // FIXME: create handlers and import them here
    (set, get) => ({
        hmsInstance: undefined,
        initHMS: async () => {
            // teardown previous instance & rebuild
            get().destroyHMS();

            const hmsInstance = await HMSSDK.build(); // save this hms instance in store
            // store a ref to the hms instance
            const ref = useRef(hmsInstance);
            
            set({ hmsInstance: ref.current });
        },
        destroyHMS: async () => {
            // teardown previous instance & rebuild
            let existingInstance = get().hmsInstance;
            if (existingInstance) {
                console.log("destroying existing instance");
                await existingInstance.leave();
                await existingInstance.destroy();
                
                set({ hmsInstance: undefined });
            } 
        }
    }), 
    ({ name: "room-store", storage: createJSONStorage(() => AsyncStorage) })) );

export default useRoomStore;