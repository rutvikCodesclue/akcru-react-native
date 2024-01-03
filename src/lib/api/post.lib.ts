import {IUserProfile} from '../../../types';
import {API} from '../../clients/api.client';

export async function getPosts(page?: number) {
    try {
        
        // Make a GET request using the API client
        const {data} = await API.get(`/v1/post`, {
            params: {
                page,
            },
        });

        // console.log('API response for getPost:', data); // Logging the entire response

        if (data.success === false) {
            throw new Error(data.message);
        }

        return data.posts;
    } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch posts');
    }
};

// export const getPosts = async (params: {page?: number}): Promise<Object | undefined> => {
//     try {
//         const {page} = params;

//         // Make a GET request using the API client
//         const {data} = await API.get(`/v1/post`, {
//             params: {
//                 page,
//             },
//         });

//         console.log('API response for getPosts:', data); // Logging the entire response

//         if (data.success === false) {
//             throw new Error(data.message);
//         }

//         return data.posts;
//     } catch (error) {
//         console.error(error);
//         throw new Error('Failed to fetch posts');
//     }
// };





export const getPostComments = async (params: {id: number}): Promise<Object | undefined> => {
    try {
        const {id} = params;
        // GET /v1/post/comments
        const {data} = await API.get(`/v1/post/comments/${id.toString()}`);

        if (data.success === false) {
            return undefined;
        }

        return data;
    } catch (error) {
        console.error(error);
        return undefined;
    }
};

export async function createPost(type: string, content: string) {
    try {
        // Make a POST request using the API client
        const {data} = await API.post(`/v1/post/create`, {
            type,
            content,
        });

        if (data.success === false) {
            throw new Error(data.message);
        }

        return data.post;
    } catch (error) {
        console.error(error);
        throw new Error('Failed to create a post.');
    }
}

export async function deletePost(id: string) {
    try {
        // Make a POST request using the API client
        const {data} = await API.delete(`/v1/post/delete`, {
            data: {id}, // In axios, the DELETE body should be in the `data` field
        });

        if (data.success === false) {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error(error);
        throw new Error('Failed to delete the post.');
    }
}

export async function likePost(id: string) {
    try {
        // Make a POST request using the API client
        const {data} = await API.post(`/v1/post/like`, {
            id,
        });

        if (data.success === false) {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error(error);
        throw new Error('Failed to like the post.');
    }
}

// export async function unlikePost(id: string) {
//     try {
//         // Make a POST request using the API client
//         const {data} = await API.post(`/v1/post/unlike`, {
//             id,
//         });

//         if (data.success === false) {
//             throw new Error(data.message);
//         }
//     } catch (error) {
//         console.error(error);
//         throw new Error('Failed to unlike the post.');
//     }
// }

export async function unlikePost(id: string) {
    try {
        const {data} = await API.delete(`/v1/post/unlike`, {
            data: {id}, // In axios, the DELETE body should be in the `data` field
        });

        if (data.success === false) {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error(error);
        throw new Error('Failed to unlike the post.');
    }
}

export async function commentOnPost(id: string, text: string) {
    try {
        // Make a POST request using the API client
        const {data} = await API.post(`/v1/post/comment`, {
            id,
            text,
        });

        if (data.success === false) {
            throw new Error(data.message);
        }

        return data.comment;
    } catch (error) {
        console.error(error);
        throw new Error('Failed to comment on the post.');
    }
}

export async function deleteComment(id: string) {
    try {
        // Make a POST request using the API client
        const {data} = await API.post(`/v1/post/comment/delete`, {
            id,
        });

        if (data.success === false) {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error(error);
        throw new Error('Failed to delete the comment.');
    }
}
