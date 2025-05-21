import { authClient } from '@/main';
import { ref } from 'vue';

const isLoading = ref(true);

const getPaths = async () => {
    try {
        const response = await authClient.get('/learningpaths');
        return response.data.data;
    } catch (error) {
        console.log(error);
    } finally {
        isLoading.value = false; // Finaliza la carga
    }
}

const createPath = async (path) => {
    try {
        const response = await authClient.post('/learningpaths/create', path);
        return response.data.data;
    } catch (error) {
        console.log(error);
    } finally {
        isLoading.value = false; // Finaliza la carga
    }
}

const getPathById = async (pathCode) => {
    try {
        const response = await authClient.get('/learningpaths/' + pathCode);
        return response.data;
    } catch (error) {
        console.log(error);
    }
}

const updatePath = async (path) => {
    try {
        const response = await authClient.put('/learningpaths/' + path.id, path);
        return response.data.data;
    } catch (error) {
        console.log(error);
    } finally {
        isLoading.value = false; // Finaliza la carga
    }
}

const deletePath = async (pathId) => {
    try {
        const response = await authClient.delete('/learningpaths/delete/' + pathId);
        return response.data.data;
    } catch (error) {
        console.log(error);
    } finally {
        isLoading.value = false; // Finaliza la carga
    }
}

const deletePaths = async (pathIds) => {
    try {
        const response = await authClient.delete('/learningpaths/deletes', { data: pathIds });
        return response.data.data;
    } catch (error) {
        console.log(error);
    } finally {
        isLoading.value = false; // Finaliza la carga
    }
}

const getPathMembers = async (pathId) => {
    try {
        const response = await authClient.get('/learningpaths/members/' + pathId);
        return response.data.data;
    } catch (error) {
        console.log(error);
    }
}

const getPosiblePathMembers = async (pathId) => {
    try {
        const response = await authClient.get('/learningpaths/members/posible/' + pathId);
        return response.data.data;
    } catch (error) {
        console.log(error);
    }
}

const addPathMembers = async (pathCode, members) => {
    try {
        const response = await authClient.post('/learningpaths/members/' + pathCode, members);
        return response.data.data;
    } catch (error) {
        console.log(error);
    }
}

const deletePathMembers = async (pathCode, usersId) => {
    console.log('deletePathMembers', pathCode, usersId);
    try {
        const response = await authClient.delete('/learningpaths/members/delete/' + pathCode, { data: usersId });
        return response.data.data;
    } catch (error) {
        console.log(error);
    }
}

const getContents = async (pathId) => {
    try {
        const response = await authClient.get('/learningpaths/contents/' + pathId);
        return response.data.data;
    } catch (error) {
        console.log(error);
    }
}

const getPosibleContents = async (pathId) => {
    try {
        const response = await authClient.get('/learningpaths/contents/posible/' + pathId);
        return response.data.data;
    } catch (error) {
        console.log(error);
    }
}

const addContents = async (pathId, contents) => {
    try {
        const response = await authClient.post('/learningpaths/contents/' + pathId, contents);
        return response.data.data;
    } catch (error) {
        console.log(error);
    }
}

const deleteContents = async (pathId, contentsId) => {
    try {
        const response = await authClient.delete('/learningpaths/contents/delete/' + pathId, { data: contentsId });
        return response.data.data;
    } catch (error) {
        console.log(error);
    }
}

const getSuggestContents = async (pathId) => {
    try {
        const response = await authClient.get('/ia/create-learning-path/' + pathId);
        return response;
    } catch (error) {
        console.log(error);
    }
}

export default {
    getPaths,
    createPath,
    getPathById,
    updatePath,
    deletePath,
    deletePaths,
    getPathMembers,
    getPosiblePathMembers,
    addPathMembers,
    deletePathMembers,
    getContents,
    getPosibleContents,
    addContents,
    deleteContents,
    getSuggestContents,
    isLoading
};