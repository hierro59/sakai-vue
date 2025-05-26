<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/service/notificationService';

const menu = ref(null);
const router = useRouter();

const notifications = ref([]);
const unreadCount = ref(0);

const fetchNotifications = async () => {
    const response = await getNotifications();
    notifications.value = response.notifications;
    unreadCount.value = response.no_read;
};

const markAsRead = async (id) => {
    await markNotificationAsRead(id);
    notifications.value = notifications.value.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
    unreadCount.value = Math.max(unreadCount.value - 1, 0);
};

const markAllAsRead = async () => {
    await markAllNotificationsAsRead();
    notifications.value = notifications.value.map((n) => ({
        ...n,
        read_at: n.read_at || new Date().toISOString()
    }));
    unreadCount.value = 0;
};

const items = ref([
    {
        label: 'Mark All as Read',
        icon: 'pi pi-check',
        command: markAllAsRead,
        disabled: computed(() => unreadCount.value === 0)
    },
    {
        label: 'Show All',
        icon: 'pi pi-eye',
        command: () => router.push('/dashboard/notifications')
    }
]);

const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleString();
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

onMounted(fetchNotifications);
</script>
<template>
    <div class="card">
        <div class="flex items-center justify-between mb-6">
            <div class="font-semibold text-xl">Notificaciones</div>
            <div>
                <Button icon="pi pi-ellipsis-v" class="p-button-text p-button-plain p-button-rounded" @click="$refs.menu.toggle($event)" />
                <Menu ref="menu" popup :model="items" class="!min-w-40" />
            </div>
        </div>

        <!-- lista de notificaciones -->
        <ul class="p-0 m-0 list-none space-y-4">
            <li
                v-for="notification in notifications"
                :key="notification.id"
                class="flex items-center py-3 px-2 border-b border-surface cursor-pointer transition-all duration-150"
                :class="[!notification.read_at ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50']"
                @click="markAsRead(notification.id)"
            >
                <div class="w-12 h-12 flex items-center justify-center rounded-full mr-4 shrink-0 relative" :class="notificationStyle(notification.type).bg">
                    <i :class="[notificationStyle(notification.type).icon, '!text-xl', notificationStyle(notification.type).color]"></i>
                    <!-- Punto indicador si no está leída -->
                    <span v-if="!notification.read_at" class="absolute top-0 right-0 w-2.5 h-2.5 bg-blue-500 rounded-full border border-white"></span>
                </div>

                <div class="flex flex-col text-sm">
                    <span :class="['leading-tight', !notification.read_at ? 'font-semibold text-gray-800' : 'text-gray-700']">
                        {{ notification.title }}
                    </span>
                    <span :class="['text-xs', !notification.read_at ? 'text-gray-700' : 'text-gray-500']">
                        {{ notification.message }}
                    </span>
                    <span class="text-xs text-gray-400 mt-1">{{ formatDate(notification.created_at) }}</span>
                </div>
            </li>
        </ul>

        <div v-if="notifications.length === 0" class="text-center text-gray-400 py-4">No hay notificaciones disponibles.</div>
    </div>
</template>
