import { authClient, publicClient } from '@/main';

const getCategories = async () => {
    try {
        const response = await publicClient.get('/categories');
        return response.data.categories;
    } catch (error) {
        console.log(error);
    }
}

const createCategory = async (category) => {
    try {
        const response = await authClient.post('/categories/create', category);
        return response.data.data;
    } catch (error) {
        console.log(error);
    }
}

const updateCategory = async (category) => {
    try {
        const response = await authClient.put('/categories/' + category.id, category);
        return response.data.data;
    } catch (error) {
        console.log(error);
    }
}

const deleteCategory = async (categoryId) => {
    try {
        const response = await authClient.delete('/categories/delete/' + categoryId);
        return response.data.data;
    } catch (error) {
        console.log(error);
    }
}


export default {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
};