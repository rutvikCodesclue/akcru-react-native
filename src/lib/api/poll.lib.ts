import {IPoll, IVote, IPollType} from '../../../types';
import {API} from '../../clients/api.client';

// Function to create a poll
export async function createPoll(
    question: string,
    imageUrl: string | null,
    choices: {text: string; imageUrl?: string}[],
    expiresAt: string,
    type: IPollType, // Add type parameter
): Promise<IPoll> {
    try {
        const {data} = await API.post('/v1/poll/create', {
            question,
            imageUrl,
            choices,
            expiresAt,
            type, // Include type in the request body
        });

        if (data.success === false) {
            throw new Error(data.message);
        }

        return data.poll;
    } catch (error) {
        console.error('Error creating poll:', error);
        throw new Error('Failed to create poll');
    }
}

// Function to vote on a poll choice
export async function voteOnPoll(pollId: string, choiceId: string): Promise<IVote> {
    try {
        const {data} = await API.post('/v1/poll/vote', {pollId, choiceId});

        if (data.success === false) {
            throw new Error(data.message);
        }

        return data.vote;
    } catch (error) {
        console.error('Error voting on poll:', error);
        throw new Error('Failed to vote on poll');
    }
}

// Function to get a poll by ID
export async function getPollById(pollId: string): Promise<IPoll> {
    try {
        const {data} = await API.get(`/v1/poll/${pollId}`);

        if (data.success === false) {
            throw new Error(data.message);
        }

        return data.poll;
    } catch (error) {
        console.error('Error fetching poll:', error);
        throw new Error('Failed to fetch poll');
    }
}

// Function to get all polls
export async function getPolls(page = 1): Promise<IPoll[]> {
    try {
        const {data} = await API.get('/v1/poll', {
            params: {
                page: page - 1,
            },
        });

        if (data.success === false) {
            throw new Error(data.message);
        }

        return data.polls;
    } catch (error) {
        console.error('Error fetching polls:', error);
        throw new Error('Failed to fetch polls');
    }
}

// Function to delete a poll
export async function deletePoll(pollId: string): Promise<string> {
    try {
        const {data} = await API.delete(`/v1/poll/${pollId}/delete`);

        if (data.success === false) {
            throw new Error(data.message);
        }

        return data.message;
    } catch (error) {
        console.error('Error deleting poll:', error);
        throw new Error('Failed to delete poll');
    }
}

// Function to like a poll
export async function likePoll(pollId: string): Promise<string> {
    try {
        const {data} = await API.post('/v1/poll/like', {pollId});
        if (data.success === false) {
            throw new Error(data.message);
        }
        return 'Poll liked';
    } catch (error) {
        console.error('Error liking poll:', error);
        throw new Error('Failed to like poll');
    }
}

// Function to unlike a poll
export async function unlikePoll(pollId: string): Promise<string> {
    try {
        const {data} = await API.delete('/v1/poll/unlike', {
            data: {pollId},
        });
        if (data.success === false) {
            throw new Error(data.message);
        }
        return 'Poll unliked';
    } catch (error) {
        console.error('Error unliking poll:', error);
        throw new Error('Failed to unlike poll');
    }
}

// Function to get likes for a poll
export async function getPollLikes(pollId: string): Promise<any[]> {
    try {
        const {data} = await API.get(`/v1/poll/${pollId}/likes`);
        if (data.success === false) {
            throw new Error(data.message);
        }
        return data.likes;
    } catch (error) {
        console.error('Error fetching poll likes:', error);
        throw new Error('Failed to fetch poll likes');
    }
}

// Function to comment on a poll
export async function commentOnPoll(pollId: string, postType: string, content: string[]): Promise<any> {
    try {
        const commentData = {
            pollId,
            content,
        };
        const {data} = await API.post(`/v1/poll/${pollId}/comment`, commentData);
        if (data.success === false) {
            throw new Error(data.message);
        }
        return data.comment;
    } catch (error) {
        console.error('Error commenting on poll:', error);
        throw new Error('Failed to comment on poll');
    }
}

// Function to get comments for a poll
export async function getPollComments(pollId: string, page: number = 0): Promise<any> {
    try {
        console.log('Fetching comments for pollId:', pollId, 'on page:', page); // Debug log
        const {data} = await API.get(`/v1/poll/${pollId}/comments`, {params: {page}});
        console.log('API Response:', data); // Add this line for debugging
        if (data.success === false) {
            throw new Error(data.message);
        }
        return data.comments;
    } catch (error) {
        console.error('Error fetching comments for poll:', error);
        throw new Error('Failed to fetch comments for poll');
    }
}

// Function to get a poll comment by ID
export async function getPollCommentById(pollCommentId: string): Promise<any> {
    try {
        const {data} = await API.get(`/v1/poll/comment/${pollCommentId}`);
        if (data.success === false) {
            throw new Error(data.message);
        }
        return data.comment;
    } catch (error) {
        console.error('Error fetching poll comment:', error);
        throw new Error('Failed to fetch poll comment');
    }
}

// Function to like a poll comment
export async function likePollComment(pollCommentId: string): Promise<any> {
    try {
        const {data} = await API.post('/v1/poll/comment/like', {pollCommentId});
        if (data.success === false) {
            throw new Error(data.message);
        }
        return data.pollCommentLike;
    } catch (error) {
        console.error('Error liking poll comment:', error);
        throw new Error('Failed to like poll comment');
    }
}

// Function to unlike a poll comment
export async function unlikePollComment(pollCommentId: string): Promise<string> {
    try {
        const {data} = await API.delete('/v1/poll/comment/unlike', {
            data: {pollCommentId},
        });
        if (data.success === false) {
            throw new Error(data.message);
        }
        return data.message;
    } catch (error) {
        console.error('Error unliking poll comment:', error);
        throw new Error('Failed to unlike poll comment');
    }
}

// Function to get likes for a poll comment
export async function getPollCommentLikes(pollCommentId: string): Promise<any[]> {
    try {
        const {data} = await API.get(`/v1/poll/comment/${pollCommentId}/likes`);
        if (data.success === false) {
            throw new Error(data.message);
        }
        return data.likes;
    } catch (error) {
        console.error('Error fetching poll comment likes:', error);
        throw new Error('Failed to fetch poll comment likes');
    }
}
