<template>
    <div class="max-w-3xl mx-auto px-4 py-8">
        <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-800">Notificaciones</h2>
            <button @click="markAllAsRead" :disabled="unreadCount === 0" class="px-4 py-2 text-sm rounded-md border border-blue-500 text-blue-500 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed">Marcar todas como leídas</button>
        </div>

        <ul class="space-y-4">
            <li v-for="notification in notifications" :key="notification.id" :class="['p-4 rounded-md shadow-sm border flex items-start space-x-4', notification.read_at ? 'bg-gray-100 border-gray-300' : 'bg-blue-50 border-blue-300']">
                <div class="w-10 h-10 flex items-center justify-center rounded-full shrink-0" :class="notificationStyle(notification.type).bg">
                    <i :class="[notificationStyle(notification.type).icon, '!text-xl', notificationStyle(notification.type).color]"></i>
                </div>

                <div class="flex-1">
                    <div class="flex justify-between items-start">
                        <h4 class="text-base font-semibold text-gray-800">{{ notification.title }}</h4>
                        <button v-if="!notification.read_at" @click="markAsRead(notification.id)" class="text-xs text-blue-600 hover:underline">Marcar como leída</button>
                    </div>
                    <p class="text-sm text-gray-600">{{ notification.message }}</p>
                    <span class="text-xs text-gray-400 mt-1 block">{{ formatDate(notification.created_at) }}</span>
                </div>
            </li>
        </ul>

        <div v-if="notifications.length === 0" class="mt-6 text-center text-gray-500">No hay notificaciones.</div>

        <div class="mt-8 flex justify-center items-center space-x-2" v-if="totalPages > 1">
            <button @click="previousPage" :disabled="currentPage === 1" class="px-3 py-1 text-sm rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50">Anterior</button>
            <span class="text-sm text-gray-700">Página {{ currentPage }} de {{ totalPages }}</span>
            <button @click="nextPage" :disabled="currentPage === totalPages" class="px-3 py-1 text-sm rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50">Siguiente</button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getNotifications, markAllNotificationsAsRead, markNotificationAsRead } from '@/service/notificationService';

const notifications = ref([]);
const unreadCount = ref(0);
const currentPage = ref(1);
const totalPages = ref(1);

const fetchNotifications = async (page = 1) => {
    try {
        const response = await getNotifications(page);
        notifications.value = response.notifications;
        unreadCount.value = response.no_read;
        currentPage.value = response.meta.current_page;
        totalPages.value = response.meta.last_page;
    } catch (error) {
        console.error('Error fetching notifications:', error);
    }
};

const markAsRead = async (id) => {
    try {
        await markNotificationAsRead(id);
        notifications.value = notifications.value.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
        unreadCount.value = Math.max(unreadCount.value - 1, 0);
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
};

const markAllAsRead = async () => {
    try {
        await markAllNotificationsAsRead();
        notifications.value = notifications.value.map((n) => ({
            ...n,
            read_at: n.read_at || new Date().toISOString()
        }));
        unreadCount.value = 0;
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
    }
};

const formatDate = (date) => {
    return new Date(date).toLocaleString();
};

const nextPage = () => {
    if (currentPage.value < totalPages.value) {
        fetchNotifications(currentPage.value + 1);
    }
};

const previousPage = () => {
    if (currentPage.value > 1) {
        fetchNotifications(currentPage.value - 1);
    }
};

const notificationStyle = (type) => {
    switch (type) {
        case 'success':
            return {
                icon: 'pi pi-check-circle',
                bg: 'bg-green-100 dark:bg-green-400/10',
                color: 'text-green-600'
            };
        case 'error':
            return {
                icon: 'pi pi-times-circle',
                bg: 'bg-red-100 dark:bg-red-400/10',
                color: 'text-red-600'
            };
        case 'warning':
            return {
                icon: 'pi pi-exclamation-triangle',
                bg: 'bg-yellow-100 dark:bg-yellow-400/10',
                color: 'text-yellow-600'
            };
        case 'info':
        default:
            return {
                icon: 'pi pi-info-circle',
                bg: 'bg-blue-100 dark:bg-blue-400/10',
                color: 'text-blue-600'
            };
    }
};

let notificationInterval = null;
onMounted(() => {
    fetchNotifications();
    notificationInterval = setInterval(fetchNotifications, 300000); // Refresh every 5 minutes
});
</script>
