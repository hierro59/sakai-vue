import { authClient } from '@/main';
import { ref } from 'vue';

const isLoading = ref(true);

const getUsers = async () => {
    try {
        const response = await authClient.get('/settings/users');
        return response.data;
    } catch (error) {
        console.log(error);
    } finally {
        isLoading.value = false; // Finaliza la carga
    }
}

const createUser = async (user) => {
    const response = await authClient.post('/settings/users/create', user);
    return response;
}


const updateUser = async (user) => {
    const response = await authClient.put('/settings/users/' + user.id, user);
    return response.data.data;
}

// Eliminar un usuario
const deleteUser = async (userId) => {
    const response = await authClient.delete('/settings/users/delete/' + userId);
    return response.data.data;
}

// Eliminar varios usuarios
const deleteUsers = async (userIds) => {
    const response = await authClient.delete('/settings/users/deletes', { data: { userIds } });
    return response.data.data;
}

const importUsers = async (formData) => {
    const response = await authClient.post('/settings/users/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export default {
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    deleteUsers,
    importUsers,
    isLoading
};