/**
 * 获取我的投票记录
 */
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

exports.main = async (event, context) => {
  const _id = event._id
  const OPENID = cloud.getWXContext().OPENID
  // 查找投票信息
  const voteCollection = db.collection('votes')
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
  console.log('vote-query', voteQuery, _id)
  if (voteQuery && voteQuery.list.length) {
    vote = voteQuery.list[0]
    vote.creator = vote.creator[0]
    vote.isOwner = vote.creator.OPENID === OPENID

    // 查找选项信息
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
      data: '找不到投票信息'
    }
  }
}
