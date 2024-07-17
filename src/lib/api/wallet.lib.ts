import {API} from '../../clients/api.client';
import axios from 'axios';

export const getTotalSupplyOfAD = async (): Promise<Number | undefined> => {
    try {
        const {data} = await API.get('/v1/wallet/total-supply');

        if (data.success === false) {
            return undefined;
        }

        return data.totalSupply;
    } catch (error) {
        console.error(error);
        return undefined;
    }
};

export const purchaseMIT = async (params: {amount: number}): Promise<boolean> => {
    console.log('purchaseMIT', params);
    try {
        const {data} = await API.post('/v1/wallet/purchase/mit', {
            amount: params.amount,
        });

        if (data.success === false) {
            return false;
        }

        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
};

export const sendAD = async (params: {
    recipientId: string;
    adAmount: number;
}): Promise<{success: boolean; message: string}> => {
    if (!params.recipientId) {
        return {
            success: false,
            message: 'Recipient ID is required.',
        };
    }

    try {
        const {data} = await API.post('/v1/wallet/send-ad', {
            recipientId: params.recipientId,
            adAmount: params.adAmount,
        });

        return {
            success: data.success,
            message: data.message || 'AD sent successfully.',
        };
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            const message = error.response.data?.message || 'Failed to send AD.';
            return {
                success: false,
                message,
            };
        } else {
            console.error('Error sending AD:', error);
            return {
                success: false,
                message: 'An unexpected error occurred. Please try again.',
            };
        }
    }
};
