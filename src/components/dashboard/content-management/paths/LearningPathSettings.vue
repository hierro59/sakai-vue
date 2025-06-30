<template>
    <div class="card">
        <!-- SENDEROS -->
        <Toolbar class="mb-6">
            <template #start>
                <Button :label="t('newPath')" icon="pi pi-plus" class="mr-2" @click="openDialog" />
                <Button :label="t('delete')" icon="pi pi-trash" severity="danger" outlined @click="confirmDeleteSelected" :disabled="!selectedPaths || !selectedPaths.length" />
            </template>

            <template #end>
                <Button :label="t('export')" v-tooltip.bottom="t('downloadCsv')" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
            </template>
        </Toolbar>

        <div v-if="!paths">
            <ProgressSpinner />
        </div>

        <DataTable
            v-else
            ref="dt"
            v-model:selection="selectedPaths"
            :value="paths"
            dataKey="id"
            :paginator="true"
            :rows="10"
            :filters="filters"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[5, 10, 25]"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} paths"
        >
            <template #header>
                <div class="flex flex-wrap gap-2 items-center justify-between">
                    <h4 class="m-0">Manage Paths</h4>
                    <IconField>
                        <InputIcon>
                            <i class="pi pi-search" />
                        </InputIcon>
                        <InputText v-model="filters['global'].value" :placeholder="t('search')" />
                    </IconField>
                </div>
            </template>

            <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
            <Column field="name" :header="t('name')" sortable style="min-width: 12rem"></Column>
            <Column field="description" :header="t('description')" sortable style="min-width: 20rem">
                <template #body="{ data }">
                    {{ truncateText(data.description, 100) }}
                </template>
            </Column>

            <Column field="access_type" :header="t('type')" sortable style="min-width: 6rem"></Column>

            <Column field="status" :header="t('status')" sortable style="min-width: 6rem">
                <template #body="slotProps">
                    <Tag :value="slotProps.data.status" :severity="getStatusLabel(slotProps.data.status)" />
                </template>
            </Column>

            <Column :exportable="false" style="min-width: 12rem">
                <template #body="slotProps">
                    <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="openPathSettingDialog(slotProps.data)" v-tooltip.top="t('editPath')" />
                    <Button icon="pi pi-trash" outlined rounded severity="danger" class="mr-2" @click="confirmDeletePath(slotProps?.data)" v-if="slotProps.data.status !== 'inactive'" />
                </template>
            </Column>
        </DataTable>

        <Dialog v-model:visible="pathDialog" :style="{ width: '450px' }" :header="t('newPath')" :modal="true">
            <div class="flex flex-col gap-6">
                <!-- BANNER DE IMAGEN DE RUTA -->
                <div>
                    <label for="image" class="block font-bold mb-3">{{ t('image') }}</label>
                    <img v-if="path.image" :src="path?.image" alt="Image" class="shadow-md rounded-xl w-full" />
                    <FileUpload mode="basic" @select="onFileSelectPresentation" :chooseLabel="path.image ? t('changeImage') : t('uploadImage')" accept="image/*" customUpload auto severity="secondary" class="p-button-outlined mt-4" />
                    <small v-if="submitted && !path.image" class="text-red-500">Image is required.</small>
                </div>

                <div>
                    <label for="name" class="block font-bold mb-3">{{ t('name') }}</label>
                    <InputText id="name" v-model.trim="path.name" required="true" autofocus :invalid="submitted && !path.name" fluid />
                    <small v-if="submitted && !path.name" class="text-red-500">{{ t('nameRequired') }}.</small>
                </div>

                <div>
                    <label for="description" class="block font-bold mb-3">Description</label>
                    <Textarea id="description" v-model.trim="path.description" required="true" :invalid="submitted && !path.description" rows="5" cols="50" autoResize />
                    <small v-if="submitted && !path.description" class="text-red-500">{{ t('descriptionRequired') }}.</small>
                </div>

                <div>
                    <span class="block font-bold mb-4">{{ t('accessType') }}</span>
                    <div class="grid grid-cols-12 gap-4">
                        <div class="flex items-center gap-2 col-span-6">
                            <RadioButton id="category1" v-model="path.access_type" name="access_type" value="free" />
                            <label for="category1">{{ t('free') }}</label>
                        </div>
                        <div class="flex items-center gap-2 col-span-6">
                            <RadioButton id="category2" v-model="path.access_type" name="access_type" value="paid" />
                            <label for="category2">{{ t('paid') }}</label>
                        </div>
                        <div class="flex items-center gap-2 col-span-6">
                            <RadioButton id="category3" v-model="path.access_type" name="access_type" value="private" />
                            <label for="category3">{{ t('private') }}</label>
                        </div>
                        <div class="flex items-center gap-2 col-span-6">
                            <RadioButton id="category4" v-model="path.access_type" name="access_type" value="subscription" />
                            <label for="category4">{{ t('subscription') }}</label>
                        </div>
                    </div>
                </div>
            </div>

            <template #footer>
                <Button :label="t('cancel')" icon="pi pi-times" text @click="hideDialog" />
                <Button :label="t('save')" icon="pi pi-check" @click="savePath" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deletePathDialog" :style="{ width: '450px' }" :header="t('confirm')" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="path"
                    >{{ t('confirmDelete') }} <b>{{ path.name }} </b> {{ t('path') }}?</span
                >
            </div>
            <template #footer>
                <Button :label="t('no')" icon="pi pi-times" text @click="deletePathDialog = false" />
                <Button :label="t('yes')" icon="pi pi-check" @click="deletePath" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deletePathsDialog" :style="{ width: '450px' }" :header="t('confirm')" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span>{{ t('confirmDelete') }} {{ selectedPaths.length }} {{ t('paths') }}?</span>
            </div>
            <template #footer>
                <Button :label="t('no')" icon="pi pi-times" text @click="deletePathsDialog = false" />
                <Button :label="t('yes')" icon="pi pi-check" text @click="deleteSelectedPaths" />
            </template>
        </Dialog>
        <Dialog v-model:visible="pathSettingDialog" :style="{ width: '80%' }" :header="t('pathSettings')" :modal="true">
            <PathSetting v-if="path.code !== null" :pathCode="path.code" :pathId="path.id" @close="pathSettingDialog = null" />
        </Dialog>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import api from '@/service/content-management/ApiLearningPaths';
import PathSetting from './PathSetting.vue';
import eventBus from '@/service/eventBus';
import ApiMedia from '@/service/media/ApiMediaLibrary';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const toast = useToast();
const dt = ref();
const paths = ref();
const pathDialog = ref(false);
const deletePathDialog = ref(false);
const deletePathsDialog = ref(false);
const selectedPaths = ref();
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);

const emptyPath = {
    id: null,
    code: null,
    name: '',
    description: '',
    image: '',
    access_type: ''
};

const path = ref({
    id: null,
    code: null,
    name: '',
    description: '',
    image: '',
    access_type: ''
});

const pathSettingDialog = ref(false);

const openPathSettingDialog = (data) => {
    path.value.code = data.code;
    path.value.id = data.id;
    pathSettingDialog.value = true;
};

const openDialog = (data) => {
    if (data) {
        path.value = { ...data };
    } else {
        path.value = { ...emptyPath };
        submitted.value = false;
        pathDialog.value = true;
    }
    pathDialog.value = true;
};

const hideDialog = () => {
    pathDialog.value = false;
    submitted.value = false;
};

const getPaths = () => {
    api.getPaths()
        .then((response) => {
            if (Object.keys(response).length === 0) {
                paths.value = []; // Asigna un array vacío
            } else {
                // Si la respuesta es un array, asígnala directamente
                if (Array.isArray(response)) {
                    paths.value = response;
                } else {
                    // Si la respuesta es un objeto, conviértelo en un array
                    paths.value = Object.values(response);
                }
            }
        })
        .catch((error) => {
            console.log(error);
        });
};
const savePath = () => {
    if (!path.value.name || !path.value.description || !path.value.image) {
        submitted.value = true;
        toast.add({ severity: 'error', summary: 'Error', detail: 'All fields are required', life: 3000 });
        return;
    }

    if (path.value.id) {
        api.updatePath(path.value)
            .then((response) => {
                getPaths();
                toast.add({ severity: 'success', summary: 'Successful', detail: 'Path Updated', life: 3000 });
            })
            .catch((error) => {
                console.log(error);
                let errorMessage = 'Error al actualizar el path.';

                const serverData = error.response?.data;

                // Extrae el mensaje del campo errorInfo si está presente
                if (serverData?.data?.error?.errorInfo && Array.isArray(serverData.data.error.errorInfo) && serverData.data.error.errorInfo.length > 2) {
                    errorMessage = serverData.data.error.errorInfo[2];
                } else if (serverData?.message) {
                    errorMessage = serverData.message;
                }

                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: errorMessage,
                    life: 5000
                });
            });
    } else {
        api.createPath(path.value)
            .then((response) => {
                getPaths();
                toast.add({ severity: 'success', summary: 'Successful', detail: 'Path Created', life: 3000 });
            })
            .catch((error) => {
                console.log(error);
                let errorMessage = 'Error al crear el path.';

                const serverData = error.response?.data;

                // Extrae el mensaje del campo errorInfo si está presente
                if (serverData?.data?.error?.errorInfo && Array.isArray(serverData.data.error.errorInfo) && serverData.data.error.errorInfo.length > 2) {
                    errorMessage = serverData.data.error.errorInfo[2];
                } else if (serverData?.message) {
                    errorMessage = serverData.message;
                }

                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: errorMessage,
                    life: 5000
                });
            });
    }
    submitted.value = true;
    pathDialog.value = false;
};
const confirmDeletePath = (prods) => {
    path.value = prods;
    deletePathDialog.value = true;
};
const deletePath = () => {
    api.deletePath(path.value.id)
        .then((response) => {
            getPaths();
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Path Deleted', life: 3000 });
        })
        .catch((error) => {
            console.log(error);
            let errorMessage = 'Error al eliminar el path.';

            const serverData = error.response?.data;

            // Extrae el mensaje del campo errorInfo si está presente
            if (serverData?.data?.error?.errorInfo && Array.isArray(serverData.data.error.errorInfo) && serverData.data.error.errorInfo.length > 2) {
                errorMessage = serverData.data.error.errorInfo[2];
            } else if (serverData?.message) {
                errorMessage = serverData.message;
            }

            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: errorMessage,
                life: 5000
            });
        });
    deletePathDialog.value = false;
    path.value = { ...emptyPath };
};

const exportCSV = () => {
    dt.value.exportCSV();
};
const confirmDeleteSelected = () => {
    deletePathsDialog.value = true;
};
const deleteSelectedPaths = async () => {
    const ids = selectedPaths.value.map((path) => path.id);

    try {
        await api.deletePaths(ids);

        paths.value = paths.value.filter((path) => !ids.includes(path.id));

        toast.add({ severity: 'success', summary: 'Deletion successful', detail: 'Paths deleted.', life: 3000 });
    } catch (error) {
        console.error(error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Error deleting paths.', life: 5000 });
    } finally {
        deletePathsDialog.value = false;
        selectedPaths.value = null;
    }
};

const getStatusLabel = (status) => {
    switch (status) {
        case 'active':
            return 'success';
        case 'inactive':
            return 'danger';
        default:
            return 'info';
    }
};

function onFileSelectPresentation(event) {
    const file = event.files[0];
    const reader = new FileReader();
    const formData = new FormData();
    formData.append('file', file);
    const response = ApiMedia.uploadMedia(formData, 'image')
        .then((res) => {
            path.value.image = res.data.media.url;
        })
        .catch((err) => {
            console.error(err);
        });
    reader.onload = async (e) => {
        if (!path.value) {
            console.error('path.value es null o undefined');
            return;
        }

        if (!path.value.image) {
            path.value.image = {};
        }

        path.value.image = e.target.result;
    };

    reader.readAsDataURL(file);
}

const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

onMounted(() => {
    getPaths();
    eventBus.on('updatePath', () => {
        getPaths();
    });
});
</script>
