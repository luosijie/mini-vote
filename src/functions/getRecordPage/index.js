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
  // const votes = await voteCollection.where({
  //   creator: OPENID
  // })
  // .skip((no - 1) * size)
  // .limit(size)
  // .get()
  const votes = await voteCollection.aggregate()
  .match({
    creator: OPENID
  })
  .lookup({
    from: 'options',
    localField: '_id',
    foreignField: 'vote_id',
    as: 'options'
  })
  .skip((no - 1) * size)
  .limit(size)
  .end()
  // 计算总数
  const total = await voteCollection.count()
  console.log('聚合操作', votes)
  let data = votes.list
  if (data.length) {
    data = data.map(e => {
      if (e.state !== 'end') {
        // 未开始
        if (new Date().getTime() < new Date(e.startTime).getTime()) {
          e.state = 'pre'
        }
        // 已过期 = 已结束
        if (new Date().getTime() > new Date(e.endTime).getTime()) {
          e.state = 'end'
        }
      }
      // 统计投票人数
      let votedTotal = 0
      const options = e.options
      options.forEach(o => {
        if (o.users && o.users.length) {
          votedTotal += o.users.length
        }
      })
      delete e.options
      return {
        ...e,
        votedTotal
      }
    })
  }
  return {
    total,
    data
  }
}
