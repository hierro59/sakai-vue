import { authClient } from '@/main';

const getModules = async () => {
    const { data } = await authClient.get('/settings/modules')
    return data
}

const getEnabledTenantModules = async () => {
    const { data } = await authClient.get('/settings/modules/enabled')
    return data
}

const setModule = async (module) => {
    const { data } = await authClient.post('/settings/modules', module)
    return data
}

const getModule = async (moduleId) => {
    const { data } = await authClient.get(`/settings/modules/${moduleId}`)
    return data
}

const cancelModule = async (moduleId) => {
    const { data } = await authClient.delete(`/settings/modules/${moduleId}`)
    return data
}

export default {
    getModules,
    getEnabledTenantModules,
    setModule,
    getModule,
    cancelModule
}