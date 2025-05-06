import { authClient } from '@/main';
import { ref } from 'vue';

const isLoading = ref(true);

const getCertificateTempalates = async () => {
    const response = await authClient.get(`/tenant/template`);
    return response.data.data;
}

const createTemplate = async (data) => {
    const response = await authClient.post(`/tenant/template/create`, data);
    //console.log(response.data.data);
    return response.data.data;
}

const updateTemplate = async (id, data) => {
    const response = await authClient.put(`/tenant/template/${id}`, data);
    //console.log(response.data.data);
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

const deleteTemplate = async (id) => {
    try {
        const response = await authClient.delete(`/tenant/template/delete/${id}`);
        return response.data.data;
    } catch (error) {
        console.log(error);
    } finally {
        isLoading.value = false; // Finaliza la carga
    }
}

export default {
    getCertificateTempalates,
    createTemplate,
    getCourse,
    updateTemplate,
    deleteTemplate
};