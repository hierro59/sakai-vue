import { authClient } from '@/main';

const updateProfile = async (data) => {
    return authClient.post('/user/profile', data);
};

const updateAvatar = async (file) => {
    let formData = new FormData();
    formData.append('avatar', file);

    return authClient.post('/user/avatar', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};


const updatePassword = async (data) => {
    return authClient.post('/user/password', data);
};

export default {
    updateProfile,
    updateAvatar,
    updatePassword
};
