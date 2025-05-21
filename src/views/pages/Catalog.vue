<template>
    <div class="card">
        <FiltersMenuBar :path="'catalogue'" @filterByCategory="filterByCategory" @sortBy="sortBy" @search="search" @clearFilters="clearAllFilters" />

        <Loading v-if="loading" />

        <div v-else>
            <div v-if="publishedCourses?.length === 0" class="text-center">There are no courses available</div>

            <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-3">
                <CourseCard v-for="course in publishedCourses" :key="course.code" :course="course" :loading="bottomLoading" :viewDetail="true" @access="access" />
            </div>

            <Paginator :rows="perPage" :totalRecords="totalRecords" :first="(currentPage - 1) * perPage" :rowsPerPageOptions="[5, 10, 20]" @page="onPageChange" class="mt-6" />
        </div>
    </div>

    <Drawer v-model:visible="visibleTop" position="top" style="height: 100vh" class="px-12">
        <Player :courseCode="selectedCourse.code" />
    </Drawer>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '@/service/content-management/ApiCourses';
import Loading from '@/components/global/Loading.vue';
import Player from '@/components/dashboard/Player.vue';
import CourseCard from '@/components/global/CourseCard.vue';
import FiltersMenuBar from '@/components/global/FiltersMenuBar.vue';
import { useToast } from 'primevue/usetoast';
import eventBus from '@/service/eventBus';

const toast = useToast();

const visibleTop = ref(false);
const selectedCourse = ref(null);
const loading = ref(false);
const bottomLoading = ref(false);

const publishedCourses = ref([]);
const filters = ref([]);
const sort = ref('created_at');
const order = ref('desc');

// Paginación
const perPage = ref(10);
const currentPage = ref(1);
const meta = ref({ total: 0, current_page: 1, last_page: 1 });

const totalPages = computed(() => meta.value.last_page);
const totalRecords = computed(() => meta.value.total);

const getPublishedCourses = () => {
    loading.value = true;
    api.publishedCourses(perPage.value, currentPage.value, sort.value, order.value, filters.value)
        .then((response) => {
            if (response) {
                publishedCourses.value = response.data;
                meta.value = response.meta;
                currentPage.value = meta.value.current_page;
            } else {
                publishedCourses.value = [];
                meta.value = { total: 0, current_page: 1, last_page: 1 };
            }
        })
        .catch((error) => {
            console.error(error);
            publishedCourses.value = [];
        })
        .finally(() => {
            loading.value = false;
        });
};

const filterByCategory = (categoryId) => {
    filters.value = filters.value.filter((f) => f.key !== 'category_id');
    filters.value.push({ key: 'category_id', value: categoryId });
    currentPage.value = 1;
    getPublishedCourses();
};

const sortBy = (criteria) => {
    switch (criteria) {
        case 'newest':
            sort.value = 'created_at';
            order.value = 'desc';
            break;
        case 'oldest':
            sort.value = 'created_at';
            order.value = 'asc';
            break;
        case 'rating':
            sort.value = 'rating';
            order.value = 'desc';
            break;
        case 'students':
            sort.value = 'students_count';
            order.value = 'desc';
            break;
    }
    currentPage.value = 1;
    getPublishedCourses();
};

const search = (query) => {
    filters.value = filters.value.filter((f) => f.key !== 'title');
    if (query.trim()) {
        filters.value.push({ key: 'title', value: query });
    }
    currentPage.value = 1;
    getPublishedCourses();
};

const clearAllFilters = () => {
    filters.value = [];
    sort.value = 'created_at';
    order.value = 'desc';
    currentPage.value = 1;
    getPublishedCourses();
};

const onPageChange = (event) => {
    currentPage.value = event.page + 1;
    getPublishedCourses();
};

const access = (oneCourse) => {
    bottomLoading.value = true;
    api.courseRegistration(oneCourse.code)
        .then(() => {
            toast.add({ severity: 'success', summary: 'Registrado', detail: 'Curso registrado correctamente', life: 3000 });
            eventBus.emit('subscription-complete');
            selectedCourse.value = oneCourse;
            visibleTop.value = true;
        })
        .catch(() => {
            toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo registrar el curso', life: 3000 });
        })
        .finally(() => {
            bottomLoading.value = false;
            setTimeout(() => {
                getPublishedCourses();
            }, 3000);
        });
};

onMounted(() => {
    getPublishedCourses();
});
</script>
