<template>
  <section>
    <el-row>
      <el-col :span="24">
        <el-tabs
          v-model="activeTabName"
          type="card"
        >
          <el-tab-pane
            label="实时追踪"
            name="first"
          ></el-tab-pane>
          <el-tab-pane
            label="结果查看"
            name="second"
          ></el-tab-pane>
          <el-tab-pane
            label="行车轨迹"
            name="third"
          ></el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>
    <carTrack
      @showBase64="getInfoByBase64"
      v-show="activeTabName=='first'"
      :ref="'carTrack'"
    ></carTrack>
    <carResultView
      v-show="activeTabName=='second'"
      :resultImgs="resultImgs"
      :ref="'carResultView'"
    ></carResultView>
    <carLocus
      v-show="activeTabName=='third'"
      :canvasWidth="canvasWidth"
      :locusSrc="locusSrc"
      :points="points"
      :ref="'carLocus'"
    ></carLocus>
  </section>
</template>
<script>
import carTrack from './CarTrack'
import carResultView from './CarResultView'
import carLocus from './CarLocus'
import { matchCar } from '../../api/api'
import mapImg from '../../assets/map.png'
import geoMap from '../../common/js/geoMap'
export default {
  data () {
    return {
      activeTabName: 'first',
      resultImgs: [],
      // 轨迹参数
      locusSrc: mapImg,
      points: {
        'TV1': [813, 2813],
        'TV2': [861, 2782]
      },
      canvasWidth: 0
    }
  },
  components: {
    carTrack,
    carResultView,
    carLocus
  },
  methods: {
    getInfoByBase64 (imgData, time, cameraId) {
      // 提交给服务端，并返回数组
      matchCar({
        'time': time,
        'camid': cameraId,
        'img64': imgData
      }).then(res => {
        this.resultImgs = res.data
        this.points = {}
        if (this.resultImgs && this.resultImgs.length > 0) {
          for (let i of this.resultImgs) {
            let key = i.cameraid
            if (geoMap[key]) {
              this.points[key] = geoMap[key]
            }
          }
        }
        this.activeTabName = 'second'
      }).catch(err => {
        this.$message({
          message: '系统异常',
          type: 'warning'
        })
        console.error(err)
      })
    }
  },
  mounted () {
    this.canvasWidth = this.$refs.carTrack.$el.clientWidth * 20 / 24 - 2
  }
}
</script>
