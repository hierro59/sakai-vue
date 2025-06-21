<template>
    <header class="bg-white shadow sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <!-- Logo -->
            <RouterLink to="/" class="flex items-center space-x-2">
                <img :src="company.logo_url" alt="Logo" class="h-10 w-auto" />
            </RouterLink>

            <!-- Botón hamburguesa para móviles -->
            <button @click="mobileMenuOpen = !mobileMenuOpen" class="lg:hidden text-gray-700 focus:outline-none">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            <!-- Menú principal en desktop -->
            <nav class="hidden lg:flex items-center space-x-4">
                <RouterLink v-if="showLoginButton" to="/auth/login" class="text-sm font-medium text-gray-700 hover:text-primary transition"> Iniciar sesión </RouterLink>
                <RouterLink v-if="showRegisterButton" to="/auth/login" class="px-4 py-2 text-sm font-medium text-white bg-primary rounded hover:bg-primary-dark transition"> Registrarse </RouterLink>
            </nav>
        </div>

        <!-- Menú colapsado en móvil -->
        <div v-if="mobileMenuOpen" class="lg:hidden px-4 pb-4 space-y-2">
            <RouterLink v-if="showLoginButton" to="/auth/login" class="block text-sm text-gray-700 bg-secondary rounded px-4 py-2 text-center hover:bg-secondary-dark">Iniciar sesión</RouterLink>
            <RouterLink v-if="showRegisterButton" to="/auth/login" class="block text-sm text-white bg-primary rounded px-4 py-2 text-center hover:bg-primary-dark"> Registrarse </RouterLink>
        </div>
    </header>
    <section class="min-h-screen bg-gray-50 px-4 py-10">
        <div v-if="!loading" class="max-w-7xl mx-auto">
            <h1 class="text-3xl font-bold text-center text-primary mb-10">Course Catalog</h1>

            <!-- Buscador y Filtros -->
            <div class="mb-6 flex items-center justify-between w-full">
                <div class="w-full">
                    <FiltersMenuBar :path="'catalogue'" @filterByCategory="filterByCategory" @sortBy="sortBy" @search="searchFn" @type="byType" @clearFilters="clearAllFilters" />
                </div>
            </div>

            <!-- Grilla de cursos -->
            <div class="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <ContentPublicCard v-for="course in courses" :key="course.id" :course="course" />
            </div>
            <div>
                <Paginator :rows="perPage" :totalRecords="totalRecords" :first="(currentPage - 1) * perPage" :rowsPerPageOptions="[5, 10, 20, 50, 100]" @page="onPageChange" class="mt-6" />
            </div>

            <div v-if="!loading && courses.length === 0" class="text-center text-gray-500 mt-20">No se encontraron cursos.</div>
        </div>
        <div v-else class="text-center text-gray-500 mt-20">
            <ProgressSpinner />
        </div>
    </section>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue';
import api from '@/service/public/PublicCatalog.js';
import FiltersMenuBar from '@/components/global/FiltersMenuBar.vue';
import CourseCard from '@/components/global/CourseCard.vue';
import ContentPublicCard from '@/components/global/ContentPublicCard.vue';
import router from '@/router';

const company = inject('company');
console.log('company', company.value.modules);
// Extrae el módulo public-catalog
const publicCatalogModule = computed(() => {
    return company?.value?.modules?.find((m) => m.slug === 'public-catalog') ?? null;
});

// Extrae settings específicos
const showLoginButton = computed(() => publicCatalogModule.value?.settings?.showLoginButton !== false);
const showRegisterButton = computed(() => publicCatalogModule.value?.settings?.showRegisterButton !== false);

const mobileMenuOpen = ref(false);

const courses = ref([]);
const search = ref('');
const loading = ref(false);

const filteredCourses = computed(() => {
    if (!search.value) return courses.value;
    return courses.value.filter((course) => course.title.toLowerCase().includes(search.value.toLowerCase()));
});

const filterByCategory = (categoryId) => {
    filters.value = filters.value.filter((f) => f.key !== 'category_id');
    filters.value.push({ key: 'category_id', value: categoryId });
    currentPage.value = 1;
    getCatalogContent();
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
    getCatalogContent();
};

const byType = (thisType) => {
    filters.value = [];
    filters.value = filters.value.filter((f) => f.key !== 'type');
    filters.value.push({ key: 'content_type', value: thisType });
    getCatalogContent();
};

const searchFn = (query) => {
    filters.value = filters.value.filter((f) => f.key !== 'title');
    if (query.trim()) {
        filters.value.push({ key: 'title', value: query });
    }
    currentPage.value = 1;
    getCatalogContent();
};

const clearAllFilters = () => {
    filters.value = [];
    sort.value = 'created_at';
    order.value = 'desc';
    currentPage.value = 1;
    getCatalogContent();
};

// Paginación
const perPage = ref(10);
const currentPage = ref(1);
const meta = ref({ total: 0, current_page: 1, last_page: 1 });

const filters = ref([]);
const sort = ref('created_at');
const order = ref('desc');

const totalRecords = computed(() => meta.value.total);

const onPageChange = (event) => {
    perPage.value = event.rows;
    currentPage.value = event.page + 1;
    getCatalogContent();
};

const getCatalogContent = async () => {
    loading.value = true;
    api.getContent({
        per_page: perPage.value,
        page: currentPage.value,
        sort: sort.value,
        order: order.value,
        filters: filters.value
    })
        .then((response) => {
            if (response) {
                courses.value = response.data;
                meta.value = response;
                currentPage.value = meta.value.current_page;
            } else {
                courses.value = [];
                meta.value = { total: 0, current_page: 1, last_page: 1 };
            }
        })
        .finally(() => {
            loading.value = false;
        })
        .catch((error) => {
            console.error(error);
            courses.value = [];
        });
};

const checkActiveModule = () => {
    company.value.modules.forEach((module) => {
        if (module.slug == 'public-catalog' && module.status == 0) {
            router.push({ name: 'dashboard' });
        }
    });
};

onMounted(() => {
    checkActiveModule();
    getCatalogContent();
});
</script>
