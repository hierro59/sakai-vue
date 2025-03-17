<template>
    <div class="flex min-h-screen bg-gray-100">
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
                <h1 class="text-3xl font-bold text-gray-800 mb-4">{{ courseData.title }}</h1>
                <ul class="space-y-2">
                    <li>
                        <button @click="showPresentation" class="w-full text-left p-2 hover:bg-blue-50 rounded-lg transition-colors">Presentación</button>
                    </li>
                    <li v-for="module in courseData.versions.data.elements" :key="module.id">
                        <h3 class="font-semibold text-gray-700 mt-4">{{ module.value }}</h3>
                        <ul class="ml-4">
                            <li v-for="activity in module.children" :key="activity.id" @click="showActivity(activity)" class="p-2 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer">
                                {{ activity.title }}
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
        </div>

        <!-- Contenido principal -->
        <div class="flex-1 p-6">
            <!-- Encabezado con el módulo actual -->
            <div v-if="currentModule" class="bg-white p-4 rounded-lg shadow mb-6">
                <div class="flex items-center justify-between">
                    <h2 class="text-xl font-bold text-gray-800">Módulo: {{ currentModule.value }}</h2>
                    <div class="flex space-x-4">
                        <button @click="prevContent" :disabled="currentIndex === 0" class="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 disabled:bg-gray-400 transition-colors">Anterior</button>
                        <button @click="nextContent" :disabled="currentIndex === allContents.length - 1" class="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 disabled:bg-gray-400 transition-colors">Siguiente</button>
                    </div>
                </div>
            </div>

            <!-- Presentación o actividad -->
            <div class="bg-white p-6 rounded-lg shadow">
                <div v-if="currentContent.type === 'presentation'">
                    <!-- Contenedor flex para título, descripción y botón -->
                    <div class="flex items-start justify-between">
                        <div>
                            <h2 class="text-2xl font-bold text-gray-800 mb-4">Presentación</h2>
                            <h1 class="text-3xl font-bold text-gray-800 mb-4">{{ courseData.title }}</h1>
                            <div class="prose" v-html="currentContent.description"></div>
                        </div>
                        <!-- Botón para iniciar el curso -->
                        <button @click="startCourse" class="ml-4 px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition-colors">Iniciar Curso</button>
                    </div>
                    <img :src="currentContent.image" alt="Presentación" class="mt-4 rounded-lg shadow" />
                </div>

                <div v-if="currentContent.type === 'image'">
                    <h2 class="text-2xl font-bold text-gray-800 mb-4">{{ currentContent.title }}</h2>
                    <p class="mt-4 text-gray-700">{{ currentContent.description }}</p>
                    <img :src="currentContent.image" :alt="currentContent.title" class="w-full rounded-lg shadow" />
                </div>
                <div v-if="currentContent.type === 'richtext'" v-html="currentContent.content"></div>

                <div v-if="currentContent.type === 'video'">
                    <h2 class="text-2xl font-bold text-gray-800 mb-4">{{ currentContent.title }}</h2>
                    <p class="mt-4 text-gray-700">{{ currentContent.description }}</p>
                    <div class="aspect-w-16 aspect-h-9">
                        <iframe :src="`https://www.youtube.com/embed/${currentContent.urlCode}`" class="rounded-lg shadow" allowfullscreen></iframe>
                    </div>
                </div>

                <!-- Boton centrado -->
                <div class="flex justify-center mt-6" v-if="currentContent.type != 'presentation' && currentContent.type != 'closure'">
                    <button @click="registerActivity" class="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors">Completar</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import api from '@/service/content-management/ApiCourses';

// Props
const props = defineProps({
    courseData: {
        type: Object,
        required: true
    }
});

// Estado reactivo
const currentIndex = ref(0);
const isSidebarOpen = ref(false);

// Lista plana de todos los contenidos (presentación + actividades)
const allContents = computed(() => {
    const contents = [];

    // Agregar la presentación
    contents.push({
        type: 'presentation',
        ...props.courseData.versions.data.presentation
    });

    // Agregar las actividades de todos los módulos
    props.courseData.versions.data.elements.forEach((module) => {
        module.children.forEach((activity) => {
            contents.push({ ...activity, moduleId: module.id }); // Agregar el ID del módulo a la actividad
        });
    });

    return contents;
});

// Contenido actual
const currentContent = computed(() => allContents.value[currentIndex.value]);

// Módulo actual
const currentModule = computed(() => {
    if (currentContent.value.type === 'presentation') {
        return null; // No hay módulo para la presentación
    }

    // Buscar el módulo al que pertenece la actividad actual
    return props.courseData.versions.data.elements.find((module) => module.id === currentContent.value.moduleId);
});

// Mostrar la presentación
const showPresentation = () => {
    currentIndex.value = 0;
    isSidebarOpen.value = false; // Cerrar la barra lateral en móviles
};

// Mostrar una actividad
const showActivity = (activity) => {
    const index = allContents.value.findIndex((content) => content.id === activity.id);
    if (index !== -1) {
        currentIndex.value = index;
    }
    isSidebarOpen.value = false; // Cerrar la barra lateral en móviles
};

// Iniciar el curso (ir a la primera actividad)
const startCourse = () => {
    if (allContents.value.length > 1) {
        currentIndex.value = 1; // La primera actividad está en el índice 1 (el índice 0 es la presentación)
        isSidebarOpen.value = false; // Cerrar la barra lateral en móviles
    }
};

// Navegar al contenido anterior
const prevContent = () => {
    if (currentIndex.value > 0) {
        currentIndex.value--;
    }
};

// Navegar al siguiente contenido
const nextContent = () => {
    if (currentIndex.value < allContents.value.length - 1) {
        currentIndex.value++;
    }
};

const checkActivity = () => {
    //
};

const registerActivity = () => {
    let payload = {
        id: currentContent.value.id,
        type: 'activity-completed',
        description: 'Completed activity successfully',
        value: currentContent.value.id
    };
    console.log(payload);
    nextContent();
    /*  api.registerActivity(currentContent.value.id)
        .then((response) => {
            console.log('Actividad registrada exitosamente:', response);
        })
        .catch((error) => {
            console.error('Error al registrar la actividad:', error);
        }); */
};
</script>
