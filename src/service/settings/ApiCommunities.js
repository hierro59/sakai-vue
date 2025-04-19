import { authClient } from '@/main';
import { ref } from 'vue';

const isLoading = ref(true);

const getCommunities = async () => {
    try {
        const response = await authClient.get('/communities');
        return response.data.data;
    } catch (error) {
        console.log(error);
    } finally {
        isLoading.value = false; // Finaliza la carga
    }
}

const createCommunity = async (community) => {
    try {
        const response = await authClient.post('/communities/create', community);
        return response.data.data;
    } catch (error) {
        console.log(error);
    } finally {
        isLoading.value = false; // Finaliza la carga
    }
}

const updateCommunity = async (companySettings) => {
    try {
        const response = await authClient.put('/communities/' + companySettings.id, companySettings);
        return response.data.data;
    } catch (error) {
        console.log(error);
    } finally {
        isLoading.value = false; // Finaliza la carga
    }
}

const deleteCommunity = async (communityId) => {
    try {
        const response = await authClient.delete('/communities/delete/' + communityId);
        return response.data.data;
    } catch (error) {
        console.log(error);
    } finally {
        isLoading.value = false; // Finaliza la carga
    }
}

const deleteCommunities = async (communityIds) => {
    try {
        const response = await authClient.delete('/communities/deletes', { data: communityIds });
        return response.data.data;
    } catch (error) {
        console.log(error);
    } finally {
        isLoading.value = false; // Finaliza la carga
    }
}

export default {
    getCommunities,
    updateCommunity,
    createCommunity,
    deleteCommunity,
    deleteCommunities,
    isLoading
};