import { authClient, publicClient } from '@/main';

const checkEmail = async (email) => {
    try {
        const response = await authClient.post('/register/check-email', { email });
        return response.data;
    } catch (error) {
        console.log(error);
    }
}

export default {
    checkEmail
};