<script setup>
import { ref, inject, watch, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import AuthService from '@/service/auth/AuthService';

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

const first_name = ref('');
const last_name = ref('');
const email = ref('');
const password = ref('');
const c_password = ref('');
const checked = ref(false);
const errorFirstNameMessage = ref('');
const errorLastNameMessage = ref('');
const errorEmailMessage = ref('');
const errorPasswordMessage = ref('');
const errorConfirmPasswordMessage = ref('');
const loading = ref(false);
const authStore = useAuthStore();
const debounceTimer = ref(null);

const register = async () => {
    errorEmailMessage.value = '';
    errorFirstNameMessage.value = '';
    errorLastNameMessage.value = '';
    errorPasswordMessage.value = '';
    errorConfirmPasswordMessage.value = '';

    if (email.value.trim() === '' || first_name.value.trim() === '' || last_name.value.trim() === '' || password.value.trim() === '' || c_password.value.trim() === '') {
        if (email.value.trim() === '') {
            toast.add({ severity: 'error', summary: 'Error', detail: t('emailRequired'), life: 3000 });
            errorEmailMessage.value = t('emailRequired');
        }
        if (first_name.value.trim() === '') {
            toast.add({ severity: 'error', summary: 'Error', detail: t('firstNameRequired'), life: 3000 });
            errorFirstNameMessage.value = t('firstNameRequired');
        }
        if (last_name.value.trim() === '') {
            toast.add({ severity: 'error', summary: 'Error', detail: t('lastNameRequired'), life: 3000 });
            errorLastNameMessage.value = t('lastNameRequired');
        }
        if (password.value.trim() === '') {
            toast.add({ severity: 'error', summary: 'Error', detail: t('passwordRequired'), life: 3000 });
            errorPasswordMessage.value = t('passwordRequired');
        }
        if (c_password.value.trim() === '') {
            toast.add({ severity: 'error', summary: 'Error', detail: t('confirmPasswordRequired'), life: 3000 });
            errorConfirmPasswordMessage.value = t('confirmPasswordRequired');
        }
        return;
    }

    if (!captchaToken.value) {
        captchaError.value = 'Debes verificar que no eres un robot.';
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Completa el captcha antes de registrarte.',
            life: 3000
        });
        return;
    }

    loading.value = true;
    try {
        email.value = email.value.toLowerCase();
        const params = {
            first_name: first_name.value,
            last_name: last_name.value,
            email: email.value,
            password: password.value,
            c_password: c_password.value,
            captchaToken: captchaToken.value
        };
        const response = await authStore.registerUser(params);
        console.log(response);
        if (response) {
            toast.add({ severity: 'success', summary: 'Success', detail: t('registerSuccess'), life: 3000 });
            await new Promise((resolve) => setTimeout(resolve, 1000));
            router.push({ name: 'dashboard' });
        } else {
            toast.add({ severity: 'error', summary: 'Error', detail: t('registerError'), life: 3000 });
        }
    } catch (error) {
        console.error('Register error:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: t('registerError'), life: 3000 });
    } finally {
        loading.value = false;
    }
};

watch([first_name, last_name, email, password, c_password], () => {
    errorFirstNameMessage.value = first_name.value.trim() === '' ? t('firstNameRequired') : '';
    errorLastNameMessage.value = last_name.value.trim() === '' ? t('lastNameRequired') : '';
    errorEmailMessage.value = email.value.trim() === '' ? t('emailRequired') : '';
    errorPasswordMessage.value = password.value.trim() === '' ? t('passwordRequired') : '';
    errorConfirmPasswordMessage.value = c_password.value.trim() === '' ? t('confirmPasswordRequired') : '';
});

const checkUniqueEmail = async () => {
    if (!email.value || email.value.length < 5) {
        errorEmailMessage.value = '';
        return;
    }

    try {
        const response = await AuthService.checkEmail(email.value);
        if (response?.exists) {
            errorEmailMessage.value = t('emailExists');
        } else {
            errorEmailMessage.value = '';
        }
    } catch (error) {
        errorEmailMessage.value = error?.response?.data?.message || t('errorCheckingEmail');
    }
};

// Verifica email con debounce
/* watch(email, () => {
    clearTimeout(debounceTimer.value);
    debounceTimer.value = setTimeout(() => {
        checkUniqueEmail();
    }, 600);
}); */

// Verifica contraseñas
watch([password, c_password], () => {
    const pass = password.value.trim();
    const confirm = c_password.value.trim();

    const isLongEnough = pass.length >= 8;
    const hasUpper = /[A-Z]/.test(pass);
    const hasLower = /[a-z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSpecial = /[^A-Za-z0-9]/.test(pass);

    // Validación de campos vacíos
    if (!pass) {
        errorPasswordMessage.value = '';
        return;
    }

    // ✅ Primero validamos la seguridad de la contraseña
    if (!isLongEnough || !hasUpper || !hasLower || !hasNumber || !hasSpecial) {
        errorPasswordMessage.value = t('passwordInvalid');
        return;
    }

    // ✅ Luego validamos coincidencia (solo si ya escribió la segunda)
    if (confirm && pass !== confirm) {
        errorPasswordMessage.value = t('passwordMismatch');
        return;
    }

    // ✅ Si todo está bien, limpiamos errores
    errorPasswordMessage.value = '';
});

const blocked = computed(() => {
    return (
        first_name.value.trim() === '' ||
        last_name.value.trim() === '' ||
        email.value.trim() === '' ||
        password.value.trim() === '' ||
        c_password.value.trim() === '' ||
        errorFirstNameMessage.value !== '' ||
        errorLastNameMessage.value !== '' ||
        errorEmailMessage.value !== '' ||
        errorPasswordMessage.value !== '' ||
        errorConfirmPasswordMessage.value !== ''
    );
});

const captchaToken = ref('');
const captchaError = ref('');
const sitekey = '1da4b12e-b55c-4f6e-8f7e-8a046236201c';

onMounted(async () => {
    if (showRegisterButton.value === false) {
        router.push({ name: 'login' });
    }

    window.onCaptchaSuccess = (token) => {
        captchaToken.value = token;
        captchaError.value = '';
    };

    window.onCaptchaExpired = () => {
        captchaToken.value = '';
        captchaError.value = 'Captcha expirado. Por favor verifica nuevamente.';
    };

    await loadHCaptchaScript(); // 🔁 asegura que está cargado antes de renderizar

    const captchaElement = document.querySelector('.h-captcha');

    if (window.hcaptcha && captchaElement && !captchaElement.querySelector('iframe')) {
        window.hcaptcha.render(captchaElement, {
            sitekey: '1da4b12e-b55c-4f6e-8f7e-8a046236201c',
            callback: 'onCaptchaSuccess',
            'expired-callback': 'onCaptchaExpired'
        });
    }
});

// Función que carga el script de hCaptcha
function loadHCaptchaScript() {
    return new Promise((resolve, reject) => {
        if (window.hcaptcha) return resolve();

        const existingScript = document.querySelector('script[src*="hcaptcha.com/1/api.js"]');
        if (existingScript) {
            existingScript.addEventListener('load', resolve);
            existingScript.addEventListener('error', reject);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://js.hcaptcha.com/1/api.js?render=explicit';
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}
</script>

<template>
    <Toast />
    <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen overflow-hidden">
        <div class="flex flex-col items-center justify-center">
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                    <div class="text-center mb-8">
                        <img :src="companyLogo" :alt="company.name" class="mb-12 mx-auto max-w-[250px]" />
                        <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">{{ t('welcome') }}</div>
                        <span class="text-muted-color font-medium">{{ t('register') }}</span>
                    </div>

                    <div>
                        <label for="first_name" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mt-2">{{ t('firstName') }}</label>
                        <InputText id="first_name" type="text" :placeholder="t('firstName')" class="w-full md:w-[30rem]" v-model="first_name" />
                        <div v-if="errorFirstNameMessage" class="text-red-500 text-sm mb-2">
                            {{ errorFirstNameMessage }}
                        </div>

                        <label for="last_name" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mt-2">{{ t('lastName') }}</label>
                        <InputText id="last_name" type="text" :placeholder="t('lastName')" class="w-full md:w-[30rem]" v-model="last_name" />
                        <div v-if="errorLastNameMessage" class="text-red-500 text-sm mb-2">
                            {{ errorLastNameMessage }}
                        </div>

                        <label for="email1" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mt-2">{{ t('email') }}</label>
                        <InputText id="email1" type="text" :placeholder="t('emailAddress')" class="w-full md:w-[30rem]" v-model="email" />
                        <div v-if="errorEmailMessage" class="text-red-500 text-sm mb-2">
                            {{ errorEmailMessage }}
                        </div>

                        <label for="password" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mt-2">{{ t('password') }}</label>
                        <Password id="password" v-model="password" :placeholder="t('password')" :toggleMask="true" class="" fluid :feedback="false"></Password>

                        <div v-if="errorPasswordMessage" class="text-red-500 text-sm mb-2">
                            {{ errorPasswordMessage }}
                        </div>

                        <label for="c_password" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mt-2">{{ t('repeatPassword') }}</label>
                        <Password id="c_password" v-model="c_password" :placeholder="t('repeatPassword')" :toggleMask="true" class="" fluid :feedback="false"></Password>

                        <div v-if="errorConfirmPasswordMessage" class="text-red-500 text-sm mb-2">
                            {{ errorConfirmPasswordMessage }}
                        </div>

                        <div class="h-captcha mt-4" style="min-height: 78px; overflow: visible"></div>
                        <div v-if="captchaError" class="text-red-500 text-sm mt-2">
                            {{ captchaError }}
                        </div>
                        <Button v-if="!loading" :disabled="blocked" :label="t('register')" class="w-full mt-4" @click="register"></Button>
                        <Button v-if="loading" :label="t('registering')" icon="pi pi-spin pi-spinner" class="w-full"></Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
.pi-eye {
    transform: scale(1.6);
    margin-right: 1rem;
}

.pi-eye-slash {
    transform: scale(1.6);
    margin-right: 1rem;
}

.h-captcha iframe {
    width: 100% !important;
    min-height: 78px !important;
    display: block !important;
}
</style>
