<template>
    <div class="card">
        <!-- CONTENIDOS -->
        <Toolbar class="mb-6">
            <template #start>
                <Button label="New Content" icon="pi pi-plus" class="mr-2" @click="openDialog" />
                <Button label="Delete" icon="pi pi-trash" severity="danger" outlined @click="confirmDeleteSelected" :disabled="!selectedUsers || !selectedUsers.length" />
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
                    v-tooltip.top="'Coming soon'"
                />
                <Button label="Export" v-tooltip.bottom="'Download CSV'" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
            </template>
        </Toolbar>
        <SuggestCoursesButton :pathId="props.pathId" @update:contents="getContents" />
        <DataTable
            ref="dt"
            v-model:selection="selectedUsers"
            :value="contents"
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
                    <h4 class="m-0">Manage Content</h4>
                    <IconField>
                        <InputIcon>
                            <i class="pi pi-search" />
                        </InputIcon>
                        <InputText v-model="filters['global'].value" placeholder="Search..." />
                    </IconField>
                </div>
            </template>
            <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
            <Column field="type" header="Type" sortable style="min-width: 6rem"></Column>
            <Column field="title" header="Title" sortable style="min-width: 12rem"></Column>
            <Column field="description" header="Description" sortable style="min-width: 20rem">
                <template #body="{ data }">
                    {{ truncateText(data.description, 100) }}
                </template>
            </Column>
            <Column field="access_type" header="Access Type" sortable style="min-width: 8rem"></Column>
            <Column :exportable="false" style="min-width: 12rem">
                <template #body="slotProps">
                    <Button icon="pi pi-trash" outlined rounded severity="danger" class="mr-2" @click="confirmDeleteContent(slotProps.data)" v-if="slotProps.data.status !== 'inactive'" v-tooltip.top="'Delete content'" />
                </template>
            </Column>
        </DataTable>

        <Dialog v-model:visible="userDialog" :style="{ width: '70%' }" :modal="true">
            <DataTable
                ref="dt"
                v-model:selection="selectedMembers"
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
                        <h4 class="m-0">Seleccione nuevos miembros</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Search..." />
                        </IconField>
                    </div>
                </template>
                <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
                <Column field="type" header="Type" sortable style="min-width: 6rem"></Column>
                <Column field="title" header="Title" sortable style="min-width: 12rem"></Column>
                <Column field="description" header="Description" sortable style="min-width: 16rem"></Column>
                <Column field="access_type" header="Access Type" sortable style="min-width: 8rem"></Column>
            </DataTable>
            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Save" icon="pi pi-check" @click="saveMembers" :disabled="!selectedMembers || !selectedMembers.length" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteContentDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="user"
                    >Are you sure you want to delete <b>{{ user.type === 'course' ? user.title : user.name }}</b> content?</span
                >
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteContentDialog = false" />
                <Button label="Yes" icon="pi pi-check" @click="deleteContent" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteUsersDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span>¿Estás seguro de que deseas eliminar los {{ selectedUsers.length }} usuarios seleccionados?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteUsersDialog = false" />
                <Button label="Yes" icon="pi pi-check" text @click="deleteSelectedContents" />
            </template>
        </Dialog>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, defineProps, watchEffect, defineEmits } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { Tooltip, Tag } from 'primevue';
import api from '@/service/content-management/ApiLearningPaths';
import router from '@/router';
import SuggestCoursesButton from './SuggestCoursesButton.vue';

const emit = defineEmits(['update:members']);

const props = defineProps({
    pathId: {
        type: Number || undefined,
        required: true
    }
});

const contents = ref([]);

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
const selectedMembers = ref();

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
const saveMembers = () => {
    api.addContents(props.pathId, selectedMembers.value)
        .then((response) => {
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Members Added', life: 3000 });
            emit('update:contents');
            selectedMembers.value = null;
        })
        .catch((error) => {
            console.log(error);
            let errorMessage = 'Error al agregar los miembros.';

            const serverData = error.response?.data;

            // Extrae el mensaje del campo errorInfo si está presente
            if (serverData?.data?.error?.errorInfo && Array.isArray(serverData.data.error.errorInfo) && serverData.data.error.errorInfo.length > 2) {
                errorMessage = serverData.data.error.errorInfo[2];
            } else if (serverData?.message) {
                errorMessage = serverData.message;
            }
            selectedMembers.value = null;

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
            toast.add({ severity: 'success', summary: 'Successful', detail: 'User Deleted', life: 3000 });
            emit('update:contents');
        })
        .catch((error) => {
            console.log(error);
            let errorMessage = 'Error al eliminar el usuario.';

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
            detail: `${data.importados} usuarios importados. ${data.message}`,
            life: 10000
        });

        if (data.errores && data.errores.length > 0) {
            data.errores.forEach((error) => {
                toast.add({ severity: 'warn', summary: 'Error en fila', detail: error, life: 10000 });
            });
        }

        // Recargar usuarios
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
        toast.add({ severity: 'success', summary: 'Eliminación exitosa', detail: 'Usuarios eliminados.', life: 3000 });
        emit('update:contents');
    } catch (error) {
        console.error(error);
        toast.add({ severity: 'error', summary: 'Error al eliminar', detail: 'No se pudieron eliminar los usuarios.', life: 5000 });
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
        contents.value = response;
        console.log('Path cargados:', contents.value);
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
