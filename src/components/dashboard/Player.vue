<template>
    <div v-if="courseData" class="flex min-h-screen bg-gray-100 w-full">
        <div class="flex min-h-screen bg-gray-100 w-full">
            <!-- Botón para colapsar/abrir la barra lateral en móviles -->
            <button @click="isSidebarOpen = !isSidebarOpen" class="fixed lg:hidden p-2 bg-blue-600 text-white rounded-full shadow-lg z-50 m-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
            </button>

            <!-- Barra lateral -->
            <div
                :class="{
                    'translate-x-0': isSidebarOpen,
                    '-translate-x-full': !isSidebarOpen
                }"
                class="fixed lg:relative lg:translate-x-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-40"
            >
                <div class="p-4">
                    <!-- <h1 class="text-3xl font-bold text-gray-800 mb-4">{{ courseData.title }}</h1> -->
                    <ul class="space-y-2">
                        <li>
                            <button @click="showPresentation" class="w-full text-2xl font-bold text-gray-800 mb-4">Presentation</button>
                        </li>
                        <li v-for="module in courseData.versions.data.elements" :key="module.id">
                            <h3 class="font-semibold text-gray-700 mt-4">{{ module.value }}</h3>
                            <ul class="ml-4">
                                <li v-for="activity in module.children" :key="activity.id" @click="showActivity(activity)" class="p-2 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer">
                                    {{ activity.title }} <i v-if="isActivityCompleted(activity.id)" class="pi pi-check-square ml-2 text-green-700"></i>
                                </li>
                            </ul>
                        </li>
                        <li v-if="certificateItem">
                            <button @click="showClosure" class="text-3xl font-semibold w-full text-left p-2 hover:bg-blue-50 rounded-lg transition-colors">Certificado</button>
                        </li>
                    </ul>
                </div>
                <div class="bottom-0 left-0 w-full p-4">
                    <ProgressBar :value="activitiesCompleted.progress || 0" />
                </div>
            </div>

            <!-- Contenido principal -->
            <div class="flex-1 p-6 w-full">
                <!-- Encabezado con el módulo actual -->
                <div v-if="currentModule" class="bg-white p-4 rounded-lg shadow mb-6 w-full">
                    <div class="flex items-center justify-between w-full">
                        <h2 class="text-xl font-bold text-gray-800">{{ currentModule.value }}</h2>
                        <div class="flex space-x-4">
                            <span v-if="['image', 'richtext', 'video', 'document'].includes(currentContent.type)">
                                <button v-if="!isActivityCompleted(currentContent.id)" @click="registerActivity" class="px-4 py-2 me-6 bg-orange-600 text-white rounded-lg shadow hover:bg-orange-700 transition-colors">Complete</button>
                            </span>
                            <button @click="prevContent" :disabled="currentIndex === 0" class="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 disabled:bg-gray-400 transition-colors">Prev</button>
                            <button @click="nextContent" :disabled="currentIndex === allContents.length - 1" class="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 disabled:bg-gray-400 transition-colors">Next</button>
                            <button @click="showClosure" v-if="currentIndex === allContents.length - 1 && certificateItem" class="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 disabled:bg-gray-400 transition-colors">
                                Certificado
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Presentación o actividad -->
                <div class="bg-white p-6 rounded-lg shadow">
                    <div v-if="currentContent.type === 'presentation'">
                        <!-- Contenedor flex para título, descripción y botón -->
                        <div class="flex items-start justify-between">
                            <div>
                                <h2 class="text-2xl font-bold text-gray-800 mb-4">Presentation</h2>
                                <h1 class="text-3xl font-bold text-gray-800 mb-4">{{ courseData.title }}</h1>
                                <div class="prose text-xl" v-html="currentContent.description"></div>
                            </div>
                            <!-- Botón para iniciar el curso -->
                            <button @click="startCourse" class="ml-4 px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition-colors">Start</button>
                        </div>
                        <img :src="currentContent.image" alt="Presentation" class="mt-4 rounded-lg shadow" />
                    </div>

                    <div v-if="currentContent.type === 'image'">
                        <h2 class="text-2xl font-bold text-gray-800 mb-4">{{ currentContent.title }}</h2>
                        <p class="mt-4 text-xl text-gray-700">{{ currentContent.description }}</p>
                        <img :src="currentContent.image" :alt="currentContent.title" class="w-full rounded-lg shadow" />
                    </div>
                    <div v-if="currentContent.type === 'richtext'">
                        <h2 class="text-2xl font-bold text-gray-800 mb-4">{{ currentContent.title }}</h2>
                        <div v-html="currentContent.content"></div>
                    </div>

                    <div v-if="currentContent.type === 'video'">
                        <h2 class="text-2xl font-bold text-gray-800 mb-4">{{ currentContent.title }}</h2>
                        <p class="mt-4 text-xl text-gray-700">{{ currentContent.description }}</p>
                        <div class="w-full">
                            <iframe :src="`https://www.youtube.com/embed/${currentContent.urlCode}`" class="w-full h-96 rounded-lg shadow" allowfullscreen></iframe>
                        </div>
                    </div>

                    <div v-if="currentContent.type === 'document'">
                        <h2 class="text-2xl font-bold text-gray-800 mb-4">{{ currentContent.title }}</h2>
                        <p class="mt-4 text-xl text-gray-700">{{ currentContent.description }}</p>
                        <div class="w-full">
                            <iframe :src="currentContent.document" class="w-full h-96 rounded-lg shadow" allowfullscreen></iframe>
                        </div>
                    </div>

                    <div v-if="currentContent.type === 'single-choice'" class="my-8">
                        <h2 class="text-2xl font-bold text-gray-800 mb-4">{{ currentContent.title }}</h2>
                        <p class="mb-4 text-xl text-gray-700">{{ currentContent.description }}</p>

                        <div v-for="(option, index) in currentContent.options" :key="index" class="flex items-center mb-3">
                            <RadioButton :disabled="isActivityCompleted(currentContent.id)" :value="option" v-model="selectedOption" :inputId="`option-${index}`" class="mr-2" />
                            <label :for="`option-${index}`" class="cursor-pointer">{{ option.text }}</label>
                        </div>

                        <Button v-if="!isActivityCompleted(currentContent.id)" label="Validar" icon="pi pi-check" @click="checkSingleChoiceAnswer" class="mt-4" />

                        <p v-if="answerChecked" :class="selectedOptionCorrect ? 'text-green-600' : 'text-red-600'" class="mt-2">
                            {{ selectedOptionCorrect ? '¡Respuesta correcta!' : 'Respuesta incorrecta' }}
                        </p>
                    </div>

                    <div v-if="currentContent.type === 'multiple-choice'" class="my-8">
                        <h2 class="text-2xl font-bold text-gray-800 mb-4">{{ currentContent.title }}</h2>
                        <p class="mb-4 text-xl text-gray-700">{{ currentContent.description }}</p>

                        <div v-for="(option, index) in currentContent.options" :key="index" class="flex items-center mb-3">
                            <Checkbox :disabled="isActivityCompleted(currentContent.id)" :value="option" v-model="selectedOptions" :inputId="`option-${index}`" class="mr-2" />
                            <label :for="`option-${index}`" class="cursor-pointer">{{ option.text }}</label>
                        </div>

                        <Button v-if="!isActivityCompleted(currentContent.id)" label="Validar" icon="pi pi-check" @click="checkSingleChoiceAnswer" class="mt-4" />

                        <p v-if="answerChecked" :class="selectedMultipleCorrect ? 'text-green-600' : 'text-red-600'" class="mt-2">
                            {{ selectedMultipleCorrect ? '¡Respuesta correcta!' : 'Respuesta incorrecta' }}
                        </p>
                    </div>

                    <div v-if="currentContent.type === 'true-false'" class="my-8">
                        <h2 class="text-2xl font-bold text-gray-800 mb-4">{{ currentContent.title }}</h2>
                        <p class="mb-4 text-xl text-gray-700">{{ currentContent.description }}</p>

                        <div class="flex gap-6 items-center mb-4">
                            <RadioButton :value="true" v-model="selectedTF" inputId="verdadero" :disabled="isActivityCompleted(currentContent.id)" />
                            <label for="verdadero" class="cursor-pointer">Verdadero</label>

                            <RadioButton :value="false" v-model="selectedTF" inputId="falso" :disabled="isActivityCompleted(currentContent.id)" />
                            <label for="falso" class="cursor-pointer">Falso</label>
                        </div>

                        <Button v-if="!isActivityCompleted(currentContent.id)" label="Validar" icon="pi pi-check" @click="checkTFAnswer" class="mt-4" />

                        <p v-if="answerChecked" :class="selectedTF === currentContent.answer ? 'text-green-600' : 'text-red-600'" class="mt-2">
                            {{ selectedTF === currentContent.answer ? '¡Respuesta correcta!' : 'Respuesta incorrecta' }}
                        </p>
                    </div>

                    <Dialog v-model:visible="doneAt" modal header="Certificado" :style="{ width: '60%' }">
                        <CourseCompletion :course="courseData" :certificate="certificate" :grade="activitiesCompleted.progress" />
                    </Dialog>

                    <!-- Boton centrado -->
                    <div class="flex justify-center mt-6" v-if="['image', 'richtext', 'video', 'document'].includes(currentContent.type)">
                        <button v-if="!isActivityCompleted(currentContent.id)" @click="registerActivity" class="px-4 py-2 bg-orange-600 text-white rounded-lg shadow hover:bg-orange-700 transition-colors">Complete</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div v-else class="p-8 text-center">
        <ProgressSpinner />
        <p class="mt-4 text-gray-600">Cargando curso...</p>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import api from '@/service/content-management/ApiCourses';
import CourseCompletion from './player/CourseCompletion.vue';
import eventBus from '@/service/eventBus';

// Props
const props = defineProps({
    courseCode: {
        type: String,
        required: true
    }
});

// Estado reactivo
const courseData = ref(null);
const currentIndex = ref(0);
const isSidebarOpen = ref(false);
const closure = ref(false);
const doneAt = ref(false);
const pdfUrl = ref(null);
const verifyUrl = ref(null);
const certificateItem = ref(false);

const selectedOption = ref(null);
const selectedOptions = ref([]);
const selectedTF = ref(null);
const answerChecked = ref(false);

const activitiesCompleted = ref([]);
const certificate = ref(null);

const loadCourseByCode = async () => {
    try {
        const response = await api.getCourseByCode(props.courseCode);
        courseData.value = response.data;
        checkActivityFn();
    } catch (error) {
        console.error('Error al cargar el curso:', error);
    }
};

const allContents = computed(() => {
    if (!courseData.value) return [];
    const contents = [{ type: 'presentation', ...courseData.value.versions.data.presentation }];
    courseData.value.versions.data.elements.forEach((module) => {
        module.children.forEach((activity) => {
            contents.push({ ...activity, moduleId: module.id });
        });
    });
    return contents;
});

const currentContent = computed(() => allContents.value[currentIndex.value]);

const currentModule = computed(() => {
    if (!courseData.value || currentContent.value.type === 'presentation') return null;
    return courseData.value.versions.data.elements.find((m) => m.id === currentContent.value.moduleId);
});

const showPresentation = () => {
    currentIndex.value = 0;
    isSidebarOpen.value = false;
};

const showActivity = (activity) => {
    const index = allContents.value.findIndex((c) => c.id === activity.id);
    if (index !== -1) currentIndex.value = index;
    isSidebarOpen.value = false;
};

const showClosure = () => (doneAt.value = true);

const startCourse = () => {
    if (allContents.value.length > 1) {
        currentIndex.value = 1;
        isSidebarOpen.value = false;
    }
};

const prevContent = () => {
    if (currentIndex.value > 0) currentIndex.value--;
};

const nextContent = () => {
    if (currentIndex.value < allContents.value.length - 1) currentIndex.value++;
};

const isActivityCompleted = (activityId) => {
    return activitiesCompleted.value.some((module) => module.activities.some((a) => a.id === activityId && a.done));
};

const checkActivityFn = () => {
    api.checkActivity(props.courseCode)
        .then((response) => {
            activitiesCompleted.value = response.data.modulos;
            activitiesCompleted.value.progress = response.data.progress;
            if (activitiesCompleted.value.progress === 100) {
                doneAt.value = true;
                certificateItem.value = true;
                pdfUrl.value = response.data.certificate?.pdf_url;
                verifyUrl.value = response.data.certificate?.hash;
                certificate.value = {
                    download_url: pdfUrl.value,
                    share_url: verifyUrl.value
                };
            }
            allContents.value.forEach((content) => {
                for (const module of response.data.modulos) {
                    const activity = module.activities.find((a) => a.id === content.id);
                    if (activity) {
                        content.user_answer_id = activity.user_answer_id;
                        content.done = activity.done;
                    }
                }
            });
        })
        .catch((err) => console.error('Error al consultar la actividad:', err));
};

watch(
    () => currentContent.value,
    (newContent) => {
        selectedOption.value = null;
        selectedOptions.value = [];
        selectedTF.value = null;
        answerChecked.value = false;

        if (newContent?.type === 'single-choice') {
            const previous = newContent.options?.find((opt) => opt.id === newContent.user_answer_id);
            if (previous) {
                selectedOption.value = previous;
                answerChecked.value = true;
            }
        }
        if (newContent?.type === 'multiple-choice') {
            selectedOptions.value = newContent.options?.filter((opt) => newContent.user_answer_id?.includes(opt.id)) || [];
            if (selectedOptions.value.length) answerChecked.value = true;
        }
        if (newContent?.type === 'true-false' && typeof newContent.user_answer_id === 'boolean') {
            selectedTF.value = newContent.user_answer_id;
            answerChecked.value = true;
        }
    },
    { immediate: true }
);

const registerActivity = () => {
    let payload = {};
    switch (currentContent.value.type) {
        case 'single-choice':
            payload = {
                value: currentContent.value.id,
                type: 'single-choice-evaluation-completed',
                code: props.courseCode,
                answer: selectedOption.value?.id || null,
                is_correct: selectedOptionCorrect.value
            };
            break;
        case 'multiple-choice':
            const selectedIds = selectedOptions.value.map((opt) => opt.id);
            const correctIds = currentContent.value.options.filter((opt) => opt.is_correct).map((opt) => opt.id);
            const isCorrect = selectedIds.length === correctIds.length && selectedIds.every((id) => correctIds.includes(id));
            payload = {
                value: currentContent.value.id,
                type: 'multiple-choice-evaluation-completed',
                code: props.courseCode,
                answer: selectedIds,
                is_correct: isCorrect
            };
            break;
        case 'true-false':
            payload = {
                value: currentContent.value.id,
                type: 'true-false-evaluation-completed',
                code: props.courseCode,
                answer: selectedTF.value,
                is_correct: selectedTF.value === currentContent.value.answer
            };
            break;
        default:
            payload = {
                value: currentContent.value.id,
                type: 'activity-completed',
                code: props.courseCode
            };
            break;
    }

    api.registerActivity(payload)
        .then(() => {
            nextContent();
            checkActivityFn();
            eventBus.emit('check-activity');
        })
        .catch((err) => console.error('Error al registrar la actividad:', err));
};

const selectedOptionCorrect = computed(() => selectedOption.value?.is_correct === true);
const selectedTFCorrect = computed(() => selectedTF.value === currentContent.value.answer);
const selectedMultipleCorrect = computed(() => {
    const correctIds = currentContent.value.options.filter((opt) => opt.is_correct).map((opt) => opt.id);
    const selectedIds = selectedOptions.value.map((opt) => opt.id);
    return selectedIds.length === correctIds.length && selectedIds.every((id) => correctIds.includes(id));
});

const checkSingleChoiceAnswer = () => {
    answerChecked.value = true;
    registerActivity();
};

const checkTFAnswer = () => {
    answerChecked.value = true;
    registerActivity();
};

onMounted(() => {
    loadCourseByCode();
});
</script>
