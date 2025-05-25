<template>
    <Loading v-if="loading" />
    <Card v-if="empty" style="width: 100%">
        <template #header>
            <div class="flex justify-between ...">
                <div class="order-first">
                    <h4 class="p-4">My learning</h4>
                </div>
            </div>
        </template>
        <template #content>
            <h3 class="text-center">You have not yet subscribed to any content.</h3>
        </template>
    </Card>

    <Card v-else style="width: 100%">
        <template #header>
            <div class="flex justify-between ...">
                <div class="order-first">
                    <h4 class="p-4">My learning</h4>
                </div>
                <div class="order-last">
                    <RouterLink :to="{ name: 'my-courses' }">
                        <Button label="Go to My Learning" class="w-full m-4" />
                    </RouterLink>
                </div>
            </div>
        </template>
        <template #content>
            <Carousel :value="courses" :numVisible="2" :numScroll="1" :responsiveOptions="responsiveOptions">
                <template #item="slotProps">
                    <CourseCard v-if="slotProps.data" :course="slotProps.data" :loading="bottomLoading" :viewDetail="true" />
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

const empty = ref(false);
const courses = ref([]);
const loading = ref(true);
const bottomLoading = ref(false);

const page = ref(1);
const perPage = ref(10);
const search = ref('');
const type = ref(''); // puede ser 'course', 'traject' o ''

const totalCourses = ref(0);

const getCoursesByLearner = () => {
    loading.value = true;

    api.getContents({
        page: page.value,
        per_page: perPage.value,
        search: search.value,
        type: type.value
    })
        .then((response) => {
            // response es paginado: incluye data, total, etc.
            courses.value = response.data || [];
            totalCourses.value = response.total || 0;
            empty.value = courses.value.length === 0;
        })
        .catch((error) => {
            console.error(error);
            empty.value = true;
        })
        .finally(() => {
            loading.value = false;
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

// Método para refrescar los cursos
const refreshCourses = () => {
    getCoursesByLearner();
};

onMounted(() => {
    getCoursesByLearner();
    eventBus.on('subscription-complete', refreshCourses);
    eventBus.on('check-activity', refreshCourses);
});

onUnmounted(() => {
    eventBus.off('check-activity', refreshCourses);
    eventBus.off('subscription-complete', refreshCourses);
});
</script>
