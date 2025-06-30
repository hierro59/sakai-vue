<template>
    <div class="card">
        <!-- MIS CURSOS -->
        <Toolbar class="mb-6">
            <template #start>
                <div class="font-semibold text-xl">{{ t('courseStatsArea') }}</div>
            </template>
            <template #end>
                <Button :label="t('export')" v-tooltip.bottom="t('downloadCsv')" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
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
                    <Button icon="pi pi-eye" outlined rounded class="mr-2" @click="editCourse(slotProps.data)" v-tooltip.top="t('viewStats')" />
                </template>
            </Column>
        </DataTable>

        <Dialog v-model:visible="courseDialog" :style="{ width: '450px' }" :header="t('courseStats')" :modal="true">
            <div class="flex flex-col gap-6">
                <div>{{ t('statistics') }}</div>
            </div>

            <template #footer>
                <Button label="Close" icon="pi pi-times" text @click="hideDialog" />
            </template>
        </Dialog>

        <!-- <Dialog v-model:visible="deleteCourseDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="course">
                    Are you sure you want to delete <b>{{ course.title }}</b> ?
                </span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteCourseDialog = false" />
                <Button label="Yes" icon="pi pi-check" @click="deleteCourse" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteCoursesDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="course"
                    >Are you sure you want to delete the <b>{{ selectedCourses.length }}</b> selected courses?</span
                >
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteCoursesDialog = false" />
                <Button label="Yes" icon="pi pi-check" text @click="deleteSelectedCourses" />
            </template>
        </Dialog>
        <Dialog v-model:visible="archiveDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="course"
                    >Are you sure you want to {{ course.status === 'archived' ? 'unarchive' : 'archive' }} the <b>{{ course.title }}</b> course?</span
                >
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="archiveDialog = false" />
                <Button label="Yes" icon="pi pi-check" text @click="archive(course)" />
            </template>
        </Dialog> -->
    </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import api from '@/service/content-management/ApiCourses';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const dt = ref();
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

const exportCSV = () => {
    dt.value.exportCSV();
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

onMounted(() => {
    getStatistics();
});
</script>
