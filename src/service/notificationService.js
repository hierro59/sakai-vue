import { authClient } from '@/main';

export const getNotifications = async (page = 1, per_page = 10) => {
    const { data } = await authClient.get('/notifications' + `?page=${page}` + `&per_page=${per_page}`);
    return data
}

export const markNotificationAsRead = async (id) => {
    await authClient.put(`/notifications/${id}/read`)
}

export const markAllNotificationsAsRead = async () => {
    await authClient.put('/notifications/mark-all-read');
};
