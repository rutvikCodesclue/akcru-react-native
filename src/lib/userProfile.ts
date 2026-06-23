import {IUserProfile} from '../../types';
import {getPpvUsdPriceForVipStatus} from './adPackPurchaseFlow';

export function getUserVipStatus(user: IUserProfile | null | undefined): boolean {
    return user?.vipStatus === true;
}

export function getPpvUsdPriceForUser(user: IUserProfile | null | undefined): number {
    return getPpvUsdPriceForVipStatus(getUserVipStatus(user));
}
