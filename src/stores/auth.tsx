import { create } from 'zustand';
import { StateStorage } from 'zustand/middleware'

import { createSelectors } from './_utils';
import { storage } from './_storage';

const TOKEN = 'token'


const zustandStorage: StateStorage = {
    setItem: (name, value) => {
        return storage.set(name, value)
    },
    getItem: (name) => {
        const value = storage.getString(name)
        return value ?? null
    },
    removeItem: (name) => {
        return storage.delete(name)
    },
}


export const getToken = () => zustandStorage.getItem(TOKEN);
export const removeToken = () => zustandStorage.removeItem(TOKEN);
export const setToken = (value: string) => zustandStorage.setItem(TOKEN, value);

interface AuthState {
    token: string | null;
    status: 'idle' | 'signOut' | 'signIn';
    signIn: (data: string) => void;
    signOut: () => void;
    hydrate: () => void;
}

const _useAuth = create<AuthState>((set, get) => ({
    status: 'idle',
    token: null,
    signIn: (token) => {
        setToken(token);
        set({ status: 'signIn', token });
    },
    signOut: () => {
        removeToken();
        set({ status: 'signOut', token: null });
    },
    hydrate: () => {
        try {
            const userToken = getToken();
            if (userToken !== null) {
                get().signIn(userToken);
            } else {
                get().signOut();
            }
        } catch (e) {
            // catch error here
            // Maybe sign_out user!
        }
    },
}));

export const useAuth = createSelectors(_useAuth);

export const signOut = () => _useAuth.getState().signOut();
export const signIn = (token: TokenType) => _useAuth.getState().signIn(token);
export const hydrateAuth = () => _useAuth.getState().hydrate();