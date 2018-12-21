<template>
  <canvas
    :id="canvasId"
    class="canvas"
    :width="width"
    :height="height"
    :style="{'width':`${width}px`,'height':`${height}px`}"
    @mousedown="canvasDown($event)"
    @mouseup="canvasUp($event)"
    @mousemove="canvasMove($event)"
    @touchstart="canvasDown($event)"
    @touchend="canvasUp($event)"
    @touchmove="canvasMove($event)"
  >
  </canvas>
</template>
<script>
export default {
  props: [
    'canvasId', 'imgSrc', 'width', 'height', 'canDraw', 'points', 'time'
  ],
  // watch: {
  //   info (val) {
  //     if (val) {
  //       this.initDraw()
  //     }
  //   }
  // },
  data () {
    return {
      url: '',

      info: [],
      // width: 1350,
      // height: 650,
      lineColor: '#FF0000',
      lineWidth: '2',
      lineType: 'rec',
      // 同一页面多次渲染时，用于区分元素的id
      // radom: uuid.v4(),
      // canvas对象
      context: { strokeStyle: '' },
      // 是否处于绘制状态
      canvasMoveUse: false,
      // 绘制矩形和椭圆时用来保存起始点信息
      beginRec: {
        x: '',
        y: '',
        imageData: ''
      },
      // 储存坐标信息
      drawInfo: [],
      // 背景图片缓存
      img: ''
    }
  },

  methods: {
    // 初始化绘制信息
    initDraw () {
      this.img = new Image()
      // 初始化画布
      const canvas = document.getElementById(this.canvasId)
      this.context = canvas.getContext('2d')
      canvas.height = this.height
      this.img.setAttribute('crossOrigin', 'Anonymous')
      this.img.width = this.width
      this.img.height = this.height
      this.img.onerror = () => {
        var timeStamp = +new Date()
        this.img.src = this.imgSrc + '?' + timeStamp
      }
      this.img.onload = () => {
        this.clean()
      }
      this.img.src = this.imgSrc
    },
    // 鼠标按下
    canvasDown (e) {
      if (this.canDraw && e.button === 0) {
        this.canvasMoveUse = true
        // client是基于整个页面的坐标，offset是cavas距离pictureDetail顶部以及左边的距离
        const canvasX = e.layerX
        const canvasY = e.layerY
        // 记录起始点和起始状态
        this.beginRec.x = canvasX
        this.beginRec.y = canvasY
        this.beginRec.imageData = this.context.getImageData(0, 0, this.width, this.height)
        // this.beginRec.imageData = this.context.getImageData(0, 0)
        // 存储本次绘制坐标信息
        this.drawInfo.push({
          x: canvasX / this.width,
          y: canvasY / this.height,
          type: this.lineType
        })
      }
    },
    Area (p0, p1, p2) {
      let area = 0.0
      area = p0.x * p1.y + p1.x * p2.y + p2.x * p0.y - p1.x * p0.y - p2.x * p1.y - p0.x * p2.y
      return area / 2
    },

    // 根据坐标信息绘制图形
    drawWithInfo () {
      this.info.forEach(item => {
        this.context.beginPath()
        if (item.type === 'rec') {
          this.context.rect(item.x * this.width, item.y * this.height, item.w * this.width, item.h * this.height)
        } else if (item.type === 'circle') {
          this.drawEllipse(this.context, (item.x + item.a) * this.width, (item.y + item.b) * this.height, item.a > 0 ? item.a * this.width : -item.a * this.width, item.b > 0 ? item.b * this.height : -item.b * this.height)
        }
        this.context.stroke()
      })
    },
    // 鼠标移动时绘制
    canvasMove (e) {
      if (this.canvasMoveUse && this.canDraw && e.button === 0) {
        // client是基于整个页面的坐标，offset是cavas距离pictureDetail顶部以及左边的距离
        // let canvasX = e.clientX - e.target.parentNode.offsetLeft
        // let canvasY = e.clientY - e.target.parentNode.offsetTop-60
        const canvasX = e.layerX
        const canvasY = e.layerY
        if (this.lineType === 'rec') { // 绘制矩形时恢复起始点状态再重新绘制
          this.context.putImageData(this.beginRec.imageData, 0, 0)
          this.context.beginPath()
          this.context.rect(this.beginRec.x, this.beginRec.y, canvasX - this.beginRec.x, canvasY - this.beginRec.y)
          let info = this.drawInfo[this.drawInfo.length - 1]
          info.w = canvasX / this.width - info.x
          info.h = canvasY / this.height - info.y
        } else if (this.lineType === 'circle') { // 绘制椭圆时恢复起始点状态再重新绘制
          this.context.putImageData(this.beginRec.imageData, 0, 0)
          this.context.beginPath()
          let a = (canvasX - this.beginRec.x) / 2
          let b = (canvasY - this.beginRec.y) / 2
          this.drawEllipse(this.context, this.beginRec.x + a, this.beginRec.y + b, a > 0 ? a : -a, b > 0 ? b : -b)
          let info = this.drawInfo[this.drawInfo.length - 1]
          info.a = a / this.width
          info.b = b / this.height
        }
        this.context.stroke()
      }
    },
    // 绘制椭圆
    drawEllipse (context, x, y, a, b) {
      context.save()
      var r = (a > b) ? a : b
      var ratioX = a / r
      var ratioY = b / r
      context.scale(ratioX, ratioY)
      context.beginPath()
      context.arc(x / ratioX, y / ratioY, r, 0, 2 * Math.PI, false)
      context.closePath()
      context.restore()
    },
    // 鼠标抬起
    canvasUp (e) {
      if (this.canDraw && e.button === 0) {
        this.canvasMoveUse = false
      }
    },
    // 获取坐标信息
    getInfo () {
      return this.drawInfo
    },
    // 清空画布
    clean () {
      this.context.drawImage(this.img, 0, 0, this.width, this.height)
      this.context.lineWidth = this.lineWidth
      this.context.strokeStyle = this.lineColor
      if (!this.canDraw) {
        this.drawLines()
      }
    },
    // 保存为Base64
    getBase64 () {
      const canvas = document.getElementById(this.canvasId)
      // image/png,image/jpeg,image/webp
      return canvas.toDataURL('image/jpeg')
    },
    drawLines () {
      this.context.lineWidth = 5
      this.context.strokeStyle = 'yellow'
      if (this.points) {
        debugger
        for (let i in this.points) {
          let point = this.points[i]
          let realWidth = 5658
          let realHeight = 3631
          let x = point[0] * this.width / realWidth
          let y = point[1] * this.height / realHeight
          if (i === 0) {
            this.context.moveTo(x, y)
          } else {
            this.context.lineTo(x, y)
          }
        }
        this.context.stroke()
      }
    }
  },
  mounted () {
    this.initDraw()
  },
  watch: {
    imgSrc (val) {
      this.img.src = val
    }
  }
}
</script>
<style lang="scss" scoped>
.canvas {
  cursor: crosshair;
}
</style>
