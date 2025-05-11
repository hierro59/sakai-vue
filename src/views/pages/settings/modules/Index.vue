<template>
    <div class="card">
        <div class="font-semibold text-xl mb-4">Modules</div>
        <div class="flex flex-wrap gap-4">
            <Card class="w-full md:w-[24rem] overflow-hidden">
                <template #header>
                    <img alt="Subscriptions" src="https://www.emprendiendohistorias.com/wp-content/uploads/2021/05/planes-modelo-de-suscripcion.jpg" />
                </template>
                <template #title><i class="pi pi-credit-card"></i> Subscriptions</template>
                <template #subtitle><Tag severity="success">Module</Tag></template>
                <template #content>
                    <p class="m-0">
                        Implement a subscription module in your platform and offer users flexible and automated management of recurring payments. With features for custom plans, automatic renewal, and user administration, optimize the subscription
                        experience and retain customers with an efficient and transparent system. Simplify membership management with advanced technology!
                    </p>
                </template>
                <template #footer>
                    <div class="flex gap-4 mt-1">
                        <Button label="Coming soon" disabled class="w-full" />
                    </div>
                </template>
            </Card>

            <Card class="w-full md:w-[24rem] overflow-hidden">
                <template #header>
                    <img alt="Landing Page" src="https://seranking.com/es/blog/wp-content/uploads/sites/13/2020/04/Landing-page.png" />
                </template>
                <template #title><i class="pi pi-home"></i> Landing Page</template>
                <template #subtitle><Tag severity="success">Module</Tag></template>
                <template #content>
                    <p class="m-0">
                        Implement a landing page module and create attractive, optimized, and functional pages to capture leads and drive conversions. With customized design tools, form integration, and performance analytics, enhance your digital
                        presence and maximize campaign results. Turn visitors into customers with effective and professional pages!
                    </p>
                </template>
                <template #footer>
                    <div class="flex gap-4 mt-1">
                        <Button label="Coming soon" disabled class="w-full" />
                    </div>
                </template>
            </Card>

            <Card class="w-full md:w-[24rem] overflow-hidden">
                <template #header>
                    <img alt="Gamification" src="https://www.educaciontrespuntocero.com/wp-content/uploads/2019/08/gamificacion.jpg" />
                </template>
                <template #title><i class="pi pi-medal"></i> Gamification</template>
                <template #subtitle><Tag severity="success">Module</Tag></template>
                <template #content>
                    <p class="m-0">
                        Implement a gamification module and enhance the user experience with interactive game mechanics. With rewards, challenges, and levels, encourage engagement, learning, and loyalty. Optimize motivation and commitment with
                        dynamic elements that drive interaction. Make every action exciting and meaningful!
                    </p>
                </template>
                <template #footer>
                    <div class="flex gap-4 mt-1">
                        <Button label="Coming soon" disabled class="w-full" />
                    </div>
                </template>
            </Card>

            <Card class="w-full md:w-[24rem] overflow-hidden">
                <template #header>
                    <img alt="user header" src="https://www.tutorialspoint.com/basics_of_computer_science/images/computer_multimedia.jpg" />
                </template>
                <template #title><i class="pi pi-book"></i> Public Catalog</template>
                <template #subtitle><Tag severity="success">Module</Tag></template>
                <template #content>
                    <p class="m-0">
                        Implement a public course catalog module and provide users with an accessible and engaging experience to discover learning opportunities. With filtering options, advanced search, and personalized recommendations, maximize
                        engagement and facilitate educational content exploration. Boost participation with a dynamic and well-structured catalog!
                    </p>
                </template>
                <template #footer>
                    <div class="flex gap-4 mt-1">
                        <Button label="Coming soon" disabled class="w-full" />
                    </div>
                </template>
            </Card>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
</script>
