<script setup>
import { computed, ref } from 'vue';
import { useToast } from 'primevue/usetoast';

const toast = useToast();

const props = defineProps({
    title: String,
    items: {
        type: Array,
        default: () => []
    }
});

// Agrupar por mes (YYYY-MM)
const groupedByMonth = computed(() => {
    const grouped = {};

    for (const item of props.items) {
        const date = new Date(item.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (!grouped[monthKey]) {
            grouped[monthKey] = [];
        }
        grouped[monthKey].push(item);
    }

    return grouped;
});

const openMonths = ref({});
const toggleMonth = (key) => {
    openMonths.value[key] = !openMonths.value[key];
};
const isOpen = (key) => openMonths.value[key] ?? false;

const formatMonth = (monthKey) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(year, Number(month) - 1);
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
};

// Modal para ver imagen grande
const showModal = ref(false);
const modalImage = ref(null);

const openImageModal = (item) => {
    modalImage.value = item;
    showModal.value = true;
};

const closeModal = () => {
    showModal.value = false;
    modalImage.value = null;
};

// Copiar al portapapeles
const copyToClipboard = (text) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();

    try {
        document.execCommand('copy');
        toast.add({ severity: 'success', summary: 'Copy', detail: 'Link copied to clipboard.', life: 3000 });
    } catch (err) {
        console.error('Error al copiar (fallback):', err);
    } finally {
        document.body.removeChild(textarea);
    }
};
</script>

<template>
    <div class="mb-10">
        <h2 class="text-2xl font-semibold mb-4 capitalize">{{ title }}</h2>

        <div v-if="groupedByMonth">
            <div v-for="(groupItems, monthKey) in groupedByMonth" :key="monthKey" class="mb-6 border rounded-xl">
                <button class="w-full rounded-xl text-left px-4 py-3 bg-gray-100 font-medium hover:bg-gray-200 flex justify-between items-center" @click="toggleMonth(monthKey)">
                    <span>{{ formatMonth(monthKey) }} ({{ groupItems.length }})</span>
                    <span :class="{ 'rotate-180': isOpen(monthKey) }" class="transition-transform">▼</span>
                </button>

                <div v-show="isOpen(monthKey)" class="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    <div v-for="item in groupItems" :key="item.id" class="bg-white rounded-xl shadow p-2 border hover:shadow-lg transition relative">
                        <!-- Imagen -->
                        <div class="aspect-video overflow-hidden rounded mb-2 bg-gray-50 flex items-center justify-center relative">
                            <template v-if="item.type === 'image'">
                                <img :src="item.url" :alt="item.name" class="object-cover w-full h-full" />
                                <!-- Botones de acción -->
                                <div class="absolute top-1 right-1 flex space-x-1 bg-white/80 backdrop-blur-sm rounded p-1">
                                    <button class="text-sm hover:text-blue-600" @click.stop="openImageModal(item)" title="Ver grande">🔍</button>
                                    <button class="text-sm hover:text-green-600" @click.stop="copyToClipboard(item.url)" title="Copiar enlace">🔗</button>
                                </div>
                            </template>

                            <template v-else-if="item.type === 'video'">
                                <video controls class="w-full h-full">
                                    <source :src="item.url" :type="`video/${item.extension}`" />
                                </video>
                            </template>

                            <template v-else-if="item.type === 'audio'">
                                <audio controls class="w-full">
                                    <source :src="item.url" :type="`audio/${item.extension}`" />
                                </audio>
                            </template>

                            <template v-else-if="item.type === 'document'">
                                <a :href="item.url" target="_blank" class="text-sm text-blue-600 underline"> Ver documento </a>
                            </template>

                            <template v-else>
                                <span class="text-gray-500 text-sm">{{ item.extension.toUpperCase() }}</span>
                            </template>
                        </div>

                        <p class="text-sm text-center truncate" :title="item.name">{{ item.name }}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal -->
        <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" @click="closeModal">
            <img :src="modalImage.url" :alt="modalImage.name" class="max-w-full max-h-[80vh] rounded-xl shadow-lg" />
        </div>
    </div>
</template>
