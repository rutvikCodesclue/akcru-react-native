
import {IUserProfile} from '../../../types';
import {API} from '../../clients/api.client';

export async function getPosts(page = 1) {
    // Default to page 1 if no page is provided
    try {
        const {data} = await API.get(`/v1/post`, {
            params: {
                page: page - 1, // Adjust if your backend expects zero-based indexing for pages
            },
        });

        if (data.success === false) {
            throw new Error(data.message);
        }

        return data.posts;
    } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch posts');
    }
}


// export async function getPosts(page?: number) {
//     try {
        
//         // Make a GET request using the API client
//         const {data} = await API.get(`/v1/post`, {
//             params: {
//                 page,
//             },
//         });

//         // console.log('API response for getPost:', data); // Logging the entire response

//         if (data.success === false) {
//             throw new Error(data.message);
//         }

//         return data.posts;
//     } catch (error) {
//         console.error(error);
//         throw new Error('Failed to fetch posts');
//     }
// };

export const getPostComments = async (postId: number): Promise<Object | undefined> => {
    console.log(`Making request to /v1/post/comments with postId: ${postId}`);
    try {
        const {data} = await API.get(`/v1/post/comments`, {params: {id: postId}});
        console.log('Received data:', data); // Log the received data
        return data;
    } catch (error) {
        console.error('Error fetching post comments:', error);

        // Detailed error logging
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
            // console.error('Response headers:', error.response.headers);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('Request:', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error message:', error.message);
        }

        return undefined;
    }
};







// export const getPostComments = async (params: {id: string}): Promise<Object | undefined> => {
//     console.log(`Making request to /v1/post/comments with postId: ${params.id}`);
//     try {
//         const {id} = params;
//         // GET /v1/post/comments
//         const {data} = await API.get(`/v1/post/comments/${id}`);

//         if (data.success === false) {
//             return undefined;
//         }

//         return data;
//     } catch (error) {
//         console.error(error);
//         return undefined;
//     }
// };


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


export async function deletePost(id: number) {
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

export async function likePost(id: number) {
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

export async function unlikePost(id: number) {
    try {
        // Make a POST request using the API client
        const {data} = await API.post(`/v1/post/unlike`, {
            id,
        });

        if (data.success === false) {
            throw new Error(data.message || 'Unliking the post failed.');
        }
    } catch (error) {
        console.error('Error in unlikePost:', error);
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
