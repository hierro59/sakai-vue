<template>
    <div class="card">
        <!-- CATEROGIAS -->
        <Toolbar class="mb-6">
            <template #start>
                <Button label="Nuevo" icon="pi pi-plus" class="mr-2" @click="openDialog" />
            </template>

            <template #end>
                <Button label="Export" v-tooltip.bottom="'Download CSV'" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
            </template>
        </Toolbar>

        <DataTable
            ref="dt"
            :value="categories"
            dataKey="id"
            :paginator="true"
            :rows="10"
            :filters="filters"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[5, 10, 25]"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} users"
        >
            <template #header>
                <div class="flex flex-wrap gap-2 items-center justify-between">
                    <h4 class="m-0">Administre las Categorías</h4>
                    <IconField>
                        <InputIcon>
                            <i class="pi pi-search" />
                        </InputIcon>
                        <InputText v-model="filters['global'].value" placeholder="Search..." />
                    </IconField>
                </div>
            </template>

            <Column field="name" header="Name" sortable style="min-width: 18rem"></Column>
            <Column field="slug" header="Slug" sortable style="min-width: 18rem"></Column>
            <!-- <Column field="paretn_id" header="Parent" sortable style="min-width: 16rem"></Column> -->

            <Column :exportable="false" style="min-width: 12rem">
                <template #body="slotProps">
                    <Button icon="pi pi-pencil" id="change-role" severity="primary" rounded class="mr-2" @click="openDialog(slotProps.data)" v-tooltip.top="'Editar Categoría'" />
                    <Button icon="pi pi-trash" outlined rounded severity="danger" class="mr-2" @click="confirmDeleteCategory(slotProps.data)" v-if="slotProps.data.status !== 'inactive'" v-tooltip.top="'Eliminar Categoría'" />
                </template>
            </Column>
        </DataTable>

        <Dialog v-model:visible="categoryDialog" :style="{ width: '450px' }" :header="!category.id ? 'New Category' : 'Edit Category'" :modal="true">
            <div class="flex flex-col gap-6">
                <div>
                    <label for="name" class="block font-bold mb-3">Name</label>
                    <InputText id="name" v-model.trim="category.name" required="true" autofocus :invalid="submitted && !category.name" fluid />
                    <small v-if="submitted && !category.name" class="text-red-500">First Name is required.</small>
                </div>
            </div>
            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Save" icon="pi pi-check" @click="saveCategory" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteCategoryDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="category"
                    >Are you sure you want to delete <b>{{ category.name }} </b> Category?</span
                >
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteCategoryDialog = false" />
                <Button label="Yes" icon="pi pi-check" @click="deleteCategory" />
            </template>
        </Dialog>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import api from '@/service/content-management/ApiCategories';

const toast = useToast();
const dt = ref();
const categoryDialog = ref(false);
const deleteCategoryDialog = ref(false);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);

const categories = ref();
const emptyCategory = {
    name: '',
    slug: '',
    parent_id: null
};
const category = ref({ ...emptyCategory });

const getCategories = async () => {
    await api
        .getCategories()
        .then((response) => {
            categories.value = response;
        })
        .catch((error) => {
            console.log(error);
        });
};

const openDialog = (data) => {
    category.value = { ...data };
    console.log(category);
    categoryDialog.value = true;
};

const hideDialog = () => {
    categoryDialog.value = false;
    submitted.value = false;
    category.value = { ...emptyCategory };
};
const saveCategory = () => {
    if (category.value.id) {
        api.updateCategory(category.value)
            .then((response) => {
                console.log(response);
                toast.add({ severity: 'success', summary: 'Successful', detail: 'Category Updated', life: 3000 });
                getCategories();
            })
            .catch((error) => {
                console.log(error);
                let errorMessage = 'Error al agregar los miembros.';

                const serverData = error.response?.data;

                // Extrae el mensaje del campo errorInfo si está presente
                if (serverData?.data?.error?.errorInfo && Array.isArray(serverData.data.error.errorInfo) && serverData.data.error.errorInfo.length > 2) {
                    errorMessage = serverData.data.error.errorInfo[2];
                } else if (serverData?.message) {
                    errorMessage = serverData.message;
                }
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: errorMessage,
                    life: 5000
                });
            });
    } else {
        api.createCategory(category.value)
            .then((response) => {
                console.log(response);
                toast.add({ severity: 'success', summary: 'Successful', detail: 'Members Added', life: 3000 });
                getCategories();
            })
            .catch((error) => {
                console.log(error);
                let errorMessage = 'Error al agregar los miembros.';

                const serverData = error.response?.data;

                // Extrae el mensaje del campo errorInfo si está presente
                if (serverData?.data?.error?.errorInfo && Array.isArray(serverData.data.error.errorInfo) && serverData.data.error.errorInfo.length > 2) {
                    errorMessage = serverData.data.error.errorInfo[2];
                } else if (serverData?.message) {
                    errorMessage = serverData.message;
                }
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: errorMessage,
                    life: 5000
                });
            });
    }
    categoryDialog.value = false;
    category.value = { ...emptyCategory };
};

const confirmDeleteCategory = (data) => {
    category.value = { ...data };
    deleteCategoryDialog.value = true;
};
const deleteCategory = () => {
    api.deleteCategory(category.value.id)
        .then((response) => {
            console.log(response);
            toast.add({ severity: 'success', summary: 'Successful', detail: 'User Deleted', life: 3000 });
            getCategories();
        })
        .catch((error) => {
            console.log(error);
            let errorMessage = 'Error al eliminar el usuario.';

            const serverData = error.response?.data;

            // Extrae el mensaje del campo errorInfo si está presente
            if (serverData?.data?.error?.errorInfo && Array.isArray(serverData.data.error.errorInfo) && serverData.data.error.errorInfo.length > 2) {
                errorMessage = serverData.data.error.errorInfo[2];
            } else if (serverData?.message) {
                errorMessage = serverData.message;
            }

            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: errorMessage,
                life: 5000
            });
        });
    deleteCategoryDialog.value = false;
    category.value = { ...emptyCategory };
};

const findIndexById = (id) => {
    let index = -1;
    for (let i = 0; i < courses.value.length; i++) {
        if (courses.value[i].id === id) {
            index = i;
            break;
        }
    }
    return index;
};

const exportCSV = () => {
    dt.value.exportCSV();
};

onMounted(() => {
    getCategories();
});
</script>
