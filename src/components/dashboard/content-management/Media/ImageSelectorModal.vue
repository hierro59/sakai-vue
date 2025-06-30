<template>
    <div v-if="visible" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
        <div class="bg-white rounded-xl p-6 w-full max-w-xl shadow-lg relative">
            <button class="absolute top-2 right-2 text-gray-500 hover:text-black" @click="close">✕</button>
            <h2 class="text-lg font-semibold mb-4">{{ t('selectImage') }}</h2>

            <Tabs value="0" v-model="activeTab">
                <TabList>
                    <Tab value="0"> 📁 {{ t('multimediaLibrary') }}</Tab>
                    <Tab value="1"> 🌐 {{ t('fromUrl') }}</Tab>
                    <Tab value="2"> 📤 {{ t('uploadFile') }}</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel value="0">
                        <div class="max-h-64 overflow-y-auto">
                            <div v-if="media.length">
                                <div class="grid grid-cols-3 gap-3">
                                    <img v-for="img in media" :key="img.id" :src="img.url" class="w-full h-auto cursor-pointer hover:opacity-75 rounded" @click="select(img.url)" />
                                </div>
                            </div>
                            <div v-else class="text-gray-500 text-sm">
                                <ProgressSpinner v-if="loading" />
                                <span v-else>{{ t('noImages') }}</span>
                            </div>
                        </div>
                    </TabPanel>
                    <TabPanel value="1">
                        <div class="flex flex-col gap-3">
                            <input type="text" v-model="urlInput" placeholder="https://image.com/example.jpg" class="p-2 border rounded" />
                            <button @click="select(urlInput)" class="btn-primary self-start">{{ t('insert') }}</button>
                        </div>
                    </TabPanel>
                    <TabPanel value="2">
                        <div class="flex flex-col gap-3">
                            <FileUpload v-if="!uploading" mode="basic" :chooseLabel="t('uploadImage')" accept="image/*" @select="onFileSelect($event)" customUpload auto severity="secondary" class="p-button-outlined mb-4" />

                            <div v-if="uploading" class="text-sm text-gray-500">
                                <ProgressSpinner class="h-4" />
                            </div>
                        </div>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import ApiMedia from '@/service/media/ApiMediaLibrary';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// Props & emits
const props = defineProps({
    visible: Boolean,
    section: String
});
const emit = defineEmits(['close', 'selected']);

// Estado
const activeTab = ref('biblioteca');
const urlInput = ref('');
const media = ref([]);
const uploading = ref(false);
const loading = ref(true);

// Métodos
const close = () => emit('close');
const select = (url) => {
    if (!url) return;
    console.log('Seleccionaste la imagen:', url);
    emit('selected', url, props.section);
    close();
};

const type = ref(null);
// Cargar imágenes desde la biblioteca (simulado)
const fetchMedia = async () => {
    switch (props.section) {
        case 'presentation':
        case 'activity':
            type.value = 'image';
            break;
        case 'document':
            type.value = 'document';
            break;
        default:
            break;
    }
    const { data } = await ApiMedia.getMedia(type.value);
    if (data.image) {
        media.value = data?.image ?? [];
        loading.value = false;
    } else {
        media.value = data;
        loading.value = false;
    }
};

// Subir archivo
const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    uploading.value = true;
    try {
        const res = await ApiMedia.uploadMedia(formData, 'image');
        console.log('Imagen subida:', res);
        select(res.data.media.url);
    } catch (err) {
        console.error('Error al subir imagen:', err);
    } finally {
        uploading.value = false;
    }
};

const onFileSelect = (event) => {
    uploading.value = true;
    const file = event.files[0];
    const formData = new FormData();
    formData.append('file', file);
    const response = ApiMedia.uploadMedia(formData, 'image')
        .then((res) => {
            select(res.data.media.url);
        })
        .catch((err) => {
            console.error(err);
        });
};

watch(
    () => props.visible,
    (isVisible) => {
        if (isVisible) {
            fetchMedia();
        }
    }
);
</script>
