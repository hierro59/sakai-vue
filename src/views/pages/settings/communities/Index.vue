<template>
    <div class="card">
        <div class="font-semibold text-xl mb-4">Community Management Area</div>
        <Tabs value="0">
            <TabList>
                <Tab value="0"><i class="pi pi-share-alt mr-2"></i>Communities</Tab>
                <Tab value="1"><i class="pi pi-chart-line mr-2"></i>Statistics</Tab>
            </TabList>
            <TabPanels>
                <TabPanel value="0">
                    <CommunitiesSettings />
                </TabPanel>
                <TabPanel value="1">
                    <Statistics />
                </TabPanel>
            </TabPanels>
        </Tabs>
    </div>
</template>
<script setup>
import CommunitiesSettings from '@/components/dashboard/settings/communities/CommunitiesSettings.vue';
import Statistics from '@/components/dashboard/settings/Statistics.vue';
</script>
