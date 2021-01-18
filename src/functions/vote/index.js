/**
 * 投票操作
 * @param {String} voteId 投票_id
 * @param {String} optionId 选项_id
 * @return {Object} 投票结果
 */
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

exports.main = async (event, context) => {
  const _id = event.optionId
  const vote_id = event.voteId
  const OPENID = cloud.getWXContext().OPENID
  // 获取当前投票数据对应的所有选项数据
  const options = db.collection('options')
  let voteOptions = await options.where({ vote_id }).get()
  voteOptions = voteOptions.data
  // 判断用户是否投过票
  let curOptionUsers = []
  for (let i = 0; i < voteOptions.length; i++) {
    // 找到选项中所有投过票的用户
    const users = voteOptions[i].users
    if (users && users.length) {
      if (voteOptions[i]._id === _id) {
        curOptionUsers = users
      }
      if (users && users.length) {
        // OPENID重复-说明已经投过票->直接返回
        if (users.indexOf(OPENID) > -1) {
          return {
            success: false,
            message: '您已经投过票了'
          }
        }
      }
    }
  }
  // 没有投票->将当前用户OPENID插入到对应的字段
  curOptionUsers.push(OPENID)
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
