<template>
    <Loading v-if="loading" />
    <Card style="width: 100%">
        <template #header>
            <h4 class="p-4">New Courses</h4>
        </template>
        <template #content>
            <Carousel :value="publishedCourses" :numVisible="5" :numScroll="1" :responsiveOptions="responsiveOptions">
                <template #item="slotProps">
                    <CourseCard :course="slotProps.data" :viewDetail="true" />
                </template>
            </Carousel>
        </template>
    </Card>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import api from '@/service/content-management/ApiCourses';
import Loading from '@/components/global/Loading.vue';
import eventBus from '@/service/eventBus.js';
import CourseCard from '../global/CourseCard.vue';

const loading = ref(false);

const publishedCourses = ref([]);
const getPublishedCourses = () => {
    api.publishedCourses(10, 1, 'created_at', 'desc', [])
        .then((response) => {
            if (Object.keys(response).length === 0) {
                publishedCourses.value = []; // Asigna un array vacío
            } else {
                // Si la respuesta es un array, asígnala directamente
                if (Array.isArray(response)) {
                    publishedCourses.value = response;
                } else {
                    // Si la respuesta es un objeto, conviértelo en un array
                    publishedCourses.value = Object.values(response.data);
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

onMounted(() => {
    getPublishedCourses();
    eventBus.on('subscription-complete', () => {
        getPublishedCourses();
    });
});

onUnmounted(() => {
    eventBus.off('subscription-complete', () => {
        getPublishedCourses();
    });
});
</script>
