<template>
    <div class="card p-6 space-y-4">
        <h2 class="text-2xl font-semibold">Planes de suscripción</h2>

        <button @click="openNewPlanModal" class="bg-blue-500 text-white px-4 py-2 rounded">+ Crear nuevo plan</button>

        <div v-if="loading">
            <div class="flex items-center justify-center">
                <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="transparent" animationDuration=".5s" />
            </div>
        </div>

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
                    <button v-if="!plan.is_default" @click="openDeleteModal(plan)" class="text-red-600">Eliminar</button>
                </div>
            </div>
        </div>

        <PlanModal v-if="showModal" :plan="editingPlan" @saved="handleSaved" @close="showModal = false" />

        <Dialog v-model:visible="showDeleteModal" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span>
                    Are you sure you want to delete the plan
                    <b>{{ editingPlan.name }}</b>
                    ?
                </span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="showDeleteModal = false" />
                <Button label="Yes" icon="pi pi-check" @click="deletePlan(editingPlan)" />
            </template>
        </Dialog>
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
const showDeleteModal = ref(false);

const openDeleteModal = (plan) => {
    editingPlan.value = { ...plan };
    showDeleteModal.value = true;
};

const deletePlan = (plan) => {
    PlanService.deleted(plan.id).then(fetchPlans);
    showDeleteModal.value = false;
};

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
