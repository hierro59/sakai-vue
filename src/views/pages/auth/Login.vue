<script setup>
import { ref, inject, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';

const { t } = useI18n();

const router = useRouter();

const toast = useToast();

const company = inject('company');
const companyLogo = inject('companyLogo');

// Extrae el módulo public-catalog
const publicCatalogModule = computed(() => {
    return company?.value?.modules?.find((m) => m.slug === 'public-catalog') ?? null;
});

// Extrae settings específicos
const showLoginButton = computed(() => publicCatalogModule.value?.settings?.showLoginButton !== false);
const showRegisterButton = computed(() => publicCatalogModule.value?.settings?.showRegisterButton !== false);

const email = ref('');
const password = ref('');
const checked = ref(false);

const loading = ref(false);

const authStore = useAuthStore();

const login = async () => {
    loading.value = true;
    try {
        const success = await authStore.login(email.value, password.value);
        if (success) {
            await new Promise((resolve) => setTimeout(resolve, 1000)); // Simula espera si deseas
            toast.add({ severity: 'success', summary: t('loginSuccess'), detail: t('welcomeBack'), life: 3000 });
            router.push({ name: 'dashboard' });
        } else {
            toast.add({ severity: 'error', summary: t('loginFailed'), detail: t('invalidCredentials'), life: 3000 });
        }
    } catch (error) {
        console.error('Login error:', error);
        toast.add({ severity: 'error', summary: t('loginError'), detail: t('unexpectedError'), life: 3000 });
    } finally {
        loading.value = false;
    }
};

const forgotPasswordDialog = ref(false);
const forgotPasswordDialogSended = ref(false);
const emailRestore = ref(null);

const hideDialog = () => {
    forgotPasswordDialog.value = false;
};

const restorePasswordFn = async () => {
    if (!emailRestore.value) {
        toast.add({ severity: 'warn', summary: t('warning'), detail: t('emailRequired'), life: 3000 });
        return;
    }
    try {
        await authStore.restorePassword(emailRestore.value);
        forgotPasswordDialogSended.value = true;
        toast.add({ severity: 'success', summary: t('passwordResetSent'), detail: t('checkYourEmail'), life: 3000 });
    } catch (error) {
        console.error('Restore password error:', error);
        toast.add({ severity: 'error', summary: t('restorePasswordError'), detail: t('restorePasswordFailed'), life: 3000 });
    }
};
</script>

<template>
    <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen overflow-hidden">
        <div class="flex flex-col items-center justify-center">
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                    <div class="text-center mb-8">
                        <img :src="companyLogo" :alt="company.name" class="mb-12 mx-auto max-w-[250px]" />
                        <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">{{ t('welcome') }}</div>
                        <span class="text-muted-color font-medium">{{ t('logInToContinue') }}</span>
                    </div>

                    <div>
                        <label for="email1" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">{{ t('email') }}</label>
                        <InputText id="email1" type="text" :placeholder="t('emailAddress')" class="w-full md:w-[30rem] mb-8" v-model="email" />

                        <label for="password" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">{{ t('password') }}</label>
                        <Password id="password" v-model="password" :placeholder="t('password')" :toggleMask="true" class="mb-4" fluid :feedback="false"></Password>

                        <div class="flex items-center justify-between mt-2 mb-8 gap-8">
                            <div class="flex items-center">
                                <Checkbox v-model="checked" id="rememberme1" binary class="mr-2"></Checkbox>
                                <label for="rememberme1">{{ t('rememberMe') }}</label>
                            </div>
                            <span class="font-medium no-underline ml-2 text-right cursor-pointer text-primary" @click="forgotPasswordDialog = true">{{ t('forgotPassword') }}</span>
                        </div>
                        <Button v-if="!loading" :label="t('logIn')" class="w-full" @click="login"></Button>
                        <Button v-if="loading" :label="t('logingIn')" icon="pi pi-spin pi-spinner" class="w-full"></Button>
                    </div>

                    <div class="mt-8 text-center">
                        <span class="font-medium no-underline mr-2 cursor-pointer text-primary" v-if="showRegisterButton" @click="$router.push({ name: 'register' })">
                            {{ t('register') }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <Dialog v-model:visible="forgotPasswordDialog" :style="{ width: '450px' }" :header="t('forgotPassword')" :modal="true">
        <div class="flex flex-col gap-6">
            <!-- BANNER DE IMAGEN DE RUTA -->
            <div v-if="!forgotPasswordDialogSended">
                <label for="email1" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">{{ t('email') }}</label>
                <InputText id="email1" type="text" :placeholder="t('emailAddress')" class="w-full md:w-[30rem] mb-8" v-model="emailRestore" />
            </div>
            <div v-if="forgotPasswordDialogSended" class="text-center">
                <i class="pi pi-check-circle text-4xl text-green-500 mb-4"></i>
                <div class="text-surface-900 dark:text-surface-0 text-xl font-medium">{{ t('passwordResetSent') }}</div>
                <p class="text-muted-color">{{ t('checkYourEmail') }}</p>
            </div>
        </div>
        <template #footer>
            <Button :label="!forgotPasswordDialogSended ? t('cancel') : t('close')" icon="pi pi-times" text @click="hideDialog" />
            <Button v-if="!forgotPasswordDialogSended" :label="t('send')" icon="pi pi-check" @click="restorePasswordFn" />
        </template>
    </Dialog>
    <Toast />
</template>

<style scoped>
.pi-eye {
    transform: scale(1.6);
    margin-right: 1rem;
}

.pi-eye-slash {
    transform: scale(1.6);
    margin-right: 1rem;
}
</style>
