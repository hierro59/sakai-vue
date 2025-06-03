<template>
    <div v-if="moduleId == 1">
        <SubscriptionPlans />
    </div>
</template>
<script setup>
import { ref, defineProps, computed } from 'vue';
import { useRoute } from 'vue-router';
import SubscriptionPlans from '@/components/dashboard/settings/modules/subscriptions/SubscriptionPlans.vue';

const route = useRoute();

const moduleId = computed(() => Number(route.params.moduleId));
</script>
