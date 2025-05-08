<template>
    <Card class="border border-surface-200 h-full justify-between dark:border-surface-700 rounded me-4">
        <template #header>
            <div class="relative">
                <img alt="user header" :src="course.image" class="card-image" />
                <div class="absolute top-2 right-2 z-1 flex flex-col items-end gap-1">
                    <Tag :value="resolveContent(course.content_type)" severity="info" />
                    <Badge v-if="course.has_new_version" value="Nueva versión" v-tooltip.top="'Existe una nueva versión de este curso'" severity="info" class="text-xs" />
                </div>
            </div>
        </template>

        <template #title>
            <div>
                <Tag v-if="course.access_type?.type === 'free'" icon="pi pi-star-fill" :value="formatAccessType(course.access_type.type)" />
                <Tag v-if="course.access_type?.type === 'private'" icon="pi pi-lock" :value="formatAccessType(course.access_type.type)" />
                <Tag v-if="course.access_type?.type === 'paid'" icon="pi pi-dollar" :value="formatAccessType(course.access_type.type)" />
                <Tag v-if="course.access_type?.type === 'subscription'" icon="pi pi-calendar-plus" :value="formatAccessType(course.access_type.type)" />
            </div>
            <div class="font-bold text-2xl">{{ course.title }}</div>
            <div class="flex flex-wrap gap-2 mt-2">
                <Tag v-for="cat in course.categories || []" :key="cat.id" :value="cat.name ? '#' + cat.name : 'uncategorized'" severity="info" class="text-xs" />
            </div>
        </template>

        <template #content>
            <p class="card-description">
                {{ stripHtml(course.description) }}
                <ProgressBar v-if="course.subscription_id != null" class="mt-2" :value="course.progress" />
            </p>
        </template>

        <template #footer>
            <div class="flex gap-4 mt-1">
                <!-- <Button v-if="!loading" :label="course.progress === 100 ? 'Volver a ver' : 'Continuar aprendiendo'" :severity="course.progress === 100 ? 'info' : 'primary'" class="w-full" @click="$emit('access', course)" />
                <Button v-if="loading" label="Continuar" class="w-full">
                    <ProgressSpinner style="height: 30px" strokeWidth="8" fill="transparent" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
                </Button> -->
                <Button v-if="course.access_type?.type === 'private'" label="Solicitar Acceso" severity="secondary" outlined class="w-full" />
                <Button v-if="course.access_type?.type === 'free' && !loading" :label="course.progress === 100 ? 'Volver a ver' : 'Iniciar'" class="w-full" @click="$emit('access', course)" />
                <Button v-if="course.access_type?.type === 'free' && loading" label="Iniciar" class="w-full">
                    <ProgressSpinner style="height: 30px" strokeWidth="8" fill="transparent" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
                </Button>
                <Button v-if="course.access_type?.type === 'paid'" :label="'Acceder por $' + course.access_type?.price" class="w-full" />
                <Button v-if="course.access_type?.type === 'subscription'" label="Iniciar" class="w-full" />
            </div>
        </template>
    </Card>
</template>

<script setup>
defineProps({
    course: Object,
    loading: Boolean
});

defineEmits(['access']);

const formatAccessType = (type) => type.charAt(0).toUpperCase() + type.slice(1);

const stripHtml = (html) => {
    if (!html) return '';
    let doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
};

const resolveContent = (content_type) => {
    switch (content_type) {
        case 'course':
            return 'Course';
        case 'external_content':
            return 'Exteral Content';
        case 'traject':
            return 'Path';
        case 'community':
            return 'Community';
        default:
            return '';
    }
};
</script>
<style scoped>
.card-image {
    border-radius: 12px 12px 0 0;
    max-height: 200px;
    width: 100%;
    object-fit: cover;
}

.card-description {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal;
}
</style>
