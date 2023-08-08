import axios from "axios";
export const isProduction = process.env.NODE_ENV === "production";

const determineBaseURL = (): string => {
    console.log("Current ENV:", process.env.NODE_ENV);

    switch (process.env.NODE_ENV) {
        case "production":
            return "https://akcru-api.fly.dev/";
        // case "staging":
        //     return "https://staging.api.akcru.com";
        default:
            return process.env.DEV_API_URL ?? 'http://10.0.2.2:3000';
    }
};

const API = axios.create({
    baseURL: determineBaseURL(),
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
});

console.log("Backend API Client Base URL:", API.defaults.baseURL);


export { API };
