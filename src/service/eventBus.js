import { ref } from 'vue';

// Creamos un objeto reactivo para almacenar los eventos y sus listeners
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

// Función para dejar de escuchar eventos
const off = (event, callback) => {
    if (bus.value[event]) {
        bus.value[event] = bus.value[event].filter((cb) => cb !== callback);
    }
};

export default { emit, on, off };