import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import router from '@/router'; // Importa el router para redirigir
import { getActivePinia, setActivePinia, createPinia } from 'pinia';

const createAxiosClients = () => {
    const pinia = getActivePinia() || createPinia();
    setActivePinia(pinia);

    const authStore = useAuthStore();

    // Cliente para endpoints públicos
    const publicClient = axios.create({
        baseURL: import.meta.env.VITE_API_BASE_URL,
        headers: {
            'Content-Type': 'application/json',
            'xsrf-header-name': 'X-CSRF-TOKEN',
            'X-Tenant-Domain': window.location.hostname
        },
    });

    // Cliente para endpoints autenticados
    const authClient = axios.create({
        baseURL: import.meta.env.VITE_API_BASE_URL,
        headers: {
            'Content-Type': 'application/json',
            'X-Tenant-Domain': window.location.hostname
        },
    });

    // Interceptor para agregar el token en cada solicitud
    authClient.interceptors.request.use(config => {
        const token = authStore.token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    // Interceptor para manejar errores 401 (Unauthenticated)
    const responseInterceptor = (error) => {
        if (error.response?.status === 401) {
            authStore.logout(); // Limpia el estado de autenticación
            router.push({ name: 'login' }); // Redirige al login
        }
        return Promise.reject(error);
    };

    // Aplica el interceptor a ambos clientes (opcional, depende de tu API)
    publicClient.interceptors.response.use(response => response, responseInterceptor);
    authClient.interceptors.response.use(response => response, responseInterceptor);

    return { publicClient, authClient };
};

export default createAxiosClients;