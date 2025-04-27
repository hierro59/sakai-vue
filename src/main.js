import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import App from './App.vue';
import router from './router';
import createAxiosClients from '@/service/axios-config';

import Aura from '@primevue/themes/aura';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import DialogService from 'primevue/dialogservice';
import DynamicDialog from 'primevue/dynamicdialog';

import '@/assets/styles.scss';

const app = createApp(App);
const pinia = createPinia();


pinia.use(piniaPluginPersistedstate);
app.use(pinia);
app.use(router);
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: '.app-dark'
        }
    }
});
app.use(ToastService);
app.use(ConfirmationService);
app.use(DialogService);

app.component('DynamicDialog', DynamicDialog);

const { publicClient, authClient } = createAxiosClients();

app.mount('#app');

export { publicClient, authClient };