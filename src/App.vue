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
        document.title = company.value.name + ' | ' + (company.value.slogan || 'Courses Platform');

        const description = document.querySelector("meta[name='description']") || document.createElement('meta');
        description.name = 'description';
        description.content = company.value.description || 'Custom Courses Platform';
        document.head.appendChild(description);
    }
};

// Función para cargar el SDK de PayPal
function loadPayPal(company) {
    const meta = company?.meta_data ? JSON.parse(company.meta_data) : null;
    const provider = company?.integrations?.find((integration) => integration.provider_type === 'payment-gateway');
    const clientId = provider?.client_id;
    const currency = meta?.currency?.code || 'USD';

    console.log('[PayPal] Intentando cargar SDK...');
    console.log('[PayPal] Empresa:', company);

    if (clientId && !document.getElementById('paypal-sdk')) {
        const script = document.createElement('script');
        script.id = 'paypal-sdk';
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}`;
        script.async = true;
        script.defer = true;
        script.onload = () => console.log('[PayPal] SDK cargado correctamente');
        document.head.appendChild(script);
    } else {
        console.warn('[PayPal] No se pudo cargar el SDK: clientId ausente o SDK ya cargado.');
    }
}

// --- Cargar metadata y favicon al montar si ya existe la info
onMounted(() => {
    if (faviconUrl.value) updateFavicon(faviconUrl.value);
    updateMetadata();
});

// --- Observar cuando esté disponible company.value y cargar PayPal SDK
watch(company, (newCompany) => {
    if (newCompany) {
        console.log('[PayPal] company detectado en watcher:', newCompany);
        if (faviconUrl.value) updateFavicon(faviconUrl.value);
        updateMetadata();
        loadPayPal(newCompany);
    }
});
</script>
