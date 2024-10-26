import {IMovie, IUserProfile} from '../../../types';
import {API} from '../../clients/api.client';
import useAuthStore from '../../stores/auth.store';

export const getMe = async (): Promise<IUserProfile | undefined> => {
    try {
        const {data} = await API.get('/v1/auth/me');

        if (data.success === false) {
            return undefined;
        }

        return data.user;
    } catch (error) {
        console.error(error);
        return undefined;
    }
};

export const findAUser = async (params: {
    id?: string;
    username?: string;
    email?: string;
}): Promise<IUserProfile | undefined> => {
    try {
        const {id, username, email} = params;

        const {data} = await API.post('/v1/user/find', {
            id: id ?? undefined,
            username: username ?? undefined,
            email: email ?? undefined,
        });

        if (data.success === false) {
            return undefined;
        }

        return data.user;
    } catch (error) {
        console.error(error);
        return undefined;
    }
};

export const searchForUsers = async (search: string): Promise<IUserProfile[] | []> => {
    try {
        const {data} = await API.post('/v1/user/search', {
            search,
        });

        if (data.success === false) {
            return [];
        }

        return data.result;
    } catch (error) {
        console.error(error);
        return [];
    }
};

export const fetchRandomUsers = async (): Promise<IUserProfile[] | []> => {
    try {
        const {data} = await API.get('/v1/user/random');

        if (data.success === false) {
            return [];
        }

        return data.users;
    } catch (error) {
        console.error(error);
        return [];
    }
};

export const updateUser = async (params: {
    username?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    description?: string;
    phone?: string;
    password?: string;
    dob?: string;
    archetype?: string;
    gender?: string;
}): Promise<IUserProfile | undefined> => {
    try {
        const {username, firstName, lastName, email, description, phone, password, dob, archetype, gender} = params;

        const updateUserObj = {
            ...(username && {username}),
            ...(firstName && {firstName}),
            ...(lastName && {lastName}),
            ...(email && {email}),
            ...(description && {description}),
            ...(phone && {phoneNumber: phone}),
            ...(password && {password}),
            ...(dob && {dateOfBirth: dob}),
            ...(archetype && {archetype}),
            ...(gender && {gender}),
        };

        //console.log('Update User Object:', updateUserObj);

        const {data} = await API.put('/v1/user', updateUserObj);

        if (data.success === false) {
            return undefined;
        }

        return data.updatedUser;
    } catch (error) {
        console.error(error, error.message);
        return undefined;
    }
};

export const updateUserProfilePicture = async (params: {
    uri: string;
    type: string;
    name: string;
}): Promise<IUserProfile | undefined> => {
    try {
        const {uri, type, name} = params;

        //if (type !== 'image/jpeg' && type !== 'image/png') {

        //}

        const form = new FormData();
        form.append('image', {
            type,
            uri,
            name,
        });

        const {data} = await API.put('/v1/user/profilePicture', form, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (data.success === false) {
            return undefined;
        }

        return data.updatedUser;
    } catch (error) {
        console.error(error);
        return undefined;
    }
};

export const updateUserGallery = async (params: {
    uri: string;
    type: string;
    name: string;
}): Promise<IUserProfile | undefined> => {
    try {
        const {uri, type, name} = params;

        const form = new FormData();
        form.append('images', {
            type,
            uri,
            name,
        });

        const {data} = await API.post('/v1/user/profileGallery/add', form, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        //console.log('data', data);
        if (data.success === false) {
            return undefined;
        }

        return data.updatedUser;
    } catch (error) {
        console.error(error);
        //console.log('Update add to gallery', error);
        return undefined;
    }
};

export const deleteUserGalleryImage = async (imageUrl: string): Promise<IUserProfile | undefined> => {
    try {
        const {data} = await API.delete(`/v1/user/profileGallery/delete?imageUrl=${encodeURIComponent(imageUrl)}`);

        console.log('data', data);

        if (data.success === false) {
            return undefined;
        }

        return data.gallery;
    } catch (error) {
        console.error('Error deleting image from gallery:', error);
        return undefined;
    }
};

export const fetchUserGallery = async (id: IUserProfile) => {
    try {
        const {data} = await API.get('/v1/user/profileGallery');

        if (data.success) {
            return data.gallery;
        } else {
            console.error('Failed to fetch gallery:', data.message);
            return [];
        }
    } catch (error) {
        console.error('Error fetching user gallery:', error);
        return [];
    }
};

export const updateUserWatchTime = async (params: {
    watchTime?: number;
    movieId?: string;
}): Promise<boolean | undefined> => {
    try {
        const {watchTime, movieId} = params;

        const {data} = await API.put('/v1/watchtime/me', {});

        if (data.success === false) {
            return false;
        }

        return true;
    } catch (error) {
        console.error(error);
        return undefined;
    }
};

/*
    TODO: test these
*/

export const getGalleryLikeCount = async (imageUrl: string): Promise<any> => {
    try {
        const response = await API.get(`/v1/user/gallery/like-count?imageUrl=${encodeURIComponent(imageUrl)}`);
        if (response.data.success === false) {
            return undefined;
        }

        return response.data;
    } catch (error) {
        console.error('Error getting gallery like count:', error);
        return undefined;
    }
};

export const likeGalleryItem = async (imageUrl: string): Promise<any> => {
    try {
        const response = await API.post(`/v1/user/gallery/like?imageUrl=${encodeURIComponent(imageUrl)}`);
        if (response.data.success === false) {
            return undefined;
        }

        return response.data.message;

    } catch (error) {
        console.error('Error liking gallery item:', error);
        return undefined;
    }
};

export const unlikeGalleryItem = async (imageUrl: string): Promise<any> => {
    try {
        const response = await API.post(`/v1/user/gallery/unlike?imageUrl=${encodeURIComponent(imageUrl)}`);
        if (response.data.success === false) {
            return undefined;
        }
        return response.data.message;

    } catch (error) {
        console.error('Error unliking gallery item:', error);
        return undefined;
    }
};

export const toggleFollow = async (
    targetUserId: string,
): Promise<{success: boolean; isFollowing: boolean; message?: string}> => {
    try {
        const response = await API.post('/v1/user/toggle-follow', {
            targetUserId: targetUserId,
        });

        return response.data;
    } catch (error) {
        console.error('Error in toggleFollow:', error);

        return {
            success: false,
            isFollowing: false,
            message: 'An error occurred while attempting to toggle follow status.',
        };
    }
};

export const followUser = async (params: {userId?: string}): Promise<boolean | undefined> => {
    try {
        const {userId} = params;

        const {data} = await API.post('/v1/user/follow', {
            id: userId,
        });

        if (data.success === false) {
            return false;
        }

        return true;
    } catch (error) {
        console.error(error);
        return undefined;
    }
};

export const unfollowUser = async (params: {userId?: string}): Promise<boolean | undefined> => {
    try {
        const {userId} = params;

        const {data} = await API.post('/v1/user/unfollow', {
            id: userId,
        });

        if (data.success === false) {
            return false;
        }

        return true;
    } catch (error) {
        console.error(error);
        return undefined;
    }
};

export const getFollowers = async (userId: string): Promise<Object | undefined> => {
    try {
        const {data} = await API.get(`/v1/user/followers?userId=${encodeURIComponent(userId)}`);

        if (data.success === false) {
            return undefined;
        }

        return data;
    } catch (error) {
        console.error(error);
        return undefined;
    }
};

export const getFollowersCount = async (userId: string): Promise<Object | undefined> => {
    try {
        const {data} = await API.get(`/v1/user/followers?count=true&userId=${encodeURIComponent(userId)}`);

        if (data.success === false) {
            return undefined;
        }

        return data;
    } catch (error) {
        console.error(error);
        return undefined;
    }
};

export const getUserFollowing = async (userId: string): Promise<Object | undefined> => {
    try {
        const {data} = await API.get(`/v1/user/following?userId=${encodeURIComponent(userId)}`);

        if (data.success === false) {
            return undefined;
        }

        return data;
    } catch (error) {
        console.error(error);
        return undefined;
    }
};

export const getUserFollowingCount = async (userId: string): Promise<Object | undefined> => {
    try {
        const {data} = await API.get(`/v1/user/following?count=true&userId=${encodeURIComponent(userId)}`);

        if (data.success === false) {
            return undefined;
        }

        return data;
    } catch (error) {
        console.error(error);
        return undefined;
    }
};

export const startUserWatching = async (id: string, isEpisode: boolean): Promise<boolean> => {
    await useAuthStore.getState().hydrateAuth();
    const userId = useAuthStore.getState().user?.id;
    console.log('Starting user watching:', id, isEpisode ? 'episode' : 'movie');
    try {
        const response = await API.post('/v1/user/currentWatching/start', {
            userId,
            movieId: isEpisode ? undefined : id,
            episodeId: isEpisode ? id : undefined,
        });
        return response.data.success;
    } catch (error) {
        console.error('Error starting user watching:', error);
        return false;
    }
};

export const finishUserWatching = async (id: string, isEpisode: boolean): Promise<boolean> => {
    await useAuthStore.getState().hydrateAuth();
    console.log('Finishing user watching:', id, isEpisode ? 'episode' : 'movie');
    
    try {
        const requestData = {
            movieId: isEpisode ? undefined : id,
            episodeId: isEpisode ? id : undefined,
        };
        console.log('Request data:', requestData);
        console.log('Making request to URL:', API.defaults.baseURL + '/v1/user/currentWatching/finish');

        const response = await API.post('/v1/user/currentWatching/finish', requestData);
        return response.data.success;
    } catch (error) {
        console.log('userLib Finish Error');
        console.error('Error finishing user watching:', error.response?.data || error.message);
        console.error('Request failed with status code', error.response?.status || 'unknown');
        return false;
    }
};

export const getUserCurrentWatching = async (userId: string): Promise<any | undefined> => {
    try {
        const {data} = await API.get(`/v1/user/currentWatching/${encodeURIComponent(userId)}`);

        if (data.success === false) {
            console.error(data.message);
            return undefined;
        }

        return data.currentWatching;
    } catch (error) {
        console.error("Error fetching user's current watching:", error);
        return undefined;
    }
};

export const logUserMovieWatchHistory = async (userId: string, movieId: string) => {
    try {
        const response = await API.post('/v1/user/logMovieWatch', {
            userId,
            movieId,
        });

        if (response.data && response.data.success) {
            return true;
        } else {
            console.error('Failed to log watch history:', response.data.message);
            return false;
        }
    } catch (error) {
        console.error('Error logging watch history:', error);
        return false;
    }
};

export const logUserContentWatchHistory = async (userId: string, id: string, isEpisode: boolean) => {
    try {
        const response = await API.post('/v1/user/logContentWatch', {
            userId,
            movieId: isEpisode ? undefined : id,
            episodeId: isEpisode ? id : undefined,
        });

        if (response.data && response.data.success) {
            console.log('Watch history logged successfully:', response.data.watchHistory);
            return true;
        } else {
            console.error('Failed to log watch history:', response.data.message);
            return false;
        }
    } catch (error) {
        console.error('Error logging watch history:', error);
        return false;
    }
};

interface ReportData {
    email: string;
    imageURL?: string[];
    description: string;
    type: string;
    name: string;
}

export const sendReportToBackend = async ({
    email,
    imageURL,
    description,
    type,
    name,
}: ReportData): Promise<{success: boolean; message: string}> => {
    try {
        const response = await API.post('/v1/user/raise-a-query', {
            email,
            imageURL: imageURL ?? undefined,
            description,
            type,
            name,
        });
        if (response.data && response.data.success) {
            //console.log('Report successfully submitted:', response.data);
            return {success: true, message: 'Report successfully submitted.'};
        } else {
            console.error('Failed to submit report:', response.data);
            return {success: false, message: response.data.message || 'Failed to submit report.'};
        }
    } catch (error) {
        console.error('Error submitting report:', error);
        return {
            success: false,
            message: error.response?.data?.message || 'An error occurred while submitting the report.',
        };
    }
};

export const uploadImages = async (uris: string[]): Promise<string[] | undefined> => {
    //console.log('Attempting to upload image:', uris);
    if (!uris.length) {
        //console.log('No URI provided for upload');
        return undefined;
    }

    const formData = new FormData();

    uris.forEach((uri, index) => {
        const fileExtension = uri.split('.').pop()?.toLowerCase() ?? 'jpg';
        let mimeType = 'image/jpeg';
        if (fileExtension === 'png') {
            mimeType = 'image/png';
        }

        formData.append('images', {
            uri: uri,
            type: mimeType,
            name: `upload_${index}.${fileExtension}`,
        });
    });

    try {
        const response = await API.post('/v1/user/uploadPictures', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        //console.log('Upload response:', response.data);

        if (response.data && response.data.success) {
            return response.data;
        } else {
            console.error('Failed to upload image:', response.data.message);
            return undefined;
        }
    } catch (error) {
        console.error('Error uploading image:', error);
        return undefined;
    }
};

interface AbuseReportData {
    description: string;
    email: string;
    imageURL?: string[];
    type: string;
    reportedByUserId: string;
    userId: string;
}

export const sendAbuseReportToBackend = async ({
    description,
    email,
    imageURL,
    type,
    reportedByUserId,
    userId,
}: AbuseReportData): Promise<{success: boolean; message: string}> => {
    try {
        const response = await API.post('/v1/user/report-user', {
            description,
            email,
            imageURL: imageURL ?? undefined,
            type,
            reportedByUserId,
            userId,
        });
        if (response.data && response.data.success) {
            //console.log('Report successfully submitted:', response.data);
            return {success: true, message: 'Report successfully submitted.'};
        } else {
            console.error('Failed to submit report:', response.data);
            return {success: false, message: response.data.message || 'Failed to submit report.'};
        }
    } catch (error) {
        console.error('Error submitting report:', error);
        return {
            success: false,
            message: error.response?.data?.message || 'An error occurred while submitting the report.',
        };
    }
};

export const blockUser = async (blockedId: string): Promise<{success: boolean; message: string}> => {
    try {
        const response = await API.post('/v1/user/block-user', {blockedId});
        if (response.data && response.data.success) {
            //console.log('User successfully blocked:', response.data);
            return {success: true, message: 'User successfully blocked.'};
        } else {
            console.error('Failed to block user:', response.data.message);
            return {success: false, message: response.data.message || 'Failed to block user.'};
        }
    } catch (error) {
        console.error('Error blocking user:', error);
        return {success: false, message: error.response?.data?.message || 'An error occurred while blocking the user.'};
    }
};

export const getBlockedUsers = async (): Promise<{
    success: boolean;
    message: string;
    blockedUsers?: IUserProfile[];
}> => {
    try {
        const response = await API.get('/v1/user/blocked-users');
        if (response.data && response.data.success) {
            //console.log('Retrieved blocked users successfully:', response.data.blockedUsers);
            return {
                success: true,
                message: 'Blocked users retrieved successfully.',
                blockedUsers: response.data.blockedUsers,
            };
        } else {
            console.error('Failed to retrieve blocked users:', response.data.message);
            return {success: false, message: response.data.message || 'Failed to retrieve blocked users.'};
        }
    } catch (error) {
        console.error('Error retrieving blocked users:', error);
        return {
            success: false,
            message: error.response?.data?.message || 'An error occurred while retrieving blocked users.',
        };
    }
};

export const unblockUser = async (userIdToUnblock: string): Promise<{success: boolean; message?: string}> => {
    try {
        const {data} = await API.post('/v1/user/unblock', {userIdToUnblock});

        if (data.success) {
            //console.log('User unblocked successfully:', data.message);
            return {success: true, message: data.message};
        } else {
            console.error('Failed to unblock user:', data.message);
            return {success: false, message: data.message};
        }
    } catch (error) {
        console.error('Error unblocking user:', error);
        return {success: false, message: 'An error occurred while trying to unblock the user.'};
    }
};

export const fetchUnfinishedMovies = async (): Promise<IMovie[]> => {
    try {
        const response = await API.get<{success: boolean; unfinishedMovies: IMovie[]}>('/v1/user/unfinished-movies');
        if (response.data.success) {
            return response.data.unfinishedMovies;
        } else {
            console.log('Failed to fetch unfinished movies:', response.data);
            return [];
        }
    } catch (error) {
        console.error('Error fetching unfinished movies:', error);
        return [];
    }
};

export const removeUnfinishedMovie = async (movieId: string): Promise<boolean> => {
    console.log('Removing movie from unfinished list:', movieId);
    try {
        const response = await API.delete(`/v1/user/unfinished-movies/${movieId}`);
        if (response.data.success) {
            console.log('Movie removed from unfinished list successfully:', movieId);
            return true;
        } else {
            console.log('Failed to remove movie from unfinished list:', response.data.message);
            return false;
        }
    } catch (error) {
        console.error('Error removing movie from unfinished list:', error.response ? error.response.data : error);
        return false;
    }
};

export const fetchUnfinishedContent = async (): Promise<any[]> => {
    await useAuthStore.getState().hydrateAuth();
    try {
        const {data} = await API.get('/v1/user/unfinished');
        if (data.success) {
            return data.unfinishedContent;
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error fetching unfinished content:', error);
        return [];
    }
};

export const removeUnfinishedContent = async (id: string, isEpisode: boolean): Promise<boolean> => {
    const endpoint = isEpisode ? `/v1/user/remove/episode/${id}` : `/v1/user/remove/movie/${id}`;
    try {
        const response = await API.put(endpoint);
        return response.data.success;
    } catch (error) {
        console.error('Error removing unfinished content:', error);
        return false;
    }
};

export const fetchUsersWithFollowers = async (): Promise<IUserProfile[] | []> => {
    try {
        const {data} = await API.get('/v1/user/users-with-followers');

        if (data.success === false) {
            return [];
        }

        return data.users;
    } catch (error) {
        console.error('Error fetching users with followers:', error);
        return [];
    }
};