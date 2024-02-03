
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

// export async function createPost(type: string, content: string) {
//     try {
//         // Make a POST request using the API client
//         const {data} = await API.post(`/v1/post/create`, {
//             type,
//             content,
//         });

//         if (data.success === false) {
//             throw new Error(data.message);
//         }

//         return data.post;
//     } catch (error) {
//         console.error(error);
//         throw new Error('Failed to create a post.');
//     }
// }

export async function createPost(postType: string, content: string[]) {
    try {
        // Validate content based on postType
        if (!validateContentForPostType(postType, content)) {
            throw new Error('Invalid content for the specified post type.');
        }

        // Make a POST request using the API client
        const {data} = await API.post(`/v1/post/create`, {
            postType,
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

function validateContentForPostType(postType: string, content: string[]): boolean {
    switch (postType) {
        case 'TEXT':
            return content.length === 1 && typeof content[0] === 'string';
        case 'IMAGE':
            // Add logic for IMAGE type validation
            // Example:
            return content.every(c => isImageUrl(c));
        // Handle other types similarly
        // ...
        default:
            return false; // Default case to handle any unexpected post types
    }
}

function isImageUrl(url: string): boolean {
    // Implement logic to validate if a string is a URL for an image
    // This is just a placeholder example
    return url.startsWith('http://') || url.startsWith('https://');
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

export async function likeComment(id: number) {
    try {
        // Make a POST request using the API client
        const {data} = await API.post(`/v1/post/comment/like`, {
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

export async function unlikeComment(id: number) {
    try {
        const {data} = await API.delete(`/v1/post/comment/unlike`, {
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

export async function deleteComment(commentId: number) {
    try {
        const {data} = await API.delete(`/v1/post/comment/delete`, {
            data: {id: commentId},
        });

        if (data.success === false) {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error(error);
        throw new Error('Failed to delete the comment.');
    }
}
