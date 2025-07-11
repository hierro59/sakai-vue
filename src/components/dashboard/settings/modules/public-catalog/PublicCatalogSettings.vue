<template>
    <section class="card">
        <h1 class="text-3xl font-bold text-primary mb-6">Configuración del Catálogo Público</h1>

        <div v-if="!loading" class="bg-white shadow-md rounded-lg p-6 space-y-6">
            <!-- Info del módulo -->
            <div>
                <h2 class="text-xl font-semibold text-gray-800">Módulo: Catálogo Público</h2>
                <p class="text-gray-600 mt-1">Esta sección te permite personalizar las opciones visibles en el catálogo público de tu institución.</p>
            </div>

            <!-- Configuraciones -->
            <div class="space-y-4">
                <div class="flex items-center justify-between">
                    <span>Mostrar botón de registro</span>
                    <InputSwitch v-model="settings.showRegisterButton" />
                </div>

                <div class="flex items-center justify-between">
                    <span>Mostrar botón de inicio de sesión</span>
                    <InputSwitch v-model="settings.showLoginButton" />
                </div>

                <!-- Puedes agregar más configuraciones aquí -->
            </div>

            <div class="card shadow-md rounded-lg">
                <h2 class="text-xl font-semibold text-gray-800">Acceso al Catálogo Público</h2>
                <p class="text-gray-600 mt-1">Para acceder al catálogo, puedes hacerlo desde la siguiente URL:</p>

                <div class="mt-4 flex items-center gap-2">
                    <span class="text-primary text-xl font-semibold">
                        {{ url }}
                    </span>

                    <Button class="ms-6" icon="pi pi-copy" severity="secondary" @click="copiarAlPortapapeles(url)" v-tooltip.bottom="'Copiar URL'" />
                </div>
            </div>

            <!-- Botón de guardar -->
            <div class="text-right pt-4">
                <Button label="Guardar cambios" icon="pi pi-save" @click="saveSettings" />
            </div>
        </div>
        <div v-else>
            <ProgressSpinner />
        </div>
    </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import ApiModules from '@/service/settings/ApiModules';
import { useToast } from 'primevue/usetoast';
import { useRoute } from 'vue-router';

const route = useRoute();

const toast = useToast();

const moduleId = computed(() => Number(route.params.moduleId));

const url = window.location.hostname + '/catalogue';

const settings = ref({
    showRegisterButton: true,
    showLoginButton: true
});

const loading = ref(false);

const saveSettings = async () => {
    try {
        await ApiModules.updateModule(moduleId.value, settings.value);

        toast.add({ severity: 'success', summary: 'Guardado', detail: 'Configuración guardada correctamente', life: 3000 });
    } catch (error) {
        console.error('Error al guardar configuración:', error);
    }
};

const loadSettings = async () => {
    loading.value = true;
    try {
        const response = await ApiModules.getEnabledTenantModules();
        const module = response.find((m) => m.id === moduleId.value);

        if (module && module.settings) {
            let parsedSettings = {};

            if (typeof module.settings === 'string') {
                try {
                    parsedSettings = JSON.parse(module.settings);
                } catch (e) {
                    console.warn('No se pudo parsear settings:', module.settings);
                }
            } else if (typeof module.settings === 'object') {
                parsedSettings = module.settings;
            }

            settings.value = {
                ...settings.value,
                ...parsedSettings
            };

            loading.value = false;
        } else {
            loading.value = false;
            console.warn('Módulo no encontrado o sin settings');
        }
    } catch (error) {
        console.error('Error al cargar configuración:', error);
    }
};

const copiarAlPortapapeles = (url) => {
    const input = document.createElement('input');
    input.value = url;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);

    toast.add({ severity: 'success', summary: 'Copiado', detail: 'La URL fue copiada al portapapeles', life: 2000 });
};

onMounted(() => {
    loadSettings();
});
</script>
