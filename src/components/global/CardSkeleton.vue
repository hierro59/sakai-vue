<template>
    <Card class="border border-surface-200 h-full justify-between dark:border-surface-700 rounded me-4 animate-pulse">
        <template #header>
            <div class="relative w-full h-48 bg-gray-300 rounded-t"></div>
        </template>

        <template #title>
            <div class="flex gap-2 my-2">
                <div class="w-20 h-6 bg-gray-300 rounded"></div>
                <div class="w-6 h-6 bg-gray-300 rounded-full"></div>
            </div>
            <div class="h-6 w-3/4 bg-gray-300 rounded mb-2"></div>
            <div class="flex gap-2 flex-wrap mt-2">
                <div class="h-4 w-16 bg-gray-300 rounded" v-for="n in 3" :key="n"></div>
            </div>
        </template>

        <template #content>
            <div class="space-y-2 mt-4">
                <div class="h-4 w-full bg-gray-300 rounded"></div>
                <div class="h-4 w-5/6 bg-gray-300 rounded"></div>
                <div class="h-4 w-2/3 bg-gray-300 rounded"></div>
                <div class="h-3 w-full bg-gray-300 rounded mt-4"></div>
            </div>
        </template>

        <template #footer>
            <div class="mt-4 space-y-2">
                <div class="h-10 w-full bg-gray-300 rounded"></div>
            </div>
        </template>
    </Card>
</template>

<script setup>
// No necesitas lógica aquí para un skeleton.
</script>

<style scoped>
.card-skeleton {
    @apply animate-pulse;
}
</style>
