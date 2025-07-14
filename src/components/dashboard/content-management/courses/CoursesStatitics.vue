<template>
    <div class="card">
        <!-- MIS CURSOS -->
        <Toolbar class="mb-6">
            <template #start>
                <div class="font-semibold text-xl">{{ t('courseStatsArea') }}</div>
            </template>
            <template #end>
                <Button :label="t('export')" v-tooltip.bottom="t('downloadCsv')" icon="pi pi-upload" severity="secondary" @click="exportCSV('dt')" />
            </template>
        </Toolbar>

        <div v-if="!statistics">
            <ProgressSpinner />
        </div>

        <DataTable
            v-else
            ref="dt"
            v-model:selection="selectedCourses"
            :value="statistics"
            dataKey="id"
            :paginator="true"
            :rows="10"
            :filters="filters"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[5, 10, 25]"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} courses"
        >
            <template #header>
                <div class="flex flex-wrap gap-2 items-center justify-between">
                    <h4 class="m-0">{{ t('courses') }}</h4>
                    <IconField>
                        <InputIcon>
                            <i class="pi pi-search" />
                        </InputIcon>
                        <InputText v-model="filters['global'].value" :placeholder="t('search')" />
                    </IconField>
                </div>
            </template>

            <Column header="Image">
                <template #body="slotProps">
                    <img :src="slotProps.data.image" :alt="slotProps.data.image" class="w-24 rounded" />
                </template>
            </Column>
            <Column field="title" :header="t('name')"></Column>
            <Column field="users_count" :header="t('registered')"></Column>
            <Column field="average_rating" :header="t('reviews')">
                <template #body="slotProps">
                    <Rating :modelValue="slotProps.data.average_rating" readonly />
                </template>
            </Column>
            <Column :header="t('status')">
                <template #body="slotProps">
                    <Tag :value="slotProps.data.status" :severity="getStatusLabel(slotProps.data.status)" />
                </template>
            </Column>

            <Column :exportable="false">
                <template #body="slotProps">
                    <Button icon="pi pi-eye" outlined rounded class="mr-2" @click="statiticsByCourseFn(slotProps.data.id)" v-tooltip.top="t('viewStats')" />
                </template>
            </Column>
        </DataTable>

        <Dialog v-model:visible="courseDialog" :style="{ width: '80%' }" :header="t('courseStats')" :modal="true">
            <!--  <div class="flex flex-col gap-6">
                <div>{{ t('statistics') }}</div>
            </div> -->
            <Toolbar class="mb-6">
                <template #start>
                    <div class="font-semibold text-xl">{{ t('statistics') }}</div>
                </template>
                <template #end>
                    <Button :label="t('export')" v-tooltip.bottom="t('downloadCsv')" icon="pi pi-upload" severity="secondary" @click="exportCSV('progressTable')" />
                </template>
            </Toolbar>

            <div v-if="statsLoading" class="flex justify-center">
                <ProgressSpinner />
            </div>

            <div v-else class="flex flex-col gap-4">
                <DataTable ref="progressTable" :value="statiticsByCourse" tableStyle="min-width: 50rem">
                    <Column field="full_name" :header="t('name')"></Column>
                    <Column field="email" :header="t('email')"></Column>
                    <Column field="progress" :header="t('progress')"></Column>
                    <Column field="score" :header="t('score')"></Column>
                    <Column field="done_at" :header="t('doneAt')"></Column>
                </DataTable>
            </div>

            <template #footer>
                <Button label="Close" icon="pi pi-times" text @click="hideDialog" />
            </template>
        </Dialog>
    </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import api from '@/service/content-management/ApiCourses';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const dt = ref();
const progressTable = ref();
const statistics = ref([]);
const courseDialog = ref(false);
const selectedCourses = ref();
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);

const hideDialog = () => {
    courseDialog.value = false;
    submitted.value = false;
};
const editCourse = (prod) => {
    courseDialog.value = true;
};

const exportCSV = (table) => {
    switch (table) {
        case 'progressTable':
            progressTable.value.exportCSV();
            break;
        case 'dt':
            dt.value.exportCSV();
            break;
        default:
            console.error('Invalid table reference for exportCSV');
            break;
    }
};

const getStatusLabel = (status) => {
    switch (status) {
        case 'published':
            return 'success';

        case 'draft':
        case 'archived':
            return 'warn';

        case 'deleted':
            return 'danger';

        default:
            return null;
    }
};

const getStatistics = () => {
    api.fetchStatitics().then((response) => {
        statistics.value = response.data.data;
    });
};

const statiticsByCourse = ref(null);
const statsLoading = ref(false);

const statiticsByCourseFn = (courseId) => {
    courseDialog.value = true;
    statsLoading.value = true;
    if (courseId) {
        api.fetchStatiticsByCourse(courseId)
            .then((response) => {
                statiticsByCourse.value = response.data;
            })
            .finally(() => {
                statsLoading.value = false;
            });
    } else {
        console.error('Course ID is not provided');
    }
};

onMounted(() => {
    getStatistics();
});
</script>
