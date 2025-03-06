<template>
    <Toolbar class="flex fixed w-[30%] z-50">
        <template #start>
            <span class="font-semibold text-xl mb-2">Creación de Curso</span>
        </template>
        <template #end>
            <Button label="Save" @click="saveCourse()" icon="pi pi-check" />
            <Button label="Publish" @click="publishCourse()" class="ml-2" icon="pi pi-cloud-upload" severity="success" />
        </template>
    </Toolbar>
    <Loading v-if="loader" />
    <div class="card mt-24" v-else>
        <h1 class="text-4xl font-bold">
            {{ course.title }}
            <Tag severity="success" class="max-h-6"> V{{ courseVersion?.version }}</Tag>
        </h1>
        <small class="mb-8">{{ course.description }}</small>
        <Tabs value="0" class="mt-8">
            <TabList>
                <Tab value="0"><i class="pi pi-pencil mr-2"></i> Creator</Tab>
                <Tab value="1"><i class="pi pi-settings mr-2"></i> Settings</Tab>
            </TabList>
            <TabPanels>
                <TabPanel value="0">
                    <div class="w-[95%] font-semibold text-xl mb-4">
                        <Card class="mt-6 p-3 bg-gray-100">
                            <template #title>
                                <label for="title" class="block font-bold mb-3">Presentacion</label>
                            </template>
                            <template #content>
                                <div class="card flex flex-col items-center gap-6">
                                    <label for="file" class="block font-bold mb-3">Portada</label>

                                    <FileUpload
                                        mode="basic"
                                        @select="onFileSelectPresentation"
                                        :chooseLabel="courseVersion?.data?.presentation?.image ? 'Change Image' : 'Upload Image'"
                                        customUpload
                                        auto
                                        severity="secondary"
                                        class="p-button-outlined"
                                    />
                                    <img v-if="courseVersion?.data?.presentation?.image" :src="courseVersion?.data.presentation.image" alt="Image" class="shadow-md rounded-xl w-full" />
                                </div>
                                <Editor
                                    api-key="0954x5p66yvz6y07qr4f65no48i7zvurvidb42cvhhe4ns67"
                                    v-model="presentation"
                                    :init="{
                                        toolbar_mode: 'sliding',
                                        plugins: [
                                            // Core editing features
                                            'anchor',
                                            'autolink',
                                            'charmap',
                                            'codesample',
                                            'emoticons',
                                            'image',
                                            'link',
                                            'lists',
                                            'media',
                                            'searchreplace',
                                            'table',
                                            'visualblocks',
                                            'wordcount',
                                            // Your account includes a free trial of TinyMCE premium features
                                            // Try the most popular premium features until Mar 17, 2025:
                                            'checklist',
                                            'mediaembed',
                                            'casechange',
                                            'export',
                                            'formatpainter',
                                            'pageembed',
                                            'a11ychecker',
                                            'tinymcespellchecker',
                                            'permanentpen',
                                            'powerpaste',
                                            'advtable',
                                            'advcode',
                                            'editimage',
                                            'advtemplate',
                                            'ai',
                                            'mentions',
                                            'tinycomments',
                                            'tableofcontents',
                                            'footnotes',
                                            'mergetags',
                                            'autocorrect',
                                            'typography',
                                            'inlinecss',
                                            'markdown',
                                            'importword',
                                            'exportword',
                                            'exportpdf'
                                        ],
                                        toolbar:
                                            'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
                                        tinycomments_mode: 'embedded',
                                        tinycomments_author: 'Author name',
                                        mergetags_list: [
                                            { value: 'First.Name', title: 'First Name' },
                                            { value: 'Email', title: 'Email' }
                                        ],
                                        ai_request: (request, respondWith) => respondWith.string(() => Promise.reject('See docs to implement AI Assistant'))
                                    }"
                                    @update:modelValue="handleEditorChangePresentation"
                                />
                            </template>
                        </Card>
                    </div>
                    <div v-for="(element, index) in elements" :key="index" class="element flex flex-col w-[90%]">
                        <div class="w-full mb-6">
                            <Card class="w-full p-3 bg-gray-100">
                                <template #title>
                                    <!-- <label :for="'section' + index" class="block font-bold mb-3">{{ element.value ? element.value : 'Módulo ' + (index + 1) }}</label> -->
                                    <InputText v-model="element.value" :placeholder="element.value ? element.value : 'Módulo ' + (index + 1)" class="mx-4 md:w-14rem mb-5" />
                                    <Button @click="removeElement(index)" label="Eliminar" icon="pi pi-trash" security="danger"></Button>
                                </template>
                                <template #content>
                                    <div v-for="(activity, element) in elements[index].children" :key="element" class="element flex flex-col w-full">
                                        <div class="w-full mb-6">
                                            <!-- RitchText -->
                                            <Card v-if="activity.type === 'richtext'" class="w-full p-3 bg-gray-100">
                                                <template #title>
                                                    <InputText v-model="activity.title" :placeholder="'Actividad ' + (element + 1)" :value="activity.title || ' Actividad ' + (element + 1)" class="w-[90%] md:w-14rem mb-5" /> |
                                                    <i class="pi pi-trash cursor-pointer" @click="removeActivity(index)"></i>
                                                </template>
                                                <template #content>
                                                    <!-- <EditorTiny :content="activity.value" v-model="activity.value" /> -->
                                                    <Editor
                                                        api-key="0954x5p66yvz6y07qr4f65no48i7zvurvidb42cvhhe4ns67"
                                                        v-model="activity.content"
                                                        :init="{
                                                            toolbar_mode: 'sliding',
                                                            plugins: [
                                                                // Core editing features
                                                                'anchor',
                                                                'autolink',
                                                                'charmap',
                                                                'codesample',
                                                                'emoticons',
                                                                'image',
                                                                'link',
                                                                'lists',
                                                                'media',
                                                                'searchreplace',
                                                                'table',
                                                                'visualblocks',
                                                                'wordcount',
                                                                // Your account includes a free trial of TinyMCE premium features
                                                                // Try the most popular premium features until Mar 17, 2025:
                                                                'checklist',
                                                                'mediaembed',
                                                                'casechange',
                                                                'export',
                                                                'formatpainter',
                                                                'pageembed',
                                                                'a11ychecker',
                                                                'tinymcespellchecker',
                                                                'permanentpen',
                                                                'powerpaste',
                                                                'advtable',
                                                                'advcode',
                                                                'editimage',
                                                                'advtemplate',
                                                                'ai',
                                                                'mentions',
                                                                'tinycomments',
                                                                'tableofcontents',
                                                                'footnotes',
                                                                'mergetags',
                                                                'autocorrect',
                                                                'typography',
                                                                'inlinecss',
                                                                'markdown',
                                                                'importword',
                                                                'exportword',
                                                                'exportpdf'
                                                            ],
                                                            toolbar:
                                                                'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
                                                            tinycomments_mode: 'embedded',
                                                            tinycomments_author: 'Author name',
                                                            mergetags_list: [
                                                                { value: 'First.Name', title: 'First Name' },
                                                                { value: 'Email', title: 'Email' }
                                                            ],
                                                            ai_request: (request, respondWith) => respondWith.string(() => Promise.reject('See docs to implement AI Assistant'))
                                                        }"
                                                        @update:modelValue="handleEditorChange"
                                                    />
                                                </template>
                                            </Card>
                                            <!-- ImagenComponent -->
                                            <Card v-if="activity.type === 'image'" class="w-full p-3 bg-gray-100">
                                                <template #title>
                                                    <InputText v-model="activity.title" :placeholder="'Actividad ' + (element + 1)" :value="activity.title || ' Actividad ' + (element + 1)" class="w-[90%] md:w-14rem mb-5" /> |
                                                    <i class="pi pi-trash cursor-pointer" @click="removeActivity(index)"></i>
                                                </template>
                                                <template #content>
                                                    <Textarea v-model="activity.description" :autoResize="true" placeholder="Description" class="w-full mb-8" rows="3" cols="30" />
                                                    <FileUpload
                                                        mode="basic"
                                                        :chooseLabel="activity.image ? 'Change Image' : 'Upload Image'"
                                                        accept="image/*"
                                                        @select="onFileSelect($event, element, index)"
                                                        customUpload
                                                        auto
                                                        severity="secondary"
                                                        class="p-button-outlined mb-4"
                                                    />
                                                    <img v-if="activity.image" :src="activity.image" alt="Image" class="shadow-md rounded-xl w-full" />
                                                </template>
                                            </Card>
                                            <!-- Document -->
                                            <Card v-if="activity.type === 'document'" class="w-full p-3 bg-gray-100">
                                                <template #title>
                                                    <InputText v-model="activity.title" :value="activity.title ?? ' Actividad ' + (element + 1)" :placeholder="'Actividad ' + (element + 1)" class="w-[90%] md:w-14rem mb-5" />
                                                    |
                                                    <i class="pi pi-trash cursor-pointer" @click="removeActivity(index)"></i>
                                                </template>
                                                <template #content>
                                                    <Textarea v-model="activity.description" :autoResize="true" placeholder="Description" class="w-full mb-8" rows="3" cols="30" />
                                                    <!-- Botón para cargar archivo -->
                                                    <input
                                                        type="file"
                                                        class="p-button-outlined mb-4"
                                                        accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                                        @change="(event) => onFileSelectDocument(event, element, index)"
                                                    />
                                                </template>
                                            </Card>
                                        </div>
                                    </div>
                                    <div>
                                        <label class="font-bold mb-3">Agregar una Actividad</label>
                                        <div class="flex flex-row flex-wrap">
                                            <Card @click="addActivity(index, 'catalog')" class="m-4 p-3 bg-gray-200 opacity-50">
                                                <template #title>
                                                    <i class="pi pi-images" style="font-size: 3rem"></i>
                                                </template>
                                                <template #content>
                                                    <span class="block font-bold mb-3">Biblioteca Multimedia</span>
                                                </template>
                                            </Card>
                                            <Card @click="addActivity(index, 'richtext')" class="m-4 p-3 bg-gray-200 cursor-pointer hover:bg-primary-100 duration-500 transition-all">
                                                <template #title>
                                                    <i class="pi pi-pencil" style="font-size: 3rem"></i>
                                                </template>
                                                <template #content>
                                                    <span class="block font-bold mb-3">Agregar Texto</span>
                                                </template>
                                            </Card>
                                            <Card @click="addActivity(index, 'image')" class="m-4 p-3 bg-gray-200 cursor-pointer hover:bg-primary-100 duration-500 transition-all">
                                                <template #title>
                                                    <i class="pi pi-image" style="font-size: 3rem"></i>
                                                </template>
                                                <template #content>
                                                    <span class="block font-bold mb-3">Agregar Imagen</span>
                                                </template>
                                            </Card>
                                            <Card class="m-4 p-3 bg-gray-200 opacity-50 disabled:cursor-pointer">
                                                <template #title>
                                                    <i class="pi pi-video" style="font-size: 3rem"></i>
                                                </template>
                                                <template #content>
                                                    <span class="block font-bold mb-3">Agregar Video</span>
                                                </template>
                                            </Card>
                                            <Card @click="addActivity(index, 'document')" class="m-4 p-3 bg-gray-200 cursor-pointer hover:bg-primary-100 duration-500 transition-all">
                                                <template #title>
                                                    <i class="pi pi-file" style="font-size: 3rem"></i>
                                                </template>
                                                <template #content>
                                                    <span class="block font-bold mb-3">Agregar Documento</span>
                                                </template>
                                            </Card>
                                        </div>
                                    </div>
                                </template>
                            </Card>
                            <!-- <InputText :id="'section' + index" v-model="element.value" required="true" autofocus :invalid="submitted && !element.value" fluid /> -->
                            <small v-if="submitted && !element.value" class="text-red-500">Section is required.</small>
                        </div>
                    </div>

                    <div class="flex flex-col items-center justify-center my-8">
                        <Button label="Agregar Módulo" icon="pi pi-plus" @click="addElement"></Button>
                    </div>
                </TabPanel>
                <TabPanel value="1">
                    <div class="flex flex-col gap-6">
                        <div>
                            <label for="title" class="block font-bold mb-3">Title</label>
                            <InputText id="title" v-model.trim="course.title" required="true" autofocus :invalid="submitted && !course.title" fluid />
                            <small v-if="submitted && !course.title" class="text-red-500">Title is required.</small>
                        </div>
                        <div>
                            <label for="description" class="block font-bold mb-3">Description</label>
                            <Textarea id="description" v-model="course.description" required="true" rows="3" cols="20" fluid />
                        </div>
                        <!--  <div>
                                <label for="inventoryStatus" class="block font-bold mb-3">Inventory Status</label>
                                <Select id="inventoryStatus" v-model="course.inventoryStatus" :options="statuses" optionLabel="label" placeholder="Select a Status" fluid></Select>
                            </div> -->

                        <div>
                            <span class="block font-bold mb-4">Access Type</span>
                            <div class="grid grid-cols-12 gap-4">
                                <div class="flex items-center gap-2 col-span-6">
                                    <RadioButton id="category1" v-model="course.access_type" name="access_type" value="free" />
                                    <label for="category1">Free</label>
                                </div>
                                <div class="flex items-center gap-2 col-span-6">
                                    <RadioButton id="category2" v-model="course.access_type" name="access_type" value="paid" />
                                    <label for="category2">Pay</label>
                                </div>
                                <div class="flex items-center gap-2 col-span-6">
                                    <RadioButton id="category3" v-model="course.access_type" name="access_type" value="private" />
                                    <label for="category3">Private</label>
                                </div>
                                <div class="flex items-center gap-2 col-span-6">
                                    <RadioButton id="category4" v-model="course.access_type" name="access_type" value="subscription" />
                                    <label for="category4">Subscription</label>
                                </div>
                            </div>
                        </div>

                        <!-- <div class="grid grid-cols-12 gap-4">
                                <div class="col-span-6">
                                    <label for="price" class="block font-bold mb-3">Price</label>
                                    <InputNumber id="price" v-model="course.price" mode="currency" currency="USD" locale="en-US" fluid />
                                </div>
                                <div class="col-span-6">
                                    <label for="quantity" class="block font-bold mb-3">Quantity</label>
                                    <InputNumber id="quantity" v-model="course.quantity" integeronly fluid />
                                </div>
                            </div> -->
                    </div>
                </TabPanel>
            </TabPanels>
        </Tabs>
        <hr class="my-3" />
        <Button label="Save" @click="saveCourse()" icon="pi pi-check" />
    </div>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useToast } from 'primevue/usetoast';
import api from '@/service/content-management/ApiCourses';
import Editor from '@tinymce/tinymce-vue';
import { useRoute } from 'vue-router';
import Loading from '@/components/global/Loading.vue';

const toast = useToast();
const src = ref(null);
const presentation = ref('');
const loader = ref(true);
const content = ref('');
const handleEditorChange = (newValue) => {
    content.value = newValue;
};

const handleEditorChangePresentation = (newValue) => {
    presentation.value = newValue;
};

const onFileSelect = (event, element, index) => {
    const file = event.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
        elements.value[index].children[element].image = e.target.result;
    };
    reader.readAsDataURL(file);
};

// Método para manejar la selección de archivos
const onFileSelectDocument = (event, childIndex, index) => {
    const file = event.target.files[0]; // Archivo seleccionado desde el input
    if (!file) {
        console.error('No se seleccionó ningún archivo.');
        return;
    }

    // Opcional: Validar el tipo de archivo
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
        console.error('Tipo de archivo no soportado:', file.type);
        return;
    }

    // Leer el archivo como Base64 usando FileReader
    const reader = new FileReader();
    reader.onload = (e) => {
        elements.value[index].children[childIndex].document = e.target.result; // Guarda el archivo en formato Base64
        console.log('Archivo cargado correctamente:', file.name);
    };
    reader.readAsDataURL(file);
};

const courseVersion = ref({
    data: {
        presentation: {
            image: '',
            description: ''
        }
    }
});

function onFileSelectPresentation(event) {
    const file = event.files[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
        if (!courseVersion.value) {
            console.error('courseVersion.value es null o undefined');
            return;
        }

        if (!courseVersion.value.data) {
            courseVersion.value.data = {};
        }

        if (!courseVersion.value.data.presentation) {
            courseVersion.value.data.presentation = {};
        }

        courseVersion.value.data.presentation.image = e.target.result;
    };

    reader.readAsDataURL(file);
}

const route = useRoute();
const courseId = ref(route.params.courseId);
const course = ref({});
const submitted = ref(false);

const getCourse = async () => {
    const response = await api.getCourse(courseId.value);
    console.log(response);
    course.value = response;
    courseVersion.value = response.versions ?? {};
    presentation.value = courseVersion.value?.data?.presentation?.description ?? '';
    elements.value = courseVersion.value?.data?.elements || [];
    console.log(response);
    //console.log(courseVersion.value.data.presentation.image);
    loader.value = false;
};

const saveCourse = () => {
    const data = {
        course: course.value,
        presentation: {
            description: presentation.value,
            image: courseVersion.value.data.presentation.image
        },
        elements: elements.value
    };
    api.updateCourse(courseId.value, data).then((response) => {
        //console.log(response);
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Course Updated', life: 3000 });
        getCourse();
    });
};

const autoSaveCourse = () => {
    saveCourse();
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Autosaved Course', life: 3000 });
};

const publishCourse = () => {
    api.publishCourse(courseId.value).then((response) => {
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Course Published', life: 3000 });
        getCourse();
    });
};

// Array reactivo para almacenar los elementos dinámicos
const elements = ref([]);

// Método para agregar un nuevo elemento
const addElement = () => {
    elements.value = elements.value || [];
    elements.value.push({ id: Date.now(), value: '', children: [] }); // Agrega un nuevo objeto con un campo `value` y un campo `children` vacío
};

const addActivity = (index, type) => {
    elements.value[index].children.push({ type, value: '' }); // Agrega un nuevo elemento al array `children` del elemento en la posición `index`
};

// Método para eliminar un elemento
const removeElement = (index) => {
    elements.value.splice(index, 1); // Elimina el elemento en la posición `index`
};

const removeActivity = (index) => {
    elements.value[index].children.splice(index, 1); // Elimina el elemento en la posición `index`
};

let autoSaveInterval = null;

onMounted(() => {
    getCourse();
    // Ejecutar cada 5 minutos (300000 ms)
    autoSaveInterval = setInterval(autoSaveCourse, 300000);
});

onBeforeUnmount(() => {
    // Limpiar el temporizador cuando el componente se destruye
    clearInterval(autoSaveInterval);
});
</script>
<style scoped>
.editor {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    border-radius: 4px;
}

.toolbar {
    margin-bottom: 10px;
}

.toolbar button {
    color: #555555;
    margin-right: 5px;
    padding: 5px 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background-color: #f9f9f9;
    cursor: pointer;
}

.toolbar button.is-active {
    background-color: #ddd;
}

/* Estilos para el editor */
.editor-content {
    border-radius: 4px;
    padding: 10px;
    min-height: 200px;
}

.tiptap .ProseMirror p {
    padding: 10%;
}
</style>
