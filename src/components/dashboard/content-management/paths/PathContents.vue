<template>
    <div class="card">
        <!-- CONTENIDOS -->
        <Toolbar class="mb-6">
            <template #start>
                <Button :label="t('newContent')" icon="pi pi-plus" class="mr-2" @click="openDialog" />
                <Button :label="t('delete')" icon="pi pi-trash" severity="danger" outlined @click="confirmDeleteSelected" :disabled="!selectedUsers || !selectedUsers.length" />
            </template>

            <template #end>
                <FileUpload
                    disabled
                    mode="basic"
                    accept=".xlsx,.xls,.csv"
                    :maxFileSize="1000000"
                    label="Import"
                    customUpload
                    chooseLabel="Import"
                    class="mr-2"
                    auto
                    :chooseButtonProps="{ severity: 'secondary' }"
                    @select="handleExcelImport"
                    v-tooltip.top="t('comingSoon')"
                />
                <Button :label="t('export')" v-tooltip.bottom="t('downloadCsv')" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
            </template>
        </Toolbar>
        <SuggestCoursesButton :pathId="props.pathId" @update:contents="getContents" />
        <DataTable
            ref="dt"
            v-model:selection="selectedUsers"
            :value="pContents"
            dataKey="id"
            :paginator="true"
            :rows="10"
            :filters="filters"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[5, 10, 25]"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} contents"
        >
            <template #header>
                <div class="flex flex-wrap gap-2 items-center justify-between">
                    <h4 class="m-0">{{ t('manageContent') }}</h4>
                    <IconField>
                        <InputIcon>
                            <i class="pi pi-search" />
                        </InputIcon>
                        <InputText v-model="filters['global'].value" :placeholder="t('search')" />
                    </IconField>
                </div>
            </template>
            <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
            <Column field="type" :header="t('type')" sortable style="min-width: 6rem"></Column>
            <Column field="position" :header="t('position')" sortable style="min-width: 6rem"></Column>
            <Column field="title" :header="t('title')" sortable style="min-width: 12rem"></Column>
            <Column field="description" :header="t('description')" sortable style="min-width: 20rem">
                <template #body="{ data }">
                    {{ truncateText(data.description, 100) }}
                </template>
            </Column>
            <Column field="access_type" :header="t('accesType')" sortable style="min-width: 8rem"></Column>
            <Column :exportable="false" style="min-width: 12rem">
                <template #body="slotProps">
                    <Button icon="pi pi-trash" outlined rounded severity="danger" class="mr-2" @click="confirmDeleteContent(slotProps.data)" v-if="slotProps.data.status !== 'inactive'" v-tooltip.top="t('deleteContent')" />
                </template>
            </Column>
        </DataTable>

        <Dialog v-model:visible="userDialog" :style="{ width: '70%' }" :modal="true">
            <DataTable
                ref="dt"
                v-model:selection="selectedContens"
                :value="members"
                dataKey="code"
                :paginator="true"
                :rows="10"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} contents"
            >
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">{{ t('selectContents') }}</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" :placeholder="t('search')" />
                        </IconField>
                    </div>
                </template>
                <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
                <Column field="type" :header="t('type')" sortable style="min-width: 6rem"></Column>
                <Column field="title" :header="t('title')" sortable style="min-width: 12rem"></Column>
                <Column field="description" :header="t('description')" sortable style="min-width: 16rem"></Column>
                <Column field="access_type" :header="t('accesType')" sortable style="min-width: 8rem"></Column>
            </DataTable>
            <template #footer>
                <Button :label="t('cancel')" icon="pi pi-times" text @click="hideDialog" />
                <Button :label="t('save')" icon="pi pi-check" @click="saveContents" :disabled="!selectedContens || !selectedContens.length" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteContentDialog" :style="{ width: '450px' }" :header="t('confirm')" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="user"
                    >{{ t('confirmDelete') }} <b>{{ user.type === 'course' ? user.title : user.name }}</b
                    >?</span
                >
            </div>
            <template #footer>
                <Button :label="t('no')" icon="pi pi-times" text @click="deleteContentDialog = false" />
                <Button :label="t('yes')" icon="pi pi-check" @click="deleteContent" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteUsersDialog" :style="{ width: '450px' }" :header="t('confirm')" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span>{{ t('confirmDelete') }} {{ selectedUsers.length }}?</span>
            </div>
            <template #footer>
                <Button :label="t('no')" icon="pi pi-times" text @click="deleteUsersDialog = false" />
                <Button :label="t('yes')" icon="pi pi-check" text @click="deleteSelectedContents" />
            </template>
        </Dialog>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, defineProps, watchEffect, defineEmits } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import api from '@/service/content-management/ApiLearningPaths';
import SuggestCoursesButton from './SuggestCoursesButton.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const emit = defineEmits(['update:contents']);

const props = defineProps({
    pathId: {
        type: Number || undefined,
        required: true
    }
});

const pContents = ref([]);

const toast = useToast();
const dt = ref();
const userDialog = ref(false);
const deleteContentDialog = ref(false);
const deleteUsersDialog = ref(false);
const selectedUsers = ref();
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);
const statuses = ref([
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Blocked', value: 'blocked' }
]);
const members = ref();
const member = ref();
const selectedContens = ref();

const emptyUser = {
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    status: 'active',
    roles: []
};

const user = ref({ ...emptyUser });

const openDialog = () => {
    getPosiblePathContents();
};

const hideDialog = () => {
    userDialog.value = false;
    submitted.value = false;
};
const saveContents = () => {
    // Agregar la propiedad position basada en el índice
    const contentsWithPosition = selectedContens.value.map((item, index) => ({
        ...item,
        position: index
    }));

    api.addContents(props.pathId, contentsWithPosition)
        .then((response) => {
            toast.add({
                severity: 'success',
                summary: 'Successful',
                detail: 'Contenidos agregados',
                life: 3000
            });
            emit('update:contents');
            selectedContens.value = null;
        })
        .catch((error) => {
            console.log(error);
            let errorMessage = 'Error al agregar los contenidos.';

            const serverData = error.response?.data;

            if (serverData?.data?.error?.errorInfo && Array.isArray(serverData.data.error.errorInfo) && serverData.data.error.errorInfo.length > 2) {
                errorMessage = serverData.data.error.errorInfo[2];
            } else if (serverData?.message) {
                errorMessage = serverData.message;
            }

            selectedContens.value = null;

            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: errorMessage,
                life: 5000
            });
        });

    userDialog.value = false;
    user.value = { ...emptyUser };
};

const confirmDeleteContent = (prod) => {
    user.value = prod;
    deleteContentDialog.value = true;
};
const deleteContent = () => {
    api.deleteContents(props.pathId, [user.value.id])
        .then((response) => {
            console.log(response);
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Content Deleted', life: 3000 });
            emit('update:contents');
        })
        .catch((error) => {
            console.log(error);
            let errorMessage = 'Error al eliminar el contenido.';

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
    deleteContentDialog.value = false;
    user.value = { ...emptyUser };
};

const handleExcelImport = async (event) => {
    const file = event.files[0];

    if (!file) {
        toast.add({ severity: 'warn', summary: 'Archivo requerido', detail: 'Selecciona un archivo Excel válido', life: 3000 });
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await api.importUsers(formData);
        const data = response;

        toast.add({
            severity: 'success',
            summary: 'Importación completa',
            detail: `${data.importados} contenidos importados. ${data.message}`,
            life: 10000
        });

        if (data.errores && data.errores.length > 0) {
            data.errores.forEach((error) => {
                toast.add({ severity: 'warn', summary: 'Error en fila', detail: error, life: 10000 });
            });
        }

        // Recargar contenidos
        emit('update:contents');
    } catch (error) {
        console.error(error);
        toast.add({ severity: 'error', summary: 'Error de importación', detail: 'No se pudo procesar el archivo', life: 10000 });
    }
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

const exportCSV = () => {
    dt.value.exportCSV();
};
const confirmDeleteSelected = () => {
    deleteUsersDialog.value = true;
};
const deleteSelectedContents = async () => {
    const ids = selectedUsers.value.map((user) => user.id);

    try {
        await api.deleteContents(props.pathId, ids);
        toast.add({ severity: 'success', summary: 'Eliminación exitosa', detail: 'Contenidos eliminados.', life: 3000 });
        emit('update:contents');
    } catch (error) {
        console.error(error);
        toast.add({ severity: 'error', summary: 'Error al eliminar', detail: 'No se pudieron eliminar los contenidos.', life: 5000 });
    } finally {
        deleteUsersDialog.value = false;
        selectedUsers.value = null;
    }
};

const getStatusLabel = (role) => {
    switch (role) {
        case 'active':
            return 'success';

        case 'blocked':
            return 'warn';

        case 'inactive':
            return 'danger';

        default:
            return 'info';
    }
};

const getRoleSeverity = (roleName) => {
    switch (roleName.toLowerCase()) {
        case 'admin':
            return 'danger';
        case 'member':
            return 'success';
        default:
            return 'secondary'; // Fallback
    }
};

const getPosiblePathContents = () => {
    api.getPosibleContents(props.pathId)
        .then((response) => {
            if (Object.keys(response).length === 0) {
                members.value = []; // Asigna un array vacío
                userDialog.value = true;
            } else {
                // Si la respuesta es un array, asígnala directamente
                if (Array.isArray(response)) {
                    members.value = response;
                    userDialog.value = true;
                } else {
                    // Si la respuesta es un objeto, conviértelo en un array
                    members.value = Object.values(response);
                    userDialog.value = true;
                }
            }
        })
        .catch((error) => {
            console.log(error);
        });
};

const getContents = async () => {
    try {
        const response = await api.getContents(props.pathId);
        pContents.value = response;
    } catch (error) {
        console.log(error);
    }
};

const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

onMounted(() => {
    getContents();
});
</script>
