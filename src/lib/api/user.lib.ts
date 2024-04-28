import {IMovie, IUserProfile} from '../../../types';
import {API} from '../../clients/api.client';

export const getMe = async (): Promise<IUserProfile | undefined> => {
    try {
        // GET /v1/auth/me
        const {data} = await API.get(`/v1/auth/me`);

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
        // GET /v1/cru/me
        const {data} = await API.post(`/v1/user/find`, {
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
        // GET /v1/user/search
        const {data} = await API.post(`/v1/user/search`, {
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
        // Assume your endpoint for fetching random users is /v1/user/random
        const {data} = await API.get(`/v1/user/random`);

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
        // PUT /v1/user/
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

        // Log the updateUserObj to verify its contents
        //console.log('Update User Object:', updateUserObj);

        const {data} = await API.put(`/v1/user`, updateUserObj);

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
        // this should be a file object
        const { uri, type, name } = params;

        // type must be one of the following: image/jpeg, image/png, image/jpg
        //if (type !== 'image/jpeg' && type !== 'image/png') {
         //   console.log('type must be one of the following: image/jpeg, image/png:', type);
           // return undefined;
        //}


        const form = new FormData();
        form.append('image', {
            type,  // Adjust the type as needed (e.g. png, jpeg, gif, etc)
            uri,
            name, // Adjust the filename as needed
        });
        // PUT /v1/user/profilePicture
        const { data } = await API.put(`/v1/user/profilePicture`, form, {
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
        // this should be a file object
        const {uri, type, name} = params;

        const form = new FormData();
        form.append('images', {
            type, // Adjust the type as needed (e.g. png, jpeg, gif, etc)
            uri,
            name, // Adjust the filename as needed
        });
        // PUT /v1/user/profilePicture
        const {data} = await API.post(`/v1/user/profileGallery/add`, form, {
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
        // Send a DELETE request to the backend with imageUrl as a query parameter
        const {data} = await API.delete(`/v1/user/profileGallery/delete?imageUrl=${encodeURIComponent(imageUrl)}`);

        //console.log('data', data);

        if (data.success === false) {
            return undefined;
        }

        return data.updatedUser;
    } catch (error) {
        console.error('Error deleting image from gallery:', error);
        return undefined;
    }
};


export const fetchUserGallery = async (id: IUserProfile) => {
    try {
        const response = await fetch(`/api/user/profileGallery`);
        const data = await response.json();

        if (data.success) {
            return data.gallery; // Return the gallery data
        } else {
            console.error('Failed to fetch gallery:', data.message);
            return []; // Return empty array in case of failure
        }
    } catch (error) {
        console.error('Error fetching user gallery:', error);
        return []; // Return empty array in case of error
    }
};


export const updateUserWatchTime = async (params: {
    watchTime?: number;
    movieId?: string;
}): Promise<boolean | undefined> => {
    try {
        // TODO: in the future, we will want to track these things: watchTime, movieId, movieTime, etc...
        const {watchTime, movieId} = params;
        // PUT /v1/watchtime/me
        const {data} = await API.put(`/v1/watchtime/me`, {
            // watchTime
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

/*
    TODO: test these
*/

// export const toggleFollow = async (
//     targetUserId: string,
// ): Promise<{success: boolean; isFollowing: boolean; message?: string}> => {
//     try {
//         const response = await API.post('/v1/user/toggle-follow', {
//             targetUserId: targetUserId,
//         });

//         // Make sure to return the actual data from the API response
//         return response.data;
//     } catch (error) {
//         console.error('Error in toggleFollow:', error);
//         // Return a default error response
//         return {
//             success: false,
//             isFollowing: false,
//             message: 'An error occurred while attempting to toggle follow status.',
//         };
//     }
// };

export const toggleFollow = async (targetUserId: string): Promise<{success: boolean; isFollowing: boolean; message?: string}> => {
    try {
        const response = await API.post('/v1/user/toggle-follow', {
            targetUserId: targetUserId,
        });

        // Make sure to return the actual data from the API response
        return response.data;
    } catch (error) {
        console.error('Error in toggleFollow:', error);
        // Return a default error response
        return { success: false, isFollowing: false, message: 'An error occurred while attempting to toggle follow status.' };
    }
};



export const followUser = async (params: {userId?: string}): Promise<boolean | undefined> => {
    try {
        const {userId} = params;
        // PUT /v1/watchtime/me
        const {data} = await API.post(`/v1/user/follow`, {
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
        // PUT /v1/watchtime/me
        const {data} = await API.post(`/v1/user/unfollow`, {
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

export const startUserWatching = async (userId: string, movieId: string) => {

    // Check if userId and movieId are strings (or whatever type you expect)
    if (typeof userId !== 'string' || typeof movieId !== 'string') {
        console.error('userId or movieId is not of type string.');
        return false;
    }

    try {
        const response = await API.post('/v1/user/currentWatching/start', {
            userId,
            movieId,
        });

        if (response.data && response.data.success) {
            //console.log('User started watching movie successfully:', response.data.userWatching);
            return true;
        } else {
            console.error('Failed to start watching movie:', response.data.message);
            return false;
        }
    } catch (error) {
        console.error('Error starting user watching movie:', error);
        return false;
    }
};

// export const finishUserWatching = async (userId: string, movieId: string) => {

//     // Check if userId and movieId are strings (or whatever type you expect)
//     if (typeof userId !== 'string' || typeof movieId !== 'string') {
//         console.error('userId or movieId is not of type string.');
//         return false;
//     }

//     try {
//         const response = await API.put(`/v1/user/currentWatching/finish/${movieId}`, {
//             userId, // If needed, though userId might be inferred from the session on the backend
//         });

//         if (response.data && response.data.success) {
//             //console.log('User finished watching movie successfully:', response.data.userWatching);
//             return true;
//         } else {
//             console.error('Failed to finish watching movie:', response.data.message);
//             return false;
//         }
//     } catch (error) {
//         console.error('Error finishing watching movie:', error);
//         return false;
//     }
// };

// export const finishUserWatching = async (movieId: string) => {
//     // Check if movieId is a string (or whatever type you expect)
//     if (typeof movieId !== 'string') {
//         console.error('movieId is not of type string.');
//         return false;
//     }

//     try {
//         // Note: No need to send userId in the body, as the backend uses session-based user identification
//         const response = await API.put(`/v1/user/currentWatching/finish/${movieId}`);

//         if (response.data && response.data.success) {
//             console.log('User finished watching movie successfully:', response.data.userWatching);
//             return true;
//         } else {
//             console.error('Failed to finish watching movie:', response.data.message);
//             return false;
//         }
//     } catch (error) {
//         console.error('Error finishing watching movie:', error);
//         return false;
//     }
// };

export const finishUserWatching = async (movieId: string) => {
    try {
        const response = await API.put(`/v1/user/currentWatching/finish/${movieId}`);
        if (response.data && response.data.success) {
            console.log('User finished watching movie successfully:', response.data.userWatching);
            return true;
        } else {
            console.error('Failed to finish watching movie:', response.data.message);
            return false;
        }
    } catch (error) {
        console.error('Error finishing watching movie:', error);
        return false;
    }
};



export const getUserCurrentWatching = async (userId: string): Promise<any | undefined> => {
    try {
        // GET /v1/user/currentWatching/:userId
        const {data} = await API.get(`/v1/user/currentWatching/${encodeURIComponent(userId)}`);

        if (data.success === false) {
            console.error(data.message);
            return undefined;
        }

        return data.currentWatching; // Returns the list of movies the user is currently watching or the last movie they watched
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
            //console.log('Watch history logged successfully:', response.data.watchHistory);
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
    imageURL?: string[]; // Make imageURL optional since it may not always be provided
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

// export const uploadImage = async (uri?: string): Promise<string | undefined> => {
//     //console.log('Attempting to upload image:', uri);
//     if (!uri) {
//         console.log('No URI provided for upload');
//         return undefined;
//     }

//     const fileExtension = uri.split('.').pop().toLowerCase();
//     let mimeType = 'image/jpeg';
//     if (fileExtension === 'png') {
//         mimeType = 'image/png';
//     }

//     const formData = new FormData();
//     formData.append('images', {
//         // Ensure this matches the backend expectation
//         uri: uri,
//         type: mimeType,
//         name: `upload.${fileExtension}`,
//     });

//     try {
//         const response = await API.post('/v1/user/uploadPictures', formData, {
//             headers: {
//                 'Content-Type': 'multipart/form-data',
//             },
//         });

//         console.log('Upload response:', response.data);

//         // Inside your uploadImage function
//         if (response.data && response.data.success) {
//             return response.data; // Adjust this to match the structure of your actual response
//         } else {
//             console.error('Failed to upload image:', response.data.message);
//             return undefined;
//         }
//     } catch (error) {
//         console.error('Error uploading image:', error);
//         return undefined;
//     }
// };


export const uploadImages = async (uris: string[]): Promise<string[] | undefined> => {
    //console.log('Attempting to upload image:', uris);
    if (!uris.length) {
        //console.log('No URI provided for upload');
        return undefined;
    }


    // const fileExtension = uri.split('.').pop().toLowerCase();
    // let mimeType = 'image/jpeg';
    // if (fileExtension === 'png') {
    //     mimeType = 'image/png';
    // }

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

        // Inside your uploadImage function
        if (response.data && response.data.success) {
            return response.data; // Adjust this to match the structure of your actual response
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
    imageURL?: string[]; // Corrected to be an array of strings or undefined
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

// API client instance is assumed to be configured to include authorization headers

export const blockUser = async (blockedId: string): Promise<{ success: boolean; message: string }> => {
    try {
        const response = await API.post('/v1/user/block-user', { blockedId });
        if (response.data && response.data.success) {
            //console.log('User successfully blocked:', response.data);
            return { success: true, message: 'User successfully blocked.' };
        } else {
            console.error('Failed to block user:', response.data.message);
            return { success: false, message: response.data.message || 'Failed to block user.' };
        }
    } catch (error) {
        console.error('Error blocking user:', error);
        return { success: false, message: error.response?.data?.message || 'An error occurred while blocking the user.' };
    }
};

export const getBlockedUsers = async (): Promise<{ success: boolean; message: string; blockedUsers?: IUserProfile[] }> => {
    try {
        const response = await API.get('/v1/user/blocked-users');
        if (response.data && response.data.success) {
            //console.log('Retrieved blocked users successfully:', response.data.blockedUsers);
            return { success: true, message: 'Blocked users retrieved successfully.', blockedUsers: response.data.blockedUsers };
        } else {
            console.error('Failed to retrieve blocked users:', response.data.message);
            return { success: false, message: response.data.message || 'Failed to retrieve blocked users.' };
        }
    } catch (error) {
        console.error('Error retrieving blocked users:', error);
        return { success: false, message: error.response?.data?.message || 'An error occurred while retrieving blocked users.' };
    }
};

// Function to unblock a user
export const unblockUser = async (userIdToUnblock: string): Promise<{success: boolean; message?: string}> => {
    try {
        // Replace `/v1/user/unblock` with your actual endpoint path if different
        const {data} = await API.post(`/v1/user/unblock`, {userIdToUnblock});

        // Assuming your backend sends back a 'success' boolean and an optional 'message' in the response
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
            return []; // Return an empty array if unsuccessful
        }
    } catch (error) {
        console.error('Error fetching unfinished movies:', error);
        return []; // Return an empty array in case of errors
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
            return false; // Return false if unsuccessful
        }
    } catch (error) {
        console.error('Error removing movie from unfinished list:', error.response ? error.response.data : error);
        return false; // Return false in case of errors
    }
};


