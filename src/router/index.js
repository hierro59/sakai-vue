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
                path: '/course-management',
                name: 'course-management',
                component: () => import('@/views/pages/content-management/CourseManagement.vue'),
                meta: { requiresAuth: true },
            },
        ],
    },
    {
        path: '/',
        name: 'landing',
        component: () => import('@/views/pages/Landing.vue'),
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