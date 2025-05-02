<template>
    <Loading v-if="loading" />

    <div class="w-full h-full flex flex-col gap-4">
        <div class="flex flex-col gap-4 w-full h-full overflow-auto">
            <div class="flex flex-col gap-2 w-full h-full overflow-auto">
                <h2 class="text-2xl font-bold">Contenido</h2>
                <p class="text-sm text-gray-500">Contenido de la comunidad</p>
            </div>
            <div class="flex flex-col gap-2 w-full h-full overflow-auto">
                <p class="text-sm text-gray-500">No hay contenido disponible</p>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, onMounted, defineEmits, defineProps } from 'vue';
import Loading from '@/components/global/Loading.vue';
import { useToast } from 'primevue/usetoast';
import api from '@/service/settings/ApiCommunities';

const toast = useToast();
const loading = ref(false);
const bottomLoading = ref(false);
const submitted = ref(false);

const props = defineProps({
    communityId: {
        type: Number || undefined,
        required: true
    }
});

const community = ref({});
const contents = ref([]);
const emit = defineEmits(['update:contents']);

onMounted(() => {});
</script>
