<template>
    <Loading v-if="loading" />
    <Card v-if="empty" style="width: 100%">
        <template #header>
            <div class="flex justify-between ...">
                <div class="order-first">
                    <h4 class="p-4">Mi aprendizaje</h4>
                </div>
            </div>
        </template>
        <template #content>
            <Empty
                class="w-full content-center"
                :title="'No hay cursos recientes'"
                :description="'Usted no se encuentra inscrito en ningun curso. Vaya al catálogo de cursos para iniciar el viaje más fascinante de su vida.'"
                :img="'/images/learners-ilustration.webp'"
                :link="'dashboard/catalog'"
            />
        </template>
    </Card>

    <Card v-else style="width: 100%">
        <template #header>
            <div class="flex justify-between ...">
                <div class="order-first">
                    <h4 class="p-4">Mi aprendizaje</h4>
                </div>
                <div class="order-last">
                    <Button label="Ir al Mis Cursos" class="w-full m-4" />
                </div>
            </div>
        </template>
        <template #content>
            <div class="courses-container">
                <Card class="course-card" v-for="course in courses" :key="course.id">
                    <template #header>
                        <img alt="user header" :src="course.versions.data.presentation.image" class="card-image" />
                        <!-- Badge para nueva versión -->
                        <div v-if="course.has_new_version" class="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-md text-sm font-bold">Nueva versión</div>
                    </template>
                    <template #title> {{ course.title }}<Badge v-if="course.has_new_version" value="Nueva versión" severity="info" class="ms-4 top-2 right-2" /> </template>
                    <template #subtitle> </template>
                    <template #content>
                        <p class="card-description">
                            {{ stripHtml(course.versions.data.presentation.description) }}
                        </p>
                        <ProgressBar :value="course.progress" />
                    </template>
                    <template #footer>
                        <div class="flex gap-4 mt-1">
                            <Button v-if="!bottomLoading" label="Continuar" class="w-full" @click="access(course)" />
                            <Button v-if="bottomLoading" label="Continuar" class="w-full">
                                <ProgressSpinner style="height: 30px" strokeWidth="8" fill="transparent" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
                            </Button>
                        </div>
                    </template>
                </Card>
                <Drawer v-model:visible="visibleTop" position="top" style="height: 100vh" class="px-12">
                    <Player :courseData="selectedCourse" />
                </Drawer>
            </div>
        </template>
    </Card>
    <Drawer v-model:visible="visibleTop" position="top" style="height: 100vh" class="px-12">
        <Player :courseData="selectedCourse" />
    </Drawer>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import api from '@/service/content-management/ApiCourses';
import Empty from '@/components/global/Empty.vue';
import Loading from '@/components/global/Loading.vue';
import eventBus from '@/service/eventBus.js';
import Player from '@/components/dashboard/Player.vue';

const empty = ref(false);
const courses = ref([]);
const loading = ref(true);
const bottomLoading = ref(false);

const selectedCourse = ref(null);
const visibleTop = ref(false);

const access = (oneCourse) => {
    bottomLoading.value = true;
    selectedCourse.value = oneCourse;
    visibleTop.value = true;
    bottomLoading.value = false;

    /* setTimeout(() => {
        bottomLoading.value = false;
    }, 5000); */
};

const getCoursesByLearner = () => {
    api.getCoursesByLearner()
        .then((response) => {
            if (Object.keys(response).length === 0) {
                courses.value = []; // Asigna un array vacío
            } else {
                // Si la respuesta es un array, asígnala directamente
                if (Array.isArray(response)) {
                    courses.value = response;
                } else {
                    // Si la respuesta es un objeto, conviértelo en un array
                    courses.value = Object.values(response);
                }
            }
            loading.value = false;
        })
        .catch((error) => {
            loading.value = false;
            empty.value = true;
            console.log(error);
        });
};

// Limpiar HTML
const stripHtml = (html) => {
    if (!html) return ''; // Evita errores si es undefined o null
    let doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
};

// Método para refrescar los cursos
const refreshCourses = () => {
    getCoursesByLearner();
};

onMounted(() => {
    getCoursesByLearner();
    eventBus.on('subscription-complete', refreshCourses);
});

onUnmounted(() => {
    eventBus.off('subscription-complete', refreshCourses);
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
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal;
}
</style>
