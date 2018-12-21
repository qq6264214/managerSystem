<template>
  <el-row>
    <el-col
      :span="20"
      :offset="2"
    >
      <el-card
        :body-style="{ padding: '0px' }"
        shadow="hover"
      >
        <div
          slot="header"
          class="clearfix"
        >
          <span>摄像头ID:</span>
          <el-select
            v-model="cameraId"
            placeholder="请选择"
            @change="queryImgs"
          >
            <el-option
              v-for="item in options"
              :key="item.cameraId"
              :label="item.cameraId"
              :value="item.cameraId"
            >
            </el-option>
          </el-select>
          <el-date-picker
            v-model="selectedDate"
            type="date"
            placeholder="选择日期"
            @change="queryImgs"
          >
          </el-date-picker>
          <el-button
            type="primary"
            icon="el-icon-search"
            @click="saveImgToBase64"
            :loading="idLoading"
          >查询车辆</el-button>
          <el-time-picker
            v-model="currentTime"
            readonly
            value-format="HH:mm:ss"
            disabled
          >
          </el-time-picker>
        </div>
        <div>
          <el-carousel
            ref="carousel"
            :autoplay="false"
            :loop="loop"
            indicator-position="none"
            arrow="always"
            trigger="click"
            height="600px"
            @change="changeImg"
          >
            <el-carousel-item
              v-for="(item, index) in imgs"
              :key="index"
            >
              <ImgEditor
                :canvasId="radom+index"
                :imgSrc="item.imagepath"
                :time="item.time"
                :width="curWidth"
                :height="600"
                :canDraw="true"
                :ref="'canvas'+radom +index"
              ></ImgEditor>
            </el-carousel-item>
          </el-carousel>
        </div>
        <div
          class="bottom clearfix block"
          style="padding: 14px;"
        >
          <el-slider
            v-model="silderVal"
            :step="1"
            :max="maxSilderVal"
            :format-tooltip="formatTooltip"
          >
          </el-slider>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>
<script>
import ImgEditor from './ImgEditor'
import { getCars, getCarCameras } from '../../api/api'
const uuid = require('node-uuid')
export default {
  data () {
    return {
      radom: uuid.v4(),
      cameraId: '',
      imgs: [],
      options: [{
        value: '',
        label: ''
      }],
      selectedDate: new Date(),
      currentTime: '00:00:00',
      silderVal: 0,
      maxSilderVal: 1439,
      idLoading: false,
      loop: false,
      carouselMax: 0,
      curActiveIndex: 0,
      curWidth: 0
      // 结果查看选项卡
    }
  },
  methods: {
    formatTooltip (val = this.silderVal) {
      return this.getCurrentTime(val)
    },
    changeImg (curIndex, lastIndex) {
      this.curActiveIndex = curIndex
      if (this.carouselMax > 0 && lastIndex === this.carouselMax - 1 && curIndex === 0) {
        // 向后一个刻度
        this.silderVal++
      } else if (this.carouselMax > 0 && lastIndex === 0 && curIndex === this.carouselMax - 1 && this.silderVal > 0) {
        this.silderVal--
      } else {
        let seconds = new Date(this.imgs[this.curActiveIndex].time * 1000).getSeconds()
        this.currentTime = this.getCurrentTime(this.silderVal, seconds)
      }
    },
    queryImgs () {
      // 查看当前选择的摄像头和日期的值
      let curDate = new Date(new Date(this.selectedDate).toLocaleDateString()).getTime()
      // 获取的数据是按分钟划分的，因此这里不考虑秒数
      let timestamp = Number(this.currentTime.split(':')[0]) * 60 * 60 * 1000 + Number(this.currentTime.split(':')[1]) * 60 * 1000
      let curTime = curDate + timestamp
      let nextTime = curTime + 1 * 60 * 1000
      getCars({
        'start': curTime / 1000,
        'end': nextTime / 1000,
        'camid': this.cameraId
      }).then(res => {
        this.imgs = res.data
        // 重新加载数据重绘图片
        // 如果一个刻度获取的图片张数不相同，走马灯会重新从第一张开始
        if (this.carouselMax !== this.imgs.length) {
          this.carouselMax = this.imgs.length
          this.curActiveIndex = 0
        }
        if (this.imgs && this.imgs.length > 0) {
          debugger
          this.imgs.sort((a, b) => {
            return a.time - b.time
          })
          let seconds = new Date(this.imgs[this.curActiveIndex].time * 1000).getSeconds()
          let realTime = this.getCurrentTime(this.silderVal, seconds)
          if (this.currentTime === realTime) {
            let curCanvasId = 'canvas' + this.radom + this.curActiveIndex
            this.$refs[curCanvasId][0].initDraw()
          }
          this.currentTime = realTime
        } else {
          this.curActiveIndex = 0
          this.currentTime = this.getCurrentTime(this.silderVal, 0)
        }
      })
        .catch(err => {
          this.$message({
            message: '系统异常',
            type: 'warning'
          })
          console.error(err)
        })
    },
    getCurrentTime (val, senconds = 0) {
      let hour = Math.floor(val / 60)
      let minutes = val % 60
      let tempTime = hour.toString().padStart(2, 0) + ':' + minutes.toString().padStart(2, 0) + ':' + senconds.toString().padStart(2, 0)
      return tempTime
    },
    saveImgToBase64 () {
      let curCanvasId = 'canvas' + this.radom + this.curActiveIndex
      let base64Code = this.$refs[curCanvasId][0].getBase64()
      let time = this.imgs[this.curActiveIndex].time
      let cameraId = this.imgs[this.curActiveIndex].cameraid
      this.$emit('showBase64', base64Code, time, cameraId)
    },
    initCameras () {
      debugger
      getCarCameras({}).then(res => {
        this.options = []
        if (res.data && res.data.length > 0) {
          for (let i of res.data) {
            let json = {}
            json.position = i[0]
            json.cameraId = i[1]
            this.options.push(json)
          }
          this.cameraId = this.options[0].cameraId
          this.queryImgs()
        }
      }).catch(err => {
        console.error(err)
      })
    }
  },
  mounted () {
    this.curWidth = this.$refs.carousel.$el.clientWidth
    // 获取摄像头
    this.initCameras()
  },
  watch: {
    silderVal (curval, oldval) {
      this.queryImgs()
    },
    currentTime (curval, oldval) {
      // 当前时间为当天最后一分钟或者第一分钟,取消上一页或者下一页
      if ((curval.slice(0, 5) === '23:59' && this.curActiveIndex === this.imgs.length) || (curval.slice(0, 5) === '00:00' && this.curActiveIndex === 0)) {
        this.loop = false
      } else {
        this.loop = true
      }
      let curCanvasId = 'canvas' + this.radom + this.curActiveIndex
      if (this.$refs[curCanvasId]) {
        this.$refs[curCanvasId][0].initDraw()
      }
    }
  },
  components: {
    ImgEditor
  }
}
</script>
<style scoped>
.exception-img {
  height: 650px;
  width: 100%;
}
.exception-list {
  height: 650px;
}
.exception-item {
  height: 30px;
}
</style>
