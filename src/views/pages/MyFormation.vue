<template>
    <div class="card">
        <FiltersMenuBar :path="'my-courses'" @filterByCategory="filterByCategory" @sortBy="sortBy" @search="search" @clearFilters="clearAllFilters" />

        <Loading v-if="loading && !registerCourses" />

        <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-3">
            <CourseCard v-for="course in registerCourses" :key="course.code" :course="course" :loading="bottomLoading" @access="access" />
        </div>
        <div v-if="registerCourses?.length === 0" class="col-span-12 text-center">You have no registered courses</div>
        <div v-else class="col-span-12 text-center">
            <Paginator :rows="perPage" :totalRecords="totalPages * perPage" :first="(currentPage - 1) * perPage" :rowsPerPageOptions="[5, 10, 20]" @page="onPageChange" class="mt-6" />
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

const visibleTop = ref(false);
const selectedCourse = ref(null);
const loading = ref(false);
const bottomLoading = ref(false);
const registerCourses = ref(null);

// Filtros y ordenamiento
const filters = ref([]);
const sort = ref('created_at');
const order = ref('desc');

const currentPage = ref(1);
const perPage = ref(10);
const totalPages = ref(1);

// Acceder al curso
const access = (oneCourse) => {
    bottomLoading.value = true;
    selectedCourse.value = oneCourse;
    visibleTop.value = true;
    bottomLoading.value = false;
};

// Obtener cursos del usuario
const getCourses = () => {
    loading.value = true;
    api.getCoursesByLearner(perPage.value, currentPage.value, sort.value, order.value, filters.value)
        .then((response) => {
            const { data, meta } = response;
            registerCourses.value = Array.isArray(data) ? data : [];
            currentPage.value = meta.current_page;
            totalPages.value = meta.last_page;
        })
        .catch((error) => {
            registerCourses.value = [];
            console.error(error);
        })
        .finally(() => {
            loading.value = false;
        });
};

// Filtros y búsqueda
const filterByCategory = (categoryId) => {
    filters.value = filters.value.filter((f) => f.key !== 'category_id');
    filters.value.push({ key: 'category_id', value: categoryId });
    getCourses();
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
    getCourses();
};

const search = (query) => {
    filters.value = filters.value.filter((f) => f.key !== 'title');
    if (query.trim()) {
        filters.value.push({ key: 'title', value: query });
    }
    getCourses();
};

const clearAllFilters = () => {
    filters.value = [];
    sort.value = 'created_at';
    order.value = 'desc';
    getCourses();
};

const onPageChange = (event) => {
    currentPage.value = Math.floor(event.first / event.rows) + 1;
    perPage.value = event.rows;
    getCourses();
};

onMounted(() => {
    getCourses();
});
</script>
