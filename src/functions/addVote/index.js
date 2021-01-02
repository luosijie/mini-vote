const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const voteCollection = db.collection('votes')
  const data = {
    creator: wxContext.OPENID,
    title: event.title,
    desc: event.desc,
    startTime: event.startTime,
    endTime: event.endTime,
    type: event.type,
    options: event.options,
    state: 'ing'
  }
  console.log('evnet params :', data)
  const res = await voteCollection.add({
    data
  })
  return {
    ...res
  }
}
