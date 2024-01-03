import {IUserProfile} from '../../../types';
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

export const updateUser = async (params: {
    username?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    description?: string;
    phone?: string;
    password?: string;
    dob?: string;
}): Promise<IUserProfile | undefined> => {
    try {
        const {username, firstName, lastName, email, description, phone, password, dob} = params;
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
        };

        // Log the updateUserObj to verify its contents
        console.log('Update User Object:', updateUserObj);

        const {data} = await API.put(`/v1/user`, updateUserObj);

        if (data.success === false) {
            return undefined;
        }

        return data.updatedUser;
    } catch (error) {
        console.error(error);
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

// TODO: type this
export const getFollowers = async (): Promise<Object | undefined> => {
    try {
        // PUT /v1/watchtime/me
        const {data} = await API.get(`/v1/user/followers`);

        if (data.success === false) {
            return false;
        }

        return data;
    } catch (error) {
        console.error(error);
        return undefined;
    }
};

// TODO: type this
export const getFollowersCount = async (): Promise<Object | undefined> => {
    try {
        // PUT /v1/watchtime/me
        const {data} = await API.get(`/v1/user/unfollow?count=true`);

        if (data.success === false) {
            return false;
        }

        return data;
    } catch (error) {
        console.error(error);
        return undefined;
    }
};

// TODO: type this
export const getUserFollowing = async (): Promise<Object | undefined> => {
    try {
        // PUT /v1/watchtime/me
        const {data} = await API.get(`/v1/user/following`);

        if (data.success === false) {
            return false;
        }

        return data;
    } catch (error) {
        console.error(error);
        return undefined;
    }
};

// export const getUserFollowing = async (userId: string): Promise<IUserProfile[] | undefined> => {
//     try {
//         const {data} = await API.get(`/v1/user/${userId}/following`);
//         if (data && data.success) {
//             return data.following;
//         }
//     } catch (error) {
//         console.error('Error fetching user following:', error);
//     }
//     return undefined;
// };



// TODO: type this
export const getUserFollowingCount = async (): Promise<Object | undefined> => {
    try {
        // PUT /v1/watchtime/me
        const {data} = await API.get(`/v1/user/unfollow?count=true`);

        if (data.success === false) {
            return false;
        }

        return data;
    } catch (error) {
        console.error(error);
        return undefined;
    }
};
