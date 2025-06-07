import { authClient } from '@/main';

const createOrder = async (data) => {
    try {
        const response = await authClient.post('/payments/paypal/create-order', data);
        return response.data;
    } catch (error) {
        console.log(error);
    }
}

const captureOrder = async (data) => {
    try {
        const response = await authClient.post('/payments/paypal/capture-order', data);
        return response.data;
    } catch (error) {
        console.log(error);
    }
}

export default {
    createOrder,
    captureOrder
}