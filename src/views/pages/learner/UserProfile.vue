<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import userService from '@/service/userService';
import { useToast } from 'primevue/usetoast';

const toast = useToast();

// Obtener el store de autenticación
const authStore = useAuthStore();

const name = ref('');
const email = ref('');
const phone = ref('');
const password = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const first_name = ref(null);
const last_name = ref(null);
const username = ref(null);
const uploadAvatar = ref(false);

// Computed para obtener datos desde el store
const userName = computed(() => authStore.user);
const userRoles = computed(() => authStore.rol);
const userAvatar = computed(() => (authStore.userAvatar ? authStore.userAvatar : '/images/owl.png'));

// Cargar los datos del usuario desde el store al montar el componente
const loadUserData = () => {
    name.value = userName.value;
    first_name.value = authStore.first_name ? authStore.first_name : '';
    last_name.value = authStore.last_name ? authStore.last_name : '';
    username.value = authStore.username ? authStore.username : '';
    email.value = authStore.userEmail ? authStore.userEmail : '';
    phone.value = authStore.phone ? authStore.phone : '';
};

// Actualizar perfil
const updateProfile = async () => {
    try {
        await userService.updateProfile({ name: name.value, first_name: first_name.value, last_name: last_name.value, username: username.value, email: email.value, phone: phone.value }).then((response) => {
            authStore.first_name = name.value;
            authStore.last_name = last_name.value;
            authStore.username = username.value;
            authStore.userEmail = email.value;
            authStore.phone = phone.value;
        });

        toast.add({ severity: 'success', summary: 'Success', detail: 'Profile updated successfully', life: 3000 });
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Error updating profile', life: 3000 });
        console.error(error);
    }
};

// Actualizar avatar
const updateAvatar = async (event) => {
    const file = event.target.files[0];
    if (!file) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'No file selected', life: 3000 });
        return;
    }
    uploadAvatar.value = true;

    try {
        // Realizar la solicitud al servicio
        const response = await userService.updateAvatar(file).then((response) => {
            // Actualizar el avatar en el store
            authStore.userAvatar = response.data.avatarUrl;
            toast.add({ severity: 'success', summary: 'Success', detail: 'Avatar updated successfully', life: 3000 });
            uploadAvatar.value = false;
        });
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Error updating avatar', life: 3000 });
        console.error(error);
    }
};

// Cambiar contraseña
const updatePassword = async () => {
    if (newPassword.value !== confirmPassword.value) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Passwords do not match', life: 3000 });
        return;
    }
    try {
        await userService.updatePassword({ password: password.value, newPassword: newPassword.value });
        toast.add({ severity: 'success', summary: 'Success', detail: 'Password updated successfully', life: 3000 });
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Error updating password', life: 3000 });
        console.error(error);
    }
};

// Cargar datos del usuario al montar el componente
onMounted(() => {
    loadUserData();
});
</script>

<template>
    <div class="container mx-auto p-6">
        <div class="bg-white shadow-md rounded-lg p-6">
            <!-- Encabezado del Perfil -->
            <div class="flex items-center space-x-4 mb-6">
                <img :src="userAvatar" alt="Avatar" class="w-20 h-20 rounded-full border border-gray-300" />
                <div>
                    <h2 class="text-2xl font-semibold">{{ userName }}</h2>
                    <p class="text-gray-600">{{ email }}</p>
                    <p class="text-gray-500 text-sm">Roles: {{ userRoles.join(', ') }}</p>
                </div>
            </div>

            <!-- Cambiar Avatar -->
            <div class="mb-4">
                <h3 class="text-xl font-semibold mb-2">Change Avatar</h3>
                <div class="flex items-center gap-4">
                    <label class="cursor-pointer">
                        <span class="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            <ProgressSpinner v-if="uploadAvatar" style="height: 10px; width: 10px; margin-right: 4px" animationDuration=".5s" color="#fff" strokeWidth="8" />
                            {{ uploadAvatar ? 'Uploading...' : 'Select Image' }}
                        </span>
                        <input type="file" @change="updateAvatar" class="hidden" accept="image/jpeg,image/png,image/jpg" />
                    </label>
                    <span class="text-sm text-gray-500">Formats: JPEG, PNG</span>
                </div>
            </div>
            <Divider />
            <!-- Información Personal -->
            <h3 class="text-xl font-semibold mb-2">Personal Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                    <label class="block text-sm font-medium text-gray-700">First Name</label>
                    <InputText v-model="first_name" placeholder="First Name" class="w-full mb-2" />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Last Name</label>
                    <InputText v-model="last_name" placeholder="Last Name" class="w-full mb-2" />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">User Name</label>
                    <InputText v-model="username" placeholder="User Name" class="w-full mb-2" />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Email</label>
                    <InputText v-model="email" placeholder="Email" class="w-full mb-2" />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Phone</label>
                    <InputText v-model="phone" placeholder="Phone" class="w-full mb-2" />
                </div>
            </div>
            <Divider />
            <!-- Cambio de Contraseña -->
            <div class="mb-6">
                <h3 class="text-xl font-semibold mb-2">Change Password</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Password</label>
                        <Password v-model="password" placeholder="Password" toggle-mask class="w-full mb-2" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">New Password</label>
                        <Password v-model="newPassword" placeholder="New Password" toggle-mask class="w-full mb-2" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Confirm Password</label>
                        <Password v-model="confirmPassword" placeholder="Confirm Password" toggle-mask class="w-full mb-2" />
                    </div>
                </div>
            </div>

            <!-- Botones de Acción -->
            <div class="flex justify-end space-x-2">
                <Button label="Update Profile" icon="pi pi-save" class="p-button-success" @click="updateProfile" />
                <Button label="Update Password" icon="pi pi-lock" class="p-button-warning" @click="updatePassword" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.container {
    max-width: 800px;
}
</style>
