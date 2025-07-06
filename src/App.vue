<script setup>
import { provide, onMounted, watch } from 'vue';
import { useCompanyStyles } from '@/service/useCompanyStyles';
import Loading from './components/global/Loading.vue';
import DynamicDialog from 'primevue/dynamicdialog'; // si no lo tienes global

// Extraemos y proveemos los datos de la empresa
const { company, companyLogo, isLoading, faviconUrl } = useCompanyStyles();
provide('company', company);
provide('isLoading', isLoading);
provide('companyLogo', companyLogo);
provide('faviconUrl', faviconUrl);

// Actualiza favicon dinámicamente
const updateFavicon = (faviconUrl) => {
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = faviconUrl;
    document.head.appendChild(link);
};

// Actualiza título y meta descripción
const updateMetadata = () => {
    if (company.value) {
        document.title = company.value.name + ' | ' + (company.value.slogan || 'Courses Platform');

        const description = document.querySelector("meta[name='description']") || document.createElement('meta');
        description.name = 'description';
        description.content = company.value.description || 'Custom Courses Platform';
        document.head.appendChild(description);
    }
};

// Carga el SDK de PayPal con datos de la empresa
function loadPayPal(company) {
    const meta = company?.meta_data ? JSON.parse(company.meta_data) : null;
    const provider = company?.integrations?.find((i) => i.provider_type === 'payment-gateway');
    const clientId = provider?.client_id;
    const currency = meta?.currency?.code || 'USD';

    if (clientId && !document.getElementById('paypal-sdk')) {
        const script = document.createElement('script');
        script.id = 'paypal-sdk';
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}`;
        script.async = true;
        script.defer = true;
        script.onload = () => console.log('[PayPal] SDK cargado correctamente');
        document.head.appendChild(script);
    } else {
        console.warn('[PayPal] No se pudo cargar el SDK: clientId ausente o ya está cargado.');
    }
}

// Esperamos a que cargue la empresa
watch(company, (newCompany) => {
    if (newCompany) {
        if (faviconUrl.value) updateFavicon(faviconUrl.value);
        updateMetadata();
        loadPayPal(newCompany);
    }
});
</script>

<template>
    <!-- Mostrar pantalla de carga mientras se resuelve la empresa -->
    <template v-if="isLoading">
        <Loading />
    </template>
    <template v-else>
        <router-view />
    </template>

    <DynamicDialog />
</template>
