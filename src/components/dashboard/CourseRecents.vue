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
    <Drawer v-model:visible="playerStore.openPlayer" :header="playerStore.selectedCourse?.title" position="top" style="height: 100vh">
        <div class="flex justify-between items-center px-12 pt-6 pb-4 border-b border-gray-200 bg-white">
            <h2 class="text-2xl font-bold text-gray-800"></h2>
            <div class="flex gap-2">
                <Button v-if="route.name !== 'dashboard'" label="Home" icon="pi pi-home" @click="goToHome" outlined />
                <Button v-if="route.name !== 'catalog'" label="Catalog" icon="pi pi-objects-column" @click="goToCatalog" outlined />
                <Button v-if="route.name !== 'my-content'" label="My Formation" icon="pi pi-bookmark-fill" @click="goToMyFormation" outlined />
            </div>
        </div>
        <Player
            v-if="playerStore.selectedCourse"
            :courseCode="playerStore.selectedCourse.content_provider_id ? playerStore.selectedCourse.origin_course_id : playerStore.selectedCourse.code"
            :provider="playerStore.selectedCourse.content_provider_id ? 'global' : null"
        />
    </Drawer>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import api from '@/service/content-management/ApiCourses';
import CourseCard from '../global/CourseCard.vue';
import CardSkeleton from '../global/CardSkeleton.vue';
import { useCourseRefreshStore } from '@/stores/useCourseRefreshStore';
import { useRoute, useRouter } from 'vue-router';
import { usePlayerStore } from '@/stores/usePlayerStore';
import Player from './Player.vue';

const route = useRoute();
const router = useRouter();

const goToHome = () => router.push({ name: 'dashboard' });
const goToCatalog = () => router.push({ name: 'catalog' });
const goToMyFormation = () => router.push({ name: 'my-content' });

const courseRefresh = useCourseRefreshStore();
const playerStore = usePlayerStore();

let lastMyRefresh = 0;

watch(
    () => courseRefresh.myContentRefreshCount,
    (count) => {
        if (count !== lastMyRefresh) {
            lastMyRefresh = count;
            getCoursesByLearner();
        }
    }
);

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
});

onUnmounted(() => {});
</script>
