import { IMovie } from "../../../types";
import { API } from "../../clients/api.client";

export const getMyCRU = async () => {
    // GET /v1/cru/me
    const { data } = await API.get(`/v1/cru/me`);
    return data.CRU;
}

export const getMyCRUViews = async () => {
    // GET /v1/cru/views/me
    const { data } = await API.get(`/v1/cru/views/me`);
    console.log("cru view response:", data);
    
    return data.CRUViews;
}

export const createACRUView = async (params: {movieId: string, startTime: string, timezone: string}) => {
    // POST /v1/cru/create-cru-view
    const { movieId, startTime, timezone } = params
    const { data } = await API.post(`/v1/cru/create-cru-view`, 
        {movieId, startTime, timezone}
    );

    return data.CRUView;
}
