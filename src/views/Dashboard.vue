<script setup>
import BestSellingWidget from '@/components/dashboard/BestSellingWidget.vue';
import CourseRecents from '@/components/dashboard/CourseRecents.vue';
import GlobalCourseOffering from '@/components/dashboard/GlobalCourseOffering.vue';
import NotificationsWidget from '@/components/dashboard/NotificationsWidget.vue';
</script>

<template>
    <div class="grid grid-cols-12 gap-8">
        <!-- <StatsWidget /> -->
        <div class="col-span-12 xl:col-span-12">
            <CourseRecents />
        </div>

        <div class="col-span-12 xl:col-span-12">
            <GlobalCourseOffering />
        </div>

        <!--  <div class="col-span-12 xl:col-span-6">
            <BestSellingWidget />
        </div>
        <div class="col-span-12 xl:col-span-6">
            <NotificationsWidget />
        </div> -->
    </div>
</template>
