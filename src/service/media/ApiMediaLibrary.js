import { authClient } from '@/main';

const uploadMedia = async (formData, type) => {
    return authClient.post(`/media-library/upload/${type}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

const getMedia = async (type = null) => {
    return await authClient.get('/media-library', { params: { type } });
}

export default {
    uploadMedia,
    getMedia
};