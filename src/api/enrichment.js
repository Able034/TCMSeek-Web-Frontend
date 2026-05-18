import axios from 'axios'

const ENRICHR_BASE_URL = 'https://maayanlab.cloud/Enrichr'
const SPEEDRICHR_BASE_URL = 'https://maayanlab.cloud/speedrichr'

const normalizeGeneInput = (genes) => {
  if (Array.isArray(genes)) {
    return genes.join('\n')
  }
  return genes || ''
}

export const addEnrichrGeneList = ({ genes, description = '' }) => {
  if (!genes || (Array.isArray(genes) && !genes.length)) {
    return Promise.reject(new Error('Gene list is required'))
  }

  const formData = new FormData()
  formData.append('list', normalizeGeneInput(genes))
  if (description) {
    formData.append('description', description)
  }

  return axios
    .post(`${ENRICHR_BASE_URL}/addList`, formData)
    .then((response) => response.data)
}

export const viewEnrichrGeneList = (userListId) => {
  return axios
    .get(`${ENRICHR_BASE_URL}/view`, { params: { userListId } })
    .then((response) => response.data)
}

export const fetchEnrichrResults = ({ userListId, backgroundType }) => {
  return axios
    .get(`${ENRICHR_BASE_URL}/enrich`, {
      params: { userListId, backgroundType }
    })
    .then((response) => response.data)
}

export const downloadEnrichrResults = ({ userListId, backgroundType, filename }) => {
  return axios.get(`${ENRICHR_BASE_URL}/export`, {
    params: { userListId, filename, backgroundType },
    responseType: 'blob'
  })
}

export const addSpeedrichrGeneList = ({ genes, description = '' }) => {
  const formData = new FormData()
  formData.append('list', normalizeGeneInput(genes))
  if (description) {
    formData.append('description', description)
  }

  return axios
    .post(`${SPEEDRICHR_BASE_URL}/api/addList`, formData)
    .then((response) => response.data)
}

export const uploadSpeedrichrBackground = (backgroundGenes) => {
  const payload = new URLSearchParams()
  payload.set('background', normalizeGeneInput(backgroundGenes))

  return axios
    .post(`${SPEEDRICHR_BASE_URL}/api/addbackground`, payload)
    .then((response) => response.data)
}

export const fetchSpeedrichrResults = ({ userListId, backgroundid, backgroundType }) => {
  const payload = new URLSearchParams()
  payload.set('userListId', userListId)
  payload.set('backgroundid', backgroundid)
  payload.set('backgroundType', backgroundType)

  return axios
    .post(`${SPEEDRICHR_BASE_URL}/api/backgroundenrich`, payload)
    .then((response) => response.data)
}
