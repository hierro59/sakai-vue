<script setup>
import { ref, computed, inject } from 'vue';
import { useAuthStore } from '@/stores/auth';
import AppMenuItem from './AppMenuItem.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const company = inject('company');

const modules = ref([]);

company.value.modules.forEach((element) => {
    if (element.status == 1) {
        modules.value.push({ label: element.name, icon: 'pi pi-fw pi-box', to: '/settings/modules/' + element.id, permission: 'manage-platform' });
    }
});

const authStore = useAuthStore();
const userAvatar = computed(() => authStore.userAvatar || '/images/owl.png');

const menuItems = ref([
    {
        label: 'Home',
        items: [
            { label: t('dashboard'), icon: 'pi pi-fw pi-home', to: '/dashboard' },
            { label: t('myFormation'), icon: 'pi pi-fw pi-bookmark-fill', to: '/dashboard/my-content' },
            { label: t('catalog'), icon: 'pi pi-fw pi-objects-column', to: '/dashboard/catalog' },
            { label: t('communities'), icon: 'pi pi-fw pi-share-alt', to: '/dashboard/communities' }
        ]
    },
    {
        label: 'Content Management',
        icon: 'pi pi-fw pi-pencil',
        items: [
            { label: t('courses'), icon: 'pi pi-fw pi-pen-to-square', to: '/content-management', permission: ['manage-platform', 'create-course', 'edit-course', 'publish-course'] },
            { label: t('paths'), icon: 'pi pi-fw pi-compass', to: '/content-management/paths', permission: ['manage-platform', 'create-course', 'edit-course', 'publish-course'] },
            { label: t('multimediaLibrary'), icon: 'pi pi-fw pi-images', to: '/content-management/multimedia-library', permission: ['manage-platform', 'create-course', 'edit-course', 'publish-course'] },
            { label: t('categories'), icon: 'pi pi-fw pi-sitemap', to: '/content-management/categories', permission: ['manage-platform', 'create-course', 'edit-course', 'publish-course'] },
            { label: t('certificates'), icon: 'pi pi-fw pi-star', to: '/content-management/certificates', permission: ['manage-platform', 'create-course', 'edit-course', 'publish-course'] }
        ]
    },
    {
        label: 'Settings',
        icon: 'pi pi-fw pi-briefcase',
        items: [
            { label: t('branding'), icon: 'pi pi-fw pi-globe', to: '/settings/branding', permission: 'company-admin' },
            { label: t('users'), icon: 'pi pi-fw pi-user', to: '/settings/user-management', permission: 'manage-users' },
            { label: t('communities'), icon: 'pi pi-fw pi-share-alt', to: '/settings/communities', permission: 'company-admin' },
            { label: t('integrations'), icon: 'pi pi-fw pi-plus-circle', to: '/settings/integrations', permission: 'company-admin' },
            {
                label: t('modules'),
                icon: 'pi pi-fw pi-box',
                to: '/settings/modules',
                permission: 'company-admin',
                items: [{ label: t('allModules'), icon: 'pi pi-fw pi-box', to: '/settings/modules', permission: 'company-admin' }, ...modules.value]
            }
        ]
    },
    {
        label: t('profile'),
        icon: 'pi pi-fw pi-user',
        items: [
            {
                label: authStore.user,
                image: userAvatar.value,
                to: '/dashboard/profile',
                permission: 'explore-courses'
            }
        ]
    },
    {
        label: 'Atenea Zone',
        icon: 'pi pi-fw pi-pencil',
        items: [{ label: 'Tenants', icon: 'pi pi-fw pi-building-columns', to: '/', permission: 'super-user' }]
    }
]);

// Verifica si el usuario tiene al menos uno de los permisos requeridos
const hasRequiredPermission = (requiredPermissions) => {
    if (Array.isArray(requiredPermissions)) {
        return requiredPermissions.some((permission) => authStore.hasPermission(permission));
    }
    return authStore.hasPermission(requiredPermissions);
};

// Filtrar los elementos del menú según los permisos del usuario
const filteredMenu = computed(() => {
    return menuItems.value
        .map((section) => ({
            ...section,
            items: section.items
                ? section.items.filter((item) => {
                      // Verifica si el usuario tiene permiso para ver el item
                      if (item.permission) {
                          return hasRequiredPermission(item.permission);
                      }
                      return true; // Si no tiene permisos específicos, se muestra por defecto
                  })
                : []
        }))
        .filter((section) => section.items.length > 0); // Elimina secciones vacías
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
