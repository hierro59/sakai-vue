<template>
    <div class="card">
        <!-- USUARIOS -->
        <Toolbar class="mb-6">
            <template #start>
                <Button label="New User" icon="pi pi-plus" class="mr-2" @click="openDialog" />
                <Button label="Delete" icon="pi pi-trash" severity="danger" outlined @click="confirmDeleteSelected" :disabled="!selectedUsers || !selectedUsers.length" />
            </template>

            <template #end>
                <FileUpload
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
                    v-tooltip.top="'Bulk upload of users'"
                />
                <Button label="Export" v-tooltip.bottom="'Download CSV'" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
            </template>
        </Toolbar>

        <div v-if="!users">
            <ProgressSpinner />
        </div>

        <DataTable
            v-else
            ref="dt"
            v-model:selection="selectedUsers"
            :value="users"
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
                    <h4 class="m-0">Manage users</h4>
                    <IconField>
                        <InputIcon>
                            <i class="pi pi-search" />
                        </InputIcon>
                        <InputText v-model="filters['global'].value" placeholder="Search..." />
                    </IconField>
                </div>
            </template>

            <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
            <Column field="id" header="ID" sortable style="min-width: 6rem"></Column>
            <Column field="first_name" header="First Name" sortable style="min-width: 12rem"></Column>
            <Column field="last_name" header="Last Name" sortable style="min-width: 12rem"></Column>
            <Column field="username" header="User Name" sortable style="min-width: 12rem"></Column>
            <Column field="email" header="Email" sortable style="min-width: 16rem"></Column>
            <Column header="Roles" style="min-width: 18rem">
                <template #body="slotProps">
                    <div class="flex flex-wrap gap-2">
                        <Tag v-for="role in slotProps.data.roles" :key="role.id" :value="role.name" :severity="getRoleSeverity(role.name)" />
                    </div>
                </template>
            </Column>

            <Column field="status" header="Status" sortable style="min-width: 6rem">
                <template #body="slotProps">
                    <Tag :value="slotProps.data.status" :severity="getStatusLabel(slotProps.data.status)" />
                </template>
            </Column>

            <Column :exportable="false" style="min-width: 12rem">
                <template #body="slotProps">
                    <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="openDialog(slotProps.data)" v-tooltip.top="'Edit user'" />
                    <Button icon="pi pi-key" outlined rounded class="mr-2" title="Send password reset email" v-if="slotProps.data.status !== 'inactive'" v-tooltip.top="'Send password reset email'" />
                    <Button icon="pi pi-trash" outlined rounded severity="danger" class="mr-2" @click="confirmDeleteUser(slotProps.data)" v-if="slotProps.data.status !== 'inactive'" v-tooltip.top="'Delete user'" />
                </template>
            </Column>
        </DataTable>

        <Dialog v-model:visible="userDialog" :style="{ width: '450px' }" :header="!user.id ? 'New User' : 'Edit User'" :modal="true">
            <div class="flex flex-col gap-6">
                <div>
                    <label for="first_name" class="block font-bold mb-3">First Name</label>
                    <InputText id="first_name" v-model.trim="user.first_name" required="true" autofocus :invalid="submitted && !user.first_name" fluid />
                    <small v-if="submitted && !user.first_name" class="text-red-500">First Name is required.</small>
                </div>

                <div>
                    <label for="last_name" class="block font-bold mb-3">Last Name</label>
                    <InputText id="last_name" v-model.trim="user.last_name" required="true" autofocus :invalid="submitted && !user.last_name" fluid />
                    <small v-if="submitted && !user.last_name" class="text-red-500">Last Name is required.</small>
                </div>

                <div>
                    <label for="username" class="block font-bold mb-3">User Name</label>
                    <InputText id="username" v-model.trim="user.username" required="true" autofocus :invalid="submitted && !user.username" fluid />
                </div>

                <div>
                    <label for="email" class="block font-bold mb-3">Email</label>
                    <InputText id="email" v-model.trim="user.email" required="true" autofocus :invalid="submitted && !user.email" fluid />
                    <small v-if="submitted && !user.email" class="text-red-500">Email is required.</small>
                </div>

                <div>
                    <label class="block font-bold mb-3">Assigned roles</label>
                    <div class="flex flex-wrap gap-2">
                        <Tag v-for="role in user.roles" :key="role.id || role.name" class="flex items-center gap-1" :severity="getRoleSeverity(role.name)">
                            {{ role.name }}
                            <Button icon="pi pi-times" text rounded class="p-0 ml-2" @click="removeRole(role.name)" />
                        </Tag>
                        <small v-if="submitted && !user.roles" class="text-red-500">Role is required.</small>
                    </div>
                </div>

                <div class="mt-4">
                    <label class="block font-bold mb-3">Add roles</label>
                    <MultiSelect v-model="newRoles" :options="availableRoles" optionLabel="name" dataKey="id" placeholder="Selecciona roles" class="w-full" />
                    <Button label="Add" icon="pi pi-plus" class="mt-2" @click="addRoles" :disabled="newRoles.length === 0" />
                </div>

                <div>
                    <label for="status" class="block font-bold mb-3">Status</label>
                    <Select id="status" v-model="user.status" :options="statuses" optionLabel="label" optionValue="value" placeholder="Select a Status" fluid></Select>
                </div>
            </div>

            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Save" icon="pi pi-check" @click="saveUser" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteUserDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="user"
                    >Are you sure you want to delete <b>{{ user.first_name }} {{ user.last_name }}</b> user?</span
                >
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteUserDialog = false" />
                <Button label="Yes" icon="pi pi-check" @click="deleteUser" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteUsersDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span>Are you sure you want to delete the selected {{ selectedUsers.length }} users?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteUsersDialog = false" />
                <Button label="Yes" icon="pi pi-check" text @click="deleteSelectedUsers" />
            </template>
        </Dialog>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import api from '@/service/settings/ApiUserSettings.js';

const getUsers = () => {
    api.getUsers()
        .then((response) => {
            if (Object.keys(response).length === 0) {
                users.value = [];
            } else {
                // Si la respuesta es un array, asígnala directamente
                if (Array.isArray(response)) {
                    users.value = response;
                } else {
                    // Si la respuesta es un objeto, conviértelo en un array
                    users.value = Object.values(response);
                }
            }
        })
        .catch((error) => {
            console.log(error);
        });
};

const toast = useToast();
const dt = ref();
const users = ref();
const userDialog = ref(false);
const deleteUserDialog = ref(false);
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

const emptyUser = {
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    status: 'active',
    roles: []
};

const user = ref({ ...emptyUser });

const allRoles = [
    { id: 2, name: 'Admin' },
    { id: 3, name: 'Instructor' },
    { id: 4, name: 'Student' },
    { id: 5, name: 'Guest' }
];

const availableRoles = computed(() => {
    const assignedIds = user.value.roles?.map((r) => r.id) || [];
    return allRoles.filter((role) => !assignedIds.includes(role.id));
});

const newRoles = ref([]);

const removeRole = (roleName) => {
    user.value.roles = user.value.roles.filter((role) => role.name !== roleName);
};

const addRoles = () => {
    if (!Array.isArray(user.value.roles)) {
        user.value.roles = [];
    }

    user.value.roles = [...user.value.roles, ...newRoles.value];
    newRoles.value = [];
};

const openDialog = (data) => {
    if (data) {
        user.value = { ...data };
    } else {
        user.value = { ...emptyUser };
        submitted.value = false;
        userDialog.value = true;
    }
    userDialog.value = true;
};

const hideDialog = () => {
    userDialog.value = false;
    submitted.value = false;
};
const saveUser = () => {
    if (!user.value.first_name || !user.value.last_name || !user.value.email || !user.value.roles) {
        submitted.value = true;
        toast.add({ severity: 'error', summary: 'Error', detail: 'All fields are required', life: 3000 });
        return;
    }

    if (user.value.id) {
        api.updateUser(user.value)
            .then((response) => {
                console.log(response);
                getUsers();
                toast.add({ severity: 'success', summary: 'Successful', detail: 'User Updated', life: 3000 });
            })
            .catch((error) => {
                console.log(error);
                let errorMessage = 'Error al actualizar el usuario.';

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
        api.createUser(user.value)
            .then((response) => {
                console.log(response);
                getUsers();
                toast.add({ severity: 'success', summary: 'Successful', detail: 'User Created', life: 3000 });
            })
            .catch((error) => {
                console.log(error);
                let errorMessage = 'Error al crear el usuario.';

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
    userDialog.value = false;
};
const confirmDeleteUser = (prod) => {
    user.value = prod;
    deleteUserDialog.value = true;
};
const deleteUser = () => {
    api.deleteUser(user.value.id)
        .then((response) => {
            console.log(response);
            getUsers();
            toast.add({ severity: 'success', summary: 'Successful', detail: 'User Deleted', life: 3000 });
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
    deleteUserDialog.value = false;
    user.value = { ...emptyUser };
};

const handleExcelImport = async (event) => {
    const file = event.files[0];

    if (!file) {
        toast.add({ severity: 'warn', summary: 'Required file', detail: 'Select a valid Excel file', life: 3000 });
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await api.importUsers(formData);
        const data = response;

        toast.add({
            severity: 'success',
            summary: 'Import completed',
            detail: `${data.importados} imported users. ${data.message}`,
            life: 10000
        });

        if (data.errores && data.errores.length > 0) {
            data.errores.forEach((error) => {
                toast.add({ severity: 'warn', summary: 'Error in row', detail: error, life: 10000 });
            });
        }

        // Recargar usuarios si tienes método
        getUsers();
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
        await api.deleteUsers(ids);
        users.value = users.value.filter((user) => !ids.includes(user.id));
        toast.add({ severity: 'success', summary: 'Eliminación exitosa', detail: 'Usuarios eliminados.', life: 3000 });
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
            return 'warning';
        case 'super admin':
            return 'danger';
        case 'student':
            return 'success';
        case 'instructor':
            return 'info';
        case 'guest':
            return 'secondary';
        default:
            return 'secondary'; // Fallback
    }
};

onMounted(() => {
    getUsers();
});
</script>
