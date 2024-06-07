import {API} from '../../clients/api.client';

export async function getPosts(page = 1) {
    try {
        const {data} = await API.get('/v1/post', {
            params: {
                page: page - 1,
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
        const {data} = await API.get('/v1/post/comments', {params: {id: postId}});
        console.log('Received data:', data);
        return data;
    } catch (error) {
        console.error('Error fetching post comments:', error);

        if (error instanceof Error) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        } else if (error instanceof Error) {
            console.error('Request:', error.name);
        } else {
            console.error('Error message:', error.message);
        }

        return undefined;
    }
};

export async function createPost(postType: string, content: string[]) {
    try {
        const postContent = Array.isArray(content) ? content : [content];
        console.log('Post Content:', postContent);

        const {data} = await API.post('/v1/post/create', {
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

        const response = await API.post('/v1/post/comment', commentData);

        if (response.data.success === false) {
            throw new Error(response.data.message);
        }

        return response.data.comment;
    } catch (error) {
        console.error('Error commenting on the post:', error);
        throw error;
    }
}

// export async function uploadPictures(imageFiles: any[]) {
//     console.log('uploadPictures');
//     console.log('imageFiles:', imageFiles);
//     let formData = new FormData();

//     imageFiles.forEach((uri, index) => {
//         const fileExtension = uri.match(/\.(jpeg|jpg|png)$/)[0];

//         let mimeType = 'image/jpeg';
//         if (fileExtension === '.png') {
//             mimeType = 'image/png';
//         }

//         const file = {
//             uri: uri,
//             type: mimeType,
//             name: `image-${index}${fileExtension}`,
//         };

//         formData.append('images', file);
//         console.log('formData:', formData);
//     });

//     try {
//         const response = await API.post('/v1/user/uploadPictures', formData, {
//             headers: {
//                 'Content-Type': 'multipart/form-data',
//             },
//         });
//         console.log('response:', response.data.content);
//         return response.data.content;
//     } catch (error) {
//         console.error('Error uploading pictures:', error);
//         throw error;
//     }
// }


export async function uploadPictures(imageFiles: any[]) {
    console.log('uploadPictures');
    console.log('imageFiles:', imageFiles);
    let formData = new FormData();

    imageFiles.forEach((uri, index) => {
        let fileExtension = uri.match(/\.(jpeg|jpg|png|gif)$/i);
        if (fileExtension) {
            fileExtension = fileExtension[0];
        } else {
            console.error(`Unsupported file type for URI: ${uri}`);
            return;
        }

        let mimeType = 'image/jpeg';
        if (fileExtension === '.png') {
            mimeType = 'image/png';
        } else if (fileExtension === '.gif') {
            mimeType = 'image/gif';
        }

        const file = {
            uri: uri,
            type: mimeType,
            name: `image-${index}${fileExtension}`,
        };

        formData.append('images', file);
        console.log('formData entry:', file);
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

    const fileExtension = videoFileUri.match(/\.(mov|mp4)$/)[0];

    let mimeType = 'video/mp4';
    if (fileExtension === '.mov') {
        mimeType = 'video/quicktime';
    }

    const videoFile = {
        uri: videoFileUri,
        type: mimeType,
        name: `video${fileExtension}`,
    };

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
        return response.data.videoLink;
    } catch (error) {
        console.error('Error uploading video:', error);
        throw error;
    }
}

export async function deletePost(id: number) {
    try {
        const {data} = await API.delete('/v1/post/delete', {
            data: {id},
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
        const {data} = await API.post('/v1/post/like', {
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
        const {data} = await API.delete('/v1/post/unlike', {
            data: {id},
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
        const {data} = await API.post('/v1/post/comment/like', {
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
        const {data} = await API.delete('/v1/post/comment/unlike', {
            data: {id},
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
        const {data} = await API.delete('/v1/post/comment/delete', {
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
