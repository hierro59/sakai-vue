<script setup>
import { ref, watch, defineEmits } from 'vue';
import PlanService from '@/service/settings/ApiSubscriptionPlan';

const props = defineProps({
    plan: Object
});
const emit = defineEmits(['saved', 'close']);

const form = ref({
    name: '',
    slug: '',
    description: '',
    price: 0,
    duration_interval: 'month',
    duration_count: 1,
    features: []
});

watch(
    () => props.plan,
    (p) => {
        if (p) form.value = { ...p };
        else
            form.value = {
                name: '',
                slug: '',
                description: '',
                price: 0,
                duration_interval: 'month',
                duration_count: 1,
                features: []
            };
    },
    { immediate: true }
);

const save = async () => {
    if (form.value.id) await PlanService.update(form.value);
    else await PlanService.create(form.value);
    emit('saved');
};
</script>

<template>
    <div class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div class="bg-white p-6 rounded-lg w-full max-w-md space-y-4">
            <h3 class="text-xl font-semibold">{{ form.id ? 'Editar' : 'Nuevo' }} Plan</h3>

            <input v-model="form.name" placeholder="Nombre" class="w-full border p-2 rounded" />
            <input v-model="form.slug" placeholder="Slug" class="w-full border p-2 rounded" />
            <textarea v-model="form.description" placeholder="Descripción" class="w-full border p-2 rounded"></textarea>

            <input v-model.number="form.price" type="number" step="0.01" placeholder="Precio" class="w-full border p-2 rounded" />

            <div class="flex gap-2">
                <select v-model="form.duration_interval" class="border p-2 rounded">
                    <option value="day">Día</option>
                    <option value="week">Semana</option>
                    <option value="month">Mes</option>
                    <option value="year">Año</option>
                </select>
                <input v-model.number="form.duration_count" type="number" min="1" class="w-20 border p-2 rounded" />
            </div>

            <input v-model="form.features" placeholder="Características separadas por coma" class="w-full border p-2 rounded" @blur="form.features = form.features.split(',').map((f) => f.trim())" />

            <div class="flex justify-end gap-2">
                <button @click="emit('close')" class="text-gray-600">Cancelar</button>
                <button @click="save" class="bg-blue-600 text-white px-4 py-2 rounded">Guardar</button>
            </div>
        </div>
    </div>
</template>
