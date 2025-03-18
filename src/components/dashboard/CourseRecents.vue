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
            <div class="flex flex-wrap gap-2 items-center justify-between">
                <Card style="width: 25rem; overflow: hidden" v-for="course in courses" :key="course.id">
                    <template #header>
                        <img alt="user header" :src="course.versions.data.presentation.image" />
                    </template>
                    <template #title>{{ course.title }}</template>
                    <template #subtitle><ProgressBar :value="course.progress" /></template>
                    <template #content>
                        <p>{{ stripHtml(course.versions.data.presentation.description) }}</p>
                    </template>
                    <template #footer>
                        <div class="flex gap-4 mt-1">
                            <!-- <Button label="Cancel" severity="secondary" outlined class="w-full" /> -->
                            <Button v-if="!bottomLoading" label="Continuar" class="w-full" @click="access(course)" />
                            <Button v-if="bottomLoading" label="Continuar" class="w-full">
                                <ProgressSpinner style="height: 30px" strokeWidth="8" fill="transparent" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
                            </Button>
                        </div>
                    </template>
                </Card>
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
import eventBus from '@/service/eventBus';
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
