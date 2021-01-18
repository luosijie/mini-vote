/**
 * 登录注册
 * @param {String} OPENID 从cloud.getWXContext()中获取
 * @return {Object} 用书数据
 */
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  // 查找集合中的用户数据
  const userCollection = db.collection('users')
  const users = await userCollection.where({ OPENID: wxContext.OPENID }).get()
  let user
  if (users && users.data.length) {
    // 用户已经存在-直接赋值用户数据
    user = users.data[0]
  } else {
    // 新用户-向数据库插入用户数据
    user = {
      OPENID: wxContext.OPENID,
      ...event.userInfo
    }
    await userCollection.add({
      data: user
    })
  }
  // 返回用户数据-前端用来缓存
  return {
    ...user
  }
}
