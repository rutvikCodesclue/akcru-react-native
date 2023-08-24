import axios from "axios";
export const isProduction = process.env.NODE_ENV === "production";
import { DEV_API_URL} from "@env"
import authStore from "../stores/auth.store";

const accessToken = authStore.getState().session?.access_token;

console.log("Current ENV for API:", process.env.NODE_ENV);

const determineBaseURL = (): string => {
    switch (process.env.NODE_ENV) {
        case "production":
            return "https://akcru-api.fly.dev/";
        // case "staging":
        //     return "https://staging.api.akcru.com";
        default:
            return DEV_API_URL ?? 'http://10.0.2.2:3000';
    }
};

const API = axios.create({
    baseURL: determineBaseURL(),
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Authorization": accessToken ? `Bearer ${accessToken}` : undefined,
    },
});

console.log('Backend API Client Base URL:', 'https://akcru-api.fly.dev/');


export { API };
