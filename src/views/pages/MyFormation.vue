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
            <div v-for="course in registerCourses" :key="course.id">
                <Card class="border border-surface-200 h-full justify-between dark:border-surface-700 rounded">
                    <template #header>
                        <img alt="user header" :src="course.versions.data.presentation.image" class="card-image" />
                    </template>

                    <template #title>
                        <div>
                            <Tag v-if="course.access_type.type === 'free'" icon="pi pi-star-fill" :value="course.access_type.type.charAt(0).toUpperCase() + course.access_type.type.slice(1)"></Tag>
                            <Tag v-if="course.access_type.type === 'private'" icon="pi pi-lock" :value="course.access_type.type.charAt(0).toUpperCase() + course.access_type.type.slice(1)"></Tag>
                            <Tag v-if="course.access_type.type === 'paid'" icon="pi pi-dollar" :value="course.access_type.type.charAt(0).toUpperCase() + course.access_type.type.slice(1)"></Tag>
                            <Tag v-if="course.access_type.type === 'subscription'" icon="pi pi-calendar-plus" :value="course.access_type.type.charAt(0).toUpperCase() + course.access_type.type.slice(1)"></Tag>
                        </div>
                        <div class="font-bold text-2xl">{{ course.title }}</div>
                    </template>
                    <template #subtitle> </template>
                    <template #content>
                        <p class="card-description">
                            {{ stripHtml(course.versions.data.presentation.description) }}
                            <ProgressBar class="mt-2" :value="course.progress" />
                        </p>
                    </template>
                    <template #footer>
                        <div class="flex gap-4 mt-1">
                            <Button v-if="!bottomLoading" :label="course.progress === 100 ? 'Volver a ver' : 'Continuar aprendiendo'" :severity="course.progress === 100 ? 'info' : 'primary'" class="w-full" @click="access(course)" />
                            <Button v-if="bottomLoading" label="Continuar" class="w-full">
                                <ProgressSpinner style="height: 30px" strokeWidth="8" fill="transparent" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
                            </Button>
                        </div>
                    </template>
                </Card>
            </div>
        </div>
    </div>

    <Drawer v-model:visible="visibleTop" position="top" style="height: 100vh" class="px-12">
        <Player :courseData="selectedCourse" />
    </Drawer>
</template>

<script setup>
import { ref, onMounted, defineEmits } from 'vue';
import api from '@/service/content-management/ApiCourses';
import router from '@/router';
import Loading from '@/components/global/Loading.vue';
import Player from '@/components/dashboard/Player.vue';
import { useToast } from 'primevue/usetoast';
import eventBus from '@/service/eventBus';

const toast = useToast();

const visibleTop = ref(false);
const selectedCourse = ref(null);
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

const access = (oneCourse) => {
    bottomLoading.value = true;
    selectedCourse.value = oneCourse;
    visibleTop.value = true;
    bottomLoading.value = false;
};

const registerCourses = ref([]);
const getCoursesByLearner = () => {
    api.getCoursesByLearner()
        .then((response) => {
            if (Object.keys(response).length === 0) {
                registerCourses.value = []; // Asigna un array vacío
            } else {
                // Si la respuesta es un array, asígnala directamente
                if (Array.isArray(response)) {
                    registerCourses.value = response;
                } else {
                    // Si la respuesta es un objeto, conviértelo en un array
                    registerCourses.value = Object.values(response);
                }
            }
            loading.value = false;
        })
        .catch((error) => {
            registerCourses.value = [];
            loading.value = false;
            console.log(error);
        });
};

// Limpiar HTML
const stripHtml = (html) => {
    if (!html) return ''; // Evita errores si es undefined o null
    let doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
};

onMounted(() => {
    getCoursesByLearner();
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
