
/**
 * 图片要放在 image 里才可以被 canvas 渲染
 * @param { String } src 本地文件路径
 * @param { Object } canvas canvas实例
 * @return { Promise } promise返回 image 实例
 */
export default function (src, canvasId) {
  const query = this.createSelectorQuery()
  return new Promise((resolve, reject) => {
    // 新建一个图片实例
    // console.log('this', this)
    query
      .select(`#${canvasId}`)
      .fields({ node: true, size: true })
      .exec(async res => {
        // 获取 canvas 实例
        const canvas = res[0].node
        const image = canvas.createImage()
        image.src = src
        try {
          image.onload = e => {
            console.log('imge-loaded', src, e)
            resolve(image)
          }
        } catch (err) {
          reject(err)
        }
      })
  })
}
