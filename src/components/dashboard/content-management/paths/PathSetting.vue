<template>
    <div v-if="loading">
        <Loading />
    </div>
    <div v-else-if="ready">
        <h3 class="text-xl font-semibold mb-2">{{ path.title }}</h3>
        <Tabs value="0">
            <TabList>
                <Tab value="0"><i class="pi pi-home mr-2"></i>Path</Tab>
                <Tab value="1"><i class="pi pi-users mr-2"></i>Members</Tab>
                <Tab value="2"><i class="pi pi-book mr-2"></i>Contents</Tab>
                <Tab value="3"><i class="pi pi-star mr-2"></i>Activities</Tab>
            </TabList>
            <TabPanels>
                <TabPanel value="0">
                    <FloatLabel class="mt-4">
                        <label for="title">Path Title</label>
                        <InputText id="title" v-model.trim="path.title" required="true" autofocus :invalid="submitted && !path.title" fluid class="mb-4 text-2xl font-bold" />
                    </FloatLabel>
                    <small v-if="submitted && !path.title" class="text-red-500">Title is required.</small>

                    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div class="col-span-1">
                            <img v-if="path.image" :src="path?.image" alt="Image" class="shadow-md rounded-xl w-full" />
                            <FileUpload mode="basic" @select="onFileSelectPresentation" :chooseLabel="path.image ? 'Change Image' : 'Upload Image'" customUpload auto severity="secondary" class="p-button-outlined mt-4" />
                            <small v-if="submitted && !path.image" class="text-red-500">Image is required.</small>
                        </div>
                        <div class="col-span-2">
                            <h3 class="text-xl font-semibold mb-2">Description</h3>
                            <Textarea id="description" v-model.trim="path.description" required="true" :invalid="submitted && !path.description" rows="5" cols="50" autoResize />
                            <small v-if="submitted && !path.description" class="text-red-500">Description is required.</small>
                            <Divider />
                            <div>
                                <span class="block font-bold mb-4">Access Type</span>
                                <div class="grid grid-cols-12 gap-4">
                                    <div class="grid grid-cols-12 gap-4">
                                        <div class="flex items-center gap-2 col-span-6">
                                            <RadioButton id="category1" v-model="path.access_type.type" name="access_type" value="free" checked @click="setAccessType('free')" />
                                            <label for="category1">Free</label>
                                        </div>
                                        <div class="flex items-center gap-2 col-span-6" v-if="IntegrationsResolve.existPaymentMethod(companyIntegrations)">
                                            <RadioButton id="category2" v-model="path.access_type.type" name="access_type" value="paid" @click="setAccessType('paid')" />
                                            <label for="category2">Paid</label>
                                        </div>
                                        <div class="flex items-center gap-2 col-span-6">
                                            <RadioButton id="category3" v-model="path.access_type.type" name="access_type" value="private" @click="setAccessType('private')" />
                                            <label for="category3">Private</label>
                                        </div>
                                        <div class="flex items-center gap-2 col-span-6">
                                            <RadioButton id="category4" v-model="path.access_type.type" name="access_type" value="subscription" @click="setAccessType('subscription')" />
                                            <label for="category4">Subscription</label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="grid grid-cols-12 gap-4 mt-4" v-if="path.access_type.type === 'paid'">
                                <div class="col-span-6">
                                    <label for="price" class="block font-bold mb-3">Price</label>
                                    <InputNumber id="price" v-model="path.access_type.price" mode="currency" currency="USD" locale="en-US" fluid />
                                </div>
                                <div class="col-span-6">
                                    <label for="discount" class="block font-bold mb-3">Discount % (optional)</label>
                                    <InputNumber id="discount" v-model="path.access_type.discount" integeronly fluid />
                                </div>
                            </div>

                            <div class="w-full mt-4" v-if="path.access_type.type === 'subscription'">
                                Select a Subscription Plan
                                <Select id="subscription" v-model="path.access_type.subscription" :options="subscriptions" optionLabel="name" placeholder="Select a Plan" fluid>
                                    <template #option="subscriptions">
                                        <div class="flex align-items-center">
                                            <span class="ml-2">{{ subscriptions.option.name }}</span>
                                        </div>
                                    </template>
                                </Select>
                            </div>
                            <Divider />
                            <div>
                                <label for="categories" class="block font-bold mb-3">Categories</label>
                                <MultiSelect id="categories" v-model="path.categories" :options="categories" optionLabel="name" dataKey="id" placeholder="Select one or more" display="chip" filter fluid />
                            </div>

                            <Divider />
                            <div class="flex items-center gap-1 mt-4">
                                <i class="pi pi-users text-2xl"></i>
                                <span class="text-2xl">{{ path.users ?? 0 }}</span> Users
                            </div>
                            <div class="flex items-center gap-1 mt-4">
                                <i class="pi pi-book text-2xl"></i>
                                <span class="text-2xl">{{ path.contents ?? 0 }}</span> Contents
                            </div>
                        </div>
                    </div>
                    <div class="flex justify-end mt-4">
                        <Button label="Save" icon="pi pi-save" @click="savePath" class="p-button-primary" />
                    </div>
                </TabPanel>
                <TabPanel value="1" v-if="props.pathCode">
                    <PathMembersSetting v-if="PathMembersSettingReady" :pathCode="props.pathCode" :users="users" @update:members="getPath()" />
                </TabPanel>
                <TabPanel value="2">
                    <PathContents :pathId="props.pathId" @update:contents="getPath()" />
                </TabPanel>
                <TabPanel value="3">
                    <div class="w-full h-full flex flex-col gap-4">
                        <div class="flex flex-col gap-4 w-full h-full overflow-auto">
                            <div class="flex flex-col gap-2 w-full h-full overflow-auto">
                                <h2 class="text-2xl font-bold">Activities</h2>
                                <p class="text-sm text-gray-500">Path Activities</p>
                            </div>
                            <div class="flex flex-col gap-2 w-full h-full overflow-auto">
                                <p class="text-sm text-gray-500">There are no activities available</p>
                            </div>
                        </div>
                    </div>
                </TabPanel>
            </TabPanels>
        </Tabs>
    </div>
</template>

<script setup>
import { ref, onMounted, defineEmits, defineProps, nextTick, inject } from 'vue';
import Loading from '@/components/global/Loading.vue';
import { useToast } from 'primevue/usetoast';
import api from '@/service/content-management/ApiLearningPaths';
import PathMembersSetting from './PathMembersSetting.vue';
import PathContents from './PathContents.vue';
import IntegrationsResolve from '@/service/IntegrationsResolve';
import eventBus from '@/service/eventBus';
import apiCategories from '@/service/content-management/ApiCategories';

const company = inject('company');
const companyIntegrations = ref(company.value.integrations ?? []);

const toast = useToast();
const ready = ref(false);
const loading = ref(false);
const bottomLoading = ref(false);
const submitted = ref(false);
const PathMembersSettingReady = ref(false);

const props = defineProps({
    pathCode: {
        type: String || undefined,
        required: true
    },
    pathId: {
        type: Number || undefined,
        required: true
    }
});

const path = ref({});
const users = ref([]);

const getPath = async () => {
    loading.value = true;
    try {
        const response = await api.getPathById(props.pathCode);
        if (response) {
            path.value = response.data;
            users.value = await getPathMembers(path.value.id);
        } else {
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error loading the path 1', life: 3000 });
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Error loading the path 2', life: 3000 });
    } finally {
        loading.value = false;
    }
};

function onFileSelectPresentation(event) {
    const file = event.files[0];
    const reader = new FileReader();

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

const getPathMembers = async () => {
    try {
        const responseUsers = await api.getPathMembers(props.pathId);
        const data = Array.isArray(responseUsers) ? [...responseUsers] : Object.values(responseUsers);
        PathMembersSettingReady.value = true;
        return data;
    } catch (error) {
        console.log(error);
        return [];
    }
};

const savePath = () => {
    submitted.value = true;
    if (!path.value.title || !path.value.description) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Title and description are required.', life: 3000 });
        return;
    }
    if (!path.value.image) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Image is required.', life: 3000 });
        return;
    }
    if (!path.value.access_type) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Access type is required.', life: 3000 });
        return;
    }
    let access_type = {
        type: path.value.access_type.type,
        price: path.value.access_type.price,
        discount: path.value.access_type.discount,
        invitations: path.value.access_type.invitations
    };
    // agregar acces_ypt a path.value
    path.value.access_type = access_type;
    console.log('path.value', path.value);
    api.updatePath(path.value)
        .then((response) => {
            console.log(response);
            eventBus.emit('updatePath', path.value);
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Path Updated', life: 3000 });
        })
        .catch((error) => {
            console.log(error);
            let errorMessage = 'Error al actualizar el path.';

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
                    life: 3000
                })
                .finally(() => {
                    bottomLoading.value = false;
                });
        });
};

const access_type = ref({});
const price = ref(0);
const discount = ref(0);
const invitations = ref([]);
const subscription = ref(false);

const subscriptions = ref([
    { name: 'Free', id: 1 },
    { name: 'Basic', id: 2 },
    { name: 'Premium', id: 3 }
]);
const setInvitation = ref('');

const setPrice = (price) => {
    if (price > 0) {
        price.value = price;
    } else {
        price.value = 0;
    }
};
const setDiscount = (discount) => {
    if (discount > 0) {
        discount.value = discount;
    } else {
        discount.value = 0;
    }
};
const setSubscription = (subscription) => {
    if (subscription) {
        subscription.value = subscription;
    } else {
        subscription.value = false;
    }
};

const addInvitation = (invitation) => {
    invitations.value.push({ email: invitation });
    setInvitation.value = '';
    access_type.value.invitations = invitations.value;
};

const removeInvitation = (index) => {
    invitations.value.splice(index, 1);
};

const setAccessType = (type) => {
    switch (type) {
        case 'free':
            price.value = 0;
            discount.value = 0;
            invitations.value = [];
            subscription.value = false;
            break;
        case 'paid':
            invitations.value = [];
            subscription.value = false;
            break;
        case 'private':
            price.value = 0;
            discount.value = 0;
            subscription.value = false;
            break;
        case 'subscription':
            price.value = 0;
            discount.value = 0;
            invitations.value = [];
            break;
        default:
            price.value = 0;
            discount.value = 0;
            invitations.value = [];
            subscription.value = false;
            break;
    }
    path.value.access_type = {
        type: type,
        price: price.value,
        discount: discount.value,
        invitations: invitations.value
    };
};

const categories = ref([]);

const getCategories = () => {
    apiCategories.getCategories().then((response) => {
        categories.value = response;
    });
};

onMounted(() => {
    getPath();
    getCategories();
    nextTick(); // Asegúrate de que DOM esté actualizado
    setTimeout(() => {
        ready.value = true;
    }, 100); // pequeño delay de seguridad
});
</script>
