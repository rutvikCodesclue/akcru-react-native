import {API} from '../../clients/api.client';
import axios from 'axios'; 

export const getTotalSupplyOfAD = async (): Promise<Number | undefined> => {
    try {
        // GET /v1/wallet/total-supply
        const {data} = await API.get(`/v1/wallet/total-supply`);

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
    try {
        // POST /v1/wallet/purchase/mit
        const {data} = await API.post(`/v1/wallet/purchase/mit`, {
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

// export const sendAD = async (params: {
//     recipientId: string;
//     adAmount: number;
// }): Promise<{success: boolean; message: string}> => {
//     try {
//         // POST /v1/wallet/send-ad
//         const {data} = await API.post(`/v1/wallet/send-ad`, {
//             recipientId: params.recipientId,
//             adAmount: params.adAmount,
//         });

//         return {
//             success: data.success,
//             message: data.message || 'AD sent successfully.',
//         };
//     } catch (error) {
//         console.error('Error sending AD:', error);
//         return {
//             success: false,
//             message: error.response?.data?.message || 'Failed to send AD.',
//         };
//     }
// };

export const sendAD = async (params: {
    recipientId: string;
    adAmount: number;
}): Promise<{success: boolean; message: string}> => {
    // Check for recipientId presence
    if (!params.recipientId) {
        return {
            success: false,
            message: 'Recipient ID is required.',
        };
    }

    try {
        const {data} = await API.post(`/v1/wallet/send-ad`, {
            recipientId: params.recipientId,
            adAmount: params.adAmount,
        });

        return {
            success: data.success,
            message: data.message || 'AD sent successfully.',
        };
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            // This is an Axios error with a response object
            const message = error.response.data?.message || 'Failed to send AD.';
            return {
                success: false,
                message,
            };
        } else {
            // This is a non-Axios error or an Axios error without a response (e.g., network error)
            console.error('Error sending AD:', error);
            return {
                success: false,
                message: 'An unexpected error occurred. Please try again.',
            };
        }
    }
};

