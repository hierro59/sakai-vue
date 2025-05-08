import { defineStore } from 'pinia';
import { ref } from 'vue';
import { publicClient } from '@/main.js';

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null); // Información del usuario
    const rol = ref([]); // Roles del usuario
    const permissions = ref([]); // Permisos del usuario
    const token = ref(null);
    const userEmail = ref(null);
    const userAvatar = ref(null);
    const phone = ref(null);
    const first_login = ref(false);
    const first_name = ref(null);
    const last_name = ref(null);
    const username = ref(null);

    // Función para iniciar sesión
    const login = async (email, password) => {
        try {
            // Aquí haces la llamada a tu API para autenticar al usuario
            const response = await publicClient.post('/login', { email, password });
            const data = response.data.data;
            if (!response.data.success) throw new Error('Error en la autenticación');

            // Actualiza el estado del store con la respuesta
            user.value = data.first_name + ' ' + data.last_name;
            username.value = data.username;
            first_name.value = data.first_name;
            last_name.value = data.last_name;
            userEmail.value = data.email;
            userAvatar.value = data.avatar;
            phone.value = data.phone;
            rol.value = data.rol;
            permissions.value = data.scopes;
            token.value = data.token;
            first_login.value = data.first_login;

            return true; // Indica que el login fue exitoso
        } catch (error) {
            console.error('Error en el login:', error);
            return false; // Indica que el login falló
        }
    };

    // Función para cerrar sesión
    const logout = () => {
        user.value = null;
        username.value = null;
        first_name.value = null;
        last_name.value = null;
        rol.value = [];
        userEmail.value = null;
        userAvatar.value = null;
        phone.value = null;
        permissions.value = [];
        token.value = null;
        first_login.value = false;
        localStorage.removeItem('auth');
    };

    // Verifica si el usuario está autenticado
    const isAuthenticated = () => !!user.value;

    // Verifica si el usuario tiene un rol específico
    const hasRole = (role) => rol.value.includes(role);

    // Verifica si el usuario tiene un permiso específico
    const hasPermission = (permission) => permissions.value.includes(permission);

    return {
        user,
        username,
        first_name,
        last_name,
        rol,
        userEmail,
        userAvatar,
        phone,
        permissions,
        token,
        first_login,
        login,
        logout,
        isAuthenticated,
        hasRole,
        hasPermission,
    };
}, {
    persist: true, // Habilita la persistencia de datos
});