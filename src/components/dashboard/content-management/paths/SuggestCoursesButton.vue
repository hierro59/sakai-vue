<script setup>
import { ref, defineProps, computed, defineEmits } from 'vue';
import api from '@/service/content-management/ApiLearningPaths';
import { marked } from 'marked';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const emit = defineEmits(['update:contents']);

const props = defineProps({
    pathId: {
        type: Number,
        required: true
    }
});

const loading = ref(false);
const fullText = ref('');
const suggest = ref([]);
const suggestions = ref([]);

const fullTextHtml = computed(() => {
    const cleaned = fullText.value.replace(/\*\*\[[^\]]+\]\*\*/g, ''); // elimina **[código]**
    return marked.parse(cleaned);
});

const generatePath = async () => {
    loading.value = true;
    try {
        const { data } = await api.getSuggestContents(props.pathId);
        console.log('Respuesta AI: ', data);
        //suggestions.value = data.suggestions;
        fullText.value = data.full_text;
        suggest.value = data.suggestions;
        console.log('Sugerencias: ', suggest.value);
    } catch (error) {
        console.error(error);
    }
    loading.value = false;
};

const addSuggestion = () => {
    console.log('Agregando sugerencias...');
    suggest.value = suggest.value.map((s) => ({
        ...s,
        type: 'ia'
    }));
    console.log(suggest.value);
    api.addContents(props.pathId, suggest.value)
        .then((response) => {
            console.log(response);
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Contents Added', life: 3000 });
            emit('update:contents');
            removeSuggestion();
        })
        .catch((error) => {
            console.log(error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al agregar los contenidos', life: 3000 });
        });
};

const removeSuggestion = () => {
    fullText.value = '';
    suggest.value = [];
};
</script>

<template>
    <Toolbar style="width: 100%" class="p-4">
        <template #start>
            <span class="font-semibold mb-2"
                >Pregunte a <b>AtenIA</b> que contenido puede agregar al Sendero
                <Button :label="loading ? 'Generando...' : 'Pregutar'" icon="pi pi-sparkles" class="m-2" @click="generatePath" />
            </span>
        </template>
    </Toolbar>
    <Card class="p-4 my-6 mx-4" v-if="fullText">
        <template #content>
            <div>
                <h3><img src="/images/owl.png" class="w-8 inline-block mr-2" /> Hola!</h3>
                <div v-html="fullTextHtml" class="prose"></div>
            </div>
            <div v-if="suggest.length">
                <h3>Cursos sugeridos:</h3>
                <ul>
                    <li v-for="s in suggest" :key="s.id">
                        <strong>{{ s.title }}</strong>
                    </li>
                </ul>
            </div>
        </template>
        <template #footer v-if="suggest.length">
            <p class="m-2">Te gustaría que los cursos sugeridos se agreguen a la ruta?</p>
            <Button label="Si" icon="pi pi-check" class="mr-2" @click="addSuggestion" />
            <Button label="No" icon="pi pi-times" class="mr-2" @click="removeSuggestion" />
        </template>
    </Card>
</template>
