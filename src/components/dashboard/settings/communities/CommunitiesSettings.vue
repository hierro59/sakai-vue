<template>
    <div class="card">
        <!-- COMUNIDADES -->
        <Toolbar class="mb-6">
            <template #start>
                <Button label="Nuevo" icon="pi pi-plus" class="mr-2" @click="openDialog" />
                <Button label="Eliminar" icon="pi pi-trash" severity="danger" outlined @click="confirmDeleteSelected" :disabled="!selectedCommunities || !selectedCommunities.length" />
            </template>

            <template #end>
                <Button label="Export" v-tooltip.bottom="'Download CSV'" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
            </template>
        </Toolbar>

        <DataTable
            ref="dt"
            v-model:selection="selectedCommunities"
            :value="communities"
            dataKey="id"
            :paginator="true"
            :rows="10"
            :filters="filters"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[5, 10, 25]"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} communities"
        >
            <template #header>
                <div class="flex flex-wrap gap-2 items-center justify-between">
                    <h4 class="m-0">Administre las comunidades</h4>
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
            <Column field="name" header="Name" sortable style="min-width: 12rem"></Column>
            <Column field="description" header="Description" sortable style="min-width: 12rem"></Column>

            <Column field="is_public" header="Is Public" sortable style="min-width: 6rem">
                <template #body="slotProps">
                    <i class="pi pi-check mr-2" v-if="slotProps.data.is_public" />
                    <i class="pi pi-times mr-2" v-else />
                </template>
            </Column>

            <Column :exportable="false" style="min-width: 12rem">
                <template #body="slotProps">
                    <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="openComunitySettingDialog(slotProps.data.id)" />
                    <Button icon="pi pi-trash" outlined rounded severity="danger" class="mr-2" @click="confirmDeleteCommunity(slotProps.data)" v-if="slotProps.data.status !== 'inactive'" />
                </template>
            </Column>
        </DataTable>

        <Dialog v-model:visible="communityDialog" :style="{ width: '450px' }" :header="!community.id ? 'New Community' : 'Edit Community'" :modal="true">
            <div class="flex flex-col gap-6">
                <!-- BANNER DE IMAGEN DE COMUNIDAD -->
                <div>
                    <label for="banner_url" class="block font-bold mb-3">Image</label>
                    <img v-if="community.banner_url" :src="community?.banner_url" alt="Image" class="shadow-md rounded-xl w-full" />
                    <FileUpload mode="basic" @select="onFileSelectPresentation" :chooseLabel="community.banner_url ? 'Change Image' : 'Upload Image'" customUpload auto severity="secondary" class="p-button-outlined mt-4" />
                    <small v-if="submitted && !community.banner_url" class="text-red-500">Image is required.</small>
                </div>

                <div>
                    <label for="name" class="block font-bold mb-3">Name</label>
                    <InputText id="name" v-model.trim="community.name" required="true" autofocus :invalid="submitted && !community.name" fluid />
                    <small v-if="submitted && !community.name" class="text-red-500">First Name is required.</small>
                </div>

                <div>
                    <label for="description" class="block font-bold mb-3">Description</label>
                    <Textarea id="description" v-model.trim="community.description" required="true" :invalid="submitted && !community.description" rows="5" cols="50" autoResize />
                    <small v-if="submitted && !community.description" class="text-red-500">Description is required.</small>
                </div>

                <!--  Is Publi Toggle -->
                <div>
                    <label for="is_public" class="block font-bold mb-3">Is Public</label>
                    <ToggleButton id="is_public" v-model="community.is_public" :onLabel="'Yes'" :offLabel="'No'" :style="{ width: '100px' }" />
                </div>
                <div v-if="!community.is_public">
                    <label for="is_visible" class="block font-bold mb-3">Is Visible</label>
                    <ToggleButton id="is_visible" v-model="community.is_visible" :onLabel="'Yes'" :offLabel="'No'" :style="{ width: '100px' }" />
                </div>
            </div>

            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Save" icon="pi pi-check" @click="saveCommunity" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteCommunityDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="community"
                    >Are you sure you want to delete <b>{{ community.name }} </b> Community?</span
                >
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteCommunityDialog = false" />
                <Button label="Yes" icon="pi pi-check" @click="deleteCommunity" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteCommunitiesDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span>¿Estás seguro de que deseas eliminar las {{ selectedCommunities.length }} comunidades seleccionadas?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteCommunitiesDialog = false" />
                <Button label="Yes" icon="pi pi-check" text @click="deleteSelectedCommunities" />
            </template>
        </Dialog>
        <Dialog v-model:visible="communitySettingDialog" :style="{ width: '80%' }" header="Community Settings" :modal="true">
            <CommunitySetting v-if="community.id !== null" :communityId="community.id" @close="communitySettingDialog = null" />
        </Dialog>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { Tooltip, Tag } from 'primevue';
import api from '@/service/settings/ApiCommunities';
import router from '@/router';

const toast = useToast();
const dt = ref();
const communities = ref();
const communityDialog = ref(false);
const deleteCommunityDialog = ref(false);
const deleteCommunitiesDialog = ref(false);
const selectedCommunities = ref();
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);

const emptyCommunity = {
    id: null,
    name: '',
    description: '',
    banner_url: '',
    users: [],
    contents: []
};

const community = ref({
    id: null,
    name: '',
    description: '',
    banner_url: '',
    users: [],
    contents: []
});

const communitySettingDialog = ref(false);

const openComunitySettingDialog = (id) => {
    console.log('openComunitySettingDialog', id);
    community.value.id = id;
    communitySettingDialog.value = true;
};

const openDialog = (data) => {
    if (data) {
        community.value = { ...data };
    } else {
        community.value = { ...emptyCommunity };
        submitted.value = false;
        communityDialog.value = true;
    }
    communityDialog.value = true;
};

const hideDialog = () => {
    communityDialog.value = false;
    submitted.value = false;
};

const getCommunities = () => {
    api.getCommunities()
        .then((response) => {
            if (Object.keys(response).length === 0) {
                communities.value = []; // Asigna un array vacío
            } else {
                // Si la respuesta es un array, asígnala directamente
                if (Array.isArray(response)) {
                    communities.value = response;
                } else {
                    // Si la respuesta es un objeto, conviértelo en un array
                    communities.value = Object.values(response);
                }
            }
        })
        .catch((error) => {
            console.log(error);
        });
};
const saveCommunity = () => {
    if (!community.value.name || !community.value.description || !community.value.banner_url) {
        submitted.value = true;
        toast.add({ severity: 'error', summary: 'Error', detail: 'All fields are required', life: 3000 });
        return;
    }

    if (community.value.id) {
        api.updateCommunity(community.value)
            .then((response) => {
                console.log(response);
                getCommunities();
                toast.add({ severity: 'success', summary: 'Successful', detail: 'Community Updated', life: 3000 });
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
        api.createCommunity(community.value)
            .then((response) => {
                console.log(response);
                getCommunities();
                toast.add({ severity: 'success', summary: 'Successful', detail: 'Community Created', life: 3000 });
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
    communityDialog.value = false;
};
const confirmDeleteCommunity = (prod) => {
    community.value = prod;
    deleteCommunityDialog.value = true;
};
const deleteCommunity = () => {
    api.deleteCommunity(community.value.id)
        .then((response) => {
            console.log(response);
            getCommunities();
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Community Deleted', life: 3000 });
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
    deleteCommunityDialog.value = false;
    community.value = { ...emptyCommunity };
};

const exportCSV = () => {
    dt.value.exportCSV();
};
const confirmDeleteSelected = () => {
    deleteCommunitiesDialog.value = true;
};
const deleteSelectedCommunities = async () => {
    const ids = selectedCommunities.value.map((community) => community.id);

    try {
        await api.deleteUsers(ids);

        communities.value = communities.value.filter((community) => !ids.includes(community.id));

        toast.add({ severity: 'success', summary: 'Eliminación exitosa', detail: 'Comunidades eliminadas.', life: 3000 });
    } catch (error) {
        console.error(error);
        toast.add({ severity: 'error', summary: 'Error al eliminar', detail: 'No se pudieron eliminar las comunidades.', life: 5000 });
    } finally {
        deleteCommunitiesDialog.value = false;
        selectedCommunities.value = null;
    }
};

const getStatusLabel = (isPublic) => {
    if (isPublic) return 'info';

    if (!isPublic) return 'danger';
};

function onFileSelectPresentation(event) {
    const file = event.files[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
        if (!community.value) {
            console.error('community.value es null o undefined');
            return;
        }

        if (!community.value.banner_url) {
            community.value.banner_url = {};
        }

        community.value.banner_url = e.target.result;
    };

    reader.readAsDataURL(file);
}

onMounted(() => {
    getCommunities();
});
</script>
