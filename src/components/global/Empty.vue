<template>
    <div className="card">
        <img :src="props.img" alt="" class="w-[30%] m-8" />
        <div class="font-semibold text-xl mb-4">{{ props.title }}</div>
        <p>{{ props.description }}</p>
        <div class="mt-4">
            <router-link :to="props.link">
                <Button label="Vamos" severity="info" />
            </router-link>
        </div>
    </div>
</template>

<script setup>
import { ref, defineProps } from 'vue';

const props = defineProps({
    title: String,
    description: String,
    img: String,
    link: String
});
</script>
