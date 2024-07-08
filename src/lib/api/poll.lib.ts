import {IPoll, IVote} from '../../../types';
import {API} from '../../clients/api.client';

// Function to create a poll
export async function createPoll(
    question: string,
    imageUrl: string | null,
    choices: {text: string; imageUrl?: string}[],
): Promise<IPoll> {
    try {
        const {data} = await API.post('/v1/poll/create', {
            question,
            imageUrl,
            choices,
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

export async function getPollsByPagination(page = 1): Promise<IPoll[]> {
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
        console.error(error);
        throw new Error('Failed to fetch polls');
    }
}
