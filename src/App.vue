<script setup>
import { provide } from 'vue';
import { useCompanyStyles } from '@/service/useCompanyStyles';
import Loading from './components/global/Loading.vue';

const { company, companyLogo, isLoading } = useCompanyStyles();
provide('company', company);
provide('isLoading', isLoading);
provide('companyLogo', companyLogo);
</script>

<template>
    <template v-if="isLoading">
        <Loading />
    </template>
    <template v-else>
        <router-view />
    </template>
</template>

<style scoped></style>
