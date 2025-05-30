<template>
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 max-w-md w-full">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-semibold">Deja tu reseña</h3>
                <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <div class="mb-4">
                <label class="block text-gray-700 mb-2">Calificación</label>
                <div class="flex space-x-1">
                    <i v-for="star in 5" :key="star" @click="rating = star" :class="['fas fa-star text-2xl cursor-pointer', star <= rating ? 'text-yellow-400' : 'text-gray-300']"></i>
                </div>
            </div>

            <div class="mb-4">
                <label for="review" class="block text-gray-700 mb-2">Comentario</label>
                <textarea id="review" v-model="comment" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" rows="4" placeholder="¿Qué te pareció el curso?"></textarea>
            </div>

            <button @click="submitReview" class="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition">Enviar Reseña</button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { rateContent } from '@/service/global/RateContent';
import confetti from 'canvas-confetti';

const props = defineProps({
    contentId: {
        type: Number,
        required: true
    },
    contentType: {
        type: String,
        required: true
    },
    rate: {
        type: Object,
        required: true
    }
});

const rating = ref(0);
const comment = ref('');

const emit = defineEmits(['close']);

const submitReview = async () => {
    try {
        await rateContent({ content_id: props.contentId, content_type: props.contentType, rating: rating.value, comment: comment.value }).then((response) => {
            console.log(response);
        });
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            zIndex: 99999
        });
        // Cerrar modal después de enviar
        emit('close');
    } catch (error) {
        console.error('Error al enviar reseña:', error);
    }
};

onMounted(() => {
    rating.value = props.rate.user_rating?.rating || 0;
    comment.value = props.rate.user_rating?.comment || '';
});
</script>
