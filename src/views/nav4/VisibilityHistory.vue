<template>
  <el-row>
    <el-col
      :span="20"
      :offset="2"
    >
      <el-card :body-style="{ padding: '0px' }">
        <div slot="header">
          <span class="demonstration">选择时期:</span>
          <el-date-picker
            v-model="datevalues"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          >
          </el-date-picker>
          <el-select
            v-model="cameraId"
            placeholder="请选择"
          >
            <el-option
              v-for="item in cameraOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
          <el-button
              type="primary"
              icon="el-icon-search"
              @click="queryVisibility"
            >查询</el-button>
        </div>
        <!-- card body -->
        <div>
          <div
          style="width:100%; height:650px;"
          ref="vsChart"
          ></div>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>
<script>
import echarts from 'echarts'
import { getVisibility } from '../../api/api'
export default {
  data () {
    return {
      datevalues: [new Date().getTime() - 24 * 60 * 60 * 1000, new Date().getTime()],
      cameraId: '',
      cameraOptions: [],
      visibilitys: [{ time: '', visibility: '', imagepath: '' }],
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
    initChart () {
      let chartDiv = this.$refs.vsChart
      this.chartLine = echarts.init(chartDiv)
      this.chartLine.setOption(this.chartOption)
    },
    queryVisibility () {
      let endTime = new Date(this.datevalues[1]).getTime()
      let startTime = new Date(this.datevalues[0]).getTime()
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
    }
  },
  mounted () {
    this.initChart()
    this.cameraOptions = [{
      value: '选项1',
      label: 'TV36'
    }, {
      value: '选项2',
      label: 'TV42'
    }, {
      value: '选项3',
      label: 'TV43'
    }, {
      value: '选项4',
      label: 'TV44'
    }, {
      value: '选项5',
      label: 'TV45'
    }]
    this.cameraId = this.cameraOptions[0].value
  },
  watch: {
    chartOption: {
      deep: true,
      handler (val, oldVal) {
        if (this.chartLine && val) {
          this.chartLine.setOption(val)
        }
      }
    }
  }
}
</script>
