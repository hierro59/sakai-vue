<script setup>
import { ref, onMounted, inject, computed, onBeforeUnmount } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/service/notificationService';

const router = useRouter();
const authStore = useAuthStore();

const companyLogo = inject('companyLogo');

const userAvatar = computed(() => authStore.userAvatar || '/images/owl.png');

const logout = () => {
    authStore.logout();
    router.push({ name: 'login' });
};

const { toggleMenu, toggleDarkMode, isDarkTheme } = useLayout();

const notifications = ref([]);
const unreadCount = ref(0);
const showDropdown = ref(false);

const toggleDropdown = () => {
    showDropdown.value = !showDropdown.value;
};

const closeDropdown = (event) => {
    if (!event.target.closest('.notification-bell') && showDropdown.value) {
        showDropdown.value = false;
    }
};

const fetchNotifications = async () => {
    try {
        const response = await getNotifications();
        notifications.value = response.notifications;
        unreadCount.value = response.no_read;
    } catch (error) {
        console.error('Error fetching notifications:', error);
    }
};

const markAsRead = async (id) => {
    try {
        await markNotificationAsRead(id);

        notifications.value = notifications.value.map((n) => {
            if (n.id === id && !n.read_at) {
                // Solo descontar si antes estaba no leída
                unreadCount.value = Math.max(unreadCount.value - 1, 0);
                return { ...n, read_at: new Date().toISOString() };
            }
            return n;
        });
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
        console.error('Error al marcar todas como leídas:', error);
    }
};

const formatDate = (date) => {
    return new Date(date).toLocaleString();
};

let notificationInterval = null;

onMounted(() => {
    fetchNotifications();
    document.addEventListener('click', closeDropdown);
    notificationInterval = setInterval(fetchNotifications, 300000);
});

onBeforeUnmount(() => {
    document.removeEventListener('click', closeDropdown);
    clearInterval(notificationInterval);
});
</script>

<template>
    <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" @click="toggleMenu">
                <i class="pi pi-bars"></i>
            </button>
            <router-link to="/" class="layout-topbar-logo">
                <img :src="companyLogo" alt="logo" class="h-14 p-2" />
            </router-link>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <!-- Change theme Drak/Light -->
                <button type="button" class="layout-topbar-action" @click="toggleDarkMode" v-tooltip.bottom="'Dark/Light'">
                    <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]"></i>
                </button>
            </div>

            <button
                class="layout-topbar-menu-button layout-topbar-action"
                v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
            >
                <i class="pi pi-ellipsis-v"></i>
            </button>

            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content">
                    <div class="relative inline-flex notification-bell" v-tooltip.bottom="'Notifications'">
                        <OverlayBadge :value="unreadCount" :severity="unreadCount > 0 ? 'danger' : 'secondary'" class="inline-flex">
                            <i class="pi pi-bell layout-topbar-action" style="font-size: 1.3rem; cursor: pointer" @click.stop="toggleDropdown" />
                        </OverlayBadge>

                        <!-- Dropdown de notificaciones -->
                        <div v-if="showDropdown" class="absolute top-8 right-0 w-72 bg-white shadow-lg rounded-lg p-3 z-50">
                            <div class="flex justify-between items-center mb-2">
                                <button class="text-sm text-blue-600 hover:underline" v-if="unreadCount > 0" @click="markAllAsRead">Marcar todas como leídas</button>
                                <router-link to="/dashboard/notifications" class="text-sm text-gray-500 hover:underline ml-auto"> Ver todas </router-link>
                            </div>

                            <div v-if="notifications.length === 0" class="text-gray-500 text-center p-2">No tienes notificaciones.</div>

                            <ul v-else>
                                <li
                                    v-for="notification in notifications"
                                    :key="notification.id"
                                    :class="['p-2 border-b last:border-none cursor-pointer hover:bg-gray-100', !notification.read_at ? 'bg-gray-200' : '']"
                                    @click="markAsRead(notification.id)"
                                >
                                    <div class="flex justify-between" :class="!notification.read_at ? 'font-semibold' : ''">
                                        <span class="font-semibold">{{ notification.title }}</span>
                                        <span class="text-xs text-gray-500">{{ formatDate(notification.created_at) }}</span>
                                    </div>
                                    <p class="text-sm">{{ notification.message }}</p>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <button type="button" class="layout-topbar-action">
                        <a href="https://wa.me/573204825390" target="_blank" rel="noopener noreferrer" class="hover:text-primary" aria-label="WhatsApp" v-tooltip.bottom="'Soporte'">
                            <i class="pi pi-whatsapp text-2xl"></i>
                        </a>
                        <!-- <i class="pi pi-inbox" title="Messages"></i>
                        <span>Messages</span> -->
                    </button>
                    <button type="button" class="layout-topbar-action" @click="router.push({ name: 'profile' })" v-tooltip.bottom="'Profile'">
                        <i v-if="!userAvatar" class="pi pi-user" title="Profile"></i>
                        <img v-else :src="userAvatar" alt="User Avatar" class="w-8 h-8 rounded-full mr-2" />
                        <span>Profile</span>
                    </button>
                    <button type="button" class="layout-topbar-action" @click="logout" v-tooltip.bottom="'Logout'">
                        <i class="pi pi-sign-out" title="Logout"></i>
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
