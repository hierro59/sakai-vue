<template>
    <div class="card">
        <div class="flex flex-wrap gap-2 items-center justify-between mb-6">
            <div class="flex items-center gap-2">
                <i class="pi pi-objects-column"></i>
                <span class="font-semibold text-2xl">Catalog</span>
            </div>
        </div>
        <FiltersMenuBar :path="'catalogue'" @filterByCategory="filterByCategory" @sortBy="sortBy" @search="search" @type="byType" @clearFilters="clearAllFilters" />

        <div v-if="loadingCatalogue" class="grid grid-cols-1 gap-4 md:grid-cols-3">
            <CardSkeleton v-for="n in 3" :key="n" />
        </div>
        <div v-else>
            <div v-if="publishedCourses?.length === 0" class="text-center">There are no courses available</div>

            <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div v-for="course in publishedCourses" :key="course.code">
                    <CourseCard :course="course" :viewDetail="true" />
                </div>
            </div>

            <Paginator :rows="perPage" :totalRecords="totalRecords" :first="(currentPage - 1) * perPage" :rowsPerPageOptions="[5, 10, 20]" @page="onPageChange" class="mt-6" />
        </div>
    </div>
    <Drawer v-model:visible="visibleTop" :header="selectedCourse?.title" position="top" style="height: 100vh" class="px-12">
        <Player :courseCode="selectedCourse.code" />
    </Drawer>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue';
import api from '@/service/content-management/ApiCourses';
import CourseCard from '@/components/global/CourseCard.vue';
import FiltersMenuBar from '@/components/global/FiltersMenuBar.vue';
import eventBus from '@/service/eventBus';
import CardSkeleton from '@/components/global/CardSkeleton.vue';

const loadingCatalogue = ref(false);

const publishedCourses = ref([]);
const filters = ref([]);
const sort = ref('created_at');
const order = ref('desc');

// Paginación
const perPage = ref(10);
const currentPage = ref(1);
const meta = ref({ total: 0, current_page: 1, last_page: 1 });

const totalRecords = computed(() => meta.value.total);

const getPublishedCourses = () => {
    loadingCatalogue.value = true;
    api.publishedCourses({
        per_page: perPage.value,
        page: currentPage.value,
        sort: sort.value,
        order: order.value,
        filters: filters.value
    })
        .then((response) => {
            if (response) {
                publishedCourses.value = response.data;
                meta.value = response;
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
            loadingCatalogue.value = false;
        });
};

const filterByCategory = (categoryId) => {
    filters.value = filters.value.filter((f) => f.key !== 'category_id');
    filters.value.push({ key: 'category_id', value: categoryId });
    currentPage.value = 1;
    getPublishedCourses();
};

const refreshCourses = () => {
    api.publishedCourses({
        per_page: perPage.value,
        page: currentPage.value,
        sort: sort.value,
        order: order.value,
        filters: filters.value
    })
        .then((response) => {
            console.log(response);
            if (response) {
                publishedCourses.value = response.data;
                meta.value = response;
                currentPage.value = meta.value.current_page;
            } else {
                publishedCourses.value = [];
                meta.value = { total: 0, current_page: 1, last_page: 1 };
            }
        })
        .catch((error) => {
            console.error(error);
        });
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

const byType = (thisType) => {
    filters.value = [];
    filters.value = filters.value.filter((f) => f.key !== 'type');
    filters.value.push({ key: 'content_type', value: thisType });
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

const refreshHandler = () => {
    refreshCourses();
};

const selectedCourse = ref(null);
const visibleTop = ref(false);

onMounted(() => {
    getPublishedCourses();
    eventBus.on('subscription-complete', (course) => {
        console.log('subscription-complete');
        selectedCourse.value = course;
        visibleTop.value = true;
        console.log('selectedCourse', selectedCourse.value);
        refreshHandler();
    });
});

onUnmounted(() => {
    eventBus.off('subscription-complete', () => {
        refreshHandler();
    });
});
</script>
