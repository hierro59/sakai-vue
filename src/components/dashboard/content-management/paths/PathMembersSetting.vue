<template>
    <div class="card">
        <!-- USUARIOS -->
        <Toolbar class="mb-6">
            <template #start>
                <Button :label="t('newMember')" icon="pi pi-plus" class="mr-2" @click="openDialog" />
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

        <DataTable
            ref="dt"
            v-model:selection="selectedUsers"
            :value="usersLocal"
            dataKey="id"
            :paginator="true"
            :rows="10"
            :filters="filters"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[5, 10, 25]"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} users"
        >
            <template #header>
                <div class="flex flex-wrap gap-2 items-center justify-between">
                    <h4 class="m-0">{{ t('manageUsers') }}</h4>
                    <IconField>
                        <InputIcon>
                            <i class="pi pi-search" />
                        </InputIcon>
                        <InputText v-model="filters['global'].value" :placeholder="t('search')" />
                    </IconField>
                </div>
            </template>

            <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
            <Column field="id" header="ID" sortable style="min-width: 6rem"></Column>
            <Column field="first_name" :header="t('firstName')" sortable style="min-width: 12rem"></Column>
            <Column field="last_name" :header="t('lastName')" sortable style="min-width: 12rem"></Column>
            <Column field="email" :header="t('email')" sortable style="min-width: 16rem"></Column>
            <Column header="Rol" style="min-width: 6rem">
                <template #body="slotProps">
                    <Tag :value="slotProps.data.pivot?.role ?? 'No role'" :severity="getRoleSeverity(slotProps.data.pivot?.role ?? 'No role')" />
                </template>
            </Column>

            <Column field="status" :header="t('status')" sortable style="min-width: 6rem">
                <template #body="slotProps">
                    <Tag :value="slotProps.data.status" :severity="getStatusLabel(slotProps.data.status)" />
                </template>
            </Column>

            <Column :exportable="false" style="min-width: 12rem">
                <template #body="slotProps">
                    <Button icon="pi pi-arrow-right-arrow-left" id="change-role" severity="primary" rounded class="mr-2" @click="openDialog(slotProps.data.id)" v-tooltip.top="'Change role'" />
                    <Button icon="pi pi-trash" outlined rounded severity="danger" class="mr-2" @click="confirmDeleteMember(slotProps.data)" v-if="slotProps.data.status !== 'inactive'" v-tooltip.top="'Delete from path'" />
                </template>
            </Column>
        </DataTable>

        <Dialog v-model:visible="userDialog" :style="{ width: '70%' }" :modal="true">
            <DataTable
                ref="dt"
                v-model:selection="selectedMembers"
                :value="members"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} users"
            >
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">{{ t('selectNewMembers') }}</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" :placeholder="t('search')" />
                        </IconField>
                    </div>
                </template>

                <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
                <Column field="id" header="ID" sortable style="min-width: 6rem"></Column>
                <Column field="first_name" :header="t('firstName')" sortable style="min-width: 12rem"></Column>
                <Column field="last_name" :header="t('lastName')" sortable style="min-width: 12rem"></Column>
                <Column field="email" :header="t('email')" sortable style="min-width: 16rem"></Column>
                <Column field="status" :header="t('status')" sortable style="min-width: 6rem">
                    <template #body="slotProps">
                        <Tag :value="slotProps.data.status" :severity="getStatusLabel(slotProps.data.status)" />
                    </template>
                </Column>
            </DataTable>
            <template #footer>
                <Button :label="t('cancel')" icon="pi pi-times" text @click="hideDialog" />
                <Button :label="t('save')" icon="pi pi-check" @click="saveMembers" :disabled="!selectedMembers || !selectedMembers.length" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteMemberDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="user"
                    >{{ t('confirmDelete') }} <b>{{ user.first_name }} {{ user.last_name }}</b
                    >?</span
                >
            </div>
            <template #footer>
                <Button :label="t('no')" icon="pi pi-times" text @click="deleteMemberDialog = false" />
                <Button :label="t('yes')" icon="pi pi-check" @click="deleteMember" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteUsersDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span>{{ t('confirmDelete') }} {{ selectedUsers.length }}?</span>
            </div>
            <template #footer>
                <Button :label="t('no')" icon="pi pi-times" text @click="deleteUsersDialog = false" />
                <Button :label="t('yes')" icon="pi pi-check" text @click="deleteSelectedUsers" />
            </template>
        </Dialog>
    </div>
</template>

<script setup>
import { ref, defineProps, watchEffect, defineEmits } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import api from '@/service/content-management/ApiLearningPaths';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const emit = defineEmits(['update:members']);

const props = defineProps({
    pathCode: {
        type: String || undefined,
        required: true
    },
    users: {
        type: Array,
        default: () => []
    }
});

const usersLocal = ref([]);

watchEffect(() => {
    if (props.users.length > 0) {
        usersLocal.value = [...props.users];
    } else {
        console.log('❌ Usuarios vacíos todavía');
    }
});

const toast = useToast();
const dt = ref();
const userDialog = ref(false);
const deleteMemberDialog = ref(false);
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
    getPosiblePathMembers();
};

const hideDialog = () => {
    userDialog.value = false;
    submitted.value = false;
};
const saveMembers = () => {
    console.log(selectedMembers.value);

    api.addPathMembers(props.pathCode, selectedMembers.value)
        .then((response) => {
            console.log(response);
            toast.add({ severity: 'success', summary: 'Successful', detail: t('membersAdded'), life: 3000 });
            emit('update:members');
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

const confirmDeleteMember = (prod) => {
    user.value = prod;
    deleteMemberDialog.value = true;
};
const deleteMember = () => {
    api.deletePathMembers(props.pathCode, [user.value.id])
        .then((response) => {
            console.log(response);
            toast.add({ severity: 'success', summary: 'Successful', detail: t('userDeleted'), life: 3000 });
            emit('update:members');
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
    deleteMemberDialog.value = false;
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
        emit('update:members');
    } catch (error) {
        console.error(error);
        toast.add({ severity: 'error', summary: 'Error de importación', detail: 'No se pudo procesar el archivo', life: 10000 });
    }
};

const exportCSV = () => {
    dt.value.exportCSV();
};
const confirmDeleteSelected = () => {
    deleteUsersDialog.value = true;
};
const deleteSelectedUsers = async () => {
    const ids = selectedUsers.value.map((user) => user.id);

    try {
        await api.deletePathMembers(props.pathCode, ids);
        toast.add({ severity: 'success', summary: 'Delete successful', detail: 'Users deleted.', life: 3000 });
        emit('update:members');
    } catch (error) {
        console.error(error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Error deleting users.', life: 5000 });
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

const getPosiblePathMembers = () => {
    api.getPosiblePathMembers(props.pathCode)
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
</script>
