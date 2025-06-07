<template>
    <div class="p-6 bg-white rounded-xl shadow-md w-full">
        <div :style="'background: url(' + props.provider.image + ') no-repeat center center / cover;'" class="h-32 rounded-t-xl"></div>
        <h2 class="text-xl font-bold mb-4">Usar {{ props.provider.name }}</h2>
        <p class="mb-4">Si prefieres mantener el control completo sobre los pagos y gestionar directamente tus ingresos, puedes optar por usar tu propia cuenta comercial de PayPal.</p>
        <div class="space-y-2">
            <h3 class="text-lg font-semibold">Ventajas de usar tu cuenta:</h3>
            <ul class="list-disc pl-6 text-gray-700">
                <li>✅ Control total: Tú gestionas directamente el flujo de pagos y cobros.</li>
                <li>✅ Sin comisiones adicionales: Atenea no retiene porcentaje alguno.</li>
                <li>✅ Flexibilidad: Puedes configurar y actualizar las credenciales cuando lo necesites.</li>
                <li>✅ Acceso directo a fondos: Recibes los pagos directamente en tu cuenta comercial.</li>
                <li>✅ Personalización: Puedes utilizar tus propias políticas y condiciones de pago.</li>
            </ul>
        </div>
        <div class="mt-4">
            <h3 class="text-lg font-semibold">¿Cómo configurar?</h3>
            <ol class="list-decimal pl-6 text-gray-700">
                <li>Selecciona esta opción para integrar tu propia cuenta de PayPal.</li>
                <li>Proporciona las credenciales API necesarias (Client ID y Secret).</li>
                <li>Guarda la configuración y realiza una prueba de pago.</li>
            </ol>
            <form @submit.prevent="saveCredentials" class="mt-4 space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">Client ID</label>
                    <input v-model="clientId" type="text" :disabled="props.edit" placeholder="Ingresa tu Client ID" class="mt-1 p-2 block w-full border rounded-md" />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Secret Key</label>
                    <InputText v-model="secret" :disabled="props.edit" type="text" placeholder="Ingresa tu Secret Key" class="mt-1 p-2 block w-full border rounded-md" />
                </div>
                <div v-if="!props.edit" class="flex items-center mb-4">
                    <Checkbox inputId="use-atenea-paypal" name="use-atenea-paypal" value="false" @click="acceptTC = !acceptTC" />
                    <label for="use-atenea-paypal" class="ml-2">Acepto los <a href="#" class="text-blue-600 hover:underline">T&eacute;rminos y Condiciones</a>.</label>
                </div>
                <!-- toggle de modo sandbox o live -->
                <label class="block text-sm font-medium text-gray-700">Modo</label>
                <ToggleButton v-model="mode" onLabel="Sandbox" offLabel="Live" :style="{ width: '10em' }" />

                <div>
                    <button
                        type="submit"
                        :disabled="!clientId || !secret || !acceptTC"
                        :class="!clientId || !secret || !acceptTC ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'"
                        class="w-full py-2 px-4 mb-4 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        @click="saveIntegration"
                    >
                        Save Integration
                    </button>
                    <button v-if="props.edit" @click="cancelIntegration = true" class="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-blue-500">Cancel Integration</button>
                </div>
            </form>
        </div>
        <p class="text-sm text-gray-500 mt-2">¿Tienes dudas? Contacta con nuestro equipo de soporte en cualquier momento. <a href="#" class="text-blue-600 hover:underline">Preguntas frecuentes</a>.</p>
    </div>
    <Dialog v-model:visible="cancelIntegration" :style="{ width: '450px' }" header="Confirm" :modal="true">
        <div class="flex items-center gap-4">
            <i class="pi pi-exclamation-triangle !text-3xl" />
            <span>Are you sure you want to cancel integration?</span>
        </div>
        <template #footer>
            <Button label="No" icon="pi pi-times" text @click="cancelIntegration = false" />
            <Button label="Yes" icon="pi pi-check" @click="cancelIntegrationRequest" />
        </template>
    </Dialog>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';
import api from '@/service/settings/ApiProviders';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const emit = defineEmits(['update:provider']);

const clientId = ref('');
const secret = ref('');
const acceptTC = ref(false);
const mode = ref(true);

const cancelIntegration = ref(false);
const integrated = ref(false);

const props = defineProps({
    provider: {
        type: Object,
        required: true
    },
    edit: {
        type: Boolean,
        default: false
    },
    settings: {
        type: Object,
        default: () => ({})
    }
});

if (props.settings.length > 0) {
    const settings = JSON.parse(props.settings[0].settings);
    clientId.value = settings.client_id || '';
    secret.value = settings.client_secret || '';
    mode.value = settings.mode;
}

const saveIntegration = () => {
    if (!acceptTC.value) {
        toast.add({
            severity: 'warn',
            summary: 'Atención',
            detail: 'Debes aceptar los términos y condiciones para continuar.',
            life: 3000
        });
        return;
    }
    if (!clientId.value || !secret.value) {
        toast.add({
            severity: 'warn',
            summary: 'Atención',
            detail: 'Debes completar todos los campos para continuar.',
            life: 3000
        });
        return;
    }

    props.provider.settings = {
        client_id: clientId.value,
        client_secret: secret.value,
        mode: mode.value === true ? 'sandbox' : 'live'
    };

    api.createProvider(props.provider)
        .then((response) => {
            toast.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Integración guardada correctamente.',
                life: 3000
            });
            emit('update:provider');
        })
        .catch((error) => {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Hubo un problema al guardar la integración 2.',
                life: 3000
            });
        });
};

const cancelIntegrationRequest = () => {
    api.cancelProvider(props.provider.id)
        .then(() => {
            toast.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Integración cancelada correctamente.',
                life: 3000
            });
            emit('update:provider', null);
            cancelIntegration.value = false;
        })
        .catch((error) => {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Hubo un problema al cancelar la integración.',
                life: 3000
            });
        });
};

const changeStatus = () => {
    acceptTC.value = !acceptTC.value;
};
</script>

<style scoped>
.bg-green-600:hover {
    background-color: #16a34a;
}
input {
    border: 1px solid #d1d5db;
}
input:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.5);
}
</style>
