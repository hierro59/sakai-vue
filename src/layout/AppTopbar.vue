<script setup>
import { ref, onMounted, inject, computed, onBeforeUnmount } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { getNotifications, markNotificationAsRead } from '@/service/notificationService';

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
        unreadCount.value = notifications.value.filter((n) => !n.read_at).length;
    } catch (error) {
        console.error('Error fetching notifications:', error);
    }
};

const markAsRead = async (id) => {
    try {
        await markNotificationAsRead(id);
        notifications.value = notifications.value.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
        unreadCount.value = notifications.value.filter((n) => !n.read_at).length;
    } catch (error) {
        console.error('Error marking notification as read:', error);
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
                <img :src="companyLogo" alt="logo" class="h-14" />
            </router-link>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <!-- Change theme Drak/Light -->
                <button type="button" class="layout-topbar-action" @click="toggleDarkMode">
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
                    <div class="relative inline-flex notification-bell">
                        <OverlayBadge :value="unreadCount" :severity="unreadCount > 0 ? 'danger' : 'secondary'" class="inline-flex">
                            <i class="pi pi-bell layout-topbar-action" style="font-size: 1.3rem; cursor: pointer" title="Notifications" @click.stop="toggleDropdown" />
                        </OverlayBadge>

                        <!-- Dropdown de notificaciones -->
                        <div v-if="showDropdown" class="absolute top-8 right-0 w-72 bg-white shadow-lg rounded-lg p-3 z-50">
                            <div v-if="notifications.length === 0" class="text-gray-500 text-center p-2">You have no notifications.</div>
                            <ul v-else>
                                <li
                                    v-for="notification in notifications"
                                    :key="notification.id"
                                    :class="!notification.read_at ? 'bg-gray-200' : ''"
                                    class="p-2 border-b last:border-none cursor-pointer hover:bg-gray-100"
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
                        <i class="pi pi-inbox" title="Messages"></i>
                        <span>Messages</span>
                    </button>
                    <button type="button" class="layout-topbar-action" @click="router.push({ name: 'profile' })">
                        <i v-if="!userAvatar" class="pi pi-user" title="Profile"></i>
                        <img v-else :src="userAvatar" alt="User Avatar" class="w-8 h-8 rounded-full mr-2" />
                        <span>Profile</span>
                    </button>
                    <button type="button" class="layout-topbar-action">
                        <i class="pi pi-sign-out" title="Logout" @click="logout"></i>
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
