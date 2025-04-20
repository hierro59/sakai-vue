<template>
    <div v-if="loading">
        <Loading />
    </div>
    <div v-else>
        <Tabs value="0">
            <TabList>
                <Tab value="0"><i class="pi pi-pencil mr-2"></i>Comunidad</Tab>
                <Tab value="1"><i class="pi pi-share-alt mr-2"></i>Miembros</Tab>
                <Tab value="2"><i class="pi pi-share-alt mr-2"></i>Contenidos</Tab>
            </TabList>
            <TabPanels>
                <TabPanel value="0">
                    <FloatLabel class="mt-4">
                        <label for="name">Nombre de la comunidad</label>
                        <InputText id="name" v-model.trim="community.name" required="true" autofocus :invalid="submitted && !community.name" fluid class="mb-4 text-2xl font-bold" />
                    </FloatLabel>
                    <small v-if="submitted && !community.name" class="text-red-500">First Name is required.</small>

                    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div class="col-span-1">
                            <img v-if="community.banner_url" :src="community?.banner_url" alt="Image" class="shadow-md rounded-xl w-full" />
                            <FileUpload mode="basic" @select="onFileSelectPresentation" :chooseLabel="community.banner_url ? 'Change Image' : 'Upload Image'" customUpload auto severity="secondary" class="p-button-outlined mt-4" />
                            <small v-if="submitted && !community.banner_url" class="text-red-500">Image is required.</small>
                        </div>
                        <div class="col-span-2">
                            <h3 class="text-xl font-semibold mb-2">Descripción</h3>
                            <Textarea id="description" v-model.trim="community.description" required="true" :invalid="submitted && !community.description" rows="5" cols="50" autoResize />
                            <small v-if="submitted && !community.description" class="text-red-500">Description is required.</small>
                            <div class="flex gap-8 items-center mt-4">
                                <div class="flex flex-col items-start">
                                    <label for="is_public" class="font-bold mb-1">¿Pública?</label>
                                    <ToggleButton id="is_public" v-model="community.is_public" :onLabel="'Sí'" :offLabel="'No'" :style="{ width: '100px' }" />
                                </div>

                                <div class="flex flex-col items-start" v-if="!community.is_public">
                                    <label for="is_visible" class="font-bold mb-1">¿Visible?</label>
                                    <ToggleButton id="is_visible" v-model="community.is_visible" :onLabel="'Sí'" :offLabel="'No'" :style="{ width: '100px' }" />
                                </div>
                            </div>

                            <div class="flex items-center gap-1 mt-4">
                                <i class="pi pi-users text-2xl"></i>
                                <span class="text-2xl">{{ community.users?.length ?? 0 }}</span> Usuarios
                            </div>
                            <div class="flex items-center gap-1 mt-4">
                                <i class="pi pi-book text-2xl"></i>
                                <span class="text-2xl">{{ community.contents?.length ?? 0 }}</span> Contenidos
                            </div>
                        </div>
                    </div>
                    <div class="flex justify-end mt-4">
                        <Button label="Guardar" icon="pi pi-save" @click="saveCommunity" class="p-button-primary" />
                    </div>
                </TabPanel>
                <TabPanel value="1" v-if="community.id">
                    <CommunityMembersSetting :communityId="community.id" :users="users" @update:members="getComunity()" />
                </TabPanel>
                <TabPanel value="2">
                    <Statistics />
                </TabPanel>
            </TabPanels>
        </Tabs>
    </div>
</template>

<script setup>
import { ref, onMounted, defineEmits, defineProps } from 'vue';
import Loading from '@/components/global/Loading.vue';
import { useToast } from 'primevue/usetoast';
import api from '@/service/settings/ApiCommunities';
import CommunityMembersSetting from './CommunityMembersSetting.vue';

const toast = useToast();
const loading = ref(false);
const bottomLoading = ref(false);
const submitted = ref(false);

const props = defineProps({
    communityId: {
        type: Number || undefined,
        required: true
    }
});

const community = ref({});
const users = ref([]);

const emit = defineEmits(['update:communityId']);
const getComunity = async () => {
    loading.value = true;
    try {
        const response = await api.getCommunityById(props.communityId);
        if (response) {
            console.log(response);
            community.value = response;
            await getCommunityMembers(community.value.id);
        } else {
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar la comunidad', life: 3000 });
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar la comunidad', life: 3000 });
    } finally {
        loading.value = false;
    }
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

const getCommunityMembers = async (communityId) => {
    try {
        const response = await api.getCommunityMembers(communityId);
        if (Object.keys(response).length === 0) {
            users.value = [];
        } else if (Array.isArray(response)) {
            users.value = response;
        } else {
            users.value = Object.values(response);
        }
        console.log('Usuarios cargados:', users.value); // Verifica aquí
    } catch (error) {
        console.log(error);
    }
};

const saveCommunity = () => {
    submitted.value = true;
    api.updateCommunity(community.value)
        .then((response) => {
            console.log(response);
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Community Updated', life: 3000 });
        })
        .catch((error) => {
            console.log(error);
            let errorMessage = 'Error al actualizar el usuario.';

            const serverData = error.response?.data;

            // Extrae el mensaje del campo errorInfo si está presente
            if (serverData?.data?.error?.errorInfo && Array.isArray(serverData.data.error.errorInfo) && serverData.data.error.errorInfo.length > 2) {
                errorMessage = serverData.data.error.errorInfo[2]; // Toma el tercer elemento del array
            } else if (serverData?.data?.error) {
                errorMessage = serverData.data.error; // Toma el mensaje de error directamente
            } else if (serverData?.message) {
                errorMessage = serverData.message; // Toma el mensaje de error directamente
            }

            toast
                .add({
                    severity: 'error',
                    summary: 'Error',
                    detail: errorMessage,
                    life: 3000 // Cambia la duración del toast
                })
                .finally(() => {
                    bottomLoading.value = false;
                });
        });
};

onMounted(() => {
    getComunity();
});
</script>
