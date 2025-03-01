import { authClient } from '@/main';

const getCourses = async () => {
    const response = await authClient.get(`/tenant/course`);
    console.log(response.data.data);
    return response.data.data;
}

export default { getCourses };