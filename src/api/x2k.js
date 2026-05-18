import axios from 'axios'

const DEFAULT_ENDPOINT = '/api/web/tcmseek/tools/x2k'
const X2K_ENDPOINT = (import.meta.env.VITE_X2K_PROXY_URL || '').trim() || DEFAULT_ENDPOINT

export const X2K_DEFAULT_OPTIONS = {
  included_organisms: 'both',
  'TF-target gene background database used for enrichment': 'ChEA & ENCODE Consensus',
  'sort transcription factors by': 'p-value',
  min_network_size: 50,
  number_of_top_TFs: 10,
  path_length: 2,
  min_number_of_articles_supporting_interaction: 0,
  max_number_of_interactions_per_protein: 200,
  max_number_of_interactions_per_article: 100,
  enable_BioGRID: true,
  enable_IntAct: true,
  enable_MINT: true,
  enable_ppid: true,
  enable_Stelzl: true,
  'kinase interactions to include': 'kea 2018',
  'sort kinases by': 'p-value'
}

const normalizeValue = (value) => {
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false'
  }
  return value
}

const parseSection = (chunk, key) => {
  if (!chunk) return null
  if (typeof chunk === 'string') {
    try {
      chunk = JSON.parse(chunk)
    } catch (error) {
      console.warn(`Failed to parse ${key} chunk`, error)
      return null
    }
  }
  return chunk
}

export const runX2K = async (geneList = [], options = {}) => {
  if (!Array.isArray(geneList) || geneList.length === 0) {
    throw new Error('Gene list is required for X2K analysis')
  }

  const payload = {
    ...X2K_DEFAULT_OPTIONS,
    ...options,
    'text-genes': geneList.join('\n')
  }

  const formData = new FormData()
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    formData.append(key, normalizeValue(value))
  })

  const response = await axios.post(X2K_ENDPOINT, formData)
  const data = response.data || {}

  console.log('X2K API Response:', data)

  const parsedChea = parseSection(data.ChEA, 'ChEA')
  const parsedG2N = parseSection(data.G2N, 'G2N')
  const parsedKEA = parseSection(data.KEA, 'KEA')
  const parsedX2K = parseSection(data.X2K, 'X2K')

  console.log('Parsed ChEA:', parsedChea)
  console.log('Parsed G2N:', parsedG2N)
  console.log('Parsed KEA:', parsedKEA)
  console.log('Parsed X2K:', parsedX2K)

  // Handle different data structures
  // ChEA: could be direct array or {tfs: [...]}
  const cheaResult = Array.isArray(parsedChea) 
    ? parsedChea 
    : (parsedChea?.tfs || parsedChea || [])

  // KEA: could be direct array or {kinases: [...]}
  const keaResult = Array.isArray(parsedKEA)
    ? parsedKEA
    : (parsedKEA?.kinases || parsedKEA || [])

  // G2N: could be {type: "G2N", network: {nodes, interactions}} or {network: {nodes, interactions}} or {nodes, interactions}
  const g2nResult = parsedG2N?.network || (parsedG2N && !parsedG2N.type ? parsedG2N : null) || { nodes: [], interactions: [] }

  // X2K: could be {type: "X2K", network: {nodes, interactions}} or {network: {nodes, interactions}} or {nodes, interactions}
  const x2kResult = parsedX2K?.network || (parsedX2K && !parsedX2K.type ? parsedX2K : null) || { nodes: [], interactions: [] }

  return {
    ChEA: cheaResult,
    G2N: g2nResult,
    KEA: keaResult,
    X2K: x2kResult,
    raw: data
  }
}
