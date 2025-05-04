<template>
    <Loading v-if="loading" />
    <Card style="width: 100%">
        <template #header>
            <h4 class="p-4">Nuevos Cursos</h4>
        </template>
        <template #content>
            <Carousel :value="publishedCourses" :numVisible="5" :numScroll="1" :responsiveOptions="responsiveOptions">
                <template #item="slotProps">
                    <!-- <Card class="border border-surface-200 h-full justify-between dark:border-surface-700 rounded mx-2">
                        <template #header>
                            <img alt="user header" :src="slotProps.data.versions.data.presentation.image" class="card-image" />
                        </template>

                        <template #title>
                            <div>
                                <Tag v-if="slotProps.data.access_type.type === 'free'" icon="pi pi-star-fill" :value="slotProps.data.access_type.type.charAt(0).toUpperCase() + slotProps.data.access_type.type.slice(1)"></Tag>
                                <Tag v-if="slotProps.data.access_type.type === 'private'" icon="pi pi-lock" :value="slotProps.data.access_type.type.charAt(0).toUpperCase() + slotProps.data.access_type.type.slice(1)"></Tag>
                                <Tag v-if="slotProps.data.access_type.type === 'paid'" icon="pi pi-dollar" :value="slotProps.data.access_type.type.charAt(0).toUpperCase() + slotProps.data.access_type.type.slice(1)"></Tag>
                                <Tag v-if="slotProps.data.access_type.type === 'subscription'" icon="pi pi-calendar-plus" :value="slotProps.data.access_type.type.charAt(0).toUpperCase() + slotProps.data.access_type.type.slice(1)"></Tag>
                            </div>
                            <div class="font-bold text-2xl">{{ slotProps.data.title }}</div>
                        </template>
                        <template #subtitle> </template>
                        <template #content>
                            <p class="card-description">
                                {{ stripHtml(slotProps.data.versions.data.presentation.description) }}
                            </p>
                        </template>
                        <template #footer>
                            <div class="flex gap-4 mt-1">
                                <Button v-if="slotProps.data.access_type.type === 'private'" label="Solicitar Acceso" severity="secondary" outlined class="w-full" />
                                <Button v-if="slotProps.data.access_type.type === 'free' && !bottomLoading" label="Iniciar" class="w-full" @click="access(slotProps.data)" />
                                <Button v-if="slotProps.data.access_type.type === 'free' && bottomLoading" label="Iniciar" class="w-full">
                                    <ProgressSpinner style="height: 30px" strokeWidth="8" fill="transparent" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
                                </Button>
                                <Button v-if="slotProps.data.access_type.type === 'paid'" :label="'Acceder por $' + slotProps.data.access_type.price" class="w-full" />
                                <Button v-if="slotProps.data.access_type.type === 'subscription'" label="Iniciar" class="w-full" />
                            </div>
                        </template>
                    </Card> -->
                    <CourseCard :loading="loading" :course="slotProps.data" @access="access" />
                </template>
            </Carousel>

            <Drawer v-model:visible="visibleTop" position="top" style="height: 100vh" class="px-12">
                <Player :courseData="selectedCourse" />
            </Drawer>
        </template>
    </Card>
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

const access = (oneCourse) => {
    bottomLoading.value = true;
    api.courseRegistration(oneCourse.id)
        .then((response) => {
            console.log(response);
            selectedCourse.value = oneCourse;
            eventBus.emit('subscription-complete');
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Course Registered', life: 3000 });
            visibleTop.value = true;
            bottomLoading.value = false;
            setTimeout(() => {
                publisehdCourses();
            }, 5000);
        })
        .catch((error) => {
            bottomLoading.value = false;
            console.log(registration);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Course Not Registered', life: 3000 });
        });

    /* setTimeout(() => {
        bottomLoading.value = false;
    }, 5000); */
};

const publishedCourses = ref([]);
const getPublishedCourses = () => {
    api.publishedCourses()
        .then((response) => {
            if (Object.keys(response).length === 0) {
                publishedCourses.value = []; // Asigna un array vacío
            } else {
                // Si la respuesta es un array, asígnala directamente
                if (Array.isArray(response)) {
                    publishedCourses.value = response;
                } else {
                    // Si la respuesta es un objeto, conviértelo en un array
                    publishedCourses.value = Object.values(response);
                }
            }
            loading.value = false;
        })
        .catch((error) => {
            publishedCourses.value = [];
            loading.value = false;
            console.log(error);
        });
};

const responsiveOptions = ref([
    {
        breakpoint: '1400px',
        numVisible: 2,
        numScroll: 1
    },
    {
        breakpoint: '1199px',
        numVisible: 3,
        numScroll: 1
    },
    {
        breakpoint: '767px',
        numVisible: 2,
        numScroll: 1
    },
    {
        breakpoint: '575px',
        numVisible: 1,
        numScroll: 1
    }
]);

// Limpiar HTML
const stripHtml = (html) => {
    if (!html) return ''; // Evita errores si es undefined o null
    let doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
};

onMounted(() => {
    getPublishedCourses();
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
