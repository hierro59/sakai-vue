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
                        <Button v-if="course.access_type?.type === 'private' && !course.subscription_id" label="Request Access" icon="pi pi-lock" severity="secondary" outlined />
                        <Button v-if="course.access_type?.type === 'private' && !loadingCC && course.subscription_id" icon="pi pi-play" :label="course.progress === 100 ? 'See again' : 'Start learning'" @click="handlePlayer(course)" />

                        <!-- Free buttons -->
                        <Button v-if="course.access_type?.type === 'free' && !loadingCC && course.subscription_id" icon="pi pi-play" :label="course.progress === 100 ? 'See again' : 'Start learning'" @click="handlePlayer(course)" />
                        <Button v-if="course.access_type?.type === 'free' && !loadingCC && !course.subscription_id" icon="pi pi-play" label="Start learning" @click="subscription(course)" />
                        <Button v-if="course.access_type?.type === 'free' && loadingCC" label="Start learning">
                            <ProgressSpinner style="height: 30px" strokeWidth="8" fill="transparent" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
                        </Button>

                        <!-- Global buttons -->
                        <Button v-if="course.content_provider_id && !loadingCC && course.subscription_id" icon="pi pi-play" :label="course.progress === 100 ? 'See again' : 'Start learning'" @click="handlePlayer(course)" />
                        <Button v-if="course.content_provider_id && !loadingCC && !course.subscription_id" icon="pi pi-play" label="Start learning" @click="subscription(course)" />
                        <Button v-if="course.content_provider_id && loadingCC" label="Start learning">
                            <ProgressSpinner style="height: 30px" strokeWidth="8" fill="transparent" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
                        </Button>

                        <!-- Payment buttons -->
                        <Button
                            v-if="course.access_type?.type === 'paid' && !course.subscription_id && !processing"
                            :disabled="!resolve.existPaymentMethod(companyIntegrations) || processing"
                            :label="'Access for ' + currencySimbol + ' ' + course.access_type?.price"
                            :class="processing ? 'cursor-not-allowed' : ''"
                            v-tooltip.top="!resolve.existPaymentMethod(companyIntegrations) ? 'Forbidden. Contact your administrator' : ''"
                            @click="handlePurchase"
                        />
                        <Button v-if="course.access_type?.type === 'paid' && !course.subscription_id && processing" label="Processing..." class="w-full">
                            <ProgressSpinner style="height: 30px" strokeWidth="8" fill="transparent" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
                        </Button>
                        <Button v-if="course.access_type?.type === 'paid' && course.subscription_id" icon="pi pi-play" :label="course.progress === 100 ? 'See again' : 'Start learning'" @click="handlePlayer(course)" />

                        <!-- Subscription buttons -->
                        <Button
                            v-if="course.access_type?.type === 'subscription' && !loadingButton"
                            icon="pi pi-calendar-plus"
                            label="Start learning"
                            class="w-full"
                            @click="course.access_type?.subscription?.subscribed ? handlePlayer(course) : openSubscriptionDialog(course)"
                        />
                        <Button v-if="course.access_type?.type === 'subscription' && loadingButton" label="Start learning" class="w-full">
                            <ProgressSpinner style="height: 30px" strokeWidth="8" fill="transparent" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
                        </Button>

                        <!-- Certificate button -->
                        <Button v-if="course.certificate_url" label="Certificate" icon="pi pi-download" severity="info" outlined @click="downloadCertificate(course.certificate_url)" />

                        <!-- Unsubscription button -->
                        <!-- <Button v-if="course.subscription_id && course.access_type?.type != 'paid'" label="" icon="pi pi-trash" severity="danger" outlined @click="unsubscription(course)" v-tooltip.top="'Unsubscribe'" /> -->
                        <Button v-if="course.subscription_id" label="" icon="pi pi-trash" severity="danger" outlined @click="unsubscription(course)" v-tooltip.top="'Unsubscribe'" />
                    </div>
                    <div v-if="course.content_type === 'traject'">
                        <!-- Private buttons -->
                        <Button v-if="course.access_type?.type === 'private' && !course.subscription_id" label="Request Access" icon="pi pi-lock" severity="secondary" outlined />
                        <Button v-if="course.access_type?.type === 'private' && !loadingCC && course.subscription_id" icon="pi pi-play" :label="course.progress === 100 ? 'See again' : 'Start learning'" @click="detail" />
                        <!-- Free buttons -->
                        <Button v-if="course.access_type?.type === 'free' && !loadingCC && course.subscription_id" icon="pi pi-play" :label="course.progress === 100 ? 'See again' : 'Start learning'" @click="detail" />
                        <Button v-if="course.access_type?.type === 'free' && !loadingCC && !course.subscription_id" icon="pi pi-play" label="Start learning" @click="pathSubscription(course)" />
                        <Button v-if="course.access_type?.type === 'free' && loadingCC" label="Start learning">
                            <ProgressSpinner style="height: 30px" strokeWidth="8" fill="transparent" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
                        </Button>

                        <!-- Payment buttons -->
                        <Button
                            v-if="course.access_type?.type === 'paid' && !course.subscription_id && !processing"
                            :disabled="!resolve.existPaymentMethod(companyIntegrations) || processing"
                            :label="'Access for ' + currencySimbol + ' ' + course.access_type?.price"
                            :class="processing ? 'cursor-not-allowed' : ''"
                            v-tooltip.top="!resolve.existPaymentMethod(companyIntegrations) ? 'Forbidden. Contact your administrator' : ''"
                            @click="handlePurchase"
                        />
                        <Button v-if="course.access_type?.type === 'paid' && !course.subscription_id && processing" label="Processing..." class="w-full">
                            <ProgressSpinner style="height: 30px" strokeWidth="8" fill="transparent" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
                        </Button>
                        <Button v-if="course.access_type?.type === 'paid' && course.subscription_id" icon="pi pi-play" :label="course.progress === 100 ? 'See again' : 'Start learning'" @click="detail" />

                        <!-- Subscription buttons -->
                        <Button
                            v-if="course.access_type?.type === 'subscription' && !loadingButton"
                            icon="pi pi-calendar-plus"
                            label="Start learning"
                            class="w-full"
                            @click="course.access_type?.subscription?.subscribed ? handlePlayer(course) : openSubscriptionDialog(course)"
                        />
                        <Button v-if="course.access_type?.type === 'subscription' && loadingButton" label="Start learning" class="w-full">
                            <ProgressSpinner style="height: 30px" strokeWidth="8" fill="transparent" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
                        </Button>
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

        <Dialog v-model:visible="subscriptionDialog" header="Upgrade Subscription" :style="{ width: '50vw' }" :modal="true">
            <SubscriptionInfo :data="learnerSubscriptions" />
        </Dialog>
        <Dialog v-model:visible="paypalModalVisible" header="Processing payment..." :modal="true" :closable="false">
            <h1 class="text-2xl font-bold text-gray-800">Choose your payment method</h1>
            <div ref="paypalContainer" class="p-4"></div>
        </Dialog>
    </div>
</template>

<script setup>
import { ref, inject, defineEmits, nextTick, defineProps } from 'vue';
import resolve from '@/service/IntegrationsResolve';
import CourseDetailView from '@/components/global/CourseDetailView.vue';
import { useToast } from 'primevue/usetoast';
import api from '@/service/content-management/ApiCourses';
import ApiLearningPaths from '@/service/content-management/ApiLearningPaths';
import { useRoute, useRouter } from 'vue-router';
import asp from '@/service/settings/ApiSubscriptionPlan';
import paypal from '@/service/integrations/payment-gateways/paypal/ApiPayPalService';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { useCourseRefreshStore } from '@/stores/useCourseRefreshStore';

const playerStore = usePlayerStore();
const courseRefresh = useCourseRefreshStore();

const route = useRoute();
const router = useRouter();

const toast = useToast();

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

const loadingCC = ref(false);

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

const handlePlayer = (selected) => {
    if (playerStore.selectedCourse?.code === selected.code && playerStore.openPlayer) return;
    visibleDetail.value = false;
    playerStore.open(selected);
};

const subscription = (oneCourse) => {
    loadingCC.value = true;
    if (oneCourse.content_provider_id) {
        api.globalContentRegister(oneCourse.code)
            .then((response) => {
                toast.add({ severity: 'success', summary: 'Successful', detail: 'Course Registered', life: 3000 });
                visibleDetail.value = false;
                playerStore.open(oneCourse);
                courseRefresh.triggerCatalogRefresh();
                loadingCC.value = false;
            })
            .catch((error) => {
                loadingCC.value = false;
                toast.add({ severity: 'error', summary: 'Error', detail: 'Course Not Registered', life: 3000 });
            });
    } else {
        api.courseRegistration(oneCourse.code)
            .then((response) => {
                toast.add({ severity: 'success', summary: 'Successful', detail: 'Course Registered', life: 3000 });
                playerStore.open(oneCourse);
                courseRefresh.triggerCatalogRefresh();
                loadingCC.value = false;
            })
            .catch((error) => {
                loadingCC.value = false;
                console.log(registration);
                toast.add({ severity: 'error', summary: 'Error', detail: 'Course Not Registered', life: 3000 });
            });
    }
};

const pathSubscription = (onePath) => {
    loadingCC.value = true;
    ApiLearningPaths.subscribePath(onePath.id)
        .then((response) => {
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Path Registered', life: 3000 });
            loadingCC.value = false;
            courseRefresh.triggerCatalogRefresh();
            courseRefresh.triggerMyContentRefresh();
            visibleDetail.value = true;
        })
        .catch((error) => {
            loadingCC.value = false;
            console.log(error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Path Not Registered', life: 3000 });
        });
};

const unsubscription = (oneCourse) => {
    loadingCC.value = true;
    api.unsubscribe(oneCourse.content_provider_id ? 'global-content' : oneCourse.content_type, oneCourse.subscription_id)
        .then((response) => {
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Course Unregistered', life: 3000 });
            loadingCC.value = false;
            courseRefresh.triggerCatalogRefresh();
            courseRefresh.triggerMyContentRefresh();
        })
        .catch((error) => {
            loadingCC.value = false;
            console.log(error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Course Not Unregistered', life: 3000 });
        });
};

const downloadCertificate = (certificateUrl) => {
    const link = document.createElement('a');
    link.href = certificateUrl;
    link.target = '_blank';
    link.click();
};

const subscriptionDialog = ref(false);
const learnerSubscriptions = ref([]);
const loadingButton = ref(false);

const openSubscriptionDialog = (content) => {
    let data = {
        content_code: content.code,
        content_type: content.content_type
    };
    loadingButton.value = true;
    asp.getLearnerSubscription(data).then((response) => {
        learnerSubscriptions.value = response[0];
        if (!learnerSubscriptions.value.autorization) {
            subscriptionDialog.value = true;
            loadingButton.value = false;
        } else {
            subscription(content);
        }
    });
};

const paypalContainer = ref(null);
const paypalModalVisible = ref(false);
const processing = ref(false);

const handlePurchase = async () => {
    processing.value = true;

    const body = JSON.stringify({
        content_id: props.course.id,
        content_type: props.course.content_type,
        action: 'content-subscribe'
    });
    const res = await paypal.createOrder(body);
    const orderID = res.id;

    if (!window.paypal) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'PayPal not loaded', life: 3000 });
        processing.value = false;
        return;
    }

    paypalModalVisible.value = true;

    await nextTick();

    const buttonInstance = window.paypal.Buttons({
        createOrder: () => orderID,
        onApprove: async () => {
            const capture = await paypal.captureOrder(
                JSON.stringify({
                    order_id: orderID,
                    content_id: props.course.id,
                    content_type: props.course.content_type,
                    action: 'content-subscribe'
                })
            );

            if (capture.status === 'COMPLETED') {
                toast.add({ severity: 'success', summary: 'Successful', detail: 'Course Registered', life: 3000 });
                courseRefresh.triggerCatalogRefresh();
                courseRefresh.triggerMyContentRefresh();
            }

            paypalModalVisible.value = false;
            processing.value = false;
            playerStore.open(props.course);
        },
        onCancel: () => {
            toast.add({ severity: 'error', summary: 'Error', detail: 'Payment canceled', life: 3000 });
            paypalModalVisible.value = false;
            processing.value = false;
        },
        onError: (err) => {
            console.error('Error en el pago:', err);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Payment error', life: 3000 });
            paypalModalVisible.value = false;
            processing.value = false;
        }
    });

    await buttonInstance.render(paypalContainer.value);
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
