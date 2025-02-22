<script setup>
import { useCompanyStyles } from '@/service/useCompanyStyles';

const { company, companyLogo } = useCompanyStyles();
</script>

<template>
    <router-view />
</template>

<style scoped></style>
