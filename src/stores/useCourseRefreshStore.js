// src/stores/useCourseRefreshStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useCourseRefreshStore = defineStore('courseRefresh', () => {
    const catalogRefreshCount = ref(0);
    const myContentRefreshCount = ref(0);

    function triggerCatalogRefresh() {
        catalogRefreshCount.value++;
    }

    function triggerMyContentRefresh() {
        myContentRefreshCount.value++;
    }

    return {
        catalogRefreshCount,
        myContentRefreshCount,
        triggerCatalogRefresh,
        triggerMyContentRefresh,
    };
});
