import { authClient } from '@/main';
import { ref } from 'vue';

const isLoading = ref(true);

const getCourses = async () => {
    const response = await authClient.get(`/tenant/course`);
    console.log(response.data.data);
    return response.data.data;
}

const createCourse = async (data) => {
    const response = await authClient.post(`/tenant/course/create`, data);
    console.log(response.data.data);
    return response.data.data;
}

const updateCourse = async (id, data) => {
    const response = await authClient.put(`/tenant/course/${id}`, data);
    console.log(response.data.data);
    return response.data.data;
}

const getCourse = async (id) => {
    try {
        const response = await authClient.get(`/tenant/course/${id}`);
        return response.data.data;
    } catch (error) {
        console.log(error);
    } finally {
        isLoading.value = false; // Finaliza la carga
    }
}

const publishCourse = async (id) => {
    try {
        const response = await authClient.put(`/tenant/course/publish/${id}`);
        return response.data.data;
    } catch (error) {
        console.log(error);
    } finally {
        isLoading.value = false; // Finaliza la carga
    }
}

export default {
    getCourses,
    createCourse,
    getCourse,
    updateCourse,
    publishCourse,
    isLoading
};