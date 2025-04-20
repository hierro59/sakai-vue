<template>
    <div class="card">
        <Menubar :model="items" class="mb-4">
            <template #start> </template>
            <template #item="{ item, props, hasSubmenu, root }">
                <a v-ripple class="flex items-center" v-bind="props.action">
                    <span>{{ item.label }}</span>
                    <Badge v-if="item.badge" :class="{ 'ml-auto': !root, 'ml-2': root }" :value="item.badge" />
                    <span v-if="item.shortcut" class="ml-auto border border-surface rounded bg-emphasis text-muted-color text-xs p-1">{{ item.shortcut }}</span>
                    <i v-if="hasSubmenu" :class="['pi pi-angle-down ml-auto', { 'pi-angle-down': root, 'pi-angle-right': !root }]"></i>
                </a>
            </template>
            <template #end>
                <div class="flex items-center gap-2">
                    <InputText placeholder="Search" type="text" class="w-32 sm:w-auto" />
                </div>
            </template>
        </Menubar>
        <Loading v-if="loading" />
        <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div v-if="communities.length === 0" class="flex justify-center items-center h-screen">
                <h1 class="text-2xl text-color">No hay comunidades disponibles</h1>
            </div>
            <div v-for="community in communities.filter((c) => c.is_visible)" :key="community.id">
                <Card class="relative border border-surface-200 h-full justify-between dark:border-surface-700 rounded">
                    <template #header>
                        <div class="absolute top-2 right-2 z-10">
                            <Tag value="Comunidad" severity="info" />
                        </div>
                        <img alt="user header" :src="community.banner_url" class="card-image" />
                    </template>

                    <template #title>
                        <div class="flex flex-col gap-2">
                            <!-- Tags de acceso -->
                            <div>
                                <Tag v-if="community.is_public" icon="pi pi-star-fill" value="Free" severity="success" />
                                <Tag v-if="!community.is_public" icon="pi pi-lock" value="Private" severity="warning" />
                            </div>

                            <!-- Iconos de info adicional -->
                            <div class="flex items-center text-sm text-color-secondary gap-4">
                                <div class="flex items-center gap-1">
                                    <i class="pi pi-users"></i>
                                    <span>{{ community.users_count }}</span>
                                </div>
                                <div class="flex items-center gap-1">
                                    <i class="pi pi-folder"></i>
                                    <span>{{ community.contents_count }}</span>
                                </div>
                            </div>

                            <!-- Título principal -->
                            <div class="font-bold text-2xl text-color">{{ community.name }}</div>
                        </div>
                    </template>

                    <template #subtitle> </template>

                    <template #content>
                        <p class="card-description">
                            {{ stripHtml(community.description) }}
                        </p>
                    </template>

                    <template #footer>
                        <div class="flex gap-4 mt-1">
                            <Button v-if="!bottomLoading && community.is_public" label="Ingresar" severity="primary" class="w-full" @click="access(community.id)" />
                            <Button v-if="!bottomLoading && !community.is_public" label="Solicitar acceso" severity="primary" class="w-full" @click="access(community.id)" />
                            <Button v-if="bottomLoading" label="Continuar" class="w-full">
                                <ProgressSpinner style="height: 30px" strokeWidth="8" fill="transparent" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
                            </Button>
                        </div>
                    </template>
                </Card>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, defineEmits } from 'vue';
import router from '@/router';
import Loading from '@/components/global/Loading.vue';
import { useToast } from 'primevue/usetoast';
import api from '@/service/settings/ApiCommunities';

const toast = useToast();

const loading = ref(false);
const bottomLoading = ref(false);

const items = ref([
    {
        label: 'Categorías',
        icon: 'pi pi-search',
        items: [
            {
                label: 'Marketing',
                icon: 'pi pi-bolt'
            },
            {
                label: 'IA',
                icon: 'pi pi-server'
            },
            {
                label: 'Desarrollo Personal',
                icon: 'pi pi-pencil'
            }
        ]
    },
    {
        label: 'Ordenar por',
        icon: 'pi pi-search',
        items: [
            {
                label: 'Más nuevos',
                icon: 'pi pi-bolt'
            },
            {
                label: 'Más viejos',
                icon: 'pi pi-server'
            },
            {
                label: 'Mejor calificados',
                icon: 'pi pi-pencil'
            },
            {
                label: 'Más estudiantes inscritos',
                icon: 'pi pi-pencil'
            }
        ]
    }
]);

const communities = ref([]);

function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

// Limpiar HTML
const stripHtml = (html) => {
    if (!html) return ''; // Evita errores si es undefined o null
    let doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
};

const getCommunities = () => {
    loading.value = true;
    api.getCommunities()
        .then((response) => {
            if (Object.keys(response).length === 0) {
                communities.value = []; // Asigna un array vacío
            } else {
                // Si la respuesta es un array, asígnala directamente
                if (Array.isArray(response)) {
                    communities.value = response;
                } else {
                    // Si la respuesta es un objeto, conviértelo en un array
                    communities.value = Object.values(response);
                }
            }
            loading.value = false;
        })
        .catch((error) => {
            communities.value = [];
            loading.value = false;
            console.log(error);
        });
};

onMounted(() => {
    getCommunities();
});
</script>

<style scoped>
.courses-container {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: flex-start; /* Alinea las tarjetas a la izquierda */
}

.course-card {
    width: 25rem; /* Ancho fijo para todas las tarjetas */
    min-height: 350px; /* Altura mínima para que todas tengan el mismo tamaño */
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.card-image {
    border-radius: 12px 12px 0 0;
    max-height: 200px;
    width: 100%;
    object-fit: cover;
}

.card-description {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal;
}
</style>
