<template>
    <div class="card">
        <div class="font-semibold text-xl mb-4">Integrations</div>
        <div class="flex flex-wrap gap-4">
            <Card class="w-full md:w-[24rem] overflow-hidden">
                <template #header>
                    <img alt="user header" src="https://www.thestreet.com/.image/t_share/MTgzMzUyNDUwNDg3NDI4NTE0/paypal_2.jpg" />
                </template>
                <template #title><i class="pi pi-paypal"></i> PayPal</template>
                <template #subtitle><Tag severity="success">Payment Gateway</Tag></template>
                <template #content>
                    <p class="m-0">
                        Integrate <b>PayPal</b> into your platform and offer your customers a fast, secure, and reliable payment option. Supporting both national and international transactions, PayPal makes payments easy with various cards and
                        account balances, enhancing the shopping experience. Make payments simpler and safer with PayPal!
                    </p>
                </template>
                <template #footer>
                    <div class="flex gap-4 mt-1">
                        <Button label="Integrate" class="w-full" />
                    </div>
                </template>
            </Card>

            <Card class="w-full md:w-[24rem] overflow-hidden">
                <template #header>
                    <img alt="user header" src="https://b.stripecdn.com/site-statics-srv/assets/assets/img/v3/home/social-9755e0835b1ab1538bddad515c24744b.png" />
                </template>
                <template #title><i class="pi pi-credit-card"></i> Stripe</template>
                <template #subtitle><Tag severity="success">Payment Gateway</Tag></template>
                <template #content>
                    <p class="m-0">
                        Integrate <b>Stripe</b> into your platform and provide your customers with a flexible, secure, and efficient payment solution. Supporting both national and international transactions, Stripe enables payments with credit cards,
                        debit cards, and alternative methods, enhancing the shopping experience. Simplify payments with advanced technology and guaranteed reliability!
                    </p>
                </template>
                <template #footer>
                    <div class="flex gap-4 mt-1">
                        <Button label="Integrate" class="w-full" />
                    </div>
                </template>
            </Card>

            <Card class="w-full md:w-[24rem] overflow-hidden">
                <template #header>
                    <img alt="user header" src="https://media.zenfs.com/en/entrepreneur.com/2492c5afbe15e710beb8f3a1a43a9994" />
                </template>
                <template #title><i class="pi pi-credit-card"></i> Mercado Pago</template>
                <template #subtitle><Tag severity="success">Payment Gateway</Tag></template>
                <template #content>
                    <p class="m-0">
                        Integrate <b>Mercado Pago</b> into your platform and offer your customers a secure, fast, and versatile payment option. Supporting both national and international transactions, Mercado Pago enables payments via cards,
                        transfers, and cash, enhancing the shopping experience. Make payments easier with a reliable and accessible solution!
                    </p>
                </template>
                <template #footer>
                    <div class="flex gap-4 mt-1">
                        <Button label="Integrate" class="w-full" />
                    </div>
                </template>
            </Card>

            <Card class="w-full md:w-[24rem] overflow-hidden">
                <template #header>
                    <img alt="user header" src="https://www.learnupon.com/wp-content/uploads/SCORM1200x628.jpg" />
                </template>
                <template #title><i class="pi pi-graduation-cap"></i> Scorm</template>
                <template #subtitle><Tag severity="success">Application</Tag></template>
                <template #content>
                    <p class="m-0">
                        Integrate SCORM packages into your platform and provide users with a structured, interactive, and internationally compatible learning experience. SCORM simplifies course management, progress tracking, and interoperability
                        across various e-learning systems. Optimize training with dynamic and accessible content!
                    </p>
                </template>
                <template #footer>
                    <div class="flex gap-4 mt-1">
                        <Button label="Integrate" class="w-full" />
                    </div>
                </template>
            </Card>

            <Card class="w-full md:w-[24rem] overflow-hidden">
                <template #header>
                    <img alt="user header" src="https://weareclearhead.com/wp-content/uploads/2020/02/linkedin_learning_macbook_3-scaled.jpg" />
                </template>
                <template #title><i class="pi pi-linkedin"></i> Linkedin Learning</template>
                <template #subtitle><Tag severity="success">Content Provider</Tag></template>
                <template #content>
                    <p class="m-0">
                        Integrate LinkedIn Learning into your platform and give users access to a vast library of specialized courses. With content created by industry experts, LinkedIn Learning supports professional development, skill enhancement,
                        and continuous learning. Empower growth with high-quality training and global recognition!
                    </p>
                </template>
                <template #footer>
                    <div class="flex gap-4 mt-1">
                        <Button label="Integrate" class="w-full" />
                    </div>
                </template>
            </Card>

            <Card class="w-full md:w-[24rem] overflow-hidden">
                <template #header>
                    <img alt="user header" src="https://tse3.mm.bing.net/th/id/OIP.8Tg91rsRdO_IJ4Aw1ubWVAHaDt?rs=1&pid=ImgDetMain" />
                </template>
                <template #title><i class="pi pi-amazon"></i> AWS Academy</template>
                <template #subtitle><Tag severity="success">Content Provider</Tag></template>
                <template #content>
                    <p class="m-0">
                        Integrate AWS Academy into your platform and provide users with access to courses and resources designed to develop skills in technology and cloud computing. With materials created by experts, AWS Academy enables training in
                        AWS services, enhancing professional opportunities and strengthening hands-on learning. Empower growth with specialized training and recognized certifications!
                    </p>
                </template>
                <template #footer>
                    <div class="flex gap-4 mt-1">
                        <Button label="Integrate" class="w-full" />
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
