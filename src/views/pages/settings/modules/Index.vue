<template>
    <div class="card">
        <div class="font-semibold text-xl mb-4">Modules</div>
        <div class="flex flex-wrap gap-4">
            <CardSkeleton v-if="modules.length === 0" v-for="n in 3" :key="n" />
            <Card v-else v-for="module in modules" class="w-full md:w-[24rem] overflow-hidden">
                <template #header>
                    <div class="w-full h-[12rem] bg-cover bg-center" :alt="module.slug" :style="'background-image: url(' + module.image + ')'">
                        <div v-for="active in companyModules">
                            <Tag v-if="active.id === module.id && active.status === 1" value="Installed" severity="success" class="mt-2 ms-2" />
                        </div>
                    </div>
                </template>
                <template #title
                    ><!-- <i class="pi pi-credit-card"></i> -->
                    {{ module.name }}</template
                >
                <template #subtitle
                    ><Tag severity="success">{{ module.type.toUpperCase() }}</Tag></template
                >
                <template #content>
                    <p class="m-0">
                        {{ module.description }}
                    </p>
                </template>
                <template #footer>
                    <div v-for="active in companyModules" class="flex gap-4 mt-1">
                        <Button v-if="active.id === module.id && active.status === 1" @click="edit(module)" label="Configuration" severity="success" class="w-full" />
                        <Button v-if="active.id === module.id && active.status === 0" @click="viewDIalog(module)" :label="module.status === 1 ? 'Install' : 'Coming soon'" :disabled="module.status != 1" class="w-full" />
                    </div>
                </template>
            </Card>
        </div>
        <Dialog header="Confirmation" v-model:visible="confirmPopup" :style="{ width: '350px' }" :modal="true">
            <div class="flex items-center justify-center">
                <i class="pi pi-exclamation-triangle mr-4" style="font-size: 2rem" />
                <span
                    >Are you sure you want to continue with the <b>{{ selectdModule.name }}</b> Module installation?</span
                >
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" @click="confirmPopup = false" text severity="secondary" />
                <Button label="Yes" icon="pi pi-check" @click="installModule(selectdModule)" severity="danger" outlined autofocus />
            </template>
        </Dialog>
    </div>
</template>

<script setup>
import { onMounted, ref, inject } from 'vue';
import { useToast } from 'primevue/usetoast';
import api from '@/service/settings/ApiModules';
import router from '@/router';

const company = inject('company');
const companyModules = ref(company.value.modules ?? []);

const toast = useToast();

const modules = ref([]);

const confirmPopup = ref(false);

const selectdModule = ref(null);

const viewDIalog = (module) => {
    selectdModule.value = module;
    confirmPopup.value = true;
};

const getAllModules = () => {
    api.getModules().then((data) => {
        modules.value = data;
    });
};

const installModule = (module) => {
    console.log(module);
    api.setModule(module).then((data) => {
        toast.add({ severity: 'success', summary: 'Success', detail: data.message, life: 3000 });
        confirmPopup.value = false;
        refresh();
    });
};

const edit = (module) => {
    router.push({ name: 'module', params: { moduleId: module.id } });
};

const refresh = () => {
    location.reload();
};

onMounted(() => {
    getAllModules();
});
</script>
