<template>
    <div v-if="moduleId == 1">
        <SubscriptionPlans />
    </div>
    <div v-if="moduleId == 4">
        <PublicCatalogSettings />
    </div>
</template>
<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import SubscriptionPlans from '@/components/dashboard/settings/modules/subscriptions/SubscriptionPlans.vue';
import PublicCatalogSettings from '@/components/dashboard/settings/modules/public-catalog/PublicCatalogSettings.vue';

const route = useRoute();

const moduleId = computed(() => Number(route.params.moduleId));
</script>
