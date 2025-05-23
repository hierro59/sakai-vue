<template>
    <div>
        <Card class="border border-surface-200 h-full justify-between dark:border-surface-700 rounded me-4" :style="course.content_type === 'traject' ? 'background-color: #f0f0ff' : ''">
            <template #header>
                <div class="relative">
                    <img alt="image" :src="course.image" class="card-image" :class="props.viewDetail ? 'cursor-pointer' : ''" @click="detail" />
                    <div class="absolute top-2 right-2 z-1 flex flex-col items-end gap-1">
                        <Tag :value="resolveContent(course.content_type)" severity="info" />
                        <Badge v-if="course.has_new_version" value="New version" v-tooltip.top="'There is a new version of this course'" severity="info" class="text-xs" />
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
                </p>
                <ProgressBar v-if="course.progress != null" class="mt-2" :value="course.progress" />
            </template>

            <template #footer>
                <div class="flex gap-4 mt-1">
                    <!-- <Button v-if="!loading" :label="course.progress === 100 ? 'Volver a ver' : 'Continuar aprendiendo'" :severity="course.progress === 100 ? 'info' : 'primary'" class="w-full" @click="$emit('access', course)" />
                <Button v-if="loading" label="Continuar" class="w-full">
                    <ProgressSpinner style="height: 30px" strokeWidth="8" fill="transparent" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
                </Button> -->
                    <Button v-if="course.access_type?.type === 'private'" label="Request Access" severity="secondary" outlined class="w-full" />
                    <Button v-if="course.access_type?.type === 'free' && !loading" :label="course.progress === 100 ? 'See again' : 'Start learning'" class="w-full" @click="$emit('access', course)" />
                    <Button v-if="course.access_type?.type === 'free' && loading" label="Start learning" class="w-full">
                        <ProgressSpinner style="height: 30px" strokeWidth="8" fill="transparent" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
                    </Button>
                    <Button
                        v-if="course.access_type?.type === 'paid'"
                        :disabled="!resolve.existPaymentMethod(companyIntegrations)"
                        :label="'Access for $' + course.access_type?.price"
                        class="w-full"
                        v-tooltip.top="!resolve.existPaymentMethod(companyIntegrations) ? 'Payment gateway not configured' : ''"
                    />
                    <Button v-if="course.access_type?.type === 'subscription'" label="Start learning" class="w-full" />
                </div>
            </template>
        </Card>
        <Drawer v-model:visible="visibleDetail" header="Details" position="top" style="height: 100vh" class="px-12">
            <CourseDetailView :contentCode="course.code" :content_type="course.content_type" />
        </Drawer>
    </div>
</template>

<script setup>
import { ref, inject } from 'vue';
import resolve from '@/service/IntegrationsResolve';
import CourseDetailView from '@/components/global/CourseDetailView.vue';

const company = inject('company');
const companyIntegrations = ref(company.value.integrations ?? []);

const visibleDetail = ref(false);

const props = defineProps({
    course: Object,
    loading: Boolean,
    viewDetail: {
        type: Boolean,
        default: false
    }
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

const detail = () => {
    if (props.viewDetail) {
        visibleDetail.value = true;
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
