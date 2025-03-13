<template>
    <Card style="width: 100%">
        <template #header>
            <h4 class="p-4">Mi aprendizaje</h4>
        </template>
        <template #content>
            <div class="flex flex-wrap gap-2 items-center justify-between">
                <Card style="width: 25rem; overflow: hidden" v-for="course in courses" :key="course.id">
                    <template #header>
                        <img alt="user header" :src="course.versions.data.presentation.image" />
                    </template>
                    <template #title>{{ course.title }}</template>
                    <template #subtitle><ProgressBar :value="50"></ProgressBar></template>
                    <template #content>
                        <p>{{ stripHtml(course.versions.data.presentation.description) }}</p>
                    </template>
                    <template #footer>
                        <div class="flex gap-4 mt-1">
                            <!-- <Button label="Cancel" severity="secondary" outlined class="w-full" /> -->
                            <Button label="Continuar" class="w-full" />
                        </div>
                    </template>
                </Card>
            </div>
        </template>
    </Card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/service/content-management/ApiCourses';

const courses = ref([]);
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
        })
        .catch((error) => {
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
