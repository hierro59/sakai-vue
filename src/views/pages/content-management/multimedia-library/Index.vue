<template>
    <div class="p-6">
        <h1 class="text-2xl font-bold mb-4">{{ t('multimediaLibrary') }}</h1>
        <div class="card">
            <div v-if="mediaGroupedByType">
                <MediaGroup v-for="(items, type) in mediaGroupedByType" :key="type" :title="type" :items="items" />
            </div>
            <div v-else>
                <ProgressSpinner />
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import ApiMedia from '@/service/media/ApiMediaLibrary';
import MediaGroup from './MediaGroup.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const mediaGroupedByType = ref(null);

const fetchMedia = async () => {
    ApiMedia.getMedia().then((res) => {
        mediaGroupedByType.value = res.data;
    });
};

onMounted(() => {
    fetchMedia();
});
</script>
