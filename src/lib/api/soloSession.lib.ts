import {API} from '../../clients/api.client';
import {SoloSessionVibe} from '../../types/SoloSessionVibe';

export type SetSoloSessionVibeResponse = {
    success: boolean;
    message?: string;
};

/**
 * Persist the user's selected Solo Session vibe.
 *
 * Called when the user taps "Start Session" in the Solo Vibe bottom sheet.
 * The auth header is attached automatically by the API client interceptor.
 */
export const setSoloSessionVibe = async (
    vibe: SoloSessionVibe,
): Promise<SetSoloSessionVibeResponse> => {
    try {
        const {data} = await API.post('/v1/solo-session/vibe', {vibe});

        if (data?.success === false) {
            return {success: false, message: data?.message};
        }

        return {success: true, message: data?.message};
    } catch (error) {
        console.error('setSoloSessionVibe error:', error);
        return {success: false, message: 'Failed to set solo session vibe'};
    }
};
