/**
 * Medicine API Module
 * 中药材、方剂、症状相关的API接口
 */

import request from '@/utils/request'

// ==================== 中药材相关接口 ====================

/**
 * 获取中药材列表（核心中药）
 * Get Core TCM Herbs List
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码，默认1
 * @param {number} params.pageSize - 每页条数，默认10
 * @param {string} params.keyword - 搜索关键词（中药名称、拼音、拉丁名）
 * @param {string} params.type - 药材类型筛选
 * @param {string} params.efficacyCategory - 功效分类筛选
 * @returns {Promise} 返回中药材列表
 */
export const getHerbsList = (params = {}) => {
  return request.get('/tcmseek/herbs/list', { params })
}

/**
 * 获取其他中药列表
 * Get Other TCM Herbs List
 * @param {Object} params - 查询参数
 * @returns {Promise} 返回其他中药列表
 */
export const getOtherHerbsList = (params = {}) => {
  return request.get('/tcmseek/herbs/other/list', { params })
}

/**
 * 获取中药材详情
 * Get TCM Herb Detail
 * @param {string} herbId - 中药ID (HERB_1, HERB_10...)
 * @returns {Promise} 返回中药材详细信息
 */
export const getHerbDetail = (herbId) => {
  return request.get(`/tcmseek/herbs/${herbId}`)
}

/**
 * 搜索中药材（支持全文搜索）
 * Search TCM Herbs
 * @param {Object} data - 搜索参数
 * @param {string} data.keyword - 搜索关键词
 * @param {number} data.page - 页码
 * @param {number} data.pageSize - 每页条数
 * @returns {Promise} 返回搜索结果
 */
export const searchHerbs = (data) => {
  return request.post('/tcmseek/herbs/search', data)
}

/**
 * 获取中药材的化合物列表
 * Get Compounds of a Herb
 * @param {string} herbId - 中药ID
 * @param {Object} params - 查询参数
 * @returns {Promise} 返回化合物列表
 */
export const getHerbCompounds = (herbId, params = {}) => {
  return request.get(`/tcmseek/herbs/${herbId}/compounds`, { params })
}

/**
 * 获取中药的化合物关联
 * Get Compounds Related to a Herb
 * @param {string} herbId - 中药ID
 * @returns {Promise} 返回相关化合物列表
 */
export const getHerbRelatedCompounds = (herbId) => {
  return request.get(`/tcmseek/herbs/${herbId}/allcompounds`)
}

/**
 * 获取中药材的疾病关联
 * Get Diseases Related to a Herb
 * @param {string} herbId - 中药ID
 * @param {Object} params - 查询参数
 * @returns {Promise} 返回相关疾病列表
 */
export const getHerbDiseases = (herbId, params = {}) => {
  return request.get(`/tcmseek/herbs/${herbId}/diseases`, { params })
}

/**
 * 获取中药材的症状关联
 * Get Symptoms Related to a Herb
 * @param {string} herbId - 中药ID
 * @param {Object} params - 查询参数
 * @returns {Promise} 返回相关症状列表
 */
export const getHerbSymptoms = (herbId, params = {}) => {
  return request.get(`/tcmseek/herbs/${herbId}/symptoms`, { params })
}

/**
 * 获取中药材的证候关联
 * Get Syndromes Related to a Herb
 * @param {string} herbId - 中药ID
 * @param {Object} params - 查询参数
 * @returns {Promise} 返回相关证候列表
 */
export const getHerbSyndromes = (herbId, params = {}) => {
  return request.get(`/tcmseek/herbs/${herbId}/syndromes`, { params })
}

/**
 * 获取中药材的方剂关联
 * Get Formulas Related to a Herb
 * @param {string} herbId - 中药ID
 * @param {Object} params - 查询参数
 * @returns {Promise} 返回相关方剂列表
 */
export const getHerbFormulas = (herbId, params = {}) => {
  return request.get(`/tcmseek/herbs/${herbId}/formulas`, { params })
}

/**
 * 获取中药材的中医医案关联
 * Get Medical Cases Related to a Herb
 * @param {string} herbId - 中药ID
 * @param {Object} params - 查询参数
 * @returns {Promise} 返回相关中医医案列表
 */
export const getHerbMedicalCases = (herbId, params = {}) => {
  return request.get(`/tcmseek/herbs/${herbId}/medicalCases`, { params })
}

/**
 * 获取中药转录组学数据
 * Get Herb Transcriptomics Data
 * @param {string} herbId - 中药ID
 * @returns {Promise} 返回转录组学数据列表
 */
export const getHerbTranscriptomics = (herbId) => {
  return request.get(`/tcmseek/herbs/${herbId}/transcriptomics`)
}

/**
 * 获取中药转录组学统计信息
 * Get Herb Transcriptomics Statistics
 * @param {string} herbId - 中药ID
 * @returns {Promise} 返回转录组学统计信息
 */
export const getHerbTranscriptomicsStatistics = (herbId) => {
  return request.get(`/tcmseek/herbs/${herbId}/transcriptomics/statistics`)
}

// ==================== 方剂相关接口 ====================

/**
 * 获取方剂列表
 * Get TCM Prescriptions List
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码，默认1
 * @param {number} params.pageSize - 每页条数，默认10
 * @param {string} params.keyword - 搜索关键词（方剂名称、拼音）
 * @param {string} params.source - 来源典籍筛选
 * @returns {Promise} 返回方剂列表
 */
export const getPrescriptionsList = (params = {}) => {
  return request.get('/tcmseek/prescriptions/list', { params })
}

/**
 * 获取方剂详情
 * Get Prescription Detail
 * @param {string} prescriptionId - 方剂ID (TCMSSD59734, BATID1033...)
 * @returns {Promise} 返回方剂详细信息
 */
export const getPrescriptionDetail = (prescriptionId) => {
  return request.get(`/tcmseek/prescriptions/${prescriptionId}`)
}

/**
 * 搜索方剂
 * Search TCM Prescriptions
 * @param {Object} data - 搜索参数
 * @param {string} data.keyword - 搜索关键词
 * @param {number} data.page - 页码
 * @param {number} data.pageSize - 每页条数
 * @returns {Promise} 返回搜索结果
 */
export const searchPrescriptions = (data) => {
  return request.post('/tcmseek/prescriptions/search', data)
}

/**
 * 获取方剂的核心中药组成
 * Get Core Herbs in a Prescription
 * @param {string} prescriptionId - 方剂ID
 * @param {Object} params - 查询参数（如page, pageSize）
 * @returns {Promise} 返回核心中药组成列表
 */
export const getPrescriptionCoreHerbs = (prescriptionId, params = {}) => {
  return request.get(`/tcmseek/prescriptions/${prescriptionId}/core-herbs`, { params })
}

/**
 * 获取方剂的其他中药组成
 * Get Other Herbs in a Prescription
 * @param {string} prescriptionId - 方剂ID
 * @param {Object} params - 查询参数（如page, pageSize）
 * @returns {Promise} 返回其他中药组成列表
 */
export const getPrescriptionOtherHerbs = (prescriptionId, params = {}) => {
  return request.get(`/tcmseek/prescriptions/${prescriptionId}/other-herbs`, { params })
}

/**
 * 获取方剂的中药组成（兼容旧接口，等同于核心中药）
 * Get Herbs Composition of a Prescription (Deprecated)
 * @param {string} prescriptionId - 方剂ID
 * @param {Object} params - 查询参数（如page, pageSize）
 * @returns {Promise} 返回中药组成列表
 * @deprecated 使用 getPrescriptionCoreHerbs 代替
 */
export const getPrescriptionHerbs = (prescriptionId, params = {}) => {
  return request.get(`/tcmseek/prescriptions/${prescriptionId}/herbs`, { params })
}

/**
 * 获取方剂的疾病关联
 * Get Diseases Related to a Prescription
 * @param {string} prescriptionId - 方剂ID
 * @param {Object} params - 查询参数（如page, pageSize）
 * @returns {Promise} 返回相关疾病列表
 */
export const getPrescriptionDiseases = (prescriptionId, params = {}) => {
  return request.get(`/tcmseek/prescriptions/${prescriptionId}/diseases`, { params })
}

/**
 * 获取方剂的症状关联
 * Get Symptoms Related to a Prescription
 * @param {string} prescriptionId - 方剂ID
 * @param {Object} params - 查询参数（如page, pageSize）
 * @returns {Promise} 返回相关症状列表
 */
export const getPrescriptionSymptoms = (prescriptionId, params = {}) => {
  return request.get(`/tcmseek/prescriptions/${prescriptionId}/symptoms`, { params })
}

/**
 * 获取方剂的证候关联
 * Get Syndromes Related to a Prescription
 * @param {string} prescriptionId - 方剂ID
 * @param {Object} params - 查询参数（如page, pageSize）
 * @returns {Promise} 返回相关证候列表
 */
export const getPrescriptionSyndromes = (prescriptionId, params = {}) => {
  return request.get(`/tcmseek/prescriptions/${prescriptionId}/syndromes`, { params })
}

/**
 * 获取方剂的医案关联
 * Get Medical Cases Related to a Prescription
 * @param {string} prescriptionId - 方剂ID
 * @param {Object} params - 查询参数（如page, pageSize）
 * @returns {Promise} 返回相关医案列表
 */
export const getPrescriptionMedicalCases = (prescriptionId, params = {}) => {
  return request.get(`/tcmseek/prescriptions/${prescriptionId}/medical-cases`, { params })
}

/**
 * 获取方剂的转录组学数据
 * @param {string} prescriptionId - 方剂ID
 * @returns {Promise}
 */
export const getPrescriptionTranscriptomics = (prescriptionId) => {
  return request.get(`/tcmseek/prescriptions/${prescriptionId}/transcriptomics`)
}

/**
 * 获取方剂转录组学统计信息
 * @param {string} prescriptionId - 方剂ID
 * @returns {Promise}
 */
export const getPrescriptionTranscriptomicsStatistics = (prescriptionId) => {
  return request.get(`/tcmseek/prescriptions/${prescriptionId}/transcriptomics/statistics`)
}

/**
 * 获取方剂组成中药的转录组学数据（用于对比分析）
 * @param {string} prescriptionId - 方剂ID
 * @returns {Promise}
 */
export const getPrescriptionHerbsTranscriptomics = (prescriptionId) => {
  return request.get(`/tcmseek/prescriptions/${prescriptionId}/herbs-transcriptomics`)
}

// ==================== 症状相关接口 ====================

/**
 * 获取中医症状列表
 * Get TCM Symptoms List
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码，默认1
 * @param {number} params.pageSize - 每页条数，默认10
 * @param {string} params.keyword - 搜索关键词
 * @param {string} params.locus - 症状部位筛选
 * @param {string} params.type - 症状类型筛选
 * @returns {Promise} 返回症状列表
 */
export const getSymptomsList = (params = {}) => {
  return request.get('/tcmseek/symptoms/list', { params })
}

/**
 * 获取症状详情
 * Get Symptom Detail
 * @param {string} symptomId - 症状ID (TCM_Symptom1...)
 * @returns {Promise} 返回症状详细信息
 */
export const getSymptomDetail = (symptomId) => {
  return request.get(`/tcmseek/symptoms/${symptomId}`)
}

/**
 * 搜索症状
 * Search Symptoms
 * @param {Object} data - 搜索参数
 * @param {string} data.keyword - 搜索关键词
 * @param {number} data.page - 页码
 * @param {number} data.pageSize - 每页条数
 * @returns {Promise} 返回搜索结果
 */
export const searchSymptoms = (data) => {
  return request.post('/tcmseek/symptoms/search', data)
}

/**
 * 获取症状的相关中药
 * Get Herbs for a Symptom
 * @param {string} symptomId - 症状ID
 * @param {Object} params - 查询参数（如page, pageSize）
 * @returns {Promise} 返回相关中药列表
 */
export const getSymptomHerbs = (symptomId, params = {}) => {
  return request.get(`/tcmseek/symptoms/${symptomId}/herbs`, { params })
}

/**
 * 获取症状的相关方剂
 * Get Prescriptions for a Symptom
 * @param {string} symptomId - 症状ID
 * @param {Object} params - 查询参数（如page, pageSize）
 * @returns {Promise} 返回相关方剂列表
 */
export const getSymptomPrescriptions = (symptomId, params = {}) => {
  return request.get(`/tcmseek/symptoms/${symptomId}/prescriptions`, { params })
}

/**
 * 获取症状的关联证候
 * Get Related Syndromes of a Symptom
 * @param {string} symptomId - 症状ID
 * @param {Object} params - 查询参数（如page, pageSize）
 * @returns {Promise} 返回证候列表
 */
export const getSymptomSyndromes = (symptomId, params = {}) => {
  return request.get(`/tcmseek/symptoms/${symptomId}/syndromes`, { params })
}

/**
 * 获取中医症状的关联西医症状
 * Get Western Medicine Symptoms by TCM Symptom
 * @param {string} symptomId - 中医症状ID
 * @param {Object} params - 查询参数（分页等）
 * @returns {Promise} 返回关联的西医症状列表
 */
export const getSymptomWmSymptoms = (symptomId, params = {}) => {
  return request.get(`/tcmseek/symptoms/${symptomId}/wm-symptoms`, { params })
}

// ==================== 证候相关接口 ====================

/**
 * 获取中医证候列表
 * Get TCM Syndromes List
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页条数
 * @param {string} params.keyword - 搜索关键词
 * @param {string} params.category - 证候分类筛选
 * @returns {Promise} 返回证候列表
 */
export const getSyndromesList = (params = {}) => {
  return request.get('/tcmseek/syndromes/list', { params })
}

/**
 * 获取证候详情
 * Get Syndrome Detail
 * @param {string} syndromeId - 证候ID
 * @returns {Promise} 返回证候详细信息
 */
export const getSyndromeDetail = (syndromeId) => {
  return request.get(`/tcmseek/syndromes/${syndromeId}`)
}

/**
 * 获取证候的相关症状
 * Get Symptoms of a Syndrome
 * @param {string} syndromeId - 证候ID
 * @param {Object} params - 查询参数（如page, pageSize）
 * @returns {Promise} 返回相关症状列表
 */
export const getSyndromeSymptoms = (syndromeId, params = {}) => {
  return request.get(`/tcmseek/syndromes/${syndromeId}/symptoms`, { params })
}

/**
 * 获取证候的相关中药
 * Get Herbs for a Syndrome
 * @param {string} syndromeId - 证候ID
 * @param {Object} params - 查询参数（如page, pageSize）
 * @returns {Promise} 返回相关中药列表
 */
export const getSyndromeHerbs = (syndromeId, params = {}) => {
  return request.get(`/tcmseek/syndromes/${syndromeId}/herbs`, { params })
}

/**
 * 获取证候的关联方剂
 * Get Related Prescriptions of a Syndrome
 * @param {string} syndromeId - 证候ID
 * @param {Object} params - 查询参数（如page, pageSize）
 * @returns {Promise} 返回方剂列表
 */
export const getSyndromePrescriptions = (syndromeId, params = {}) => {
  return request.get(`/tcmseek/syndromes/${syndromeId}/prescriptions`, { params })
}

// ==================== 知识图谱接口 ====================

/**
 * 构建知识图谱
 * Build Knowledge Graph
 * @param {Object} params - 参数对象
 * @param {string} params.centerType - 中心节点类型: herb/prescription/compound/gene
 * @param {string} params.centerId - 中心节点ID
 * @param {string} params.relations - 关系类型（逗号分隔），如：compound,disease,syndrome
 * @returns {Promise} 返回图谱数据
 */
export const buildKnowledgeGraph = (params) => {
  return request.get('/tcmseek/knowledge-graph/build', { params })
}

/**
 * 搜索中心节点
 * Search Center Nodes
 * @param {Object} params - 参数对象
 * @param {string} params.centerType - 节点类型
 * @param {string} params.keyword - 搜索关键词
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @returns {Promise} 返回搜索结果
 */
export const searchCenterNodes = (params) => {
  return request.get('/tcmseek/knowledge-graph/search-center', { params })
}

// ==================== 化合物相关接口 ====================

/**
 * 获取化合物列表
 * Get Compounds List
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码，默认1
 * @param {number} params.pageSize - 每页条数，默认10
 * @param {string} params.keyword - 搜索关键词（InChIKey或分子式）
 * @returns {Promise} 返回化合物列表
 */
export const getCompoundsList = (params = {}) => {
  return request.get('/tcmseek/compounds/list', { params })
}

/**
 * 获取化合物详情
 * Get Compound Detail
 * @param {string} inchikey - 化合物InChIKey
 * @returns {Promise} 返回化合物详细信息
 */
export const getCompoundDetail = (inchikey) => {
  return request.get(`/tcmseek/compounds/${inchikey}`)
}

/**
 * 获取化合物的靶标列表
 * Get Targets of a Compound
 * @param {string} inchikey - 化合物InChIKey
 * @returns {Promise} 返回靶标列表
 */
export const getCompoundTargets = (inchikey, params = {}) => {
  return request.get(`/tcmseek/compounds/${inchikey}/targets`, { params })
}

/**
 * 获取化合物的所有标靶信息
 * Get All Targets of a Compound
 * @param {string} inchikey - 化合物InChIKey
 * @returns {Promise} 返回所有标靶信息
 */
export const getCompoundAllTargets = (inchikey) => {
  return request.get(`/tcmseek/compounds/${inchikey}/alltargets`)
}

/**
 * 批量获取多个化合物的靶标信息
 * Batch Get Targets for Multiple Compounds
 * @param {Array<string>} inchikeys - 化合物InChIKey数组
 * @returns {Promise} 返回所有化合物的靶标信息
 */
export const batchGetCompoundTargets = (inchikeys) => {
  return request.post('/tcmseek/compounds/batch/targets', { inchikeys })
}

/**
 * 获取化合物的ADMET性质
 * Get ADMET Properties of a Compound
 * @param {string} inchikey - 化合物InChIKey
 * @returns {Promise} 返回ADMET性质
 */
export const getCompoundADMET = (inchikey) => {
  return request.get(`/tcmseek/compounds/${inchikey}/admet`)
}

/**
 * 获取化合物的关联中药材
 * Get Herbs Related to a Compound
 * @param {string} inchikey - 化合物InChIKey
 * @param {Object} params - 查询参数
 * @returns {Promise} 返回中药材列表
 */
export const getCompoundHerbs = (inchikey, params = {}) => {
  return request.get(`/tcmseek/compounds/${inchikey}/herbs`, { params })
}

/**
 * 获取化合物的转录组学数据
 * Get Compound Transcriptomics Data
 * @param {string} inchikey - 化合物InChIKey
 * @returns {Promise} 返回转录组学数据（log2FC, p-value等）
 */
export const getCompoundTranscriptomics = (inchikey) => {
  return request.get(`/tcmseek/compounds/${inchikey}/transcriptomics`)
}

/**
 * 获取化合物的转录组学统计信息
 * Get Compound Transcriptomics Statistics
 * @param {string} inchikey - 化合物InChIKey
 * @returns {Promise} 返回统计信息（上调、下调基因数量等）
 */
export const getCompoundTranscriptomicsStatistics = (inchikey) => {
  return request.get(`/tcmseek/compounds/${inchikey}/transcriptomics/statistics`)
}

// ==================== 基因/靶标相关接口 ====================

/**
 * 获取基因列表
 * Get Genes List
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码，默认1
 * @param {number} params.pageSize - 每页条数，默认10
 * @param {string} params.keyword - 搜索关键词（基因符号或描述）
 * @returns {Promise} 返回基因列表
 */
export const getGenesList = (params = {}) => {
  return request.get('/tcmseek/genes/list', { params })
}

/**
 * 获取基因详情
 * Get Gene Detail
 * @param {string} geneId - 基因ID (tcm_tar_id)
 * @returns {Promise} 返回基因详细信息
 */
export const getGeneDetail = (geneId) => {
  return request.get(`/tcmseek/genes/${geneId}`)
}

/**
 * 根据Entrez ID获取基因详情
 * Get Gene Detail by Entrez ID
 * @param {number} entrezId - 基因Entrez ID
 * @returns {Promise} 返回基因详细信息
 */
export const getGeneDetailByEntrezId = (entrezId) => {
  return request.get(`/tcmseek/genes/entrez/${entrezId}`)
}

/**
 * 获取基因的关联化合物
 * Get Compounds Related to a Gene
 * @param {string} geneId - 基因ID
 * @param {Object} params - 查询参数（如page, pageSize）
 * @returns {Promise} 返回化合物列表
 */
export const getGeneCompounds = (geneId, params = {}) => {
  return request.get(`/tcmseek/genes/${geneId}/compounds`, { params })
}

/**
 * 获取基因的关联疾病
 * Get Diseases Related to a Gene
 * @param {string} geneId - 基因ID
 * @param {Object} params - 查询参数（如page, pageSize）
 * @returns {Promise} 返回疾病列表
 */
export const getGeneDiseases = (geneId, params = {}) => {
  return request.get(`/tcmseek/genes/${geneId}/diseases`, { params })
}

/**
 * 获取基因的关联证候
 * Get Syndromes Related to a Gene
 * @param {string} geneId - 基因ID
 * @param {Object} params - 查询参数（如page, pageSize）
 * @returns {Promise} 返回证候列表
 */
export const getGeneSyndromes = (geneId, params = {}) => {
  return request.get(`/tcmseek/genes/${geneId}/syndromes`, { params })
}

/**
 * 获取基因的关联通路
 * Get Pathways Related to a Gene
 * @param {string} geneId - 基因ID
 * @param {Object} params - 查询参数（如page, pageSize）
 * @returns {Promise} 返回通路列表
 */
export const getGenePathways = (geneId, params = {}) => {
  return request.get(`/tcmseek/genes/${geneId}/pathways`, { params })
}

/**
 * 获取基因的关联表型
 * Get Phenotypes Related to a Gene
 * @param {string} geneId - 基因ID
 * @param {Object} params - 查询参数（如page, pageSize）
 * @returns {Promise} 返回表型列表
 */
export const getGenePhenotypes = (geneId, params = {}) => {
  return request.get(`/tcmseek/genes/${geneId}/phenotypes`, { params })
}

/**
 * 获取基因的关联西医症状
 * Get Western Medicine Symptoms Related to a Gene
 * @param {string} geneId - 基因ID
 * @param {Object} params - 查询参数（如page, pageSize）
 * @returns {Promise} 返回西医症状列表
 */
export const getGeneWmSymptoms = (geneId, params = {}) => {
  return request.get(`/tcmseek/genes/${geneId}/wm-symptoms`, { params })
}

// ==================== 中医医案相关接口 ====================
/**
 * 获取中医案列表
 * Get Medical Cases List
 * @param {Object} params - 搜索参数
 * @param {number} params.page - 页码，默认1
 * @param {number} params.pageSize - 每页条数，默认10
 * @param {string} params.keyword - 搜索关键词（案名或描述）
 * @returns {Promise} 返回中医案列表
 */
export const getMedicalCasesList = (params = {}) => {
  return request.get('/tcmseek/medical-cases/list', { params })
}

/**
 * 获取医案详情
 * Get Medical Case Detail
 * @param {string} caseId - 医案ID
 * @returns {Promise} 返回医案详细信息
 */
export const getMedicalCaseDetail = (caseId) => {
  return request.get(`/tcmseek/medical-cases/${caseId}`)
}

/**
 * 获取医案的关联方剂
 * Get Related Prescriptions of a Medical Case
 * @param {string} caseId - 医案ID
 * @param {Object} params - 查询参数（如page, pageSize）
 * @returns {Promise} 返回方剂列表
 */
export const getMedicalCasePrescriptions = (caseId, params = {}) => {
  return request.get(`/tcmseek/medical-cases/${caseId}/prescriptions`, { params })
}

/**
 * 获取医案的关联中药
 * Get Related Herbs of a Medical Case
 * @param {string} caseId - 医案ID
 * @param {Object} params - 查询参数（如page, pageSize）
 * @returns {Promise} 返回中药列表
 */
export const getMedicalCaseHerbs = (caseId, params = {}) => {
  return request.get(`/tcmseek/medical-cases/${caseId}/herbs`, { params })
}

// ==================== 统计相关接口 ====================

/**
 * 获取数据库统计信息
 * Get Database Statistics
 * @returns {Promise} 返回统计信息
 */
export const getDatabaseStats = () => {
  return request.get('/tcmseek/statistics')
}

/**
 * 获取中药分类统计
 * Get Herb Category Statistics
 * @returns {Promise} 返回分类统计
 */
export const getHerbCategories = () => {
  return request.get('/tcmseek/herbs/categories')
}

/**
 * 获取方剂来源统计
 * Get Prescription Source Statistics
 * @returns {Promise} 返回来源统计
 */
export const getPrescriptionSources = () => {
  return request.get('/tcmseek/prescriptions/sources')
}

// ==================== 西医症状相关接口 ====================

/**
 * 获取西医症状列表
 * Get Western Medicine Symptoms List
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码，默认1
 * @param {number} params.pageSize - 每页条数，默认10
 * @param {string} params.keyword - 搜索关键词
 * @returns {Promise} 返回西医症状列表
 */
export const getWmSymptomsList = (params = {}) => {
  return request.get('/tcmseek/wm-symptoms/list', { params })
}

/**
 * 获取西医症状详情
 * Get Western Medicine Symptom Detail
 * @param {string} wmSymptomId - 西医症状ID (如 WM_Symptom_ID01)
 * @returns {Promise} 返回西医症状详细信息
 */
export const getWmSymptomDetail = (wmSymptomId) => {
  return request.get(`/tcmseek/wm-symptoms/${wmSymptomId}`)
}

/**
 * 获取西医症状对应的中医症状
 * Get TCM Symptoms by Western Medicine Symptom
 * @param {string} wmSymptomId - 西医症状ID
 * @param {Object} params - 查询参数（分页等）
 * @returns {Promise} 返回关联的中医症状列表
 */
export const getWmSymptomTcmSymptoms = (wmSymptomId, params = {}) => {
  return request.get(`/tcmseek/wm-symptoms/${wmSymptomId}/tcm-symptoms`, { params })
}

/**
 * 获取西医症状关联的基因
 * Get Genes by Western Medicine Symptom
 * @param {string} wmSymptomId - 西医症状ID
 * @param {Object} params - 查询参数（分页等）
 * @returns {Promise} 返回关联的基因列表
 */
export const getWmSymptomGenes = (wmSymptomId, params = {}) => {
  return request.get(`/tcmseek/wm-symptoms/${wmSymptomId}/genes`, { params })
}

// ==================== 疾病相关接口 ====================

/**
 * 获取疾病详情
 * Get Disease Detail
 * @param {string} diseaseId - 疾病ID (如 DOID:11832)
 * @returns {Promise} 返回疾病详细信息
 */
export const getDiseaseDetail = (diseaseId) => {
  return request.get(`/tcmseek/diseases/${diseaseId}`)
}

/**
 * 获取疾病关联的基因
 * Get Genes Related to a Disease
 * @param {string} diseaseId - 疾病ID
 * @param {Object} params - 查询参数（分页等）
 * @returns {Promise} 返回关联的基因列表
 */
export const getDiseaseGenes = (diseaseId, params = {}) => {
  return request.get(`/tcmseek/diseases/${diseaseId}/genes`, { params })
}

/**
 * 获取疾病关联的方剂
 * Get Prescriptions Related to a Disease
 * @param {string} diseaseId - 疾病ID
 * @param {Object} params - 查询参数（分页等）
 * @returns {Promise} 返回关联的方剂列表
 */
export const getDiseasePrescriptions = (diseaseId, params = {}) => {
  return request.get(`/tcmseek/diseases/${diseaseId}/prescriptions`, { params })
}

/**
 * 获取疾病关联的中药
 * Get Herbs Related to a Disease
 * @param {string} diseaseId - 疾病ID
 * @param {Object} params - 查询参数（分页等）
 * @returns {Promise} 返回关联的中药列表
 */
export const getDiseaseHerbs = (diseaseId, params = {}) => {
  return request.get(`/tcmseek/diseases/${diseaseId}/herbs`, { params })
}

// ==================== 表型相关接口 ====================

/**
 * 获取表型列表
 * Get Phenotypes List
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码，默认1
 * @param {number} params.pageSize - 每页条数，默认10
 * @param {string} params.keyword - 搜索关键词（表型名称或HPO ID）
 * @returns {Promise} 返回表型列表
 */
export const getPhenotypesList = (params = {}) => {
  return request.get('/tcmseek/phenotypes/list', { params })
}

/**
 * 获取表型详情
 * Get Phenotype Detail
 * @param {string} phenotypeId - 表型ID (如 HP:0000006)
 * @returns {Promise} 返回表型详细信息
 */
export const getPhenotypeDetail = (phenotypeId) => {
  return request.get(`/tcmseek/phenotypes/${phenotypeId}`)
}

/**
 * 获取表型关联的靶标/基因
 * Get Targets Related to a Phenotype
 * @param {string} phenotypeId - 表型ID
 * @param {Object} params - 查询参数（分页等）
 * @returns {Promise} 返回关联的靶标/基因列表
 */
export const getPhenotypeTargets = (phenotypeId, params = {}) => {
  return request.get(`/tcmseek/phenotypes/${phenotypeId}/targets`, { params })
}

/**
 * 获取表型的统计信息
 * Get Phenotype Statistics
 * @param {string} phenotypeId - 表型ID
 * @returns {Promise} 返回统计信息
 */
export const getPhenotypeStatistics = (phenotypeId) => {
  return request.get(`/tcmseek/phenotypes/${phenotypeId}/statistics`)
}

/**
 * 获取表型的知识图谱数据
 * Get Phenotype Graph Data
 * @param {string} phenotypeId - 表型ID
 * @returns {Promise} 返回图谱数据
 */
export const getPhenotypeGraph = (phenotypeId) => {
  return request.get(`/tcmseek/phenotypes/${phenotypeId}/graph`)
}

// ==================== 通路相关接口 ====================

/**
 * 获取通路列表
 * Get Pathways List
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页条数
 * @param {string} params.keyword - 搜索关键词（通路名称或KEGG ID）
 * @returns {Promise} 返回通路列表
 */
export const getPathwaysList = (params = {}) => {
  return request.get('/tcmseek/pathways/list', { params })
}

/**
 * 获取通路详情
 * Get Pathway Detail
 * @param {string} pathwayId - 通路ID (hsa01100)
 * @returns {Promise} 返回通路详细信息
 */
export const getPathwayDetail = (pathwayId) => {
  return request.get(`/tcmseek/pathways/${pathwayId}`)
}

/**
 * 获取通路的关联靶标/基因
 * Get Targets by Pathway ID
 * @param {string} pathwayId - 通路ID
 * @param {Object} params - 查询参数
 * @returns {Promise} 返回靶标列表
 */
export const getPathwayTargets = (pathwayId, params = {}) => {
  return request.get(`/tcmseek/pathways/${pathwayId}/targets`, { params })
}

/**
 * 获取影响此通路的化合物
 * Get Compounds by Pathway ID
 * @param {string} pathwayId - 通路ID
 * @param {Object} params - 查询参数
 * @returns {Promise} 返回化合物列表
 */
export const getPathwayCompounds = (pathwayId, params = {}) => {
  return request.get(`/tcmseek/pathways/${pathwayId}/compounds`, { params })
}

/**
 * 获取影响此通路的中药
 * Get Herbs by Pathway ID
 * @param {string} pathwayId - 通路ID
 * @param {Object} params - 查询参数
 * @returns {Promise} 返回中药列表
 */
export const getPathwayHerbs = (pathwayId, params = {}) => {
  return request.get(`/tcmseek/pathways/${pathwayId}/herbs`, { params })
}

/**
 * 获取通路的统计信息
 * Get Pathway Statistics
 * @param {string} pathwayId - 通路ID
 * @returns {Promise} 返回统计信息
 */
export const getPathwayStatistics = (pathwayId) => {
  return request.get(`/tcmseek/pathways/${pathwayId}/statistics`)
}

/**
 * 获取通路的知识图谱数据
 * Get Pathway Knowledge Graph
 * @param {string} pathwayId - 通路ID
 * @returns {Promise} 返回图谱数据
 */
export const getPathwayGraph = (pathwayId) => {
  return request.get(`/tcmseek/pathways/${pathwayId}/graph`)
}





