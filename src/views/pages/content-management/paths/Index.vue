<template>
    <div class="card">
        <div class="font-semibold text-xl mb-4">Área de Gestión de Senderos</div>
        <Tabs value="0">
            <TabList>
                <Tab value="0"><i class="pi pi-sitemap mr-2"></i>Senderos</Tab>
                <Tab value="1"><i class="pi pi-chart-line mr-2"></i>Estadisticas</Tab>
            </TabList>
            <TabPanels>
                <TabPanel value="0">
                    <LearningPathSettings />
                </TabPanel>
                <TabPanel value="1">
                    <Statistics />
                </TabPanel>
            </TabPanels>
        </Tabs>
    </div>
</template>
<script setup>
import LearningPathSettings from '@/components/dashboard/content-management/paths/LearningPathSettings.vue';
import Statistics from '@/components/dashboard/settings/Statistics.vue';
</script>
