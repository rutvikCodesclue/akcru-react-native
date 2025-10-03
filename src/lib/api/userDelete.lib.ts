import {API} from '../../clients/api.client';
import useAuthStore from '../../stores/auth.store';

export type DeletionState = 'ACTIVE' | 'PENDING' | 'DELETED';

type DeleteResponse = {success: boolean; status: DeletionState | 'PENDING' | 'DELETED'};
type StatusResponse = {success: boolean; state: DeletionState; deletedAt: string | null};
type UndoResponse = {success: boolean; message: string};

/** Self-service: delete my account (server does Phase A + B inline) */
export const deleteMyAccount = async (): Promise<DeleteResponse> => {
    await useAuthStore.getState().hydrateAuth();
    try {
        const {data} = await API.delete<DeleteResponse>('/v1/user-account-delete/users/me');
        return data;
    } catch (err: any) {
        console.error('deleteMyAccount error:', err);
        throw new Error(err?.response?.data?.message ?? 'Failed to delete account');
    }
};

/** Self-service: check current deletion status */
export const getMyDeletionStatus = async (): Promise<StatusResponse> => {
    await useAuthStore.getState().hydrateAuth();
    try {
        const {data} = await API.get<StatusResponse>('/v1/user-account-delete/users/me/deletion-status');
        return data;
    } catch (err: any) {
        console.error('getMyDeletionStatus error:', err);
        throw new Error(err?.response?.data?.message ?? 'Failed to fetch deletion status');
    }
};

/** Optional: undo deletion while still PENDING (if your backend allows it) */
export const undoMyDeletion = async (): Promise<UndoResponse> => {
    await useAuthStore.getState().hydrateAuth();
    try {
        const {data} = await API.post<UndoResponse>('/v1/user-account-delete/users/me/deletion-undo');
        return data;
    } catch (err: any) {
        console.error('undoMyDeletion error:', err);
        throw new Error(err?.response?.data?.message ?? 'Failed to undo deletion');
    }
};

/** Admin: delete another user by id */
export const adminDeleteUser = async (userId: string): Promise<DeleteResponse> => {
    await useAuthStore.getState().hydrateAuth();
    try {
        const {data} = await API.delete<DeleteResponse>(`/v1/user-account-delete/admin/users/${userId}`);
        return data;
    } catch (err: any) {
        console.error('adminDeleteUser error:', err);
        throw new Error(err?.response?.data?.message ?? 'Failed to delete user');
    }
};
