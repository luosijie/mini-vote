const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

exports.main = async (event, context) => {
  const _id = event.optionId
  const vote_id = event.voteId
  const OPENID = cloud.getWXContext().OPENID
  const options = db.collection('options')
  // 获取当前投票的所有选项
  let voteOptions = await options.where({ vote_id }).get()
  voteOptions = voteOptions.data
  // 判断是否投过票
  let curOptionUsers = []
  for (let i = 0; i < voteOptions.length; i++) {
    const users = voteOptions[i].users
    // console.log('_id', voteOptions[i])
    if (users && users.length) {
      if (voteOptions[i]._id === _id) {
        curOptionUsers = users
      }
      if (users && users.length) {
        if (users.indexOf(OPENID) > -1) {
          return {
            success: false,
            message: '您已经投过票了'
          }
        }
      }
    }
  }
  curOptionUsers.push(OPENID)
  // 更新投票信息
  const res = await options.where({ _id }).update({
    data: {
      users: curOptionUsers
    }
  })
  return {
    success: true,
    data: res,
    message: '投票成功'
  }
}
