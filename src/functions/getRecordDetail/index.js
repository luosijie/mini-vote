/**
 * 获取投票详情
 * @param {String} _id 投票_id
 * @return {Object} 投票数据
 */
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

exports.main = async (event, context) => {
  const _id = event._id
  const OPENID = cloud.getWXContext().OPENID
  // 查找集合中的投票数据
  const voteCollection = db.collection('votes')
  // 聚合联表查询
  const voteQuery = await voteCollection
  .aggregate()
  .match({ _id })
  .lookup({
    from: 'users',
    localField: 'creator',
    foreignField: 'OPENID',
    as: 'creator'
  })
  .end()
  let vote = {}
  if (voteQuery && voteQuery.list.length) {
    vote = voteQuery.list[0]
    vote.creator = vote.creator[0]
    // 判断是否当前投票的发起人
    vote.isOwner = vote.creator.OPENID === OPENID

    // 查找集合中的选项数据
    const optionsCollection = db.collection('options')
    const optionsQuary = await optionsCollection
    .aggregate()
    .match({ vote_id: _id })
    .lookup({
      from: 'users',
      localField: 'users',
      foreignField: 'OPENID',
      as: 'users'
    })
    .end()
    vote.options = optionsQuary.list
    // 统计已经投票的人数
    let votedTotal = 0
    vote.options.forEach(e => {
      if (e.users && e.users.length) {
        votedTotal += e.users.length
      }
    })
    vote.votedTotal = votedTotal
    // 计算当前投票的状态
    if (vote.state !== 'end') {
      // 未开始
      if (new Date().getTime() < new Date(vote.startTime).getTime()) {
        vote.state = 'pre'
      }
      // 已过期 = 已结束
      if (new Date().getTime() > new Date(vote.endTime).getTime()) {
        vote.state = 'end'
      }
    }
    return {
      success: true,
      data: vote
    }
  } else {
    return {
      success: false,
      message: '找不到投票信息'
    }
  }
}
