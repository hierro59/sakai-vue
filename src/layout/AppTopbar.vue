<script setup>
import { inject } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const router = useRouter();

const company = inject('company');
const companyLogo = inject('companyLogo');

const authStore = useAuthStore();
const logout = () => {
    authStore.logout(); // Llama al metodo logout del store
    router.push({ name: 'login' }); // Redirige al login
};

const { toggleMenu, toggleDarkMode, isDarkTheme } = useLayout();
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
                    <OverlayBadge value="2" severity="danger" class="inline-flex">
                        <i class="pi pi-bell layout-topbar-action" style="font-size: 1.3rem" title="Notifications" />
                    </OverlayBadge>
                    <button type="button" class="layout-topbar-action">
                        <i class="pi pi-inbox" title="Messages"></i>
                        <span>Messages</span>
                    </button>
                    <button type="button" class="layout-topbar-action">
                        <i class="pi pi-user" title="Profile"></i>
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
