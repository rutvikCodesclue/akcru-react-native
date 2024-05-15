import AsyncStorage from '@react-native-async-storage/async-storage';
import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import {IMovie} from '../../types';

interface IGlobalStore {
    movies: IMovie[];
}

const useGlobalStore = create<IGlobalStore>()(
    persist(
        (set, get) => ({
            movies: [],
        }),
        {name: 'akcru-store', storage: createJSONStorage(() => AsyncStorage)},
    ),
);

export default useGlobalStore;
