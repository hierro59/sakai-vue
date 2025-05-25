<template>
    <div v-if="!loading" class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <!-- Header con imagen y título -->
        <section class="flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center">
            <div class="w-full md:w-1/3 lg:w-1/4">
                <img :src="course?.versions?.data?.presentation?.image || course?.image" class="w-full h-auto object-cover rounded-xl shadow-lg" alt="Imagen del curso" />
            </div>
            <div class="flex-1 space-y-4">
                <div class="flex items-center gap-2">
                    <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{{ props.content_type }}</span>
                    <span class="text-gray-500 text-sm">Por {{ course?.author?.name }}</span>
                </div>
                <h1 class="text-3xl md:text-4xl font-bold text-gray-900">{{ course?.title }}</h1>
                <Tag v-for="cat in course?.categories || []" :key="cat.id" :value="cat.name ? '#' + cat.name : 'uncategorized'" severity="info" class="text-xs" />

                <!-- Progreso mejorado -->
                <div v-if="course?.progress" class="pt-2">
                    <div class="flex items-center justify-between mb-1">
                        <span class="text-sm font-medium text-gray-700">Progress</span>
                        <span class="text-sm font-medium text-blue-600">{{ course?.progress }}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2.5">
                        <div class="bg-blue-600 h-2.5 rounded-full" :style="`width: ${course?.progress}%`"></div>
                    </div>
                </div>

                <div v-if="props.content_type !== 'traject'">
                    <div v-if="course.content_type === 'course'">
                        <Button v-if="course.access_type?.type === 'private'" label="Request Access" icon="pi pi-lock" severity="secondary" outlined class="w-full" />
                        <Button v-if="course.access_type?.type === 'free' && !loading && course.subscription_id" icon="pi pi-play" :label="course.progress === 100 ? 'See again' : 'Start learning'" class="w-full" @click="access(course)" />
                        <Button v-if="course.access_type?.type === 'free' && !loading && !course.subscription_id" icon="pi pi-play" label="Start learning 2" class="w-full" @click="subscription(course)" />
                        <Button v-if="course.access_type?.type === 'free' && loading" label="Start learning" class="w-full">
                            <ProgressSpinner style="height: 30px" strokeWidth="8" fill="transparent" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
                        </Button>
                        <Button
                            v-if="course.access_type?.type === 'paid' && !course.subscription_id"
                            :disabled="!resolve.existPaymentMethod(companyIntegrations)"
                            :label="'Access for $' + course.access_type?.price"
                            class="w-full"
                            icon="pi pi-dollar"
                            v-tooltip.top="!resolve.existPaymentMethod(companyIntegrations) ? 'Forbidden. Contact your administrator' : ''"
                        />
                        <Button v-if="course.access_type?.type === 'paid' && course.subscription_id" icon="pi pi-play" :label="course.progress === 100 ? 'See again' : 'Start learning'" class="w-full" @click="access(course)" />
                        <Button v-if="course.access_type?.type === 'subscription'" icon="pi pi-calendar-plus" label="Start learning" class="w-full" />
                    </div>
                </div>
            </div>
        </section>

        <!-- Descripción con fondo destacado -->
        <section class="bg-gray-50 rounded-xl p-6">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4">Description</h2>
            <div v-html="course?.description" class="prose max-w-none text-gray-700"></div>
        </section>

        <!-- Contenido del curso con acordeones -->
        <section class="space-y-6">
            <h2 class="text-2xl font-semibold text-gray-900">Content</h2>
            <div class="space-y-4" v-if="props.content_type === 'course'">
                <div v-for="unit in course?.versions?.data?.elements" :key="unit.id" class="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                    <div class="bg-white px-4 py-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors" @click="toggleUnit(unit.id)">
                        <div class="flex items-center gap-3">
                            <i :class="[expandedUnits.includes(unit.id) ? 'pi pi-folder-open text-blue-500' : 'pi pi-folder text-gray-500']"></i>
                            <h3 class="font-semibold text-lg text-gray-800">{{ unit.title }}</h3>
                        </div>
                        <span class="text-gray-500">
                            <i :class="[expandedUnits.includes(unit.id) ? 'pi pi-angle-down' : 'pi pi-angle-right']"></i>
                        </span>
                    </div>
                    <div v-show="expandedUnits.includes(unit.id)" class="px-4 py-3 bg-gray-50 border-t border-gray-200">
                        <ul class="space-y-3">
                            <li v-for="activity in unit.children" :key="activity.id" class="flex items-center gap-3 py-2 px-3 rounded hover:bg-gray-100 transition-colors">
                                <i class="pi pi-circle-fill text-xs text-blue-500"></i>
                                <span class="text-gray-700">{{ activity.title }}</span>
                                <span class="ml-auto text-xs text-gray-500">{{ activity.duration ?? 1 }} min</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div v-else-if="props.content_type === 'traject'" class="flex flex-wrap gap-4">
                <div v-for="unit in course?.content" :key="unit.id" class="max-w-sm">
                    <CourseCard :course="unit" />
                </div>
            </div>
        </section>

        <!-- Información adicional (solo si existe) -->
        <section v-if="course?.meta" class="bg-blue-50 rounded-xl p-6 border border-blue-100">
            <h2 class="text-2xl font-semibold text-gray-900 mb-3">Información adicional</h2>
            <p class="text-gray-700">{{ course?.meta }}</p>
        </section>

        <!-- Botón de acción flotante para móviles -->
        <div class="fixed md:hidden bottom-6 right-6">
            <div v-if="props.content_type !== 'traject'">
                <Button v-if="course.access_type?.type === 'private'" label="Request Access" icon="pi pi-lock" severity="secondary" outlined class="w-full" />
                <Button v-if="course.access_type?.type === 'free' && !loading && course.subscription_id" icon="pi pi-play" :label="course.progress === 100 ? 'See again' : 'Start learning'" class="w-full" @click="access(course)" />
                <Button v-if="course.access_type?.type === 'free' && !loading && !course.subscription_id" icon="pi pi-play" label="Start learning 2" class="w-full" @click="subscription(course)" />
                <Button v-if="course.access_type?.type === 'free' && loading" label="Start learning" class="w-full">
                    <ProgressSpinner style="height: 30px" strokeWidth="8" fill="transparent" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
                </Button>
                <Button
                    v-if="course.access_type?.type === 'paid' && !course.subscription_id"
                    :disabled="!resolve.existPaymentMethod(companyIntegrations)"
                    :label="'Access for $' + course.access_type?.price"
                    class="w-full"
                    icon="pi pi-dollar"
                    v-tooltip.top="!resolve.existPaymentMethod(companyIntegrations) ? 'Forbidden. Contact your administrator' : ''"
                />
                <Button v-if="course.access_type?.type === 'paid' && course.subscription_id" icon="pi pi-play" :label="course.progress === 100 ? 'See again' : 'Start learning'" class="w-full" @click="access(course)" />
                <Button v-if="course.access_type?.type === 'subscription'" icon="pi pi-calendar-plus" label="Start learning" class="w-full" />
            </div>
        </div>
    </div>

    <!-- Loading state mejorado -->
    <div v-else class="flex items-center justify-center min-h-[60vh]">
        <div class="text-center space-y-4">
            <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="transparent" animationDuration=".5s" />
            <p class="text-gray-600">Loading...</p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, inject, defineEmits } from 'vue';
import api from '@/service/content-management/ApiCourses';
import traject from '@/service/content-management/ApiLearningPaths';
import CourseCard from './CourseCard.vue';
import resolve from '@/service/IntegrationsResolve';
import { useToast } from 'primevue/usetoast';
import eventBus from '@/service/eventBus';

const toast = useToast();

const emit = defineEmits(['close-detail-and-open-player']);

const company = inject('company');
const companyIntegrations = ref(company.value.integrations ?? []);

const props = defineProps({
    contentCode: {
        type: String,
        required: true
    },
    content_type: {
        type: String,
        default: 'course'
    }
});

const course = ref({});
const loading = ref(true);
const expandedUnits = ref([]);

const visibleTop = ref(false);
const selectedCourse = ref(null);

const access = (oneCourse) => {
    selectedCourse.value = oneCourse;
    visibleTop.value = true;
    emit('close-detail-and-open-player', oneCourse);
};

const toggleUnit = (unitId) => {
    if (expandedUnits.value.includes(unitId)) {
        expandedUnits.value = expandedUnits.value.filter((id) => id !== unitId);
    } else {
        expandedUnits.value.push(unitId);
    }
};

const getCourseData = async () => {
    try {
        const { data } = await api.getCourseByCode(props.contentCode);
        course.value = data;
        loading.value = false;
    } catch (error) {
        console.error('Error loading course:', error);
        loading.value = false;
    }
};

const getTrajectData = async () => {
    try {
        const { data } = await traject.getPathById(props.contentCode);
        course.value = data;
        loading.value = false;
    } catch (error) {
        console.error('Error loading trajectory:', error);
        loading.value = false;
    }
};

const subscription = (oneCourse) => {
    loading.value = true;
    api.courseRegistration(oneCourse.code)
        .then((response) => {
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Course Registered', life: 3000 });
            loading.value = false;
            selectedCourse.value = oneCourse;
            visibleTop.value = true;
            emit('close-detail-and-open-player', oneCourse);
            eventBus.emit('subscription-complete', oneCourse);
        })
        .catch((error) => {
            loading.value = false;
            console.error('Error registering course:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Course Not Registered', life: 3000 });
        });
};

onMounted(async () => {
    if (props.content_type === 'course') {
        await getCourseData();
    }
    if (props.content_type === 'traject') {
        await getTrajectData();
    }
});
</script>
