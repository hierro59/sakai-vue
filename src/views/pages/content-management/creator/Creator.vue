<template>
    <Toolbar class="flex fixed w-[30%] z-50">
        <template #start>
            <span class="font-semibold text-xl mb-2">Courses Creator</span>
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
                                <label for="title" class="block font-bold mb-3">Presentation</label>
                            </template>
                            <template #content>
                                <div class="card flex flex-col items-center gap-6">
                                    <label for="file" class="block font-bold mb-3">Front page</label>

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
                                        plugins: ['anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'image', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount'],
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
                    </div>
                    <div v-for="(element, moduleIndex) in elements" :key="moduleIndex" class="element flex flex-col w-[90%]">
                        <div class="w-full mb-6">
                            <Card class="w-full p-3 bg-gray-100">
                                <template #title>
                                    <InputText v-model="element.title" :placeholder="element.title" class="mx-4 md:w-14rem mb-5" />
                                    <Button @click="removeElement(moduleIndex)" label="Delete" icon="pi pi-trash" security="danger"></Button>
                                </template>
                                <template #content>
                                    <div v-for="(activity, activityIndex) in elements[moduleIndex].children" :key="activityIndex" class="element flex flex-col w-full">
                                        <div class="w-full mb-6">
                                            <!-- RitchText -->
                                            <Card v-if="activity.type === 'richtext'" class="w-full p-3 bg-gray-100">
                                                <template #title>
                                                    <label class="block font-bold mb-3">Activity Title</label>
                                                    <InputText v-model="activity.title" :placeholder="activity.title" class="w-[90%] md:w-14rem mb-5" /> |
                                                    <i class="pi pi-trash cursor-pointer" @click="removeActivity(moduleIndex, activityIndex)"></i>
                                                    <FloatLabel variant="in">
                                                        <InputNumber :id="activityIndex" v-model="activity.duration" variant="filled" />
                                                        <label :for="activityIndex">Duration in minutes</label>
                                                    </FloatLabel>
                                                </template>
                                                <template #content>
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
                                                                'wordcount'
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
                                                    <InputText v-model="activity.title" :placeholder="activity.title" class="w-[90%] md:w-14rem mb-5" /> |
                                                    <i class="pi pi-trash cursor-pointer" @click="removeActivity(moduleIndex, activityIndex)"></i>
                                                    <FloatLabel variant="in">
                                                        <InputNumber :id="activityIndex" v-model="activity.duration" variant="filled" />
                                                        <label :for="activityIndex">Duration in minutes</label>
                                                    </FloatLabel>
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
                                                    <InputText v-model="activity.title" :placeholder="activity.title" class="w-[90%] md:w-14rem mb-5" />
                                                    |
                                                    <i class="pi pi-trash cursor-pointer" @click="removeActivity(moduleIndex, activityIndex)"></i>
                                                    <FloatLabel variant="in">
                                                        <InputNumber :id="activityIndex" v-model="activity.duration" variant="filled" />
                                                        <label :for="activityIndex">Duration in minutes</label>
                                                    </FloatLabel>
                                                </template>
                                                <template #content>
                                                    <Textarea v-model="activity.description" :autoResize="true" placeholder="Description" class="w-full mb-8" rows="3" cols="30" />
                                                    <!-- Botón para cargar archivo -->
                                                    <input type="file" class="p-button-outlined mb-4" accept="application/pdf" @change="(event) => onFileSelectDocument(event, activityIndex, moduleIndex)" />
                                                    <iframe v-if="activity.document" :src="activity.document" class="shadow-md rounded-xl w-full h-96"></iframe>
                                                </template>
                                            </Card>
                                            <!-- Video -->
                                            <Card v-if="activity.type === 'video'" class="w-full p-3 bg-gray-100">
                                                <template #title>
                                                    <InputText v-model="activity.title" :placeholder="activity.title" class="w-[90%] md:w-14rem mb-5" />
                                                    |
                                                    <i class="pi pi-trash cursor-pointer" @click="removeActivity(moduleIndex, activityIndex)"></i>
                                                    <FloatLabel variant="in">
                                                        <InputNumber :id="activityIndex" v-model="activity.duration" variant="filled" />
                                                        <label :for="activityIndex">Duration in minutes</label>
                                                    </FloatLabel>
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
                                            <!-- Single Choice -->
                                            <Card v-if="activity.type === 'single-choice'" class="w-full p-3 bg-gray-100">
                                                <template #title>
                                                    <InputText v-model="activity.title" :placeholder="activity.title" class="w-[90%] md:w-14rem mb-5" />
                                                    |
                                                    <i class="pi pi-trash cursor-pointer" @click="removeActivity(moduleIndex, activityIndex)"></i>
                                                    <FloatLabel variant="in">
                                                        <InputNumber :id="activityIndex" v-model="activity.duration" variant="filled" />
                                                        <label :for="activityIndex">Duration in minutes</label>
                                                    </FloatLabel>
                                                </template>
                                                <template #content>
                                                    <Textarea v-model="activity.description" :autoResize="true" placeholder="Question" class="w-full mb-8" rows="3" cols="30" />
                                                    <label class="block font-bold mb-3">Options</label>
                                                    <div v-for="(option, optionIndex) in activity.options" :key="optionIndex" class="flex items-center mb-4">
                                                        <RadioButton name="correctOption" :value="optionIndex" :modelValue="getCorrectOptionIndex(activity.options)" @update:modelValue="setCorrectOption(activity.options, $event)" class="mr-2" />
                                                        <InputText v-model="option.text" :placeholder="`Option ${optionIndex + 1}`" class="w-full" />
                                                    </div>
                                                </template>
                                            </Card>
                                            <Card v-if="activity.type === 'multiple-choice'" class="w-full p-3 bg-gray-100">
                                                <template #title>
                                                    <InputText v-model="activity.title" placeholder="Question Title" class="w-[90%] md:w-14rem mb-5" />
                                                    |
                                                    <i class="pi pi-trash cursor-pointer" @click="removeActivity(moduleIndex, activityIndex)"></i>
                                                    <FloatLabel variant="in">
                                                        <InputNumber :id="activityIndex" v-model="activity.duration" variant="filled" />
                                                        <label :for="activityIndex">Duration in minutes</label>
                                                    </FloatLabel>
                                                </template>

                                                <template #content>
                                                    <Textarea v-model="activity.description" autoResize placeholder="Description" class="w-full mb-8" rows="3" cols="30" />

                                                    <label class="block font-bold mb-3">Options</label>

                                                    <div v-for="(option, optionIndex) in activity.options" :key="optionIndex" class="flex items-center mb-4">
                                                        <i class="pi pi-trash cursor-pointer mr-2" @click="removeOption(activity, optionIndex)"></i>
                                                        <Checkbox v-model="option.is_correct" binary class="mr-2" />
                                                        <InputText v-model="option.text" :placeholder="`Option ${optionIndex + 1}`" class="w-full" />
                                                    </div>

                                                    <Button icon="pi pi-plus" label="Add option" class="mt-2" @click="addOption(activity)" />
                                                </template>
                                            </Card>
                                            <Card v-if="activity.type === 'true-false'" class="w-full p-3 bg-gray-100">
                                                <template #title>
                                                    <InputText v-model="activity.title" placeholder="Question Title" class="w-[90%] md:w-14rem mb-5" />
                                                    |
                                                    <i class="pi pi-trash cursor-pointer" @click="removeActivity(moduleIndex, activityIndex)"></i>
                                                    <FloatLabel variant="in">
                                                        <InputNumber :id="activityIndex" v-model="activity.duration" variant="filled" />
                                                        <label :for="activityIndex">Duration in minutes</label>
                                                    </FloatLabel>
                                                </template>

                                                <template #content>
                                                    <Textarea v-model="activity.description" autoResize placeholder="Description" class="w-full mb-8" rows="3" cols="30" />

                                                    <label class="block font-bold mb-3">Select the correct answer</label>

                                                    <div class="flex gap-4">
                                                        <RadioButton id="verdadero" name="truefalse" :value="true" v-model="activity.answer" />
                                                        <label for="verdadero">True</label>

                                                        <RadioButton id="falso" name="truefalse" :value="false" v-model="activity.answer" />
                                                        <label for="falso">False</label>
                                                    </div>
                                                </template>
                                            </Card>
                                        </div>
                                    </div>
                                    <div>
                                        <label class="font-bold mb-3">Add activity</label>
                                        <div class="flex flex-row flex-wrap">
                                            <Card @click="addActivity(moduleIndex, 'catalog')" class="m-4 p-3 bg-gray-200 opacity-50">
                                                <template #title>
                                                    <i class="pi pi-images" style="font-size: 3rem"></i>
                                                </template>
                                                <template #content>
                                                    <span class="block font-bold mb-3">Multimedia Library</span>
                                                </template>
                                            </Card>
                                            <Card @click="addActivity(moduleIndex, 'richtext')" class="m-4 p-3 bg-gray-200 cursor-pointer hover:bg-primary-100 duration-500 transition-all">
                                                <template #title>
                                                    <i class="pi pi-pencil" style="font-size: 3rem"></i>
                                                </template>
                                                <template #content>
                                                    <span class="block font-bold mb-3">Add Text</span>
                                                </template>
                                            </Card>
                                            <Card @click="addActivity(moduleIndex, 'image')" class="m-4 p-3 bg-gray-200 cursor-pointer hover:bg-primary-100 duration-500 transition-all">
                                                <template #title>
                                                    <i class="pi pi-image" style="font-size: 3rem"></i>
                                                </template>
                                                <template #content>
                                                    <span class="block font-bold mb-3">Add Image</span>
                                                </template>
                                            </Card>
                                            <Card @click="addActivity(moduleIndex, 'video')" class="m-4 p-3 bg-gray-200 cursor-pointer hover:bg-primary-100 duration-500 transition-all">
                                                <template #title>
                                                    <i class="pi pi-video" style="font-size: 3rem"></i>
                                                </template>
                                                <template #content>
                                                    <span class="block font-bold mb-3">Add Video</span>
                                                </template>
                                            </Card>
                                            <Card @click="addActivity(moduleIndex, 'document')" class="m-4 p-3 bg-gray-200 cursor-pointer hover:bg-primary-100 duration-500 transition-all">
                                                <template #title>
                                                    <i class="pi pi-file-pdf" style="font-size: 3rem"></i>
                                                </template>
                                                <template #content>
                                                    <span class="block font-bold mb-3">Add Document</span>
                                                </template>
                                            </Card>
                                        </div>
                                        <Divider />
                                        <label class="font-bold mb-3">Add Evaluation</label>
                                        <div class="flex flex-row flex-wrap">
                                            <Card @click="addActivity(moduleIndex, 'single-choice')" class="m-4 p-3 bg-gray-200 cursor-pointer hover:bg-primary-100 duration-500 transition-all">
                                                <template #title>
                                                    <i class="pi pi-check-circle" style="font-size: 3rem"></i>
                                                </template>
                                                <template #content>
                                                    <span class="block font-bold mb-3">Simple Selection</span>
                                                </template>
                                            </Card>
                                            <Card @click="addActivity(moduleIndex, 'multiple-choice')" class="m-4 p-3 bg-gray-200 cursor-pointer hover:bg-primary-100 duration-500 transition-all">
                                                <template #title>
                                                    <i class="pi pi-list" style="font-size: 3rem"></i>
                                                </template>
                                                <template #content>
                                                    <span class="block font-bold mb-3">Multiple Selection</span>
                                                </template>
                                            </Card>
                                            <Card @click="addActivity(moduleIndex, 'true-false')" class="m-4 p-3 bg-gray-200 cursor-pointer hover:bg-primary-100 duration-500 transition-all">
                                                <template #title>
                                                    <i class="pi pi-sort-alt" style="font-size: 3rem"></i>
                                                </template>
                                                <template #content>
                                                    <span class="block font-bold mb-3">True or False</span>
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
                        <Button label="Add Module" icon="pi pi-plus" @click="addElement"></Button>
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
                        <Divider />
                        <div>
                            <label for="categories" class="block font-bold mb-3">Categories</label>
                            <MultiSelect id="categories" v-model="course.categories" :options="categories" optionLabel="name" dataKey="id" placeholder="Select one or more" display="chip" filter fluid />
                        </div>

                        <Divider />
                        <div>
                            <span class="block font-bold mb-4">Access Type</span>
                            <div class="grid grid-cols-12 gap-4">
                                <div class="flex items-center gap-2 col-span-6">
                                    <RadioButton id="category1" v-model="access_type.type" name="access_type" value="free" checked @click="setAccessType('free')" />
                                    <label for="category1">Free</label>
                                </div>
                                <div class="flex items-center gap-2 col-span-6" v-if="IntegrationsResolve.existPaymentMethod(companyIntegrations)">
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
                            Select a Subscription Plan
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
                                <label for="invite" class="block font-bold mb-3">Invite</label>
                                <FloatLabel variant="in">
                                    <InputText class="w-[80%]" id="in_label" v-model="setInvitation" autocomplete="off" />
                                    <Button icon="pi pi-plus" class="ml-2" :disabled="setInvitation === ''" @click="addInvitation(setInvitation)"></Button>
                                    <label for="in_label">Mail</label>
                                </FloatLabel>
                            </div>
                            <div class="col-span-6">
                                <span v-for="(invitation, index) in invitations" :key="invitation.email">
                                    <Chip :label="invitation.email" :removable="true" @remove="removeInvitation(index)" class="mr-2 mb-2"></Chip>
                                </span>
                            </div>
                        </div>

                        <div>
                            <label for="certTemplates" class="block font-bold mb-3">Certificate Template</label>
                            <Select id="certTemplates" v-model="certificate" :options="course.certTemplates" optionLabel="name" :placeholder="certificate.value != null ? certificate.name : 'Select a template'" fluid></Select>
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
            <p>You should only copy the code that appears in the URL as shown in the example image.</p>
        </span>
        <div class="flex items-center gap-4 mb-4">
            <img alt="logo" src="/images/helps/url-code-help.png" style="width: 100%" />
        </div>
    </Dialog>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount, inject } from 'vue';
import { useToast } from 'primevue/usetoast';
import api from '@/service/content-management/ApiCourses';
import apiCategories from '@/service/content-management/ApiCategories';
import Editor from '@tinymce/tinymce-vue';
import { useRoute } from 'vue-router';
import Loading from '@/components/global/Loading.vue';
import { v4 as uuidv4 } from 'uuid';
import IntegrationsResolve from '@/service/IntegrationsResolve';
import apiSubscriptions from '@/service/settings/ApiSubscriptionPlan';

const company = inject('company');
const companyIntegrations = ref(company.value.integrations ?? []);
const companyModules = ref(company.value.modules ?? []);

const toast = useToast();
const presentation = ref('');
const loader = ref(true);
const content = ref('');
const subscription = ref(false);
const price = ref(0);
const discount = ref(0);

const urlCodeHelp = ref(false);

const subscriptions = ref([]);

const invitations = ref([]);
const setInvitation = ref('');

const access_type = ref({});

const setAccessType = (type) => {
    access_type.value = {
        type: type
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
    const file = event.target.files[0];
    if (!file) {
        console.error('No se seleccionó ningún archivo.');
        return;
    }

    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'File type not supported.', life: 3000 });
        return;
    }

    // Validación previa
    const module = elements.value[index];
    if (!module || !module.children || !module.children[childIndex]) {
        console.error('Índice fuera de rango o datos no cargados.', { index, childIndex });
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        // Uso de referencia guardada
        module.children[childIndex].document = e.target.result;
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
const certificate = ref(null);

const getCourse = async () => {
    const response = await api.getCourse(courseId.value);
    course.value = response;
    certificate.value = {
        id: response.settings?.certificate_id ?? null,
        name: response.settings?.certificate_name ?? null
    };
    access_type.value = response.access_type ?? { type: 'free', price: 0, discount: 0, subscription: false, invitations: [] };
    courseVersion.value = response.versions ?? {};
    presentation.value = courseVersion.value?.data?.presentation?.description ?? '';
    elements.value = courseVersion.value?.data?.elements || [];
    if (companyModules.value[0].id === 1 && companyModules.value[1].status === 1) {
        getSubscriptions();
    }
    loader.value = false;
};

const saved = ref(false);

const saveCourse = () => {
    if (!validations()) {
        return;
    }
    course.value.access_type = access_type.value;
    course.value.invitations = invitations.value;
    const data = {
        course: course.value,
        certificate: { id: certificate.value?.id || null, name: certificate.value?.name || null },
        presentation: {
            description: presentation.value,
            image: courseVersion.value.data.presentation.image
        },
        elements: elements.value
    };
    api.updateCourse(courseId.value, data).then((response) => {
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Course Updated', life: 3000 });
        saved.value = true;
        getCourse();
    });
};

const autoSaveCourse = () => {
    saveCourse();
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Autosaved Course', life: 3000 });
};

const publishCourse = () => {
    if (saved.value === false) {
        saveCourse();
        saved.value = true;
    }
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
    const moduleIndex = elements.value.length;
    elements.value.push({ id: uuidv4(), title: `Module ${moduleIndex + 1}`, value: `Module ${moduleIndex + 1}`, children: [] }); // Agrega un nuevo objeto con un campo `value` y un campo `children` vacío
};

const addActivity = (index, type) => {
    let activityIndex = elements.value[index].children.length;

    switch (type) {
        case 'single-choice':
            elements.value[index].children.push({
                id: uuidv4(),
                type,
                title: `Single Choice`,
                description: '',
                options: [
                    { id: uuidv4(), text: '', is_correct: false },
                    { id: uuidv4(), text: '', is_correct: false },
                    { id: uuidv4(), text: '', is_correct: false }
                ]
            });
            break;
        case 'multiple-choice':
            elements.value[index].children.push({
                id: uuidv4(),
                type: 'multiple-choice',
                title: `Multiple Choice`,
                description: '',
                options: [
                    { id: uuidv4(), text: '', is_correct: false },
                    { id: uuidv4(), text: '', is_correct: false },
                    { id: uuidv4(), text: '', is_correct: false }
                ]
            });
            break;
        case 'true-false':
            elements.value[index].children.push({
                id: uuidv4(),
                type: 'true-false',
                title: `True or False`,
                description: '',
                answer: null // puede ser true o false
            });
            break;

        default:
            elements.value[index].children.push({ id: uuidv4(), type, title: `Activity ${activityIndex + 1}` }); // Agrega un nuevo elemento al array `children` del elemento en la posición `index`
            break;
    }
};

// Método para eliminar un elemento
const removeElement = (index) => {
    elements.value.splice(index, 1); // Elimina el elemento en la posición `index`
};

const removeActivity = (moduleIndex, activityIndex) => {
    elements.value[moduleIndex].children.splice(activityIndex, 1); // Elimina el elemento en la posición `index`
};

let autoSaveInterval = null;

const getCorrectOptionIndex = (options) => {
    return options.findIndex((option) => option.is_correct);
};

const setCorrectOption = (options, index) => {
    options.forEach((opt, i) => (opt.is_correct = i === index));
};

const addOption = (activity) => {
    activity.options.push({ id: uuidv4(), text: '', is_correct: false });
};

const removeOption = (activity, optionIndex) => {
    activity.options.splice(optionIndex, 1);
};

const categories = ref([]);

const getCategories = () => {
    apiCategories.getCategories().then((response) => {
        categories.value = response;
    });
};

const getSubscriptions = () => {
    apiSubscriptions.getSubscriptionPlan().then((response) => {
        subscriptions.value = response;
    });
};

onMounted(() => {
    getCourse();
    getCategories();
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
