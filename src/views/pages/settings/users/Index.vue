<template>
    <div class="card">
        <div class="font-semibold text-xl mb-4">Área de Gestión de usuarios</div>
        <Tabs value="0">
            <TabList>
                <Tab value="0"><i class="pi pi-pencil mr-2"></i>Usuarios</Tab>
                <Tab value="1"><i class="pi pi-share-alt mr-2"></i>Estadisticas</Tab>
            </TabList>
            <TabPanels>
                <TabPanel value="0">
                    <Users />
                </TabPanel>
                <TabPanel value="1">
                    <Statistics />
                </TabPanel>
            </TabPanels>
        </Tabs>
    </div>
</template>
<script setup>
import Statistics from '@/components/dashboard/settings/Statistics.vue';
import Users from '@/components/dashboard/settings/Users.vue';
</script>
