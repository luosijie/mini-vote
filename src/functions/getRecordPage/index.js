/**
 * 获取我的投票记录
 */
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const size = event.size
  const no = event.no
  const OPENID = wxContext.OPENID
  const voteCollection = db.collection('votes')
  const votes = await voteCollection.where({
    creator: OPENID
  })
  .skip((no - 1) * size)
  .limit(size)
  .get()
  const total = await voteCollection.count()
  console.log('votes', votes)
  return {
    total,
    data: votes.data
  }
}
