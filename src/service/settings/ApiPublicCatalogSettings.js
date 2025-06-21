import { authClient } from '@/main';

const getSettings = async () => {
    const { data } = await authClient.get('/settings/modules/subscription/plans')
    return data
}

const update = async (data) => {
    const { response } = await authClient.put('/settings/modules/subscription/plans/' + data.id, data)
    return response
}

export default {
    getSettings,
    update
}