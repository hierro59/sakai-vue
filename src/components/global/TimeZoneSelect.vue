<template>
    <select v-model="internalValue" class="timezone-select">
        <option v-for="tz in formattedTimezones" :key="tz.value" :value="tz.value">
            {{ tz.label }}
        </option>
    </select>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';

// Props: acepta `modelValue` para v-model
const props = defineProps({
    modelValue: {
        type: String,
        default: ''
    }
});

// Emit: notifica cambios al padre
const emit = defineEmits(['update:modelValue']);

// Valor interno (manejado localmente)
const internalValue = ref(props.modelValue);

// Si el prop externo cambia, actualizamos el valor interno
watch(
    () => props.modelValue,
    (newVal) => {
        internalValue.value = newVal;
    }
);

// Si el valor interno cambia, emitimos el evento para v-model
watch(internalValue, (newVal) => {
    emit('update:modelValue', newVal);
});

// Obtener zonas horarias del navegador
const timezones = Intl.supportedValuesOf('timeZone');

// Formatear para mostrar: "(UTC±HH:MM) Zona"
const formattedTimezones = computed(() => {
    return timezones.map((tz) => ({
        label: `(UTC${getTimezoneOffset(tz)}) ${tz.replace(/_/g, ' ')}`,
        value: tz
    }));
});

// Función para obtener el offset UTC (ej: "-05:00")
function getTimezoneOffset(timeZone) {
    const formatter = new Intl.DateTimeFormat('en', {
        timeZone,
        timeZoneName: 'longOffset'
    });
    const offset = formatter.formatToParts().find((p) => p.type === 'timeZoneName')?.value;
    return offset?.replace('GMT', '') || '+00:00';
}

// Opcional: Establecer la zona horaria del usuario como valor inicial
onMounted(() => {
    if (!props.modelValue) {
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        internalValue.value = userTimezone;
    }
});
</script>

<style scoped>
.timezone-select {
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
}
</style>
