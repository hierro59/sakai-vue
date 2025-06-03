<script setup>
import { ref, defineEmits, defineProps, watch } from 'vue';

const emit = defineEmits(['update:modelValue']);

const props = defineProps({
    modelValue: {
        type: Object,
        default: () => ({ code: 'USD', name: 'USD $' })
    }
});

const currencies = [
    { code: 'USD', name: 'USD $' },
    { code: 'EUR', name: 'EUR €' },
    { code: 'MXN', name: 'MXN $' },
    { code: 'COP', name: 'COP $' },
    { code: 'CLP', name: 'CLP $' },
    { code: 'ARS', name: 'ARS $' },
    { code: 'BRL', name: 'BRL R$' },
    { code: 'GBP', name: 'GBP £' },
    { code: 'CAD', name: 'CAD $' },
    { code: 'AUD', name: 'AUD $' },
    { code: 'JPY', name: 'JPY ¥' },
    { code: 'CNY', name: 'CNY ¥' }
];

const selectedCode = ref(props.modelValue.code);

watch(selectedCode, (code) => {
    const selectedCurrency = currencies.find((c) => c.code === code);
    emit('update:modelValue', selectedCurrency);
});

watch(
    () => props.modelValue.code,
    (code) => {
        selectedCode.value = code;
    }
);
</script>

<template>
    <select v-model="selectedCode" class="border p-2 rounded w-full">
        <option v-for="currency in currencies" :key="currency.code" :value="currency.code">
            {{ currency.name }}
        </option>
    </select>
</template>
