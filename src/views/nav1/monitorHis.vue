<template>
  <section>
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
            <span>路段:</span>
            <el-select
              v-model="positionId"
              placeholder="请选择"
            >
              <el-option
                v-for="item in positionOptions"
                :key="item.positionId"
                :label="item.positionId"
                :value="item.positionId"
              >
              </el-option>
            </el-select>
            <span>摄像头ID:</span>
            <el-select
              v-model="cameraId"
              placeholder="请选择"
            >
              <el-option
                v-for="item in cameraOptions"
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
            >
            </el-date-picker>
            <el-button
              type="primary"
              icon="el-icon-search"
              @click="queryImgs"
              :loading="idLoading"
            > 查看</el-button>
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
              height="650px"
              @change="changeImg"
            >
              <el-carousel-item
                v-for="(item, index) in imgs"
                :key="index"
              >
                <img
                  :src=item.imagepath
                  alt=""
                >
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
  </section>
</template>
<script>
import { getMonCameras, getHistoryimage } from '../../api/api'
export default {
  data () {
    return {
      imgs: [
        { time: '', imagepath: '', cameraid: '' }
      ],
      cameraOptions: [{
        cameraId: '',
        address: ''
      }],
      cameraId: '',
      positionOptions: [{
        positionId: ''
      }],
      positionId: '',
      posMap: {},
      selectedDate: new Date(),
      currentTime: '00:00:00',
      silderVal: 0,
      maxSilderVal: 1439,
      idLoading: false,
      loop: false,
      carouselMax: 0,
      curActiveIndex: 0
    }
  },
  methods: {
    getCurrentTime (val, senconds = 0) {
      let hour = Math.floor(val / 60)
      let minutes = val % 60
      let tempTime = hour.toString().padStart(2, 0) + ':' + minutes.toString().padStart(2, 0) + ':' + senconds.toString().padStart(2, 0)
      return tempTime
    },
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
      getHistoryimage({
        'start': curTime / 1000,
        'end': nextTime / 1000,
        'cameraid': this.cameraId
      }).then(res => {
        this.imgs = res.data
        // 重新加载数据重绘图片
        // 如果一个刻度获取的图片张数不相同，走马灯会重新从第一张开始
        if (this.carouselMax !== this.imgs.length) {
          this.carouselMax = this.imgs.length
          this.curActiveIndex = 0
        }
        if (this.imgs && this.imgs.length > 0) {
          this.imgs.sort((a, b) => {
            return a.time - b.time
          })
          let seconds = new Date(this.imgs[this.curActiveIndex].time * 1000).getSeconds()
          let realTime = this.getCurrentTime(this.silderVal, seconds)
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
    initCameras () {
      getMonCameras({
      }).then(res => {
        debugger
        let result = res.data
        this.positionOptions = []
        if (result && result.length > 0) {
          let json = {}
          for (let i of result) {
            let pos = i[0]
            let cam = i[1]
            let add = i[2]
            // posOption
            let posOption = { positionId: pos }
            if (!json[pos]) {
              this.positionOptions.push(posOption)
              json[pos] = 1
            }
            // 摄像头的option
            let arr = this.posMap[pos] || []
            let camsOption = { cameraId: cam, address: add }
            arr.push(camsOption)
            this.posMap[pos] = arr
          }
          // 选中第一个路段
          this.positionId = this.positionOptions[0].positionId
        }
      }).catch(err => {
        console.error(err)
      })
    }
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
    },
    positionId (val) {
      this.cameraOptions = this.posMap[val]
      this.cameraId = this.cameraOptions[0].cameraId
    },
    cameraId (val) {
      this.queryImgs()
    }
  },
  mounted() {
    this.initCameras ()
  },

}
</script>
<style scoped>
img {
  height: 100%;
  width: 100%;
}
/* .bottom {
    margin-top: 13px;
    line-height: 12px;
  }
  .clearfix:before,
  .clearfix:after {
    display: table;
    content: "";
  }

  .clearfix:after {
    clear: both;
  } */
</style>
