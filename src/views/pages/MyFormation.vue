<template>
    <div class="card">
        <div class="flex flex-wrap gap-2 items-center justify-between mb-6">
            <div class="flex items-center gap-2">
                <i class="pi pi-book"></i>
                <span class="font-semibold text-2xl">My Formation</span>
            </div>
        </div>

        <FiltersMenuBar :path="'my-content'" @filterByCategory="filterByCategory" @sortBy="sortBy" @search="search" @type="byType" @clearFilters="clearAllFilters" />
        <Tag v-for="cat in filters" :key="cat.key" :value="cat.name" severity="info" class="text-xs mb-4" />

        <div v-if="loading" class="grid grid-cols-1 gap-4 md:grid-cols-3">
            <CardSkeleton v-for="n in 3" :key="n" />
        </div>

        <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-3">
            <CourseCard v-for="course in registerCourses" :key="course.code" :course="course" :loading="bottomLoading" :viewDetail="true" @access="access" />
        </div>
        <div v-if="registerCourses?.length === 0" class="col-span-12 text-center">You have no registered courses</div>
        <div v-else class="col-span-12 text-center">
            <Paginator :rows="perPage" :totalRecords="totalPages * perPage" :first="(currentPage - 1) * perPage" :rowsPerPageOptions="[5, 10, 20]" @page="onPageChange" class="mt-6" />
        </div>
    </div>

    <Drawer v-model:visible="visibleTop" position="top" style="height: 100vh" class="px-12" :header="selectedCourse?.title">
        <Player :courseCode="selectedCourse.code" />
    </Drawer>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import api from '@/service/content-management/ApiCourses';
import Player from '@/components/dashboard/Player.vue';
import CourseCard from '@/components/global/CourseCard.vue';
import FiltersMenuBar from '@/components/global/FiltersMenuBar.vue';
import CardSkeleton from '@/components/global/CardSkeleton.vue';
import eventBus from '@/service/eventBus';

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
    api.getContents({
        per_page: perPage.value,
        page: currentPage.value,
        sort: sort.value,
        order: order.value,
        filters: filters.value
    })
        .then((response) => {
            registerCourses.value = response.data || [];
            currentPage.value = response.current_page;
            totalPages.value = response.last_page;
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
const filterByCategory = (category) => {
    filters.value = filters.value.filter((f) => f.key !== 'category_id');
    filters.value.push({ key: 'category_id', value: category.id, name: category.name });
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

const byType = (thisType) => {
    filters.value = [];
    filters.value = filters.value.filter((f) => f.key !== 'type');
    filters.value.push({ key: 'content_type', value: thisType });
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
    eventBus.on('unsubscription-complete', getCourses);
});

onUnmounted(() => {
    eventBus.off('unsubscription-complete', getCourses);
});
</script>
