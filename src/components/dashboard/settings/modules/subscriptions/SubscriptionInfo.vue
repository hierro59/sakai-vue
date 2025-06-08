<template>
    <div class="p-6 space-y-6">
        <div v-if="!data.autorization" class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
            <p class="font-semibold">You do not have access to the content.</p>
            <p>You need to upgrade your subscription to continue.</p>
        </div>

        <div v-if="currentPlan" class="border p-4 rounded bg-white shadow">
            <h2 class="text-lg font-semibold mb-2">Your current plan</h2>
            <div class="grid md:grid-cols-2 gap-4">
                <h3 class="text-xl font-bold">{{ currentPlan.name }}</h3>
                <p class="text-gray-600 mb-2">{{ currentPlan.description }}</p>
                <p class="text-green-600 font-semibold text-lg">${{ currentPlan.price }} / {{ currentPlan.duration_interval }}</p>

                <ul class="mt-3 list-disc list-inside text-sm text-gray-700">
                    <li v-for="feature in currentPlan.features" :key="feature">{{ feature }}</li>
                </ul>
            </div>
            <!-- <p><strong>Plan ID:</strong> {{ currentPlan.subscription_plan_id }}</p> -->
            <p><strong>Active:</strong> {{ currentPlan.is_active ? 'Yes' : 'No' }}</p>
            <p><strong>From:</strong> {{ currentPlan.starts_at ?? 'No date' }}</p>
            <p><strong>To:</strong> {{ currentPlan.ends_at ?? 'No date' }}</p>
        </div>

        <div class="space-y-4">
            <h2 class="text-lg font-semibold">You need to upgrade</h2>
            <div class="grid md:grid-cols-2 gap-4">
                <div v-for="plan in data.available_plans" :key="plan.id" class="border p-4 rounded shadow hover:shadow-md transition bg-white">
                    <h3 class="text-xl font-bold">{{ plan.name }}</h3>
                    <p class="text-gray-600 mb-2">{{ plan.description }}</p>
                    <p class="text-green-600 font-semibold text-lg">${{ plan.price }} / {{ plan.duration_interval }}</p>

                    <ul class="mt-3 list-disc list-inside text-sm text-gray-700">
                        <li v-for="feature in plan.features" :key="feature">{{ feature }}</li>
                    </ul>

                    <button v-if="!processing" class="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90" @click="handlePurchase(plan)">Upgrade to {{ plan.name }}</button>

                    <button v-else class="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90" disabled>
                        <i class="pi pi-spin pi-spinner"></i>
                        Processing...
                    </button>
                </div>
            </div>
        </div>
    </div>
    <Dialog v-model:visible="paypalModalVisible" header="Processing payment..." :modal="true" :closable="false">
        <h1 class="text-2xl font-bold text-gray-800">Choose your payment method</h1>
        <div ref="paypalContainer" class="p-4"></div>
    </Dialog>
    <Dialog
        v-model:visible="subscriptionSuccess"
        header="Upgrade Subscription"
        :style="{ width: '50vw', maxWidth: '500px' }"
        :modal="true"
        :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
        headerClass="border-b border-gray-200 pb-4"
        contentClass="pt-6"
        footerClass="border-t border-gray-200 pt-4"
    >
        <div class="flex items-center mb-4">
            <i class="pi pi-check-circle text-3xl text-green-500 mr-3"></i>
            <div>
                <p class="text-gray-700 font-medium mb-2">Your subscription has been upgraded successfully!</p>
                <p class="text-sm text-gray-500">We will refresh the page to apply the changes.</p>
            </div>
        </div>

        <template #footer>
            <Button label="Apply" @click="refresh()" icon="pi pi-check" class="bg-green-500 hover:bg-green-600 focus:shadow-green-500" autofocus />
        </template>
    </Dialog>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import paypal from '@/service/integrations/payment-gateways/paypal/ApiPayPalService';
import { useToast } from 'primevue/usetoast';
import confetti from 'canvas-confetti';

const emit = defineEmits(['close-detail-and-open-player']);

const toast = useToast();

// Props o mock de datos
const props = defineProps({
    data: Object
});

// Suscripción actual (puede venir vacía si no tiene ninguna)
const currentPlan = props.data.user_plans || null;

const paypalContainer = ref(null);
const paypalModalVisible = ref(false);
const processing = ref(false);
const subscriptionSuccess = ref(false);

const handlePurchase = async (plan) => {
    processing.value = true;

    const body = JSON.stringify({
        content_id: plan.id,
        content_type: plan.slug,
        action: 'plan-subscribe'
    });
    const res = await paypal.createOrder(body);
    const orderID = res.id;

    if (!window.paypal) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'PayPal not loaded', life: 3000 });
        processing.value = false;
        return;
    }

    paypalModalVisible.value = true;

    await nextTick();

    const buttonInstance = window.paypal.Buttons({
        createOrder: () => orderID,
        onApprove: async () => {
            const capture = await paypal.captureOrder(
                JSON.stringify({
                    order_id: orderID,
                    content_id: plan.id,
                    content_type: plan.slug,
                    action: 'plan-subscribe'
                })
            );

            if (capture.status === 'COMPLETED') {
                toast.add({ severity: 'success', summary: 'Successful', detail: 'Plan Registered', life: 3000 });
                subscriptionSuccess.value = true;
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    zIndex: 99999
                });
                setTimeout(() => {
                    refresh();
                }, 10000);
            }

            paypalModalVisible.value = false;
            processing.value = false;
        },
        onCancel: () => {
            toast.add({ severity: 'error', summary: 'Error', detail: 'Payment canceled', life: 3000 });
            paypalModalVisible.value = false;
            processing.value = false;
        },
        onError: (err) => {
            console.error('Error en el pago:', err);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Payment error', life: 3000 });
            paypalModalVisible.value = false;
            processing.value = false;
        }
    });

    await buttonInstance.render(paypalContainer.value);
};

const refresh = () => {
    location.reload();
};
</script>
