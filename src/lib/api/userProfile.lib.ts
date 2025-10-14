// src/lib/api/userProfile.lib.ts

import {IUserProfile} from '../../../types';
import {API} from '../../clients/api.client';

export async function newVisitUserProfile() {
    try {
        const response = await API.post('/v1/user-profile/isNewVisitUserProfile');
        if (response) {
            return response.data.isNewVisitProfile;
        }
    } catch (error) {
        throw new Error('Error thrown while calling newVisitUserProfile');
    }
}
export async function newVisitUserProfileUpdate() {
    const response = await API.post('/v1/user-profile/newVisitUserProfileUpdate');

    if (response) {
        console.log('data come update successfully', response.data);
        return response.data;
    }
}
