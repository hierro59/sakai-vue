<template>
    <div class="card">
        <div class="font-semibold text-xl mb-4">Área de Gestión de Cursos</div>
        <Tabs value="0">
            <TabList>
                <Tab value="0"><i class="pi pi-pencil mr-2"></i> Mis Creaciones</Tab>
                <Tab value="1"><i class="pi pi-share-alt mr-2"></i> Compartidos conmigo</Tab>
            </TabList>
            <TabPanels>
                <TabPanel value="0">
                    <!-- MIS CURSOS -->
                    <Toolbar class="mb-6">
                        <template #start>
                            <Button label="Nuevo" icon="pi pi-plus" class="mr-2" @click="openNew" />
                            <Button label="Eliminar" icon="pi pi-trash" severity="danger" outlined @click="confirmDeleteSelected" :disabled="!selectedCourses || !selectedCourses.length" />
                        </template>

                        <template #end>
                            <FileUpload disabled v-tooltip.top="'Coming soon'" mode="basic" accept="image/*" :maxFileSize="1000000" label="Import" customUpload chooseLabel="Import" class="mr-2" auto :chooseButtonProps="{ severity: 'secondary' }" />
                            <Button label="Export" v-tooltip.bottom="'Download CSV'" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
                        </template>
                    </Toolbar>

                    <DataTable
                        ref="dt"
                        v-model:selection="selectedCourses"
                        :value="courses"
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
                                <h4 class="m-0">Administre sus cursos</h4>
                                <IconField>
                                    <InputIcon>
                                        <i class="pi pi-search" />
                                    </InputIcon>
                                    <InputText v-model="filters['global'].value" placeholder="Search..." />
                                </IconField>
                            </div>
                        </template>

                        <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
                        <!-- <Column header="Image">
                            <template #body="slotProps">
                                <img :src="`https://primefaces.org/cdn/primevue/images/product/${slotProps.data.image}`" :alt="slotProps.data.image" class="rounded" style="width: 90px" />
                            </template>
                        </Column> -->
                        <Column field="code" header="Code" sortable style="min-width: 12rem"></Column>
                        <Column field="title" header="Title" sortable style="min-width: 16rem"></Column>

                        <!-- <Column field="description" header="Description" sortable style="min-width: 20rem"></Column> -->

                        <Column field="access_type.type" header="Tipo" sortable style="min-width: 6rem"></Column>

                        <Column field="status" header="Status" sortable style="min-width: 6rem">
                            <template #body="slotProps">
                                <Tag :value="slotProps.data.status" :severity="getStatusLabel(slotProps.data.inventoryStatus)" />
                            </template>
                        </Column>

                        <Column :exportable="false" style="min-width: 12rem">
                            <template #body="slotProps">
                                <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editCourse(slotProps.data)" />
                                <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteCourse(slotProps.data)" />
                            </template>
                        </Column>
                    </DataTable>

                    <Dialog v-model:visible="courseDialog" :style="{ width: '450px' }" header="Course Details" :modal="true">
                        <div class="flex flex-col gap-6">
                            <div>
                                <label for="title" class="block font-bold mb-3">Title</label>
                                <InputText id="title" v-model.trim="course.title" required="true" autofocus :invalid="submitted && !course.title" fluid />
                                <small v-if="submitted && !course.title" class="text-red-500">Title is required.</small>
                            </div>
                            <div>
                                <label for="description" class="block font-bold mb-3">Description</label>
                                <Textarea id="description" v-model="course.description" required="true" rows="3" cols="20" fluid />
                            </div>
                            <!--  <div>
                                <label for="inventoryStatus" class="block font-bold mb-3">Inventory Status</label>
                                <Select id="inventoryStatus" v-model="course.inventoryStatus" :options="statuses" optionLabel="label" placeholder="Select a Status" fluid></Select>
                            </div> -->

                            <div>
                                <span class="block font-bold mb-4">Access Type</span>
                                <div class="grid grid-cols-12 gap-4">
                                    <div class="flex items-center gap-2 col-span-6">
                                        <RadioButton id="category1" v-model="course.access_type" name="access_type" value="free" />
                                        <label for="category1">Free</label>
                                    </div>
                                    <div class="flex items-center gap-2 col-span-6">
                                        <RadioButton id="category2" v-model="course.access_type" name="access_type" value="paid" />
                                        <label for="category2">Pay</label>
                                    </div>
                                    <div class="flex items-center gap-2 col-span-6">
                                        <RadioButton id="category3" v-model="course.access_type" name="access_type" value="private" />
                                        <label for="category3">Private</label>
                                    </div>
                                    <div class="flex items-center gap-2 col-span-6">
                                        <RadioButton id="category4" v-model="course.access_type" name="access_type" value="subscription" />
                                        <label for="category4">Subscription</label>
                                    </div>
                                </div>
                            </div>

                            <!-- <div class="grid grid-cols-12 gap-4">
                                <div class="col-span-6">
                                    <label for="price" class="block font-bold mb-3">Price</label>
                                    <InputNumber id="price" v-model="course.price" mode="currency" currency="USD" locale="en-US" fluid />
                                </div>
                                <div class="col-span-6">
                                    <label for="quantity" class="block font-bold mb-3">Quantity</label>
                                    <InputNumber id="quantity" v-model="course.quantity" integeronly fluid />
                                </div>
                            </div> -->
                        </div>

                        <template #footer>
                            <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
                            <Button label="Save" icon="pi pi-check" @click="saveCourse" />
                        </template>
                    </Dialog>

                    <Dialog v-model:visible="deleteCourseDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                        <div class="flex items-center gap-4">
                            <i class="pi pi-exclamation-triangle !text-3xl" />
                            <span v-if="course"
                                >Are you sure you want to delete <b>{{ course.name }}</b
                                >?</span
                            >
                        </div>
                        <template #footer>
                            <Button label="No" icon="pi pi-times" text @click="deleteCourseDialog = false" />
                            <Button label="Yes" icon="pi pi-check" @click="deleteCourse" />
                        </template>
                    </Dialog>

                    <Dialog v-model:visible="deleteCoursesDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                        <div class="flex items-center gap-4">
                            <i class="pi pi-exclamation-triangle !text-3xl" />
                            <span v-if="course">Are you sure you want to delete the selected courses?</span>
                        </div>
                        <template #footer>
                            <Button label="No" icon="pi pi-times" text @click="deleteCoursesDialog = false" />
                            <Button label="Yes" icon="pi pi-check" text @click="deleteSelectedCourses" />
                        </template>
                    </Dialog>
                </TabPanel>
                <TabPanel value="1">
                    <p class="m-0">Una lista de cursos de otras personas a los que el usuario ha sido invitado como editor</p>
                </TabPanel>
            </TabPanels>
        </Tabs>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';

import { Tooltip } from 'primevue';
import api from '@/service/content-management/ApiCourses';
import router from '@/router';

onMounted(() => {
    getCourses();
});

const getCourses = () => {
    api.getCourses()
        .then((response) => {
            if (Object.keys(response).length === 0) {
                courses.value = []; // Asigna un array vacío
            } else {
                // Si la respuesta es un array, asígnala directamente
                if (Array.isArray(response)) {
                    courses.value = response;
                } else {
                    // Si la respuesta es un objeto, conviértelo en un array
                    courses.value = Object.values(response);
                }
            }
        })
        .catch((error) => {
            console.log(error);
        });
};

const toast = useToast();
const dt = ref();
const courses = ref();
const courseDialog = ref(false);
const deleteCourseDialog = ref(false);
const deleteCoursesDialog = ref(false);
const course = ref({});
const selectedCourses = ref();
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);
const statuses = ref([
    { label: 'INSTOCK', value: 'instock' },
    { label: 'LOWSTOCK', value: 'lowstock' },
    { label: 'OUTOFSTOCK', value: 'outofstock' }
]);

const formatCurrency = (value) => {
    if (value) return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    return;
};
const openNew = () => {
    course.value = {};
    submitted.value = false;
    courseDialog.value = true;
};
const hideDialog = () => {
    courseDialog.value = false;
    submitted.value = false;
};
const saveCourse = () => {
    console.log(course.value);
    api.createCourse(course.value).then((response) => {
        console.log(response);
        getCourses();
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Course Created', life: 3000 });
        setTimeout(() => {
            router.push({ name: 'creator', params: { courseId: response.id } });
        }, 2000);
    });
    submitted.value = true;
};
const editCourse = (prod) => {
    course.value = { ...prod };
    router.push({ name: 'creator', params: { courseId: course.value.id } });
    //courseDialog.value = true;
};
const confirmDeleteCourse = (prod) => {
    course.value = prod;
    deleteCourseDialog.value = true;
};
const deleteCourse = () => {
    courses.value = courses.value.filter((val) => val.id !== course.value.id);
    deleteCourseDialog.value = false;
    course.value = {};
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Course Deleted', life: 3000 });
};
const findIndexById = (id) => {
    let index = -1;
    for (let i = 0; i < courses.value.length; i++) {
        if (courses.value[i].id === id) {
            index = i;
            break;
        }
    }

    return index;
};
const createId = () => {
    let id = '';
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < 5; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
};
const exportCSV = () => {
    dt.value.exportCSV();
};
const confirmDeleteSelected = () => {
    deleteCoursesDialog.value = true;
};
const deleteSelectedCourses = () => {
    courses.value = courses.value.filter((val) => !selectedCourses.value.includes(val));
    deleteCoursesDialog.value = false;
    selectedCourses.value = null;
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Courses Deleted', life: 3000 });
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
</script>
