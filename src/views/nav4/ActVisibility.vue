<template>
  <el-row>
    <el-col
      :span="20"
      :offset="2"
    >
      <el-card :body-style="{ padding: '0px'}">
        <div slot="header">
          <span>摄像头:</span>
          <el-select
            v-model="cameraId"
            placeholder="请选择"
            @focus="focusHandler"
          >
            <el-option
              v-for="item in cameraOptions"
              :key="item.cameraId"
              :label="item.cameraId"
              :value="item.cameraId"
            >
            </el-option>
          </el-select>
          <el-switch
            v-model="isCas"
            active-text="轮播"
            inactive-text="查看"
            @change="changstatus()"
          >
          </el-switch>
          <!-- card body -->
        </div>
        <div
          style="width:100%; height:650px;"
          ref="vsChart"
        ></div>
        <div>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>
<script>
import echarts from 'echarts'
import { getVisibility, getViscameras } from '../../api/api'
export default {
  data () {
    return {
      cameraId: '',
      cameraOptions: [],
      currentIndex: 0,
      visibilitys: [{ time: '', visibility: '', imagepath: '' }],
      isCas: false,
      casInterval: '',
      chartLine: '',
      chartOption: {
        title: {
          text: '能见度曲线图'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['能见度']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        calculable: true,
        xAxis: [{
          type: 'time',
          boundaryGap: false,
          splitNumber: 10,
          axisLabel: { // 坐标轴文本标签，详见axis.axisLabel
            show: true,
            interval: 3,
            textStyle: { // 其余属性默认使用全局文本样式，详见TEXTSTYLE
              color: '#333'
            }
          }
        }],
        yAxis: [{
          name: '米',
          type: 'value',
          scale: true
        }],
        series: [{
          name: '能见度',
          type: 'line',
          showSymbol: false,
          itemStyle: {
            normal: {
              color: '#C23531'
            }
          },
          data: []
        }]
      }
    }
  },
  methods: {
    changstatus () {
      // todo
    },
    timer () {
      if (this.cameraOptions.length === 0 || this.currentIndex >= this.cameraOptions.length - 1) {
        this.currentIndex = 0
      } else {
        this.currentIndex++
      }
      console.log(this.cameraOptions)
      this.cameraId = this.cameraOptions[this.currentIndex].cameraId
    },
    initChart () {
      let chartDiv = this.$refs.vsChart
      this.chartLine = echarts.init(chartDiv)
      this.chartLine.setOption(this.chartOption)
    },
    queryVisibility () {
      let endTime = new Date().getTime()
      let startTime = new Date().getTime() - 2 * 60 * 1000
      getVisibility({
        start: startTime / 1000,
        end: endTime / 1000,
        cameraid: this.cameraId
      }).then(res => {
        let results = res.data
        let dataArr = []
        if (results && results.length > 0) {
          for (let i of results) {
            let tempArr = []
            tempArr.push(i.time * 1000)
            tempArr.push(i.visibility)
            dataArr.push({ 'value': tempArr })
          }
        }
        this.chartOption.series[0].data = dataArr
      })
        .catch(err => {
          this.$message.warning('系统异常')
          console.err(err)
        })
    },
    initCameras () {
      // 加载摄像头
      getViscameras({}).then(res => {
        this.cameraOptions = []
        if (res.data && res.data.length > 0) {
          for (let i of res.data) {
            let json = {}
            json.position = i[0]
            json.cameraId = i[1]
            this.cameraOptions.push(json)
          }
          this.cameraId = this.cameraOptions[0].cameraId
          this.isCas = true
        }
      }).catch(err => {
        console.error(err)
      })
    },
    focusHandler () {
      this.isCas = false
    }
  },
  mounted () {
    this.initChart()
    this.initCameras()
    // this.isCas = true
  },
  beforeDestroy () {
    clearInterval(this.casInterval)
  },
  watch: {
    chartOption: {
      deep: true,
      handler (val, oldVal) {
        if (this.chartLine && val) {
          this.chartLine.setOption(val)
        }
      }
    },
    isCas (val) {
      if (this.casInterval) {
        clearInterval(this.casInterval)
      }
      if (val) {
        // 轮播
        this.casInterval = setInterval(this.timer, 2000)
      }
    },
    cameraId (val) {
      if (this.chartLine && val) {
        this.queryVisibility()
      }
    }
  }
}
</script>
