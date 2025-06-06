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

                    <button class="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90" @click="upgradeTo(plan)">Upgrade to {{ plan.name }}</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

// Props o mock de datos
const props = defineProps({
    data: Object
});

// Suscripción actual (puede venir vacía si no tiene ninguna)
const currentPlan = props.data.user_plans || null;

console.log(currentPlan);

// Acción al hacer clic en actualizar
const upgradeTo = (plan) => {
    // Aquí deberías redirigir a checkout o llamar a la API de upgrade
    console.log(`Actualizar a plan ID ${plan.id}`, plan);
    alert(`Redirigir al proceso de actualización para el plan ${plan.name}`);
};
</script>
