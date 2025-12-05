import { AdEventType, IGetAdsResponse } from '../../../types';
import {API} from '../../clients/api.client';

export interface FetchAdsParams {
    placement: 'HOME_BETWEEN_CAROUSELS';
}

export const getAds = async (placement: FetchAdsParams['placement']) => {
    // If you have IGetAdsResponse in your types file:
    const {data} = await API.get<IGetAdsResponse>('/v1/ads/get-ad', {params: {placement}});
    return data;

    // Otherwise keep your inline type:
    // const { data } = await API.get('/ads', { params: { placement } });
    // return data as {
    //   ads: {
    //     id: string;
    //     title: string;
    //     imageUrl: string;
    //     clickType: 'EXTERNAL' | 'INTERNAL';
    //     targetUrl?: string | null;
    //     routeName?: string | null;
    //     routeParams?: Record<string, unknown> | null;
    //     placement: 'HOME_BETWEEN_CAROUSELS';
    //     startAt?: string | null;
    //     endAt?: string | null;
    //     isActive: boolean;
    //     weight: number;
    //     createdAt: string;
    //     updatedAt: string;
    //   }[];
    // };
};

export const trackAdEvent = async (adId: string, type: AdEventType) => {
    const path = type === 'IMPRESSION' ? `/v1/ads/${adId}/impression` : `/v1/ads/${adId}/click`;
    try {
        await API.post(path);
    } catch {}
};

export const trackAdImpression = async (adId: string) => {
    try {
        await API.post(`/v1/ads/${adId}/impression`);
    } catch {}
};

export const trackAdClick = async (adId: string) => {
    try {
        await API.post(`/v1/ads/${adId}/click`);
    } catch {}
};
