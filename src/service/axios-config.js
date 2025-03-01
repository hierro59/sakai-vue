// axios-config.js
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import { getActivePinia, setActivePinia, createPinia } from 'pinia';

const createAxiosClients = () => {
    const pinia = getActivePinia() || createPinia();
    setActivePinia(pinia);

    const authStore = useAuthStore();
    const token = authStore.token;

    const publicClient = axios.create({
        baseURL: import.meta.env.VITE_API_BASE_URL,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
            'xsrf-header-name': 'X-CSRF-TOKEN',
        },
    });

    const authClient = axios.create({
        baseURL: import.meta.env.VITE_API_BASE_URL,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
        },
    });

    // Agregar token dinámico en cada solicitud autenticada
    authClient.interceptors.request.use(config => {
        const token = authStore.token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    return { publicClient, authClient };
};

export default createAxiosClients;
