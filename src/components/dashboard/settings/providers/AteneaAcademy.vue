<template>
    <div class="p-6 bg-white rounded-xl shadow-md w-full">
        <div :style="'background: url(' + props.provider.image + ') no-repeat center center / cover;'" class="h-32 rounded-t-xl"></div>
        <h2 class="text-xl font-bold mb-4">Usar {{ props.provider.name }}</h2>
        <h2 class="text-xl font-bold mb-4">Integra AteneaAcademy en tu plataforma</h2>
        <p class="mb-4">
            Ofrece a tus estudiantes acceso inmediato a una amplia biblioteca de cursos de alta calidad. Todos los contenidos estarán disponibles directamente dentro del ecosistema de tu organización, sin necesidad de configuraciones adicionales o
            integraciones técnicas.
        </p>

        <div class="space-y-2">
            <h3 class="text-lg font-semibold">¿Por qué elegir AteneaAcademy?</h3>
            <ul class="list-disc pl-6 text-gray-700">
                <li>✅ Acceso instantáneo: El contenido se activa automáticamente al integrar el proveedor.</li>
                <li>✅ Sin configuraciones técnicas: Todo listo para usarse desde el primer momento.</li>
                <li>✅ Contenido actualizado y relevante: Cursos diseñados para el aprendizaje moderno.</li>
                <li>✅ Mejora la oferta educativa: Complementa tus programas de formación con nuevos recursos.</li>
                <li>✅ Experiencia fluida: Total integración con tu entorno institucional.</li>
            </ul>
        </div>

        <div class="mt-6">
            <div v-if="!props.edit" class="flex items-center mb-4">
                <Checkbox inputId="use-atenea-paypal" name="use-atenea-paypal" value="false" @click="changeStatus" />
                <label for="use-atenea-paypal" class="ml-2"> Acepto los <a href="#" class="text-blue-600 hover:underline">T&eacute;rminos y Condiciones</a>.</label>
            </div>
            <button
                v-if="!props.edit"
                @click="saveIntegration"
                :disabled="!useAteneaAcademy"
                :class="!useAteneaAcademy ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'"
                class="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                Save Integration
            </button>
            <button v-else @click="cancelIntegration = true" class="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-blue-500">Cancel Integration</button>
            <p class="text-sm text-gray-500 mt-2">¿Tienes dudas? Contacta con nuestro equipo de soporte en cualquier momento. <a href="#" class="text-blue-600 hover:underline">Preguntas frecuentes</a>.</p>
        </div>
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
import { ref, defineProps, defineEmits, computed } from 'vue';
import api from '@/service/settings/ApiProviders';
import { useToast } from 'primevue/usetoast';

const useAteneaAcademy = ref(false);

const emit = defineEmits(['update:provider']);

const props = defineProps({
    provider: {
        type: Object,
        required: true
    },
    edit: {
        type: Boolean,
        default: false
    }
});

const toast = useToast();

const integrated = ref(false);
const cancelIntegration = ref(false);

const saveIntegration = () => {
    if (!useAteneaAcademy.value) {
        toast.add({
            severity: 'warn',
            summary: 'Atención',
            detail: 'Debes aceptar los términos y condiciones para continuar.',
            life: 3000
        });
        return;
    }

    api.createProvider(props.provider)
        .then((response) => {
            toast.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Integración guardada correctamente.',
                life: 3000
            });
            emit('update:provider', response.data);
            integrated.value = true;
        })
        .catch((error) => {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Hubo un problema al guardar la integración.',
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
    useAteneaAcademy.value = !useAteneaAcademy.value;
};
</script>

<style scoped>
.bg-indigo-600:hover {
    background-color: #4f46e5;
}
</style>
