<script setup></script>

<template>
    <div class="flex items-center justify-center min-h-screen overflow-hidden">
        <div class="flex flex-col items-center justify-center">
            <img src="/images/owl.png" alt="" />
        </div>
    </div>
</template>
<style scoped>
img {
    animation: spin 2s linear infinite;
}
@keyframes spin {
    0% {
        transform: rotate(0deg);
        scale: 1;
    }
    50% {
        transform: rotate(180deg);
        scale: 1.5;
    }
    100% {
        transform: rotate(360deg);
        scale: 1;
    }
}
</style>
