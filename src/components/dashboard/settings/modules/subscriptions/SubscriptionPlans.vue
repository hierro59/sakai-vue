<template>
    <div class="card p-6 space-y-4">
        <h2 class="text-2xl font-semibold">Planes de suscripción</h2>

        <button @click="openNewPlanModal" class="bg-blue-500 text-white px-4 py-2 rounded">+ Crear nuevo plan</button>

        <div v-if="loading">Cargando...</div>

        <div v-else class="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            <div v-for="plan in plans" :key="plan.id" class="border p-4 rounded-lg shadow">
                <div class="text-lg font-bold">{{ plan.name }}</div>
                <div class="text-sm text-gray-500">{{ plan.description }}</div>
                <div class="mt-2 font-semibold text-green-600">{{ currencySimbol }} {{ Number(plan.price).toFixed(2) }}</div>
                <div class="text-xs text-gray-500">Duración: {{ plan.duration_count }} {{ plan.duration_interval }}</div>

                <ul class="mt-2 text-sm list-disc list-inside">
                    <li v-for="f in plan.features" :key="f">{{ f }}</li>
                </ul>

                <div class="mt-4 flex gap-2">
                    <button @click="openEditModal(plan)" class="text-blue-600">Editar</button>
                    <button @click="PlanService.deleted(plan.id).then(fetchPlans)" class="text-red-600">Eliminar</button>
                </div>
            </div>
        </div>

        <PlanModal v-if="showModal" :plan="editingPlan" @saved="handleSaved" @close="showModal = false" />
    </div>
</template>
<script setup>
import { ref, onMounted, inject } from 'vue';
import PlanService from '@/service/settings/ApiSubscriptionPlan';
import PlanModal from './PlanModal.vue';

const company = inject('company');

const currencySimbol = ref(JSON.parse(company.value.meta_data).currency.name);

const plans = ref([]);
const loading = ref(true);
const showModal = ref(false);
const editingPlan = ref(null);

const fetchPlans = async () => {
    loading.value = true;
    plans.value = await PlanService.getSubscriptionPlan();
    loading.value = false;
};

const openNewPlanModal = () => {
    editingPlan.value = null;
    showModal.value = true;
};

const openEditModal = (plan) => {
    editingPlan.value = { ...plan };
    showModal.value = true;
};

const handleSaved = async () => {
    showModal.value = false;
    await fetchPlans();
};

onMounted(() => {
    fetchPlans();
});
</script>
