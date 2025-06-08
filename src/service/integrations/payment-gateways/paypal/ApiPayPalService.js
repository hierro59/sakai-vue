import { nextTick } from 'vue';
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


const handlePurchase = async (data) => {

    const body = JSON.stringify({ content_id: data.id, content_type: data.content_type });
    const res = await createOrder(data);
    const orderID = res.id;

    if (!window.paypal) {
        return {
            success: false,
            error: 'PayPal SDK not loaded'
        };
    }
    await nextTick();

    const buttonInstance = window.paypal.Buttons({
        createOrder: () => orderID,
        onApprove: async () => {
            const capture = await captureOrder(
                JSON.stringify({
                    order_id: orderID,
                    content_id: data.id,
                    content_type: data.content_type,
                    action: data.action
                })
            );

            if (capture.status === 'COMPLETED') {
                return {
                    success: true,
                    data: capture
                }
            }
        },
        onCancel: () => {
            return {
                success: false,
                error: 'Payment canceled'
            }
        },
        onError: (err) => {
            console.error('Error en el pago:', err);
            alert('Error al procesar el pago.');
            return {
                success: false,
                error: err
            }
        }
    });
    console.log(buttonInstance);
    return buttonInstance;
    //await buttonInstance.render(paypalContainer.value);
};

export default {
    createOrder,
    captureOrder,
    handlePurchase
}