<script setup>
import { ref, inject } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const router = useRouter();

const company = inject('company');
const companyLogo = inject('companyLogo');

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
            router.push({ name: 'dashboard' });
        } else {
            alert('Error en el inicio de sesión');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Error en el inicio de sesión');
    } finally {
        loading.value = false;
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
                        <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Welcome</div>
                        <span class="text-muted-color font-medium">Log in to continue</span>
                    </div>

                    <div>
                        <label for="email1" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Email</label>
                        <InputText id="email1" type="text" placeholder="Email address" class="w-full md:w-[30rem] mb-8" v-model="email" />

                        <label for="password" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Password</label>
                        <Password id="password" v-model="password" placeholder="Password" :toggleMask="true" class="mb-4" fluid :feedback="false"></Password>

                        <div class="flex items-center justify-between mt-2 mb-8 gap-8">
                            <div class="flex items-center">
                                <Checkbox v-model="checked" id="rememberme1" binary class="mr-2"></Checkbox>
                                <label for="rememberme1">Remember me</label>
                            </div>
                            <span class="font-medium no-underline ml-2 text-right cursor-pointer text-primary">Forgot password?</span>
                        </div>
                        <Button v-if="!loading" label="Log in" class="w-full" @click="login"></Button>
                        <Button v-if="loading" label="Loging in..." icon="pi pi-spin pi-spinner" class="w-full"></Button>
                    </div>
                </div>
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
