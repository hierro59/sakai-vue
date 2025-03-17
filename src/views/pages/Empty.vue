<template>
    <div className="card">
        <div class="font-semibold text-xl mb-4">{{ title }}</div>
        <p>{{ description }}</p>
    </div>
</template>

<script setup>
import { ref, defineProps } from 'vue';

const title = ref('Empty');
const description = ref('This is an empty page.');

const props = defineProps({
    title: String,
    description: String
});
</script>
