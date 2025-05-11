<template>
    <div class="p-6 bg-white rounded-xl shadow-md w-full">
        <h2 class="text-xl font-bold mb-4">Usar tu propia cuenta de PayPal</h2>
        <p class="mb-4">Si prefieres mantener el control completo sobre los pagos y gestionar directamente tus ingresos, puedes optar por usar tu propia cuenta comercial de PayPal.</p>
        <div class="space-y-2">
            <h3 class="text-lg font-semibold">Ventajas de usar tu cuenta:</h3>
            <ul class="list-disc pl-6 text-gray-700">
                <li>✅ Control total: Tú gestionas directamente el flujo de pagos y cobros.</li>
                <li>✅ Sin comisiones adicionales: Atenea no retiene porcentaje alguno.</li>
                <li>✅ Flexibilidad: Puedes configurar y actualizar las credenciales cuando lo necesites.</li>
                <li>✅ Acceso directo a fondos: Recibes los pagos directamente en tu cuenta comercial.</li>
                <li>✅ Personalización: Puedes utilizar tus propias políticas y condiciones de pago.</li>
            </ul>
        </div>
        <div class="mt-4">
            <h3 class="text-lg font-semibold">¿Cómo configurar?</h3>
            <ol class="list-decimal pl-6 text-gray-700">
                <li>Selecciona esta opción para integrar tu propia cuenta de PayPal.</li>
                <li>Proporciona las credenciales API necesarias (Client ID y Secret).</li>
                <li>Guarda la configuración y realiza una prueba de pago.</li>
            </ol>
            <form @submit.prevent="saveCredentials" class="mt-4 space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">Client ID</label>
                    <input v-model="clientId" type="text" placeholder="Ingresa tu Client ID" class="mt-1 p-2 block w-full border rounded-md" />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Secret</label>
                    <input v-model="secret" type="password" placeholder="Ingresa tu Secret" class="mt-1 p-2 block w-full border rounded-md" />
                </div>
                <div>
                    <button type="submit" class="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">Guardar Configuración</button>
                </div>
            </form>
        </div>
        <p class="text-sm text-gray-500 mt-2">¿Tienes dudas? Contacta con nuestro equipo de soporte en cualquier momento. <a href="#" class="text-blue-600 hover:underline">Preguntas frecuentes</a>.</p>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const clientId = ref('');
const secret = ref('');

const integrateWithOwnAccount = () => {
    alert('Integración iniciada con tu propia cuenta de PayPal');
};

const saveCredentials = () => {
    if (clientId.value && secret.value) {
        alert(`Credenciales guardadas: Client ID: ${clientId.value}`);
    } else {
        alert('Por favor, completa ambos campos');
    }
};
</script>

<style scoped>
.bg-green-600:hover {
    background-color: #16a34a;
}
input {
    border: 1px solid #d1d5db;
}
input:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.5);
}
</style>
