<script setup>
import { ref, inject, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const router = useRouter();
const route = useRoute();
const toast = useToast();

const company = inject('company');
const companyLogo = inject('companyLogo');

const token = computed(() => String(route.params.token));
const email = computed(() => String(route.params.email));
const validToken = ref(false);

const password = ref('');
const password2 = ref('');

const loading = ref(false);

const authStore = useAuthStore();

// Errores
const errors = ref({
    password: '',
    password2: ''
});

const validateForm = () => {
    errors.value = { password: '', password2: '' };

    if (!password.value) {
        errors.value.password = t('fieldRequired');
    }

    if (!password2.value) {
        errors.value.password2 = t('fieldRequired');
    }

    if (password.value && password2.value && password.value !== password2.value) {
        errors.value.password2 = t('passwordMismatch');
    }

    if (password.value && password.value.length < 8) {
        errors.value.password = t('passwordMin');
    }

    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
    if (password.value && !regex.test(password.value)) {
        errors.value.password = t('passwordComplexity');
    }

    return !errors.value.password && !errors.value.password2;
};

const login = async () => {
    if (!validateForm()) return;

    loading.value = true;
    try {
        const success = await authStore.defineResetPassword(password.value, password2.value, token.value, email.value);
        if (success) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            router.push({ name: 'dashboard' });
        } else {
            toast.add({ severity: 'error', summary: 'Error', detail: t('invalidToken'), life: 3000 });
        }
    } catch (error) {
        console.error('Login error:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: t('invalidToken'), life: 3000 });
    } finally {
        loading.value = false;
    }
};

const checkTokenFn = async () => {
    loading.value = true;
    try {
        const success = await authStore.checkResetPassword(token.value, email.value);
        if (success) {
            validToken.value = true;
        } else {
            toast.add({ severity: 'error', summary: 'Error', detail: t('invalidToken'), life: 3000 });
        }
    } catch (error) {
        console.error('Token check error:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: t('invalidToken'), life: 3000 });
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    if (token.value) {
        checkTokenFn();
    }
});
</script>

<template>
    <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen overflow-hidden">
        <div class="flex flex-col items-center justify-center">
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <!-- Formulario -->
                <div v-if="validToken && !loading" class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                    <div class="text-center mb-8">
                        <img :src="companyLogo" :alt="company.name" class="mb-12 mx-auto max-w-[250px]" />
                        <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">{{ t('welcome') }}</div>
                        <span class="text-muted-color font-medium">{{ t('createPassword') }}</span>
                    </div>

                    <div>
                        <label for="password" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">{{ t('password') }}</label>
                        <Password id="password" v-model="password" :placeholder="t('password')" :toggleMask="true" class="mb-2" fluid :feedback="false" />
                        <p v-if="errors.password" class="text-red-500 text-sm mb-4">{{ errors.password }}</p>

                        <label for="password2" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">{{ t('confirmPassword') }}</label>
                        <Password id="password2" v-model="password2" :placeholder="t('confirmPassword')" :toggleMask="true" class="mb-2" fluid :feedback="false" />
                        <p v-if="errors.password2" class="text-red-500 text-sm mb-4">{{ errors.password2 }}</p>

                        <Button v-if="!loading" :label="t('saveAndContinue')" class="w-full" @click="login"></Button>
                        <Button v-else :label="t('saving')" icon="pi pi-spin pi-spinner" class="w-full"></Button>
                    </div>
                </div>

                <!-- Token inválido -->
                <div v-if="!validToken && !loading" class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                    <div class="text-center mb-8">
                        <img :src="companyLogo" :alt="company.name" class="mb-12 mx-auto max-w-[250px]" />
                        <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">{{ t('welcome') }}</div>
                    </div>

                    <div class="flex justify-center items-center mx-auto border-2 border-pink-500 rounded-full mb-6" style="height: 3.2rem; width: 3.2rem">
                        <i class="pi pi-fw pi-exclamation-circle !text-2xl text-pink-500 flex items-center justify-center w-full h-full"></i>
                    </div>
                    <div class="text-center">
                        <span class="text-red-900 dark:text-surface-0 text-2xl font-bold mb-2">{{ t('invalidToken') }}</span>
                    </div>
                </div>

                <!-- Spinner -->
                <ProgressSpinner v-if="loading" style="width: 50px; height: 50px" />
            </div>
        </div>
    </div>
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
