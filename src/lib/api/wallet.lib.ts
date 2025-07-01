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

export interface ADSnapshot {
    date: string;
    supply: number;
    snapshotAt: string;
}

export const getADSupplySnapshots = async (): Promise<ADSnapshot[]> => {
    try {
        // 1) Request
        const response = await API.get<{
            success: boolean;
            history: ADSnapshot[];
        }>('/v1/wallet/snapshots');

        const {data} = response;

        // 2) Validate
        if (!data.success || !Array.isArray(data.history)) {
            console.warn('[wallet.lib] unexpected snapshots payload:', data);
            return [];
        }

        // 3) Return typed data (you can also transform here if needed)
        return data.history.map(snap => ({
            date: snap.date,
            supply: snap.supply,
            snapshotAt: snap.snapshotAt,
        }));
    } catch (err) {
        console.error('[wallet.lib] fetching AD snapshots failed:', err);
        return [];
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
