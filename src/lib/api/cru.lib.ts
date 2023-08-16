import { IMovie, ICruView } from "../../../types";
import { API } from "../../clients/api.client";

export const getMyCRU = async () => {
    // GET /v1/cru/me
    const { data } = await API.get(`/v1/cru/me`);
    return data.CRU;
}

export const getMyCRUViews = async (params?: { upcoming?: boolean, past?: boolean }) : Promise<ICruView[] | undefined> => {
    // GET /v1/cru/views/me

    // if params is empty return all CRUViews
    if (!params) {
        const { data } = await API.get(`/v1/cru/views/me`);
        if (data.success === false) {
            return []
        }

        const { CRUViews }: { CRUViews: ICruView[] } = data

        return CRUViews;
    }

    const { upcoming, past } = params

    if (upcoming) {
        const { data } = await API.get(`/v1/cru/views/me?upcoming=${upcoming}`);
    
        return data.CRUViews;
    }
    if (past) {
        const { data } = await API.get(`/v1/cru/views/me?past=${past}`);
    
        return data.CRUViews;
    }
}

export const createACRUView = async (params: {movieId: string, startTime: string, timezone: string}) => {
    // POST /v1/cru/create-cru-view
    const { movieId, startTime, timezone } = params
    const { data } = await API.post(`/v1/cru/create-cru-view`, 
        {movieId, startTime, timezone}
    );

    return data.CRUView;
}
