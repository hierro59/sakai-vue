<template>
    <Loading v-if="loading" />
    <Card style="width: 100%">
        <template #header>
            <h4 class="p-4">New Courses</h4>
        </template>
        <template #content>
            <Carousel :value="publishedCourses" :numVisible="5" :numScroll="1" :responsiveOptions="responsiveOptions">
                <template #item="slotProps">
                    <CourseCard :loading="loading" :course="slotProps.data" @access="access(slotProps.data)" />
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
    api.courseRegistration(oneCourse.code)
        .then((response) => {
            selectedCourse.value = oneCourse.code;
            eventBus.emit('subscription-complete');
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Course Registered', life: 3000 });
            visibleTop.value = true;
            bottomLoading.value = false;
            setTimeout(() => {
                publishedCourses();
            }, 5000);
        })
        .catch((error) => {
            bottomLoading.value = false;
            console.log(registration);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Course Not Registered', life: 3000 });
        });
};

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

onMounted(() => {
    getPublishedCourses();
});
</script>
