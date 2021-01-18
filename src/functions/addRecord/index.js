/**
 * 新增投票记录
 * @param {String} title 标题
 * @param {String} desc 描述
 * @param {String} startTime 开始日期
 * @param {String} endTime 结束日期
 * @param {String} anonymous 匿名
 * @param {String} min 允许小投票数
 * @param {String} max 允许最大投票数
 * @param {String} type 投票类型：normal; pk
 * @returns {Object} 包含投票_id
 */
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const voteCollection = db.collection('votes')
  const data = {
    creator: wxContext.OPENID, // 发起人
    title: event.title,
    desc: event.desc,
    startTime: event.startTime,
    endTime: event.endTime,
    anonymous: event.anonymous,
    min: event.min,
    max: event.max,
    type: event.type,
    state: 'ing'
  }
  // 集合投票votes：新增记录
  const res = await voteCollection.add({
    data
  })
  // 集合选项options: 新增记录
  const options = event.options
  const optionCollection = db.collection('options')
  const optionPromise = options.map( ele => {
    const option = {
      vote_id: res._id,
      ...ele
    }
    return optionCollection.add({
      data: option
    })
  })
  let resOptions = await Promise.all(optionPromise)
  resOptions = resOptions.map(e =>  e._id)
  // 返回投票结果
  return {
    success: true,
    message: '新增投票成功',
    ...res
  }
}
