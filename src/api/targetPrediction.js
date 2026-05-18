import request from '@/utils/request'

const unwrap = (promise) => promise.then((res) => res.data)

const buildHeaders = (userName, extra = {}) => {
  const headers = { ...(extra.headers || {}) }
  if (userName) {
    headers['X-WEMOL-USER'] = userName
  }
  return { ...extra, headers }
}

export const loginTargetPrediction = (userName) => {
  return unwrap(request.post('/tcmseek/tools/target-prediction/login', { userName }))
}

export const fetchTargetPredictionModule = (userName) => {
  return unwrap(
    request.get('/tcmseek/tools/target-prediction/module', buildHeaders(userName))
  )
}

export const submitTargetPredictionJob = (payload, userName) => {
  return unwrap(
    request.post(
      '/tcmseek/tools/target-prediction/jobs',
      payload,
      buildHeaders(userName, { headers: { 'Content-Type': 'multipart/form-data' } })
    )
  )
}

export const fetchTargetPredictionJob = (id, userName) => {
  return unwrap(
    request.get(`/tcmseek/tools/target-prediction/jobs/${id}`, buildHeaders(userName))
  )
}

export const fetchTargetPredictionJobResult = (id, userName) => {
  return unwrap(
    request.post(
      `/tcmseek/tools/target-prediction/jobs/${id}/result`,
      null,
      buildHeaders(userName)
    )
  )
}

export const downloadTargetPredictionFile = (id, relativePath, userName) => {
  return request.get(`/tcmseek/tools/target-prediction/jobs/${id}/files/download`, {
    params: { path: relativePath },
    responseType: 'blob',
    headers: userName ? { 'X-WEMOL-USER': userName } : {}
  })
}

export const fetchTargetPredictionFileText = (id, relativePath, userName) => {
  return request.get(`/tcmseek/tools/target-prediction/jobs/${id}/files/download`, {
    params: { path: relativePath },
    responseType: 'text',
    headers: userName ? { 'X-WEMOL-USER': userName } : {}
  })
}
