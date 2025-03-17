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
                    <div v-for="(element, moduleIndex) in elements" :key="moduleIndex" class="element flex flex-col w-[90%]">
                        <div class="w-full mb-6">
                            <Card class="w-full p-3 bg-gray-100">
                                <template #title>
                                    <!-- <label :for="'section' + index" class="block font-bold mb-3">{{ element.value ? element.value : 'Módulo ' + (index + 1) }}</label> -->
                                    <InputText v-model="element.value" :value="element.value || 'Módulo ' + (moduleIndex + 1)" :placeholder="element.value ? element.value : 'Módulo ' + (moduleIndex + 1)" class="mx-4 md:w-14rem mb-5" />
                                    <Button @click="removeElement(moduleIndex)" label="Eliminar" icon="pi pi-trash" security="danger"></Button>
                                </template>
                                <template #content>
                                    <div v-for="(activity, activityIndex) in elements[moduleIndex].children" :key="activityIndex" class="element flex flex-col w-full">
                                        <div class="w-full mb-6">
                                            <!-- RitchText -->
                                            <Card v-if="activity.type === 'richtext'" class="w-full p-3 bg-gray-100">
                                                <template #title>
                                                    <InputText v-model="activity.title" :placeholder="'Actividad ' + (activityIndex + 1)" :value="activity.title || ' Actividad ' + (activityIndex + 1)" class="w-[90%] md:w-14rem mb-5" /> |
                                                    <i class="pi pi-trash cursor-pointer" @click="removeActivity(moduleIndex, activityIndex)"></i>
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
                                                    <InputText v-model="activity.title" :placeholder="'Actividad ' + (activityIndex + 1)" :value="activity.title || ' Actividad ' + (activityIndex + 1)" class="w-[90%] md:w-14rem mb-5" /> |
                                                    <i class="pi pi-trash cursor-pointer" @click="removeActivity(moduleIndex, activityIndex)"></i>
                                                </template>
                                                <template #content>
                                                    <Textarea v-model="activity.description" :autoResize="true" placeholder="Description" class="w-full mb-8" rows="3" cols="30" />
                                                    <FileUpload
                                                        mode="basic"
                                                        :chooseLabel="activity.image ? 'Change Image' : 'Upload Image'"
                                                        accept="image/*"
                                                        @select="onFileSelect($event, activityIndex, moduleIndex)"
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
                                                    <InputText v-model="activity.title" :value="activity.title ?? ' Actividad ' + (activityIndex + 1)" :placeholder="'Actividad ' + (activityIndex + 1)" class="w-[90%] md:w-14rem mb-5" />
                                                    |
                                                    <i class="pi pi-trash cursor-pointer" @click="removeActivity(moduleIndex, activityIndex)"></i>
                                                </template>
                                                <template #content>
                                                    <Textarea v-model="activity.description" :autoResize="true" placeholder="Description" class="w-full mb-8" rows="3" cols="30" />
                                                    <!-- Botón para cargar archivo -->
                                                    <input
                                                        type="file"
                                                        class="p-button-outlined mb-4"
                                                        accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                                        @change="(event) => onFileSelectDocument(event, moduleIndex, activityIndex)"
                                                    />
                                                </template>
                                            </Card>
                                            <!-- Video -->
                                            <Card v-if="activity.type === 'video'" class="w-full p-3 bg-gray-100">
                                                <template #title>
                                                    <InputText v-model="activity.title" :value="activity.title || ' Actividad ' + (activityIndex + 1)" :placeholder="'Actividad ' + (activityIndex + 1)" class="w-[90%] md:w-14rem mb-5" />
                                                    |
                                                    <i class="pi pi-trash cursor-pointer" @click="removeActivity(moduleIndex, activityIndex)"></i>
                                                </template>
                                                <template #content>
                                                    <Textarea v-model="activity.description" :autoResize="true" placeholder="Description" class="w-full mb-8" rows="3" cols="30" />
                                                    <!-- Botón para cargar url -->
                                                    <label class="block font-bold mb-3">
                                                        Youtube URL Code
                                                        <Badge class="ml-2 cursor-pointer hover:bg-gray-200" severity="info" @click="urlCodeHelp = true">
                                                            <i class="pi pi-question rounded-full"></i>
                                                        </Badge>
                                                    </label>
                                                    <InputText type="text" class="w-[90%] md:w-14rem mb-5" v-model="activity.urlCode" />
                                                    <iframe
                                                        v-if="activity.urlCode"
                                                        class="shadow-md rounded-xl w-full"
                                                        width="560"
                                                        height="315"
                                                        :src="'https://www.youtube.com/embed/' + activity.urlCode"
                                                        title="YouTube video player"
                                                        frameborder="0"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                        referrerpolicy="strict-origin-when-cross-origin"
                                                        allowfullscreen
                                                    ></iframe>
                                                </template>
                                            </Card>
                                        </div>
                                    </div>
                                    <div>
                                        <label class="font-bold mb-3">Agregar una Actividad</label>
                                        <div class="flex flex-row flex-wrap">
                                            <Card @click="addActivity(moduleIndex, 'catalog')" class="m-4 p-3 bg-gray-200 opacity-50">
                                                <template #title>
                                                    <i class="pi pi-images" style="font-size: 3rem"></i>
                                                </template>
                                                <template #content>
                                                    <span class="block font-bold mb-3">Biblioteca Multimedia</span>
                                                </template>
                                            </Card>
                                            <Card @click="addActivity(moduleIndex, 'richtext')" class="m-4 p-3 bg-gray-200 cursor-pointer hover:bg-primary-100 duration-500 transition-all">
                                                <template #title>
                                                    <i class="pi pi-pencil" style="font-size: 3rem"></i>
                                                </template>
                                                <template #content>
                                                    <span class="block font-bold mb-3">Agregar Texto</span>
                                                </template>
                                            </Card>
                                            <Card @click="addActivity(moduleIndex, 'image')" class="m-4 p-3 bg-gray-200 cursor-pointer hover:bg-primary-100 duration-500 transition-all">
                                                <template #title>
                                                    <i class="pi pi-image" style="font-size: 3rem"></i>
                                                </template>
                                                <template #content>
                                                    <span class="block font-bold mb-3">Agregar Imagen</span>
                                                </template>
                                            </Card>
                                            <Card @click="addActivity(moduleIndex, 'video')" class="m-4 p-3 bg-gray-200 cursor-pointer hover:bg-primary-100 duration-500 transition-all">
                                                <template #title>
                                                    <i class="pi pi-video" style="font-size: 3rem"></i>
                                                </template>
                                                <template #content>
                                                    <span class="block font-bold mb-3">Agregar Video</span>
                                                </template>
                                            </Card>
                                            <Card @click="addActivity(moduleIndex, 'document')" class="m-4 p-3 bg-gray-200 cursor-pointer hover:bg-primary-100 duration-500 transition-all">
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
                                    <RadioButton id="category1" v-model="access_type.type" name="access_type" value="free" checked @click="setAccessType('free')" />
                                    <label for="category1">Free</label>
                                </div>
                                <div class="flex items-center gap-2 col-span-6">
                                    <RadioButton id="category2" v-model="access_type.type" name="access_type" value="paid" @click="setAccessType('paid')" />
                                    <label for="category2">Paid</label>
                                </div>
                                <div class="flex items-center gap-2 col-span-6">
                                    <RadioButton id="category3" v-model="access_type.type" name="access_type" value="private" @click="setAccessType('private')" />
                                    <label for="category3">Private</label>
                                </div>
                                <div class="flex items-center gap-2 col-span-6">
                                    <RadioButton id="category4" v-model="access_type.type" name="access_type" value="subscription" @click="setAccessType('subscription')" />
                                    <label for="category4">Subscription</label>
                                </div>
                            </div>
                        </div>
                        <Divider />
                        <div class="grid grid-cols-12 gap-4" v-if="access_type.type === 'paid'">
                            <div class="col-span-6">
                                <label for="price" class="block font-bold mb-3">Price</label>
                                <InputNumber id="price" v-model="access_type.price" mode="currency" currency="USD" locale="en-US" fluid />
                            </div>
                            <div class="col-span-6">
                                <label for="discount" class="block font-bold mb-3">Discount % (optional)</label>
                                <InputNumber id="discount" v-model="access_type.discount" integeronly fluid />
                            </div>
                        </div>

                        <div class="w-full" v-if="access_type.type === 'subscription'">
                            Seleccione un Plan de Suscripción
                            <Select id="subscription" v-model="access_type.subscription" :options="subscriptions" optionLabel="name" placeholder="Select a Plan" fluid>
                                <template #option="subscriptions">
                                    <div class="flex align-items-center">
                                        <span class="ml-2">{{ subscriptions.option.name }}</span>
                                    </div>
                                </template>
                            </Select>
                        </div>

                        <div class="grid grid-cols-12 gap-4" v-if="access_type.type === 'private'">
                            <div class="col-span-6">
                                <label for="invite" class="block font-bold mb-3">Invitar</label>
                                <FloatLabel variant="in">
                                    <InputText class="w-[80%]" id="in_label" v-model="setInvitation" autocomplete="off" />
                                    <Button icon="pi pi-plus" class="ml-2" :disabled="setInvitation === ''" @click="addInvitation(setInvitation)"></Button>
                                    <label for="in_label">Correo</label>
                                </FloatLabel>
                            </div>
                            <div class="col-span-6">
                                <span v-for="(invitation, index) in invitations" :key="invitation.email">
                                    <Chip :label="invitation.email" :removable="true" @remove="removeInvitation(index)" class="mr-2 mb-2"></Chip>
                                </span>
                            </div>
                        </div>
                    </div>
                </TabPanel>
            </TabPanels>
        </Tabs>
        <hr class="my-3" />
        <Button label="Save" @click="saveCourse()" icon="pi pi-check" />
    </div>
    <Dialog v-model:visible="urlCodeHelp" modal header="URL Code Help" :style="{ width: '34rem' }">
        <span class="text-surface-500 dark:text-surface-400 block mb-8">
            <p>Solo debe copiar el código que aparece en la URL como se muestra en la imagen de ejemplo.</p>
        </span>
        <div class="flex items-center gap-4 mb-4">
            <img alt="logo" src="/images/helps/url-code-help.png" style="width: 100%" />
        </div>
    </Dialog>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useToast } from 'primevue/usetoast';
import api from '@/service/content-management/ApiCourses';
import Editor from '@tinymce/tinymce-vue';
import { useRoute } from 'vue-router';
import Loading from '@/components/global/Loading.vue';
import { v4 as uuidv4 } from 'uuid';

const toast = useToast();
const src = ref(null);
const presentation = ref('');
const loader = ref(true);
const content = ref('');
const subscription = ref(false);
const price = ref(0);
const discount = ref(0);

const urlCodeHelp = ref(false);

const subscriptions = ref([
    { name: 'Free', id: 1 },
    { name: 'Basic', id: 2 },
    { name: 'Premium', id: 3 }
]);

const invitations = ref([]);
const setInvitation = ref('');

const access_type = ref({});

const setAccessType = (type) => {
    switch (type) {
        case 'free':
            price.value = 0;
            discount.value = 0;
            invitations.value = [];
            subscription.value = false;
            break;
        case 'paid':
            invitations.value = [];
            subscription.value = false;
            break;
        case 'private':
            price.value = 0;
            discount.value = 0;
            subscription.value = false;
            break;
        case 'subscription':
            price.value = 0;
            discount.value = 0;
            invitations.value = [];
            break;
        default:
            price.value = 0;
            discount.value = 0;
            invitations.value = [];
            subscription.value = false;
            break;
    }
    access_type.value = {
        type: type,
        price: price.value,
        discount: discount.value,
        invitations: invitations.value
    };
};

const addInvitation = (invitation) => {
    invitations.value.push({ email: invitation });
    setInvitation.value = '';
    access_type.value.invitations = invitations.value;
};

const removeInvitation = (index) => {
    invitations.value.splice(index, 1);
};

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
    course.value = response;
    access_type.value = response.access_type ?? { type: 'free', price: 0, discount: 0, subscription: false, invitations: [] };
    //console.log(course.value);
    courseVersion.value = response.versions ?? {};
    presentation.value = courseVersion.value?.data?.presentation?.description ?? '';
    elements.value = courseVersion.value?.data?.elements || [];

    loader.value = false;
};

const saveCourse = () => {
    if (!validations()) {
        return;
    }
    course.value.access_type = access_type.value;
    course.value.invitations = invitations.value;
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
    elements.value.push({ id: uuidv4(), value: '', children: [] }); // Agrega un nuevo objeto con un campo `value` y un campo `children` vacío
};

const addActivity = (index, type) => {
    elements.value[index].children.push({ id: uuidv4(), type, value: '' }); // Agrega un nuevo elemento al array `children` del elemento en la posición `index`
};

// Método para eliminar un elemento
const removeElement = (index) => {
    elements.value.splice(index, 1); // Elimina el elemento en la posición `index`
};

const removeActivity = (moduleIndex, activityIndex) => {
    console.log(moduleIndex, activityIndex);
    elements.value[moduleIndex].children.splice(activityIndex, 1); // Elimina el elemento en la posición `index`
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

const validations = () => {
    submitted.value = true;

    if (course.value.title.trim() === '') {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Course Name is required', life: 3000 });
        return false;
    }

    if (!courseVersion.value?.data?.presentation?.image) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Course Presentation Image is required', life: 3000 });
        return false;
    }

    if (presentation.value.trim() === '') {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Course Presentation is required', life: 3000 });
        return false;
    }

    if (course.value.description.trim() === '') {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Course Description is required', life: 3000 });
        return false;
    }

    if (elements.value.length === 0) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'At least one Module is required', life: 3000 });
        return false;
    }

    for (let i = 0; i < elements.value.length; i++) {
        if (elements.value[i].children.length === 0) {
            toast.add({ severity: 'error', summary: 'Error', detail: 'At least one activity is required', life: 3000 });
            return false;
        }
    }

    return true;
};
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
