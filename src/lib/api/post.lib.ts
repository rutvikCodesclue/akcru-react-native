
import { da } from 'date-fns/locale';
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

export async function getPost(postId: number) {
    try {
        const {data} = await API.get(`/v1/post/${postId}`);
        if (data.success === false) {
            throw new Error(data.message);
        }
        return data.post;
    } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch the post');
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
        if (error instanceof Error) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
            // console.error('Response headers:', error.response.headers);
        } else if (error instanceof Error) {
            // The request was made but no response was received
            console.error('Request:', error.name);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error message:', error.message);
        }

        return undefined;
    }
};

export async function createPost(postType: string, content: string[]) {
    try {
        const postContent = Array.isArray(content) ? content : [content];
        console.log('Post Content:', postContent);

        // Make a POST request using the API client
        const {data} = await API.post(`/v1/post/create`, {
            postType,
            content: postContent,
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

export async function commentOnPost(postId: number, postType: string, content: string[]) {
    try {
        const commentData = {
            postId,
            postType,
            content,
        };

        console.log('Sending Comment Data:', commentData);

        const response = await API.post(`/v1/post/comment`, commentData);

        if (response.data.success === false) {
            throw new Error(response.data.message);
        }

        return response.data.comment;
    } catch (error) {
        console.error('Error commenting on the post:', error);
        throw error;
    }
}

export async function uploadPictures(imageFiles: any[]) {
    console.log('uploadPictures');
    console.log('imageFiles:', imageFiles);
    let formData = new FormData();
    
    imageFiles.forEach((uri, index) => {
        // Extract the file extension from the URI
        const fileExtension = uri.match(/\.(jpeg|jpg|png)$/)[0];

        // Determine the MIME type
        let mimeType = 'image/jpeg'; // Default MIME type
        if (fileExtension === '.png') {
            mimeType = 'image/png';
        }

        // Convert the URI to a Blob or File-like object
        const file = {
            uri: uri,
            type: mimeType,
            name: `image-${index}${fileExtension}`, // Append the correct file extension
        };

        formData.append('images', file);
        console.log('formData:', formData);
    });

    try {
        const response = await API.post('/v1/user/uploadPictures', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
           
        });
         console.log('response:', response.data.content);
        return response.data.content;
    } catch (error) {
        console.error('Error uploading pictures:', error);
        throw error;
    }
}

export async function uploadVideo(videoFileUri: any, uploadType: any, durationInSeconds: any) {
    console.log('uploadVideo');
    let formData = new FormData();

    // Extract the file extension from the URI
    const fileExtension = videoFileUri.match(/\.(mov|mp4)$/)[0];

    // Determine the MIME type
    let mimeType = 'video/mp4'; // Default MIME type for mp4
    if (fileExtension === '.mov') {
        mimeType = 'video/quicktime'; // MIME type for mov
    }

    // Convert the URI to a Blob or File-like object
    const videoFile = {
        uri: videoFileUri,
        type: mimeType,
        name: `video${fileExtension}`, // Append the correct file extension
    };

    // Append the video file, upload type, and video duration to FormData
    formData.append('video', videoFile);
    formData.append('uploadType', uploadType);
    formData.append('videoDuration', durationInSeconds.toString());

    try {
        const response = await API.post('/v1/user/uploadVideo', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        console.log('response:', response.data.videoLink);
        return response.data.videoLink; // Assuming the API returns the video link
    } catch (error) {
        console.error('Error uploading video:', error);
        throw error;
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
