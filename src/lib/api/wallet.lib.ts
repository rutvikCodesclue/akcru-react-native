import { API } from "../../clients/api.client";

export const getTotalSupplyOfAD = async () : Promise<Number | undefined> => {
    try {
        // GET /v1/wallet/total-supply
        const { data } = await API.get(`/v1/wallet/total-supply`);
    
        if (data.success === false) {
            return undefined
        }
        
        return data.totalSupply;
    } catch (error) {
        console.error(error);
        return undefined;
    }
}
