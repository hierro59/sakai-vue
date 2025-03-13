<template>
    <Card style="width: 100%">
        <template #header>
            <h4 class="p-4">Nuevos Cursos</h4>
        </template>
        <template #content>
            <div class="courses-container">
                <Card class="course-card" v-for="course in courses" :key="course.id">
                    <template #header>
                        <img alt="user header" :src="course.versions.data.presentation.image" class="card-image" />
                    </template>
                    <template #title>{{ course.title }}</template>
                    <template #subtitle>
                        <Tag v-if="course.access_type.type === 'free'" icon="pi pi-star-fill" :value="course.access_type.type.charAt(0).toUpperCase() + course.access_type.type.slice(1)"></Tag>
                        <Tag v-if="course.access_type.type === 'private'" icon="pi pi-lock" :value="course.access_type.type.charAt(0).toUpperCase() + course.access_type.type.slice(1)"></Tag>
                        <Tag v-if="course.access_type.type === 'paid'" icon="pi pi-dollar" :value="course.access_type.type.charAt(0).toUpperCase() + course.access_type.type.slice(1)"></Tag>
                        <Tag v-if="course.access_type.type === 'subscription'" icon="pi pi-calendar-plus" :value="course.access_type.type.charAt(0).toUpperCase() + course.access_type.type.slice(1)"></Tag>
                    </template>
                    <template #content>
                        <p class="card-description">
                            {{ stripHtml(course.versions.data.presentation.description) }}
                        </p>
                    </template>
                    <template #footer>
                        <div class="flex gap-4 mt-1">
                            <Button v-if="course.access_type.type === 'private'" label="Solictar Acceso" severity="secondary" outlined class="w-full" />
                            <Button v-if="course.access_type.type === 'free'" label="Iniciar" class="w-full" @click="access(course)" />
                            <Button v-if="course.access_type.type === 'paid'" :label="'Acceder por $' + course.access_type.price" class="w-full" />
                            <Button v-if="course.access_type.type === 'subscription'" label="Iniciar" class="w-full" />
                        </div>
                    </template>
                </Card>
                <Drawer v-model:visible="visibleTop" position="top" style="height: 100vh" class="px-12">
                    <template #header>
                        <div class="flex flex-wrap justify-end gap-2">
                            <h1 v-if="selectedCourse">{{ selectedCourse.title }}</h1>
                        </div>
                    </template>
                    <template #default>
                        <div class="flex flex-row">
                            <div class="flex flex-col w-[20%]">
                                <div class="text-2xl cursor-pointer bg-slate-300 rounded-sm p-2 mb-2" @click="contentVisibleFn(null)">Presentacion</div>
                                <div v-for="item in selectedCourse.versions.data.elements" :key="item.id">
                                    <div class="cursor-pointer bg-slate-300 rounded-sm p-2" @click="contentVisibleFn(item.id)">{{ item.value }}</div>
                                    <div v-for="(subitem, subitemIndex) in item.children" :key="subitem.id">
                                        <h5 class="cursor-pointer" @click="sectionVisibleFn(subitemIndex, item.id)" :class="{ 'bg-slate-400 p-2 rounded-sm': sectionVisible === subitemIndex && contentVisible === item.id }">{{ subitem.title }}</h5>
                                    </div>
                                </div>
                            </div>
                            <div class="flex flex-col w-[80%] m-4 p-10">
                                <div>
                                    <img class="rounded-xl" v-if="selectedCourse.versions.data.presentation.image && !contentVisible" :src="selectedCourse.versions.data.presentation.image" alt="" />
                                    <h4 v-if="selectedCourse.versions.data.presentation.description && !contentVisible" v-html="selectedCourse.versions.data.presentation.description"></h4>
                                </div>
                                <div v-for="item in selectedCourse.versions.data.elements" :key="item.id">
                                    <div v-if="contentVisible == item.id">
                                        <h4 class="bg-slate-300 rounded-sm p-2">{{ item.value }}</h4>
                                        <div v-for="(subitemAct, subitemActIndex) in item.children" :key="subitemAct.id">
                                            <div v-if="sectionVisible == subitemActIndex">
                                                <h5>{{ subitemAct.title }}</h5>
                                                <div v-if="subitemAct.type === 'richtext'" v-html="subitemAct.content"></div>
                                                <img v-if="subitemAct.type === 'image'" :src="subitemAct.image" alt="" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </Drawer>
            </div>
        </template>
    </Card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/service/content-management/ApiCourses';
import router from '@/router';

const visibleTop = ref(false);
const selectedCourse = ref(null);

const access = (oneCourse) => {
    selectedCourse.value = oneCourse;
    visibleTop.value = true;
    console.log(selectedCourse.value);
};

const contentVisible = ref(null);
const sectionVisible = ref(null);

const contentVisibleFn = (id) => {
    contentVisible.value = id;
    sectionVisible.value = 0;
    console.log(contentVisible.value);
};

const sectionVisibleFn = (id, idContent) => {
    contentVisible.value = idContent;
    sectionVisible.value = id;
};

const courses = ref([]);
const publisehdCourses = () => {
    api.publisehdCourses()
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
    publisehdCourses();
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
