<template>
    <div class="p-6 bg-white rounded-xl shadow-md w-full">
        <h2 class="text-xl font-bold mb-4">Usar la cuenta de PayPal de Atenea</h2>
        <p class="mb-4">Si prefieres simplificar el proceso de integración de pagos y reducir el esfuerzo administrativo, puedes optar por utilizar nuestra cuenta de PayPal para gestionar los cobros.</p>
        <div class="space-y-2">
            <h3 class="text-lg font-semibold">Ventajas de usar nuestra cuenta:</h3>
            <ul class="list-disc pl-6 text-gray-700">
                <li>✅ Facilidad y rapidez: Evita configuraciones complejas y disfruta de una integración rápida.</li>
                <li>✅ Soporte continuo: Nos encargamos de mantener el sistema operativo y seguro.</li>
                <li>✅ Gestión completa de pagos: Nosotros procesamos los cobros y te transferimos el dinero.</li>
                <li>✅ Seguridad garantizada: Nuestra infraestructura de pagos cumple con los estándares de seguridad más exigentes.</li>
                <li>✅ Menos papeleo: Olvídate de crear y mantener una cuenta comercial en PayPal.</li>
            </ul>
        </div>
        <div class="mt-4">
            <h3 class="text-lg font-semibold">¿Cómo funciona?</h3>
            <ol class="list-decimal pl-6 text-gray-700">
                <li>Selecciona esta opción para autorizar a Atenea a gestionar los pagos.</li>
                <li>Nosotros realizamos el cobro en tu nombre y gestionamos los pagos directamente a tus cuentas.</li>
                <li>Recibirás los ingresos, menos la comisión por gestión, de manera periódica y transparente.</li>
            </ol>
        </div>
        <div class="mt-6">
            <div class="flex items-center mb-4">
                <Checkbox inputId="use-atenea-paypal" name="use-atenea-paypal" value="false" @click="changeStatus" />
                <label for="use-atenea-paypal" class="ml-2"> Autorizo a Atenea a gestionar los pagos por mi y acepto los <a href="#" class="text-blue-600 hover:underline">T&eacute;rminos y Condiciones</a>.</label>
            </div>
            <button
                @click="integrateWithAtenea"
                :disabled="!useAteneaPayPal"
                :class="!useAteneaPayPal ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'"
                class="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                Integrar con cuenta de Atenea
            </button>
            <p class="text-sm text-gray-500 mt-2">¿Tienes dudas? Contacta con nuestro equipo de soporte en cualquier momento. <a href="#" class="text-blue-600 hover:underline">Preguntas frecuentes</a>.</p>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const useAteneaPayPal = ref(false);

const integrateWithAtenea = () => {
    alert('Integración iniciada con la cuenta de Atenea');
};

const changeStatus = () => {
    useAteneaPayPal.value = !useAteneaPayPal.value;
};
</script>

<style scoped>
.bg-blue-600:hover {
    background-color: #2563eb;
}
</style>
