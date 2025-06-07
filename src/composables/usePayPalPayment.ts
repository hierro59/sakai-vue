import { ref, nextTick } from 'vue'
import paypal from '@/service/integrations/payment-gateways/paypal/ApiPayPalService'

interface PayPalPaymentOptions {
    courseId: number
    container: HTMLElement
    onSuccess?: () => void
    onCancel?: () => void
    onError?: (err: any) => void
}

export function usePayPalPayment() {
    const processing = ref(false)

    const loadSDK = async () => {
        if ((window as any).paypal) return Promise.resolve()
        return new Promise<void>((resolve, reject) => {
            const script = document.createElement('script')
            script.src = 'https://www.paypal.com/sdk/js?client-id=sb' // ⚠️ Cambiar por client_id dinámico si aplica
            script.onload = () => resolve()
            script.onerror = reject
            document.head.appendChild(script)
        })
    }

    const pay = async ({
        courseId,
        container,
        onSuccess,
        onCancel,
        onError
    }: PayPalPaymentOptions) => {
        processing.value = true

        try {
            await loadSDK()

            let body = JSON.stringify({ course_id: courseId })

            const res = await paypal.createOrder(body)

            const { id: orderID } = res.id

            await nextTick()

            const buttonInstance = (window as any).paypal.Buttons({
                createOrder: () => orderID,
                onApprove: async () => {
                    let body2 = JSON.stringify({
                        order_id: orderID,
                        course_id: courseId
                    })
                    const capture = await paypal.captureOrder(body2)

                    if (capture.status === 'COMPLETED' && onSuccess) onSuccess()
                },
                onCancel: () => onCancel?.(),
                onError: (err: any) => onError?.(err)
            })
            if (!container || !(container instanceof HTMLElement)) {
                console.error('Container recibido en usePayPalPayment:', container)
                throw new Error('Contenedor de PayPal no es un HTMLElement válido')
            }


            await buttonInstance.render(container)
        } catch (err) {
            console.error('Error general en el proceso de pago:', err)
            onError?.(err)
        }

        processing.value = false
    }

    return {
        pay,
        processing
    }
}
