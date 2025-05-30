import { authClient } from '@/main';

export const rateContent = async (data) => {
    return authClient.post('/learner/rate-content', data);
};