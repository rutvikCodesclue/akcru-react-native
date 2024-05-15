import AsyncStorage from '@react-native-async-storage/async-storage';
import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import {HMSSDK} from '@100mslive/react-native-hms';
import {useRef} from 'react';

interface IRoomStore {
    hmsInstance: HMSSDK | undefined;
    initHMS: () => Promise<void>;
    destroyHMS: () => Promise<void>;
}

const useRoomStore = create<IRoomStore>()(
    persist(
        (set, get) => ({
            hmsInstance: undefined,
            initHMS: async () => {
                get().destroyHMS();

                const hmsInstance = await HMSSDK.build();

                const ref = useRef(hmsInstance);

                set({hmsInstance: ref.current});
            },
            destroyHMS: async () => {
                let existingInstance = get().hmsInstance;
                if (existingInstance) {
                    console.log('destroying existing instance');
                    await existingInstance.leave();
                    await existingInstance.destroy();

                    set({hmsInstance: undefined});
                }
            },
        }),
        {name: 'room-store', storage: createJSONStorage(() => AsyncStorage)},
    ),
);

export default useRoomStore;
