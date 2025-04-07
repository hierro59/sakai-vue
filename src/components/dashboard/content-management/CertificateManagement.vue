<template>
    <Toolbar class="mb-6">
        <template #start>
            <Button label="Nuevo" icon="pi pi-plus" class="mr-2" @click="openNew" />
            <Button label="Eliminar" icon="pi pi-trash" severity="danger" outlined @click="confirmDeleteSelected" :disabled="!selectedTemplates || !selectedTemplates.length" />
        </template>

        <template #end>
            <FileUpload disabled v-tooltip.top="'Coming soon'" mode="basic" accept="image/*" :maxFileSize="1000000" label="Import" customUpload chooseLabel="Import" class="mr-2" auto :chooseButtonProps="{ severity: 'secondary' }" />
            <Button label="Export" v-tooltip.bottom="'Download CSV'" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
        </template>
    </Toolbar>

    <DataTable
        ref="dt"
        v-model:selection="selectedTemplates"
        :value="templates"
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
                <h4 class="m-0">Plantillas de certificados</h4>
                <IconField>
                    <InputIcon>
                        <i class="pi pi-search" />
                    </InputIcon>
                    <InputText v-model="filters['global'].value" placeholder="Search..." />
                </IconField>
            </div>
        </template>

        <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>

        <Column field="id" header="ID" sortable style="min-width: 12rem"></Column>
        <Column field="name" header="Name" sortable style="min-width: 16rem"></Column>

        <Column field="description" header="Description" sortable style="min-width: 20rem"></Column>

        <Column field="type" header="Type" sortable style="min-width: 6rem"></Column>

        <Column field="status" header="Status" sortable style="min-width: 6rem">
            <template #body="slotProps">
                <Tag :value="slotProps.data.status" :severity="getStatusLabel(slotProps.data.status)" />
            </template>
        </Column>

        <Column :exportable="false" style="min-width: 12rem">
            <template #body="slotProps">
                <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editTemplate(slotProps.data)" />
                <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteCourse(slotProps.data)" />
            </template>
        </Column>
    </DataTable>

    <Card v-if="templateDialog" class="mt-8">
        <template #header>
            <div class="font-semibold text-xl mb-4 p-6">Plantilla de Certificados</div>
        </template>
        <template #content>
            <div class="flex flex-col gap-6 mb-12">
                <div>
                    <label for="name" class="block font-bold mb-3">Name</label>
                    <InputText id="name" v-model.trim="template.name" required="true" autofocus :invalid="submitted && !template.name" fluid />
                    <small v-if="submitted && !template.name" class="text-red-500">Name is required.</small>
                </div>
                <div>
                    <label for="description" class="block font-bold mb-3">Description</label>
                    <Textarea id="description" v-model="template.description" required="true" rows="3" cols="20" fluid />
                </div>
                <div>
                    <Select v-model="template.type" :options="types" optionLabel="name" :placeholder="template.type ? template.type : 'Select a Type'" />
                </div>
                <div>
                    <Editor
                        api-key="0954x5p66yvz6y07qr4f65no48i7zvurvidb42cvhhe4ns67"
                        v-model="template.data"
                        :init="{
                            toolbar_mode: 'sliding',
                            plugins: [
                                // Core editing features
                                'anchor',
                                'autolink',
                                'charmap',
                                'codesample',
                                'emoticons',
                                'image',
                                'link',
                                'lists',
                                'searchreplace',
                                'table',
                                'visualblocks',
                                'wordcount',
                                'code'
                            ],
                            toolbar:
                                'undo redo | code | blocks fontfamily fontsize | bold italic underline strikethrough | link image table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
                            tinycomments_mode: 'embedded',
                            tinycomments_author: 'Author name'
                        }"
                        @update:modelValue="handleEditorChange"
                    />
                </div>
            </div>
        </template>
        <template #footer>
            <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
            <Button label="Save" icon="pi pi-check" @click="saveCourse" />
        </template>
    </Card>

    <Dialog hidden :style="{ width: '450px' }" header="Course Details" :modal="true">
        <div class="flex flex-col gap-6">
            <div>
                <label for="title" class="block font-bold mb-3">Title</label>
                <InputText id="title" v-model.trim="template.title" required="true" autofocus :invalid="submitted && !template.title" fluid />
                <small v-if="submitted && !template.title" class="text-red-500">Title is required.</small>
            </div>
            <div>
                <label for="description" class="block font-bold mb-3">Description</label>
                <Textarea id="description" v-model="template.description" required="true" rows="3" cols="20" fluid />
            </div>
        </div>

        <template #footer>
            <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
            <Button label="Save" icon="pi pi-check" @click="saveCourse" />
        </template>
    </Dialog>

    <Dialog v-model:visible="deleteTemplateDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
        <div class="flex items-center gap-4">
            <i class="pi pi-exclamation-triangle !text-3xl" />
            <span v-if="template"
                >Are you sure you want to delete <b>{{ template.name }}</b
                >?</span
            >
        </div>
        <template #footer>
            <Button label="No" icon="pi pi-times" text @click="deleteTemplateDialog = false" />
            <Button label="Yes" icon="pi pi-check" @click="deleteCourse" />
        </template>
    </Dialog>

    <Dialog v-model:visible="deleteTemplatesDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
        <div class="flex items-center gap-4">
            <i class="pi pi-exclamation-triangle !text-3xl" />
            <span v-if="template">Are you sure you want to delete the selected courses?</span>
        </div>
        <template #footer>
            <Button label="No" icon="pi pi-times" text @click="deleteTemplatesDialog = false" />
            <Button label="Yes" icon="pi pi-check" text @click="deleteSelectedCourses" />
        </template>
    </Dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import api from '@/service/content-management/ApiCertificates';
import Editor from '@tinymce/tinymce-vue';

const toast = useToast();
const dt = ref();
const templates = ref();
const templateDialog = ref(false);
const deleteTemplateDialog = ref(false);
const deleteTemplatesDialog = ref(false);
const template = ref({});
const selectedTemplates = ref();
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);

const types = ref([
    { name: 'Certificate', code: 'certificate' },
    { name: 'Diploma', code: 'diploma' },
    { name: 'Badge', code: 'badge' },
    { name: 'Degree', code: 'degree' },
    { name: 'Accreditation', code: 'accreditation' },
    { name: 'Other', code: 'other' }
]);

const getCertificateTempalates = () => {
    api.getCertificateTempalates()
        .then((response) => {
            if (Object.keys(response).length === 0) {
                templates.value = []; // Asigna un array vacío
            } else {
                // Si la respuesta es un array, asígnala directamente
                if (Array.isArray(response)) {
                    templates.value = response;
                } else {
                    // Si la respuesta es un objeto, conviértelo en un array
                    templates.value = Object.values(response);
                }
            }
        })
        .catch((error) => {
            console.log(error);
        });
};

const saveCourse = () => {
    console.log(template.value);

    if (template.value.id) {
        api.updateTemplate(template.value.id, template.value).then((response) => {
            //console.log(response);
            getCertificateTempalates();
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Template Updated', life: 3000 });
        });
    } else {
        api.createTemplate(template.value).then((response) => {
            //console.log(response);
            getCertificateTempalates();
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Template Created', life: 3000 });
        });
        submitted.value = true;
    }
};

const openNew = () => {
    template.value = {};
    submitted.value = false;
    templateDialog.value = true;
};
const hideDialog = () => {
    templateDialog.value = false;
    submitted.value = false;
};

const editTemplate = (prod) => {
    template.value = { ...prod };
    templateDialog.value = true;
};
const confirmDeleteCourse = (prod) => {
    course.value = prod;
    deleteTemplateDialog.value = true;
};
const deleteCourse = () => {
    courses.value = courses.value.filter((val) => val.id !== course.value.id);
    deleteTemplateDialog.value = false;
    course.value = {};
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Course Deleted', life: 3000 });
};

const exportCSV = () => {
    dt.value.exportCSV();
};
const confirmDeleteSelected = () => {
    deleteTemplatesDialog.value = true;
};
const deleteSelectedCourses = () => {
    courses.value = courses.value.filter((val) => !selectedCourses.value.includes(val));
    deleteTemplatesDialog.value = false;
    selectedCourses.value = null;
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Courses Deleted', life: 3000 });
};

const getStatusLabel = (status) => {
    switch (status) {
        case 'active':
            return 'success';

        case 'inactive':
            return 'warn';

        case 'deleted':
            return 'danger';

        default:
            return null;
    }
};

const templateData = ref();

const handleEditorChange = (newValue) => {
    templateData.value = newValue;
};

onMounted(() => {
    getCertificateTempalates();
});
</script>
