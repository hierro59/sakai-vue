import { defineStore } from 'pinia';
import { ref } from 'vue';

export const usePlayerStore = defineStore('player', () => {
    const openPlayer = ref(false);
    const selectedCourse = ref(null);

    function open(course) {
        selectedCourse.value = course;
        openPlayer.value = true;
    }

    function close() {
        selectedCourse.value = null;
        openPlayer.value = false;
    }

    return {
        openPlayer,
        selectedCourse,
        open,
        close
    };
});
