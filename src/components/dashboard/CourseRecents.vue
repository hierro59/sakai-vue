<template>
    <div class="card" v-if="loadingCR">
        <div class="flex justify-between">
            <div class="order-first">
                <h4 class="p-4">My learning</h4>
            </div>
        </div>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <CardSkeleton v-for="n in 2" :key="n" />
        </div>
    </div>
    <div v-else>
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
                        <RouterLink :to="{ name: 'my-content' }">
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
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import api from '@/service/content-management/ApiCourses';
import eventBus from '@/service/eventBus.js';
import CourseCard from '../global/CourseCard.vue';
import CardSkeleton from '../global/CardSkeleton.vue';

const empty = ref(false);
const courses = ref([]);
const loadingCR = ref(true);
const bottomLoading = ref(false);

const page = ref(1);
const perPage = ref(5);
const search = ref('');
const type = ref(''); // puede ser 'course', 'traject' o ''

const getCoursesByLearner = () => {
    loadingCR.value = true;

    api.getContents({
        page: page.value,
        per_page: perPage.value,
        search: search.value,
        type: type.value
    })
        .then((response) => {
            // response es paginado: incluye data, total, etc.
            courses.value = response.data || [];
            empty.value = courses.value.length === 0;
        })
        .catch((error) => {
            console.error(error);
            empty.value = true;
        })
        .finally(() => {
            loadingCR.value = false;
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
    api.getContents({
        page: page.value,
        per_page: perPage.value,
        search: search.value,
        type: type.value
    })
        .then((response) => {
            // response es paginado: incluye data, total, etc.
            courses.value = response.data || [];
        })
        .catch((error) => {
            console.error(error);
            empty.value = true;
        })
        .finally(() => {
            //
        });
};

onMounted(() => {
    getCoursesByLearner();
    eventBus.on('subscription-complete', () => {
        setTimeout(() => {
            refreshCourses();
        }, 200);
    });

    eventBus.on('check-activity', refreshCourses);
    eventBus.on('unsubscription-complete', refreshCourses);
});

onUnmounted(() => {
    eventBus.off('check-activity', refreshCourses);
    eventBus.off('subscription-complete', refreshCourses);
    eventBus.off('unsubscription-complete', refreshCourses);
});
</script>
