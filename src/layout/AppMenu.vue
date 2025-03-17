<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import AppMenuItem from './AppMenuItem.vue';

const authStore = useAuthStore();

const menuItems = ref([
    {
        label: 'Home',
        items: [
            { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/dashboard' },
            { label: 'Mis Cursos', icon: 'pi pi-fw pi-bookmark-fill', to: '/dashboard' },
            { label: 'Catálogo', icon: 'pi pi-fw pi-objects-column', to: '/dashboard' },
            { label: 'Comunidades', icon: 'pi pi-fw pi-share-alt', to: '/dashboard' }
        ]
    },
    {
        label: 'Administración de Contenidos',
        icon: 'pi pi-fw pi-pencil',
        items: [
            { label: 'Cursos', icon: 'pi pi-fw pi-pen-to-square', to: '/content-management', permission: 'manage-platform' },
            { label: 'Rutas', icon: 'pi pi-fw pi-sitemap', to: '/dashboard', permission: 'manage-platform' },
            { label: 'Biblioteca Multimedia', icon: 'pi pi-fw pi-images', to: '/dashboard', permission: 'manage-platform' }
        ]
    },
    {
        label: 'Settings',
        icon: 'pi pi-fw pi-briefcase',
        to: '/',
        items: [
            {
                label: 'Brandig',
                icon: 'pi pi-fw pi-globe',
                to: '/',
                permission: 'company-admin'
            },
            {
                label: 'Usuarios',
                icon: 'pi pi-fw pi-user',
                permission: 'manage-users',
                to: '/'
                /* items: [
                    {
                        label: 'Login',
                        icon: 'pi pi-fw pi-sign-in',
                        to: '/',
                        permission: 'view-login'
                    },
                    {
                        label: 'Error',
                        icon: 'pi pi-fw pi-times-circle',
                        to: '/',
                        permission: 'view-error'
                    },
                    {
                        label: 'Access Denied',
                        icon: 'pi pi-fw pi-lock',
                        to: '/',
                        permission: 'view-access-denied'
                    }
                ] */
            },
            {
                label: 'Comunidades',
                icon: 'pi pi-fw pi-share-alt',
                to: '/',
                permission: 'company-admin'
            },
            {
                label: 'Integraciones',
                icon: 'pi pi-fw pi-plus-circle',
                to: '/',
                permission: 'company-admin'
            },
            {
                label: 'Módulos',
                icon: 'pi pi-fw pi-box',
                to: '/',
                permission: 'company-admin'
            }
        ]
    },
    {
        label: 'Atenea Zone',
        icon: 'pi pi-fw pi-pencil',
        items: [{ label: 'Tenants', icon: 'pi pi-fw pi-building-columns', to: '/', permission: 'super-user' }]
    }
]);

// Filtra los elementos del menú según los permisos del usuario
const filteredMenu = computed(() => {
    return menuItems.value
        .map((section) => ({
            ...section,
            items: section.items
                ? section.items.filter((item) => {
                      // Si el item tiene un permiso requerido, verifica si el usuario lo tiene
                      if (item.permission) {
                          return authStore.hasPermission(item.permission);
                      }
                      return true; // Si no tiene permiso requerido, se muestra
                  })
                : []
        }))
        .filter((section) => section.items.length > 0); // Filtra secciones vacías
});
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in filteredMenu" :key="item.label">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
