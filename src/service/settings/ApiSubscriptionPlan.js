import { authClient } from '@/main';

const getSubscriptionPlan = async () => {
  const { data } = await authClient.get('/settings/modules/subscription/plans')
  return data
}

const create = async (data) => {
  const { response } = await authClient.post('/settings/modules/subscription/plans/create', data)
  return response
}

const update = async (data) => {
  const { response } = await authClient.put('/settings/modules/subscription/plans/' + data.id, data)
  return response
}

const deleted = async (data) => {
  const { response } = await authClient.delete('/settings/modules/subscription/plans/delete/' + data)
  return response
}

export default {
  getSubscriptionPlan,
  create,
  update,
  deleted
}