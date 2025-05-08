import { authClient } from '@/main';

export const getNotifications = async () => {
    const { data } = await authClient.get('/notifications')
    return data
}

export const markNotificationAsRead = async (id) => {
    await authClient.put(`/notifications/${id}/read`)
}