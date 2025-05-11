import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes = [
    {
        path: '/dashboard',
        component: () => import('@/layout/AppLayout.vue'),
        children: [
            {
                path: '/dashboard',
                name: 'dashboard',
                component: () => import('@/views/Dashboard.vue'),
                meta: { requiresAuth: true },
            },
            {
                path: '/dashboard/catalog',
                name: 'catalog',
                component: () => import('@/views/pages/Catalog.vue'),
                meta: { requiresAuth: true },
            },
            {
                path: '/dashboard/my-courses',
                name: 'my-courses',
                component: () => import('@/views/pages/MyFormation.vue'),
                meta: { requiresAuth: true },
            },
            {
                path: '/dashboard/communities',
                name: 'communities',
                component: () => import('@/views/pages/Communities.vue'),
                meta: { requiresAuth: true },
            },
            {
                path: '/dashboard/profile',
                name: 'profile',
                component: () => import('@/views/pages/learner/UserProfile.vue'),
                meta: { requiresAuth: true },
            },
            {
                path: '/settings/communities',
                name: 'communities-settings',
                component: () => import('@/views/pages/settings/communities/Index.vue'),
                meta: { requiresAuth: true },
            },
            {
                path: '/content-management',
                name: 'content-management',
                component: () => import('@/views/pages/content-management/CourseManagement.vue'),
                meta: { requiresAuth: true },
            },
            {
                path: '/content-management/paths',
                name: 'learner-paths',
                component: () => import('@/views/pages/content-management/paths/Index.vue'),
                meta: { requiresAuth: true },
            },
            {
                path: '/content-management/multimedia-library',
                name: 'multimedia-library',
                component: () => import('@/views/pages/content-management/multimedia-library/Index.vue'),
                meta: { requiresAuth: true },
            },
            {
                path: '/content-management/creator/:courseId',
                name: 'creator',
                component: () => import('@/views/pages/content-management/creator/Creator.vue'),
                meta: { requiresAuth: true },
            },
            {
                path: '/settings/branding',
                name: 'branding',
                component: () => import('@/views/pages/settings/branding/Index.vue'),
                meta: { requiresAuth: true },
            },
            {
                path: '/settings/user-management',
                name: 'user-management',
                component: () => import('@/views/pages/settings/users/Index.vue'),
                meta: { requiresAuth: true },
            },
            {
                path: '/settings/integrations',
                name: 'integrations',
                component: () => import('@/views/pages/settings/integration/Index.vue'),
                meta: { requiresAuth: true },
            },
            {
                path: '/settings/modules',
                name: 'modules',
                component: () => import('@/views/pages/settings/modules/Index.vue'),
                meta: { requiresAuth: true },
            },
        ],
    },
    {
        path: '/',
        name: 'landing',
        component: () => import('@/views/pages/auth/Login.vue'),
        meta: { requiresAuth: false }, // Ruta pública
    },
    {
        path: '/auth/login',
        name: 'login',
        component: () => import('@/views/pages/auth/Login.vue'),
        meta: { requiresAuth: false }, // Ruta pública
    },
    {
        path: '/auth/access',
        name: 'accessDenied',
        component: () => import('@/views/pages/auth/Access.vue'),
        meta: { requiresAuth: false }, // Ruta pública
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();

    // Verifica si la ruta es pública
    if (to.meta.requiresAuth === false) {
        next(); // Permite el acceso sin verificación
        return;
    }

    // Si la ruta es privada, verifica la autenticación
    if (to.meta.requiresAuth && !authStore.isAuthenticated()) {
        next({ name: 'login' }); // Redirige al login si no está autenticado
        return;
    }

    // Verifica si la ruta requiere roles específicos
    if (to.meta.roles) {
        const hasRequiredRole = to.meta.roles.some(role => authStore.hasRole(role));
        if (!hasRequiredRole) {
            next({ name: 'accessDenied' }); // Redirige si no tiene el rol requerido
            return;
        }
    }

    next(); // Permite el acceso a la ruta
});

export default router;