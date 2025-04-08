import { authClient } from '@/main';
import { ref } from 'vue';

const isLoading = ref(true);

const getBranding = async () => {
    try {
        const response = await authClient.get('/settings/branding');
        return response.data.data;
    } catch (error) {
        console.log(error);
    } finally {
        isLoading.value = false; // Finaliza la carga
    }
}

const updateBranding = async (companySettings) => {
    try {
        const response = await authClient.put('/settings/branding/' + companySettings.id, companySettings);
        return response.data.data;
    } catch (error) {
        console.log(error);
    } finally {
        isLoading.value = false; // Finaliza la carga
    }
}

export default {
    getBranding,
    updateBranding,
    isLoading
};