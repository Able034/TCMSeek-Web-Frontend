import request from '@/utils/request'

/**
 * 知识图谱（Neo4j）相关 API
 * Knowledge Graph (Neo4j) related APIs
 */

/**
 * 查询知识图谱
 * Fetch knowledge graph around a center node.
 *
 * @param {Object} params - 查询参数 / query params
 * @param {string} params.centerType - 中心节点类型，如 herb、prescription
 * @param {string} params.centerId - 中心节点 ID
 * @param {string} params.relations - 目标类型或关系类型，多个以逗号分隔
 * @returns {Promise} GraphResult 数据
 */
export const getKnowledgeGraph = (params) => {
  return request.get('/tcmseek/knowledge-graph-neo4j/build', {
    params
  })
}
