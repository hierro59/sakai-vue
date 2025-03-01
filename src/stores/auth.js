import { defineStore } from 'pinia';
import { ref } from 'vue';
import { publicClient } from '@/main.js';

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null); // Información del usuario
    const rol = ref([]); // Roles del usuario
    const permissions = ref([]); // Permisos del usuario
    const token = ref(null);

    // Función para iniciar sesión
    const login = async (email, password) => {
        try {
            // Aquí haces la llamada a tu API para autenticar al usuario
            const response = await publicClient.post('/login', { email, password });
            const data = response.data.data;
            if (!response.data.success) throw new Error('Error en la autenticación');



            // Actualiza el estado del store con la respuesta
            user.value = data.first_name + ' ' + data.last_name;
            rol.value = data.rol;
            permissions.value = data.scopes;
            token.value = data.token;

            return true; // Indica que el login fue exitoso
        } catch (error) {
            console.error('Error en el login:', error);
            return false; // Indica que el login falló
        }
    };

    // Función para cerrar sesión
    const logout = () => {
        user.value = null;
        rol.value = [];
        permissions.value = [];
        token.value = null;
    };

    // Verifica si el usuario está autenticado
    const isAuthenticated = () => !!user.value;

    // Verifica si el usuario tiene un rol específico
    const hasRole = (role) => rol.value.includes(role);

    // Verifica si el usuario tiene un permiso específico
    const hasPermission = (permission) => permissions.value.includes(permission);

    return {
        user,
        rol,
        permissions,
        token,
        login,
        logout,
        isAuthenticated,
        hasRole,
        hasPermission,
    };
}, {
    persist: true, // Habilita la persistencia de datos
});