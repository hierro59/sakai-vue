<script setup>
import { provide, onMounted, watch } from 'vue';
import { useCompanyStyles } from '@/service/useCompanyStyles';
import Loading from './components/global/Loading.vue';

const { company, companyLogo, isLoading, faviconUrl } = useCompanyStyles();
provide('company', company);
provide('isLoading', isLoading);
provide('companyLogo', companyLogo);
provide('faviconUrl', faviconUrl);

// Función para actualizar el favicon dinámicamente
const updateFavicon = (faviconUrl) => {
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = faviconUrl;
    document.head.appendChild(link);
};

// Función para actualizar la metadata
const updateMetadata = () => {
    if (company.value) {
        document.title = company.value.name + ' | ' + company.value.slogan || 'Courses Platform';

        const description = document.querySelector("meta[name='description']") || document.createElement('meta');
        description.name = 'description';
        description.content = company.value.description || 'Custom Courses Platform';
        document.head.appendChild(description);
    }
};

// Actualizar el favicon y metadata cuando cambie la compañía
watch(company, () => {
    if (faviconUrl.value) {
        updateFavicon(faviconUrl.value);
    }
    updateMetadata();
});

onMounted(() => {
    if (faviconUrl.value) {
        updateFavicon(faviconUrl.value);
    }
    updateMetadata();
});
</script>

<template>
    <template v-if="isLoading">
        <Loading />
    </template>
    <template v-else>
        <router-view />
    </template>
    <DynamicDialog />
</template>

<style scoped></style>
