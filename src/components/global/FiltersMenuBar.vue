<template>
    <Menubar :model="items" class="mb-4 z-150">
        <template #start></template>

        <template #item="{ item, props, hasSubmenu, root }">
            <a v-ripple class="flex items-center" v-bind="props.action">
                <span>{{ item.label }}</span>
                <Badge v-if="item.badge" :class="{ 'ml-auto': !root, 'ml-2': root }" :value="item.badge" />
                <span v-if="item.shortcut" class="ml-auto border border-surface rounded bg-emphasis text-muted-color text-xs p-1">
                    {{ item.shortcut }}
                </span>
                <i v-if="hasSubmenu" :class="['pi pi-angle-down ml-auto', { 'pi-angle-down': root, 'pi-angle-right': !root }]"></i>
            </a>
        </template>

        <template #end>
            <div class="flex items-center gap-2">
                <InputText :placeholder="t('search')" type="text" class="w-32 sm:w-auto" v-model="searchQuery" @keyup.enter="emitSearch" />
                <Button :label="t('clear')" icon="pi pi-times" class="p-button-text p-button-danger" @click="clearFilters" />
            </div>
        </template>
    </Menubar>
</template>

<script setup>
import { ref, onMounted, defineProps, defineEmits } from 'vue';
import ApiCategories from '@/service/content-management/ApiCategories';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const emit = defineEmits(['filterByCategory', 'sortBy', 'search', 'clearFilters', 'type']);

defineProps({ path: String });

const items = ref([]);
const categories = ref([]);
const searchQuery = ref('');

const loadCategories = async () => {
    try {
        const response = await ApiCategories.getCategories();
        categories.value = response;

        const categoryMenuItems = response.map((cat) => ({
            label: cat.name,
            icon: 'pi pi-tag',
            command: () => filterByCategory(cat)
        }));

        items.value = [
            {
                label: t('categories'),
                icon: 'pi pi-tags',
                items: categoryMenuItems
            },
            {
                label: t('orderBy'),
                icon: 'pi pi-sort-alt',
                items: [
                    {
                        label: t('newer'),
                        icon: 'pi pi-clock',
                        command: () => sortBy('newest')
                    },
                    {
                        label: t('older'),
                        icon: 'pi pi-history',
                        command: () => sortBy('oldest')
                    },
                    {
                        label: t('topRated'),
                        icon: 'pi pi-star',
                        command: () => sortBy('rating')
                    },
                    {
                        label: t('moreStudents'),
                        icon: 'pi pi-users',
                        command: () => sortBy('students')
                    }
                ]
            },
            {
                label: t('type'),
                icon: 'pi pi-sort-alt',
                items: [
                    {
                        label: t('course'),
                        icon: 'pi pi-clock',
                        command: () => type('course')
                    },
                    {
                        label: t('path'),
                        icon: 'pi pi-history',
                        command: () => type('traject')
                    }
                ]
            }
        ];
    } catch (err) {
        console.error('Error cargando categorías', err);
    }
};

const emitSearch = () => {
    emit('search', searchQuery.value);
};

const filterByCategory = (categoryId) => {
    emit('filterByCategory', categoryId);
};

const sortBy = (criteria) => {
    emit('sortBy', criteria);
};

const type = (criteria) => {
    emit('type', criteria);
};

const clearFilters = () => {
    searchQuery.value = '';
    emit('clearFilters');
};

onMounted(() => {
    loadCategories();
});
</script>
