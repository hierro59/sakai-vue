import { publicClient } from '@/main';

const getContent = async (params = {}) => {
    try {
        const response = await publicClient.get('/public-catalog', {
            params
        });
        return response.data;
    } catch (error) {
        console.log(error);
    }
}

export default {
    getContent
}