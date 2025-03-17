import { ref } from 'vue';

// Creamos un evento reactivo
const bus = ref({});

// Función para emitir eventos
const emit = (event, ...args) => {
    if (bus.value[event]) {
        bus.value[event].forEach((callback) => callback(...args));
    }
};

// Función para escuchar eventos
const on = (event, callback) => {
    if (!bus.value[event]) {
        bus.value[event] = [];
    }
    bus.value[event].push(callback);
};

export default { emit, on };