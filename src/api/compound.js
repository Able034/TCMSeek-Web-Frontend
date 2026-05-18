/**
 * Compound API Module
 * 化合物相关的API接口
 */

import request from '@/utils/request'

/**
 * 根据分子结构搜索化合物
 * Search compounds by molecular structure
 * @param {Object} params - 搜索参数
 * @param {string} params.type - 搜索类型：'full'(全结构), 'sub'(子结构), 'similarity'(相似性)
 * @param {string} params.molFile - MOL 文件内容
 * @param {number} params.threshold - 相似度阈值 (0.5-1.0)，仅用于相似性搜索
 * @returns {Promise} 返回化合物列表
 */
export const searchByStructure = (params) => {
  return request.post('/tcmseek/compounds/search/structure', params)
}

/**
 * 检查 RDKit 状态
 * @returns {Promise} 返回状态信息
 */
export const checkRdkitStatus = () => {
  return request.get('/tcmseek/compounds/search/rdkit/status')
}

/**
 * 获取化合物详情
 * Get compound details
 * @param {string} inchikey - 化合物 InChIKey
 * @returns {Promise} 返回化合物详情
 */
export const getCompoundDetail = (inchikey) => {
  return request.get(`/tcmseek/compounds/${inchikey}`)
}
