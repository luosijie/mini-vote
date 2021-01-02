const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const userCollection = db.collection('users')
  const users = await userCollection.where({ OPENID: wxContext.OPENID }).get()
  let user
  if (users && users.data.length) {
    user = users.data[0]
  } else {
    user = {
      OPENID: wxContext.OPENID,
      ...event.userInfo
    }
    await userCollection.add({
      data: user
    })
  }
  return {
    ...user
  }
}
