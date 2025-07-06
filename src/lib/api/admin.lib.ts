// lib/api/admin.lib.ts
import {API} from '../../clients/api.client';
import axios from 'axios';

export const getSystemWalletBalance = async (): Promise<string | undefined> => {
    try {
        const {data} = await API.get<{success: boolean; balance: string}>('/v1/admin-wallet/balance');
        return data.success ? data.balance : undefined;
    } catch (err) {
        console.error('[admin.lib] getSystemWalletBalance error', err);
        return undefined;
    }
};

export const grantAD = async (params: {
    userId: string;
    amount: number;
}): Promise<{success: boolean; message: string}> => {
    try {
        const {data} = await API.post('/v1/admin-wallet/grant', {
            userId: params.userId,
            amount: params.amount,
        });
        return {
            success: data.success,
            message: data.message || `Granted ${params.amount} AD.`,
        };
    } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
            return {
                success: false,
                message: err.response.data?.message || 'Grant failed.',
            };
        }
        console.error('[admin.lib] grantAD error', err);
        return {success: false, message: 'Unexpected error.'};
    }
};
