import { ref } from "vue";


const existPaymentMethod = (integrations) => {
    const paymentMethod = ref(false);
    if (!integrations) {
        return paymentMethod;
    }
    integrations.find(
        (integration) => integration.provider_type === "payment-gateway"
    );
    if (integrations.length > 0) {
        paymentMethod.value = true;
    }
    return paymentMethod.value;
};

export default {
    existPaymentMethod
};