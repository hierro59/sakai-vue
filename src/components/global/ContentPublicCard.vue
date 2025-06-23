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
                    <Tag v-if="course.content_provider" :value="course.content_provider" severity="success" />
                    <Tag v-if="course.access_type?.type === 'free'" icon="pi pi-star-fill" :value="formatAccessType(course.access_type.type)" />
                    <Tag v-if="course.access_type?.type === 'private'" icon="pi pi-lock" :value="formatAccessType(course.access_type.type)" />
                    <Tag v-if="course.access_type?.type === 'paid'" icon="pi pi-dollar" :value="formatAccessType(course.access_type.type)" />
                    <Tag v-if="course.access_type?.type === 'subscription'" icon="pi pi-calendar-plus" :value="formatAccessType(course.access_type.subscription?.name + ' ' + course.access_type.type)" />
                </div>
                <div class="font-bold text-2xl">{{ course.title }}</div>
                <div class="flex flex-wrap gap-2 mt-2">
                    <Tag v-for="cat in course.categories || []" :key="cat.id" :value="cat.name ? '#' + cat.name : 'uncategorized'" severity="info" class="text-xs" />
                </div>
                <div v-if="course.content_provider" class="flex flex-wrap gap-2 mt-2">
                    <Tag v-for="cat in course.tags || []" :key="cat" :value="cat ? '#' + cat : 'uncategorized'" severity="info" class="text-xs" />
                </div>
            </template>

            <template #content>
                <p class="card-description">
                    {{ stripHtml(course.description) }}
                </p>
                <ProgressBar v-if="course.progress != null && course.subscription_id" class="mt-2" :value="course.progress" />
            </template>

            <template #footer>
                <div class="flex gap-4 mt-1">
                    <div v-if="course.content_type === 'course'" class="flex flex-col sm:flex-row flex-wrap gap-2">
                        <!-- Private buttons -->
                        <Button v-if="course.access_type?.type === 'private'" label="Request Access" icon="pi pi-lock" severity="secondary" outlined />

                        <!-- Free buttons -->
                        <Button v-if="course.access_type?.type === 'free'" icon="pi pi-play" :label="'Start learning'" @click="access(course)" />

                        <!-- Global buttons -->
                        <Button v-if="course.content_provider_id" icon="pi pi-play" :label="course.progress === 100 ? 'See again' : 'Start learning'" @click="access(course)" />

                        <!-- Payment buttons -->
                        <Button
                            v-if="course.access_type?.type === 'paid'"
                            :disabled="!resolve.existPaymentMethod(companyIntegrations)"
                            :label="'Access for ' + currencySimbol + ' ' + course.access_type?.price"
                            v-tooltip.top="!resolve.existPaymentMethod(companyIntegrations) ? 'Forbidden. Contact your administrator' : ''"
                            @click="access(course)"
                        />

                        <!-- Subscription buttons -->
                        <Button v-if="course.access_type?.type === 'subscription'" icon="pi pi-calendar-plus" label="Start learning" class="w-full" @click="access(course)" />
                    </div>
                </div>
            </template>
        </Card>

        <Drawer v-model:visible="visibleDetail" :header="null" position="top" style="height: 100vh" class="px-0">
            <div class="flex justify-between items-center px-12 pt-6 pb-4 border-b border-gray-200 bg-white">
                <h2 class="text-2xl font-bold text-gray-800">Details</h2>
                <div class="flex gap-2">
                    <Button v-if="route.name !== 'dashboard'" label="Home" icon="pi pi-home" @click="goToHome" outlined />
                    <Button v-if="route.name !== 'catalog'" label="Catalog" icon="pi pi-objects-column" @click="goToCatalog" outlined />
                    <Button v-if="route.name !== 'my-content'" label="My Formation" icon="pi pi-bookmark-fill" @click="goToMyFormation" outlined />
                </div>
            </div>

            <CourseDetailView :contentCode="course.code" :content_type="course.content_type" :provider="course.content_provider_id ? 'global' : null" />
        </Drawer>
    </div>
</template>

<script setup>
import { ref, inject, defineEmits, nextTick, defineProps } from 'vue';
import resolve from '@/service/IntegrationsResolve';
import CourseDetailView from '@/components/global/CourseDetailView.vue';
import { useToast } from 'primevue/usetoast';
import { useRoute, useRouter } from 'vue-router';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { useCourseRefreshStore } from '@/stores/useCourseRefreshStore';

const playerStore = usePlayerStore();

const route = useRoute();
const router = useRouter();

const company = inject('company');
const companyIntegrations = ref(company.value.integrations ?? []);
const currencySimbol = ref(JSON.parse(company.value.meta_data).currency.name);

const props = defineProps({
    course: Object,
    loading: Boolean,
    viewDetail: {
        type: Boolean,
        default: false
    }
});

const goToHome = () => router.push({ name: 'dashboard' });
const goToCatalog = () => router.push({ name: 'catalog' });
const goToMyFormation = () => router.push({ name: 'my-content' });

const visibleDetail = ref(false);

const emit = defineEmits(['close-detail-and-open-player']);

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

const access = (selected) => {
    router.push({
        name: 'login'
    });
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
