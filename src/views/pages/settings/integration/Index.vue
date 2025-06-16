<template>
    <div class="card">
        <div class="font-semibold text-xl mb-4">Integrations</div>
        <div v-if="providers" class="flex flex-wrap gap-4 h-full">
            <Card v-for="integration in providers" class="w-full md:w-[24rem] overflow-hidden flex flex-col h-full">
                <template #header>
                    <div class="w-full h-[12rem] bg-cover bg-center" :style="'background-image: url(' + integration.image + ')'">
                        <div v-for="tenantTag in tenantProviders">
                            <Tag v-if="tenantTag.provider_id === integration.id" value="Integrated" severity="success" class="mt-2 ms-2" />
                        </div>
                    </div>
                </template>
                <template #title><i class="pi pi-credit-card"></i> {{ integration.name }}</template>
                <template #subtitle
                    ><Tag severity="success">{{
                        integration.type
                            .toLowerCase()
                            .replace(/-/g, ' ')
                            .replace(/(^|\s)\w/g, (match) => match.toUpperCase())
                    }}</Tag></template
                >
                <template #content>
                    <div class="flex-grow">
                        <!-- Contenedor flexible para el contenido -->
                        <div class="whitespace-normal overflow-visible min-w-0" v-html="integration.description"></div>
                    </div>
                </template>
                <template #footer>
                    <!-- Si ya está integrado -->
                    <Button v-if="isIntegrated(integration.id)" label="Edit Integration" class="w-full" severity="info" @click="openDialog(integration, true)" />

                    <!-- Si NO está integrado -->
                    <template v-else>
                        <!-- Para payment-gateway -->
                        <Button v-if="integration.type === 'payment-gateway' && !paymentGatewaySetted" label="Integrate" class="w-full" @click="openDialog(integration, false)" />
                        <Button
                            v-else-if="integration.type === 'payment-gateway'"
                            label="Another equal integrated"
                            severity="warning"
                            class="w-full"
                            disabled
                            v-tooltip.top="'Another one configured the same. You must deactivate it first to integrate this one.'"
                        />

                        <!-- Para content-provider -->
                        <Button v-if="integration.type === 'content-provider'" label="Integrate" class="w-full" @click="openDialog(integration, false)" />
                    </template>
                </template>
            </Card>

            <!-- Stripe -->
            <Card class="w-full md:w-[24rem] overflow-hidden">
                <template #header>
                    <div class="w-full h-[12rem] bg-cover bg-center" style="background-image: url('https://b.stripecdn.com/site-statics-srv/assets/assets/img/v3/home/social-9755e0835b1ab1538bddad515c24744b.png')"></div>
                </template>
                <template #title><i class="pi pi-credit-card"></i> Stripe</template>
                <template #subtitle><Tag severity="success">Payment Gateway</Tag></template>
                <template #content>
                    <p class="m-0">
                        Integrate <b>Stripe</b> into your platform and provide your customers with a flexible, secure, and efficient payment solution. Supporting both national and international transactions, Stripe enables payments with credit cards,
                        debit cards, and alternative methods, enhancing the shopping experience. Simplify payments with advanced technology and guaranteed reliability!
                    </p>
                </template>
                <template #footer>
                    <div class="flex gap-4 mt-1">
                        <Button label="Coming soon" class="w-full" disabled />
                    </div>
                </template>
            </Card>

            <!-- Mercado Pago -->
            <Card class="w-full md:w-[24rem] overflow-hidden">
                <template #header>
                    <div class="w-full h-[12rem] bg-cover bg-center" style="background-image: url('https://media.zenfs.com/en/entrepreneur.com/2492c5afbe15e710beb8f3a1a43a9994')"></div>
                </template>
                <template #title><i class="pi pi-credit-card"></i> Mercado Pago</template>
                <template #subtitle><Tag severity="success">Payment Gateway</Tag></template>
                <template #content>
                    <p class="m-0">
                        Integrate <b>Mercado Pago</b> into your platform and offer your customers a secure, fast, and versatile payment option. Supporting both national and international transactions, Mercado Pago enables payments via cards,
                        transfers, and cash, enhancing the shopping experience. Make payments easier with a reliable and accessible solution!
                    </p>
                </template>
                <template #footer>
                    <div class="flex gap-4 mt-1">
                        <Button label="Coming soon" disabled class="w-full" />
                    </div>
                </template>
            </Card>

            <!-- SCORM -->
            <Card class="w-full md:w-[24rem] overflow-hidden">
                <template #header>
                    <div class="w-full h-[12rem] bg-cover bg-center" style="background-image: url('https://www.learnupon.com/wp-content/uploads/SCORM1200x628.jpg')"></div>
                </template>
                <template #title><i class="pi pi-graduation-cap"></i> Scorm</template>
                <template #subtitle><Tag severity="success">Application</Tag></template>
                <template #content>
                    <p class="m-0">
                        Integrate SCORM packages into your platform and provide users with a structured, interactive, and internationally compatible learning experience. SCORM simplifies course management, progress tracking, and interoperability
                        across various e-learning systems. Optimize training with dynamic and accessible content!
                    </p>
                </template>
                <template #footer>
                    <div class="flex gap-4 mt-1">
                        <Button label="Coming soon" disabled class="w-full" />
                    </div>
                </template>
            </Card>

            <!-- Linkedin Learning -->
            <Card class="w-full md:w-[24rem] overflow-hidden">
                <template #header>
                    <div class="w-full h-[12rem] bg-cover bg-center" style="background-image: url('https://weareclearhead.com/wp-content/uploads/2020/02/linkedin_learning_macbook_3-scaled.jpg')"></div>
                </template>
                <template #title><i class="pi pi-linkedin"></i> Linkedin Learning</template>
                <template #subtitle><Tag severity="success">Content Provider</Tag></template>
                <template #content>
                    <p class="m-0">
                        Integrate LinkedIn Learning into your platform and give users access to a vast library of specialized courses. With content created by industry experts, LinkedIn Learning supports professional development, skill enhancement,
                        and continuous learning. Empower growth with high-quality training and global recognition!
                    </p>
                </template>
                <template #footer>
                    <div class="flex gap-4 mt-1">
                        <Button label="Coming soon" disabled class="w-full" />
                    </div>
                </template>
            </Card>

            <!-- AWS Academy -->
            <Card class="w-full md:w-[24rem] overflow-hidden">
                <template #header>
                    <div class="w-full h-[12rem] bg-cover bg-center" style="background-image: url('https://tse3.mm.bing.net/th/id/OIP.8Tg91rsRdO_IJ4Aw1ubWVAHaDt?rs=1&pid=ImgDetMain')"></div>
                </template>
                <template #title><i class="pi pi-amazon"></i> AWS Academy</template>
                <template #subtitle><Tag severity="success">Content Provider</Tag></template>
                <template #content>
                    <p class="m-0">
                        Integrate AWS Academy into your platform and provide users with access to courses and resources designed to develop skills in technology and cloud computing. With materials created by experts, AWS Academy enables training in
                        AWS services, enhancing professional opportunities and strengthening hands-on learning. Empower growth with specialized training and recognized certifications!
                    </p>
                </template>
                <template #footer>
                    <div class="flex gap-4 mt-1">
                        <Button label="Coming soon" disabled class="w-full" />
                    </div>
                </template>
            </Card>
        </div>
        <Dialog v-model:visible="providerDialog" :style="{ width: '70%' }" :header="provider.name" :modal="true">
            <div v-if="provider.slug == 'paypal'">
                <PayPalThey :provider="provider" :settings="tenantProviders ?? {}" :edit="editProvider" @update:provider="refresh()" />
            </div>
            <div v-else-if="provider.slug == 'atenea-pay'">
                <AteneaPay :provider="provider" :edit="editProvider" @update:provider="refresh()" />
            </div>
            <div v-else-if="provider.slug == 'atenea-academy'">
                <AteneaAcademy :provider="provider" :edit="editProvider" @update:provider="refresh()" />
            </div>
            <template #footer>
                <!-- <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Save" icon="pi pi-check" @click="saveProvider" /> -->
            </template>
        </Dialog>
    </div>
</template>

<script setup>
import { onMounted, ref, inject, defineEmits } from 'vue';
import { useToast } from 'primevue/usetoast';
import AteneaPay from '@/components/dashboard/settings/providers/AteneaPay.vue';
import PayPalThey from '@/components/dashboard/settings/providers/PayPal-They.vue';
import api from '@/service/settings/ApiProviders';
import AteneaAcademy from '@/components/dashboard/settings/providers/AteneaAcademy.vue';

const company = inject('company');

const companyIntegrations = ref(company.value.integrations ?? []);

const paymentGatewaySetted = ref(false);

if (companyIntegrations.value.length > 0) {
    companyIntegrations.value.forEach((element) => {
        if (element.provider_type == 'payment-gateway') {
            paymentGatewaySetted.value = true;
        }
    });
}
const emit = defineEmits(['update:provider']);
const providerDialog = ref(false);
const provider = ref({});
const editProvider = ref(false);

const openDialog = (data, edit = false) => {
    provider.value = { ...data };
    providerDialog.value = true;
    editProvider.value = edit;
};

const hideDialog = () => {
    providerDialog.value = false;
    provider.value = {};
};

const saveProvider = () => {
    providerDialog.value = false;
};

const toast = useToast();

const providers = ref([]);
const tenantProviders = ref([]);
const getProviders = () => {
    api.getProviders().then((data) => {
        providers.value = data.data.providers;
        tenantProviders.value = data.data.tenant_providers;
    });
    hideDialog();
};

const refresh = () => {
    location.reload();
};

const isIntegrated = (integrationId) => {
    return tenantProviders.value.some((tp) => tp.provider_id === integrationId);
};

const getTenantProvider = (integrationId) => {
    return tenantProviders.value.find((tp) => tp.provider_id === integrationId);
};

onMounted(() => {
    getProviders();
});
</script>
