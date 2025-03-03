<template>
    <Toolbar class="mb-6">
        <template #start> <span class="font-semibold text-xl">Creación de Curso</span> </template>
        <template #end>
            <Button label="Save" icon="pi pi-check" />
        </template>
    </Toolbar>
    <div class="card">
        <h1 class="text-4xl font-bold">{{ course.title }}</h1>
        <small class="mb-8">{{ course.description }}</small>
        <Tabs value="0" class="mt-8">
            <TabList>
                <Tab value="0"><i class="pi pi-pencil mr-2"></i> Creator</Tab>
                <Tab value="1"><i class="pi pi-settings mr-2"></i> Settings</Tab>
            </TabList>
            <TabPanels>
                <TabPanel value="0">
                    <Splitter>
                        <SplitterPanel class="flex flex-col items-center justify-center my-8" :size="20" :minSize="10">
                            <div class="p-6 cursor-pointer hover:bg-primary-200 rounded-md duration-500 transition-all">
                                <span>Presentacion</span>
                            </div>
                            <Divider />
                            <div v-for="(element, index) in elements" :key="index" class="element flex flex-col items-center">
                                <InputText v-model="element.value" :placeholder="'Capitulo ' + (index + 1)" class="mx-4 md:w-14rem mb-5" />
                                <Button @click="removeElement(index)" label="Eliminar" icon="pi pi-trash" security="danger"></Button>
                                <Divider />
                            </div>
                            <Button label="Agregar Capitulo" icon="pi pi-plus" @click="addElement"></Button>
                        </SplitterPanel>
                        <SplitterPanel class="flex flex-col items-center justify-center" :size="80">
                            <div class="w-[95%] font-semibold text-xl mb-4">
                                <Card class="mt-6 p-3 bg-gray-100">
                                    <template #title>
                                        <label for="title" class="block font-bold mb-3">Presentacion</label>
                                    </template>
                                    <template #content>
                                        <div class="card flex flex-col items-center gap-6">
                                            <label for="file" class="block font-bold mb-3">Portada</label>
                                            <FileUpload mode="basic" @select="onFileSelectPresentation" customUpload auto severity="secondary" class="p-button-outlined" />
                                            <img v-if="src" :src="src" alt="Image" class="shadow-md rounded-xl w-full" />
                                        </div>
                                        <EditorTiny :contentext="presentation" />
                                    </template>
                                </Card>
                            </div>
                            <div v-for="(element, index) in elements" :key="index" class="element flex flex-col w-[90%]">
                                <div class="w-full mb-6">
                                    <Card class="w-full p-3 bg-gray-100">
                                        <template #title>
                                            <label :for="'section' + index" class="block font-bold mb-3">{{ element.value ? element.value : 'Capitulo ' + (index + 1) }}</label>
                                        </template>
                                        <template #content>
                                            <div v-for="(activity, element) in elements[index].children" :key="element" class="element flex flex-col w-full">
                                                <div class="w-full mb-6">
                                                    <!-- RitchText -->
                                                    <Card v-if="activity.type === 'richtext'" class="w-full p-3 bg-gray-100">
                                                        <template #title>
                                                            <InputText v-model="activity.value" :placeholder="'Actividad ' + (element + 1)" class="mx-4 md:w-14rem mb-5" /> |
                                                            <i class="pi pi-trash cursor-pointer" @click="removeActivity(index)"></i>
                                                        </template>
                                                        <template #content>
                                                            <EditorTiny :content="activity.value" v-model="activity.value" />
                                                        </template>
                                                    </Card>
                                                    <!-- ImagenComponent -->
                                                    <Card v-if="activity.type === 'image'" class="w-full p-3 bg-gray-100">
                                                        <template #title>
                                                            <InputText v-model="activity.value" :placeholder="'Actividad ' + (element + 1)" class="mx-4 md:w-14rem mb-5" /> |
                                                            <i class="pi pi-trash cursor-pointer" @click="removeActivity(index)"></i>
                                                        </template>
                                                        <template #content>
                                                            <FileUpload mode="basic" @select="onFileSelect($event, element, index)" customUpload auto severity="secondary" class="p-button-outlined" />
                                                            <img v-if="activity.image" :src="activity.image" alt="Image" class="shadow-md rounded-xl w-full" />
                                                        </template>
                                                    </Card>
                                                    <!-- Document -->
                                                    <Card v-if="activity.type === 'document'" class="w-full p-3 bg-gray-100">
                                                        <template #title>
                                                            <InputText v-model="activity.value" :placeholder="'Actividad ' + (element + 1)" class="mx-4 md:w-14rem mb-5" /> |
                                                            <i class="pi pi-trash cursor-pointer" @click="removeActivity(index)"></i>
                                                        </template>
                                                        <template #content>
                                                            <Textarea v-model="activity.description" :autoResize="true" placeholder="Description" class="w-full mb-8" rows="3" cols="30" />
                                                            <FileUpload
                                                                ref="fileupload"
                                                                mode="basic"
                                                                name="demo[]"
                                                                accept="application/pdf, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                                                :maxFileSize="1000000"
                                                                @upload="onFileSelectDocument($event, element, index)"
                                                            />
                                                        </template>
                                                    </Card>
                                                </div>
                                            </div>
                                            <div class="flex flex-row">
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
                                        </template>
                                    </Card>
                                    <!-- <InputText :id="'section' + index" v-model="element.value" required="true" autofocus :invalid="submitted && !element.value" fluid /> -->
                                    <small v-if="submitted && !element.value" class="text-red-500">Section is required.</small>
                                </div>
                            </div>
                        </SplitterPanel>
                    </Splitter>
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
        <Button label="Save" icon="pi pi-check" />
    </div>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useToast } from 'primevue/usetoast';
import api from '@/service/content-management/ApiCourses';

import { useRoute } from 'vue-router';
import EditorTiny from '@/components/global/EditorTiny.vue';

const src = ref(null);

const presentation = ref('');

const content = ref('');

console.log(content.value);

const onFileSelect = (event, element, index) => {
    const file = event.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
        elements.value[index].children[element].image = e.target.result;
    };
    reader.readAsDataURL(file);
};

const onFileSelectDocument = (event, element, index) => {
    const file = event.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
        elements.value[index].children[element].document = e.target.result;
    };
    reader.readAsDataURL(file);
};

function onFileSelectPresentation(event) {
    const file = event.files[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
        src.value = e.target.result;
    };

    reader.readAsDataURL(file);
}

const route = useRoute();
const courseId = ref(route.params.courseId);
const course = ref({});
const submitted = ref(false);

const getCourse = async () => {
    const response = await api.getCourse(courseId.value);
    course.value = response;
    console.log(response);
};

// Array reactivo para almacenar los elementos dinámicos
const elements = ref([]);
const activities = ref([]);
const ritchTextComponents = ref([]);
const imageComponent = ref(false);
const videoComponent = ref(false);
const audioComponent = ref(false);
const documentComponent = ref(false);
const count = ref(0);

// Método para agregar un nuevo elemento
const addElement = () => {
    elements.value = elements.value || [];
    elements.value.push({ id: Date.now(), value: '', children: [] }); // Agrega un nuevo objeto con un campo `value` y un campo `children` vacío
};

const addActivity = (index, type) => {
    elements.value[index].children.push({ type, value: '' }); // Agrega un nuevo elemento al array `children` del elemento en la posición `index`
};

const addImageComponent = (index, element) => {
    elements.value[index].children.push({ value: '' }); // Agrega un nuevo elemento al array `children` del elemento en la posición `index`
};

// Método para eliminar un elemento
const removeElement = (index) => {
    elements.value.splice(index, 1); // Elimina el elemento en la posición `index`
};

const removeActivity = (index) => {
    elements.value[index].children.splice(index, 1); // Elimina el elemento en la posición `index`
};

onMounted(() => {
    getCourse();
});

onBeforeUnmount(() => {
    // Destruye la instancia del editor al desmontar el componente
    editor.value.destroy();
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
