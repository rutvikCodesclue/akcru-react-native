import {ITrailer} from '../../../types';
import {API} from '../../clients/api.client';
import useAuthStore from '../../stores/auth.store';

export const getTrailers = async () => {
    await useAuthStore.getState().hydrateAuth();
    try {
        const {data} = await API.get('/v1/trailers');

        if (data.success === false) {
            console.log(data.message);
            return [];
        }

        return data.trailers;
    } catch (error) {
        console.error('Error fetching trailers:', error);
        return [];
    }
};

export const getTrailerById = async (trailerId: string): Promise<ITrailer | null> => {
    await useAuthStore.getState().hydrateAuth();
    try {
        const {data} = await API.get(`/v1/trailers/${trailerId}`);

        if (data.success === false) {
            console.log(data.message);
            return null;
        }

        return data.trailer;
    } catch (error) {
        console.error(`Error fetching trailer with ID ${trailerId}:`, error);
        return null;
    }
};

export const handleTrailerReaction = async (trailerId: string, reactionType: string) => {
    await useAuthStore.getState().hydrateAuth();
    try {
        const {data} = await API.post(`/v1/trailers/${trailerId}/reactions`, {reactionType});

        if (data.success === false) {
            console.log(data.message);
            return null;
        }

        return data.message;
    } catch (error) {
        console.error(`Error handling reaction for trailer with ID ${trailerId}:`, error);
        return null;
    }
};

export const getUserTrailerReaction = async (trailerId: string) => {
    await useAuthStore.getState().hydrateAuth();
    try {
        const {data} = await API.get(`/v1/trailers/${trailerId}/user-reaction`);

        if (data.success === false) {
            console.log(data.message);
            return null;
        }

        return data.reaction;
    } catch (error) {
        console.error(`Error fetching user reaction for trailer with ID ${trailerId}:`, error);
        return null;
    }
};

export const getTrailerReactionStats = async (trailerId: string) => {
    await useAuthStore.getState().hydrateAuth();
    try {
        const {data} = await API.get(`/v1/trailers/${trailerId}/reaction-stats`);

        if (data.success === false) {
            console.log(data.message);
            return [];
        }

        return data.reactionStats;
    } catch (error) {
        console.error(`Error fetching reaction stats for trailer with ID ${trailerId}:`, error);
        return [];
    }
};
