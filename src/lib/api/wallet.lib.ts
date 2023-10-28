import {API} from '../../clients/api.client';

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
