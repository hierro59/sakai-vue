<template>
    <div class="card">
        <div class="md:w-full">
            <div class="card flex flex-col gap-4">
                <div class="font-semibold text-xl">Brand Configuration</div>
                <div class="flex flex-col gap-2">
                    <label for="name">Company Name</label>
                    <InputText id="name" type="text" v-model="companySettings.name" />
                </div>
                <div class="flex flex-col gap-2">
                    <label for="owner_name">Contact Name</label>
                    <InputText id="owner_name" type="text" v-model="companySettings.owner_name" />
                </div>
                <div class="flex flex-col gap-2">
                    <label for="owner_email">Contact Email</label>
                    <InputText id="owner_email" type="email" v-model="companySettings.owner_email" />
                </div>
                <div class="flex flex-col gap-2">
                    <label for="description">Description</label>
                    <Textarea id="description" rows="4" v-model="companySettings.description" />
                </div>
                <div class="flex flex-col gap-2">
                    <label for="slogan">Slogan</label>
                    <InputText id="slogan" type="text" v-model="companySettings.slogan" />
                </div>
                <div class="flex flex-wrap gap-4">
                    <div class="flex flex-col grow basis-0 gap-2">
                        <label for="email">Time Zone</label>
                        <TimeZoneSelect v-model="companySettings.timezone" />
                    </div>
                    <div class="flex flex-col grow basis-0 gap-2">
                        <label for="email2">Language</label>
                        <select
                            id="language"
                            v-model="companySettings.language"
                            class="bg-gray-50 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        >
                            <option v-for="language in languages" :key="language.code" :value="language.code">
                                {{ language.name }}
                            </option>
                        </select>
                    </div>
                </div>
                <Divider class="my-4"></Divider>
                <div class="flex flex-wrap gap-4">
                    <div class="flex flex-col grow basis-0 gap-2">
                        <Card class="w-full p-3 bg-gray-100">
                            <template #title>Company Logo</template>
                            <template #content>
                                <img v-if="companySettings.logo_url" :src="companySettings.logo_url" alt="Image" class="mb-6 shadow-md rounded-xl w-full p-2" />
                                <FileUpload
                                    mode="basic"
                                    :chooseLabel="companySettings.logo_url ? 'Change Image' : 'Upload Image'"
                                    accept="image/*"
                                    @select="onFileSelect($event, 'logo')"
                                    customUpload
                                    auto
                                    severity="secondary"
                                    class="p-button-outlined"
                                />
                            </template>
                        </Card>
                    </div>
                    <div class="flex flex-col grow basis-0 gap-2">
                        <Card class="w-full p-3 bg-gray-100">
                            <template #title>Company Favicon</template>
                            <template #content>
                                <img v-if="companySettings.favicon_url" :src="companySettings.favicon_url" alt="Image" class="mb-6 shadow-md rounded-xl w-12" />
                                <FileUpload
                                    mode="basic"
                                    :chooseLabel="companySettings.favicon_url ? 'Change Image' : 'Upload Image'"
                                    accept="image/*"
                                    @select="onFileSelect($event, 'favicon')"
                                    customUpload
                                    auto
                                    severity="secondary"
                                    class="p-button-outlined"
                                />
                            </template>
                        </Card>
                    </div>
                </div>
                <Divider class="my-4"></Divider>
                <div class="card flex flex-col gap-4">
                    <div class="font-semibold text-xl">Company Colors</div>
                    <div class="flex flex-wrap gap-4">
                        <div class="flex flex-col grow basis-0 gap-4">
                            <label for="color-picker">Primary Color</label>
                            <input id="color-picker" type="color" v-model="companySettings.primary_color" class="w-full" />
                            <InputText v-model="companySettings.primary_color" class="w-full" />
                        </div>
                        <div class="flex flex-col grow basis-0 gap-4">
                            <label for="color-picker">Secondary Color</label>
                            <input id="color-picker" type="color" v-model="companySettings.secondary_color" class="w-full" />
                            <InputText v-model="companySettings.secondary_color" class="w-full" />
                        </div>
                        <div class="flex flex-col grow basis-0 gap-4">
                            <label for="color-picker">Text Color</label>
                            <input id="color-picker" type="color" v-model="companySettings.text_color" class="w-full" />
                            <InputText v-model="companySettings.text_color" class="w-full" />
                        </div>
                        <div class="flex flex-col grow basis-0 gap-4">
                            <label for="color-picker">Link Color</label>
                            <input id="color-picker" type="color" v-model="companySettings.link_color" class="w-full" />
                            <InputText v-model="companySettings.link_color" class="w-full" />
                        </div>
                        <div class="flex flex-col grow basis-0 gap-4">
                            <label for="color-picker">Background Color</label>
                            <input id="color-picker" type="color" v-model="companySettings.background_color" class="w-full" />
                            <InputText v-model="companySettings.background_color" class="w-full" />
                        </div>
                    </div>
                </div>
            </div>
            <Divider class="my-4"></Divider>

            <div class="card flex flex-col gap-4">
                <div class="flex flex-wrap gap-4">
                    <div class="flex flex-col grow basis-0 gap-2"></div>
                    <div class="flex flex-col grow basis-0 gap-2">
                        <Button v-if="!buttomLoading" @click="saveSettings" label="Save" icon="pi pi-check" severity="primary" class="w-full max-w-[17.35rem] mx-auto"></Button>
                        <Button v-else label="Guardando..." class="w-full max-w-[17.35rem] mx-auto">
                            <ProgressSpinner style="height: 30px" strokeWidth="8" fill="transparent" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import TimeZoneSelect from '@/components/global/TimeZoneSelect.vue';
import { useToast } from 'primevue/usetoast';
import api from '@/service/settings/ApiBranding';

const toast = useToast();

const buttomLoading = ref(false);
const selectedTimezone = ref('');

const companySettings = ref({});

const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'pt_BR', name: 'Brazilian Portuguese' }
];

const onFileSelect = (event, type) => {
    const file = event.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
        if (type === 'favicon') {
            companySettings.value.favicon_url = e.target.result;
        }
        if (type === 'logo') {
            companySettings.value.logo_url = e.target.result;
        }
    };
    reader.readAsDataURL(file);
};

const getSettings = async () => {
    try {
        const response = await api.getBranding();
        companySettings.value = response;
    } catch (error) {
        console.error(error);
    }
};

const saveSettings = () => {
    buttomLoading.value = true;

    const data = {
        id: companySettings.value.id,
        favicon_url: companySettings.value.favicon_url,
        logo_url: companySettings.value.logo_url,
        primary_color: companySettings.value.primary_color,
        secondary_color: companySettings.value.secondary_color,
        text_color: companySettings.value.text_color,
        link_color: companySettings.value.link_color,
        background_color: companySettings.value.background_color,
        name: companySettings.value.name,
        owner_name: companySettings.value.owner_name,
        owner_email: companySettings.value.owner_email,
        description: companySettings.value.description,
        slogan: companySettings.value.slogan,
        timezone: companySettings.value.timezone,
        language: companySettings.value.language
    };

    api.updateBranding(data).then((response) => {
        console.log(response);
        buttomLoading.value = false;
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Settings Saved', life: 3000 });
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    });
};

onMounted(() => {
    getSettings();
});
</script>
