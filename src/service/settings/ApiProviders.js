import { authClient } from '@/main';

const getProviders = async () => {
    const { data } = await authClient.get('/settings/providers')
    return data
}

const createProvider = async (provider) => {
    const { data } = await authClient.post('/settings/providers', provider)
    return data
}

const cancelProvider = async (providerId) => {
    const { data } = await authClient.delete(`/settings/providers/${providerId}`)
    return data
}

export default {
    getProviders,
    createProvider,
    cancelProvider
}