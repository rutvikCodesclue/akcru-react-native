import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { AuthResponse, Session} from '@supabase/supabase-js'
import { supabase } from "../../lib/supabase";
import { API } from "../clients/api.client";

interface IAuthStore {
    session: Session | null;
    user: IUserProfile | null;
    isAuth: () => boolean;
    loginWithEmail: (email: string, password: string) => Promise<{ session: Session, user: IUserProfile } | null>;
    logout: () => Promise<boolean | null>;
}


const useAuthStore = create<IAuthStore>()(persist(
    (set, get) => ({
        session: null,
        user: null,
        loginWithEmail: async (email: string, password: string) => {
            // LOGIN w/ API
            const loginResponse = await API.post("/v1/auth/login", {
                type: "email",
                email: email,
                password: password,
            })

            if (loginResponse.status !== 200) {
                return null;
            }

            const data = loginResponse.data as ILoginResponse;
            const session = data.session 
            const user = data.user

            // set params
            set({ session, user });

            // return session and user
            return { session, user };
        },
        logout: async () => {
            // LOGOUT w/ Supabase
            const { error } = await supabase.auth.signOut();

            if (error) {
                console.log(error);
                return null;
            }

            // set params
            set({ session: null, user: null });

            return true;

        },
        isAuth: (): boolean => {
            return get().session !== null ? true : false;
        }
    }), 
    ({ name: "user-store", storage: createJSONStorage(() => AsyncStorage) })) );

export default useAuthStore;