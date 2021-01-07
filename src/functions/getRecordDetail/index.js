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
  // 投票信息
  const voteCollection = db.collection('votes')
  const votes = await voteCollection
  .aggregate()
  .match({ _id })
  .lookup({
    from: 'users',
    localField: 'creator',
    foreignField: 'OPENID',
    as: 'creator'
  })
  .lookup({
    from: 'options',
    localField: '_id',
    foreignField: 'vote_id',
    as: 'options'
  })
  .end()
  // 选项信息
  let vote = {}
  if (votes && votes.list.length) {
    vote = votes.list[0]
    vote.creator = vote.creator[0]
  }
  return {
    ...vote
  }
}
