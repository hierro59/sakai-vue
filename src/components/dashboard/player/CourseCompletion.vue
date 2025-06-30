<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Hero Section -->
        <div class="completion-hero py-12 px-4 text-center text-white">
            <div class="max-w-4xl mx-auto">
                <div class="achievement-badge inline-block mb-6">
                    <i class="fas fa-trophy text-6xl text-yellow-300"></i>
                </div>
                <h1 class="text-4xl font-bold mb-4">{{ t('congrats') }}</h1>
                <p class="text-xl mb-8">
                    {{ t('courseCompleted') }} <strong>{{ course.title }}</strong>
                </p>

                <div class="flex flex-wrap justify-center gap-4">
                    <button @click="downloadCertificate" class="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"><i class="fas fa-download mr-2"></i> {{ t('downloadCertificate') }}</button>
                    <button v-if="!props.provider" @click="openReviewModal" class="bg-white bg-opacity-20 px-6 py-3 rounded-lg font-semibold hover:bg-opacity-30 transition">
                        <i class="fas fa-star mr-2"></i>{{ course.rating_summary?.user_rating ? t('updateReview') : t('leaveReview') }}
                    </button>
                </div>
            </div>
        </div>

        <!-- Main Content -->
        <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div class="grid md:grid-cols-3 gap-8">
                <!-- Certificate Preview -->
                <div class="md:col-span-2">
                    <div class="bg-white rounded-xl p-6 shadow-sm">
                        <h2 class="text-2xl font-bold mb-6">{{ t('certificateTitle') }}</h2>

                        <div class="certificate-preview bg-white rounded-lg overflow-hidden">
                            <iframe :src="certificate.download_url + '#toolbar=0&navpanes=0'" width="100%" height="320" style="border: none"></iframe>
                        </div>

                        <div class="mt-6 flex flex-wrap gap-3">
                            <button @click="shareCertificate" class="share-btn bg-blue-50 text-blue-600 px-4 py-2 rounded-lg"><i class="fab fa-facebook mr-2"></i> {{ t('share') }}</button>
                            <button @click="shareOnTwitter" class="share-btn bg-blue-100 text-blue-500 px-4 py-2 rounded-lg"><i class="fab fa-twitter mr-2"></i> Tweet</button>
                            <button @click="shareOnLinkedIn" class="share-btn bg-blue-200 text-blue-700 px-4 py-2 rounded-lg"><i class="fab fa-linkedin mr-2"></i> LinkedIn</button>
                            <button @click="copyCertificateLink" class="share-btn bg-gray-100 text-gray-700 px-4 py-2 rounded-lg"><i class="fas fa-link mr-2"></i> {{ t('copyLink') }}</button>
                        </div>
                    </div>
                </div>

                <!-- Stats and Next Steps -->
                <div class="space-y-6">
                    <!-- Progress Stats -->
                    <div class="bg-white rounded-xl p-6 shadow-sm">
                        <h3 class="text-xl font-semibold mb-4">{{ t('yourProgress') }}</h3>
                        <div class="space-y-4">
                            <div>
                                <p class="text-gray-600">{{ t('finalGrade') }}</p>
                                <div class="flex items-center mt-1">
                                    <span class="text-2xl font-bold text-indigo-600">{{ grade }}%</span>
                                    <div class="ml-2 w-full bg-gray-200 rounded-full h-2.5">
                                        <div class="bg-indigo-600 h-2.5 rounded-full" :style="`width: ${grade}%`"></div>
                                    </div>
                                </div>
                            </div>
                            <!-- <div>
                                <p class="text-gray-600">Tiempo invertido</p>
                                <p class="text-xl font-semibold">{{ time_spent }} horas</p>
                            </div> -->
                            <div>
                                <p class="text-gray-600">{{ t('completionDate') }}</p>
                                <p class="text-xl font-semibold">{{ formatDate(completed_at) }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Recommendations -->
                    <div class="bg-white rounded-xl p-6 shadow-sm">
                        <h3 class="text-xl font-semibold mb-4">{{ t('nextSteps') }}</h3>
                        <ul class="space-y-3">
                            <li class="flex items-start">
                                <i class="fas fa-check-circle text-green-500 mt-0.5 mr-2"></i>
                                <span
                                    ><a href="https://www.linkedin.com/in/" target="_blank" class="text-indigo-600 hover:underline">{{ t('addToProfile') }} </a></span
                                >
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check-circle text-green-500 mt-0.5 mr-2"></i>
                                <span
                                    ><a href="#" @click="$router.push('/dashboard/catalog')" class="text-indigo-600 hover:underline">{{ t('exploreCourses') }} </a></span
                                >
                            </li>
                            <!-- <li class="flex items-start">
                                <i class="fas fa-check-circle text-green-500 mt-0.5 mr-2"></i>
                                <span>Completa tu <a href="#" class="text-indigo-600 hover:underline">perfil de habilidades</a></span>
                            </li> -->
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Recommended Courses -->
            <div class="mt-16">
                <h2 class="text-2xl font-bold mb-6">{{ t('keepLearning') }}</h2>
                <div class="grid md:grid-cols-3 gap-6">
                    <div v-for="course in recommendedCourses" :key="course.id">
                        <CourseCard :course="course" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Review Modal -->
        <ReviewModal v-if="showReviewModal" :contentId="course.id" :contentType="course.content_type" :rate="course.rating_summary" @close="showReviewModal = false" />
    </div>
</template>

<script setup>
import { ref, onMounted, defineProps, computed } from 'vue';
import { useRoute } from 'vue-router';
import ReviewModal from './ReviewModal.vue';
import confetti from 'canvas-confetti';
import api from '@/service/content-management/ApiCourses';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const route = useRoute();

// Definir las props que recibe el componente
const props = defineProps({
    course: {
        type: Object,
        required: true,
        validator: (value) => {
            return (value.id && value.title) || value.origin_course_id;
        }
    },
    certificate: {
        type: Object,
        required: true,
        validator: (value) => {
            return value.share_url && value.download_url;
        }
    },
    grade: {
        type: Number,
        required: true,
        validator: (value) => value >= 0 && value <= 100
    },
    recommendedCourses: {
        type: Array,
        default: () => []
    },
    provider: {
        type: String || null,
        default: null
    }
});

// Métodos (igual que antes pero usando props.course, props.student, etc.)
const downloadCertificate = async () => {
    try {
        window.open(props.certificate.download_url, '_blank');
    } catch (error) {
        console.error('Error al descargar certificado:', error);
    }
};

const completed_at = ref(new Date());
const showReviewModal = ref(false);

const recommendedCourses = ref([]);

const getCoursesByLearner = () => {
    api.getContents({
        page: 1,
        per_page: 3,
        search: null,
        type: null
    })
        .then((response) => {
            // response es paginado: incluye data, total, etc.
            recommendedCourses.value = response.data || [];
        })
        .catch((error) => {
            console.error(error);
            recommendedCourses.value = [];
        });
};

// Métodos

const openReviewModal = () => {
    showReviewModal.value = true;
};

const shareCertificate = () => {
    if (navigator.share) {
        navigator
            .share({
                title: `He completado el curso ${props.course.title}`,
                text: `Acabo de completar el curso ${props.course.title}. ¡Mira mi certificado!`,
                url: props.certificate.download_url
            })
            .catch((err) => {
                console.log('Error al compartir:', err);
            });
    } else {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(props.certificate.download_url)}`, '_blank');
    }
};

const shareOnTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Acabo de completar "${props.course.title}" y obtuve mi certificado!`)}&url=${encodeURIComponent(props.certificate.download_url)}`, '_blank');
};

const shareOnLinkedIn = () => {
    window.open(
        `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(props.certificate.download_url)}&title=${encodeURIComponent(`Certificado de ${props.course.title}`)}&summary=${encodeURIComponent(`He completado con éxito el curso ${props.course.title}`)}`,
        '_blank'
    );
};

const copyCertificateLink = async () => {
    try {
        await navigator.clipboard.writeText(props.certificate.share_url);
        alert('Enlace copiado al portapapeles');
    } catch (err) {
        console.error('Error al copiar:', err);
    }
};

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES');
};

// Formatear fecha computada
const formattedDate = computed(() => {
    return new Date(props.completedAt).toLocaleDateString('es-ES');
});

const truncate = (text, length) => {
    return text.length > length ? text.substring(0, length) + '...' : text;
};

onMounted(() => {
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        zIndex: 99999
    });
    getCoursesByLearner();
});
</script>

<style scoped>
.completion-hero {
    background: linear-gradient(135deg, #6e8efb, #a777e3);
    color: white;
}
.certificate-preview {
    border: 15px solid #f8f9fa;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}
.certificate-preview:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}
.share-btn {
    transition: transform 0.2s;
}
.share-btn:hover {
    transform: scale(1.05);
}
.achievement-badge {
    animation: pulse 2s infinite;
}
@keyframes pulse {
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.05);
    }
    100% {
        transform: scale(1);
    }
}
</style>
