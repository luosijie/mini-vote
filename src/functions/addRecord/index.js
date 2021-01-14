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
    anonymous: event.anonymous,
    min: event.min,
    max: event.max,
    type: event.type,
    state: 'ing'
  }
  const res = await voteCollection.add({
    data
  })
  console.log('evnet params :', res)
  const options = event.options
  const optionCollection = db.collection('options')
  const optionPromise = options.map( ele => {
    const option = {
      vote_id: res._id,
      ...ele
    }
    return optionCollection.add({
      data: option
    })
  })
  let resOptions = await Promise.all(optionPromise)
  resOptions = resOptions.map(e =>  e._id)
  console.log('res after add', res, resOptions)
  return {
    success: true,
    message: '新增投票成功',
    ...res
  }
}
