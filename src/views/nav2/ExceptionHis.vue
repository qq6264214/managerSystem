<template>
  <section>
    <el-row>
      <el-col :span="18">
        <el-card
          :body-style="{ padding: '0px' }"
          shadow="hover"
        >
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
            <el-button
              type="primary"
              icon="el-icon-search"
              @click="initExceptions()"
            >查询</el-button>
            <el-button
              type="primary"
              icon="el-icon-caret-right"
              @click="viewExcVideo()"
            >查看异常视频</el-button>
            <el-button
              type="primary"
              icon="el-icon-document"
              @click="exportTocsv"
            >导出</el-button>
          </div>
          <div>
            <img
              :src="imgsrc"
              class="exception-img"
              alt=""
              srcset=""
            >
          </div>
        </el-card>

      </el-col>
      <el-col
        :span="5"
        :offset="1"
      >
        <el-card :body-style="{ padding: '0px' }">
          <div slot="header">
            <el-select
              v-model="dealVal"
              popper-class="deal-select"
            >
              <el-option
                v-for="item in dealOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
            <el-button
              type="primary"
              icon="el-icon-upload2"
              @click="dealExc"
            >提交</el-button>
          </div>
          <div class='exception-list'>
            <el-scrollbar style="height:100%">
              <el-table
                ref="singleTable"
                :data="tableData"
                highlight-current-row
                @current-change="handleCurrentChange"
                style="width: 100%"
              >
                <el-table-column
                  type="index"
                  width="50"
                  v-if="false"
                >
                </el-table-column>
                <el-table-column
                  property="objid"
                  width="5"
                  v-if="false"
                >
                </el-table-column>
                <el-table-column
                  property="cameraid"
                  width="70"
                  label="摄像头"
                >
                </el-table-column>
                <el-table-column
                  property="position"
                  label="位置"
                  width="85"
                >
                </el-table-column>
                <el-table-column
                  property="saferank"
                  label="安全等级"
                  width="45"
                  v-if="false"
                >
                </el-table-column>
                <el-table-column
                  property="datetime"
                  label="时间"
                >
                </el-table-column>
              </el-table>
            </el-scrollbar>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-dialog
      title="异常视频"
      :visible.sync="dialogVideoVisible"
      center
      width="50%"
    >
      <video-player
        class="vjs-custom-skin"
        ref="videoPlayer"
        :options="playerOptions"
      >
      </video-player>
    </el-dialog>

  </section>
</template>
<script>
import { getExceptions, updateException } from '../../api/api'
import CSV from 'comma-separated-values'
import exportCsv from '../../common/js/export-csv'
export default {
  data () {
    return {
      datevalues: [new Date().getTime() - 24 * 60 * 60 * 1000, new Date()],
      tableData: [{
        imagepath: '',
        videopath: '',
        position: '',
        saferank: '',
        t: '',
        datetimeT: '',
        objid: '',
        cameraid: ''
      }],
      imgsrc: '',
      currentRow: null,
      dialogVideoVisible: false,
      videoSrc: '',
      playerOptions: {
        height: '350',
        width: '650',
        autoplay: false,
        muted: false,
        language: 'en',
        sources: [{
          type: 'video/mp4',
          src: 'http://vjs.zencdn.net/v/oceans.mp4'
        }],
        notSupportedMessage: '此视频暂无法播放，请稍后再试'
      },
      dealVal: 0,
      dealOptions: [{
        label: '已处理',
        value: 0
      }, {
        label: '忽略',
        value: 1
      }]
    }
  },
  computed: {
    player () {
      return this.$refs.videoPlayer.player
    }
  },
  methods: {
    exportTocsv () {
      debugger
      if (!this.currentRow) {
        this.$message.warning('请选择要导出的数据')
        return
      }
      let headers = []
      let data = [[]]
      for (let i in this.currentRow) {
        headers.push(i)
        data[0].push(this.currentRow[i])
      }
      let result = new CSV(data, { header: headers }).encode()
      // 导出成csv
      let fileName = this.currentRow.cameraid + '_' + this.currentRow.time + '.csv'
      exportCsv.download(fileName, result)
    },
    viewExcVideo () {
      if (!this.imgsrc) {
        this.$message({
          message: '请选择一项异常',
          type: 'warning'
        })
        return
      }
      this.dialogVideoVisible = true
    },
    handleCurrentChange (val, old) {
      this.currentRow = val
      if (val) {
        this.imgsrc = val.imagepath
        this.videoSrc = val.videopath
      }
    },
    dealExc () {
      if (!this.currentRow) {
        this.$message({
          message: '请选择一项异常',
          type: 'warning'
        })
        return
      }
      updateException({
        'obj_id': this.currentRow.objid,
        'status': this.dealVal
      }).then(res => {
        if (res.data === 'success') {
          this.$message({
            message: '处理成功',
            type: 'success'
          })
        } else {
          this.$message({
            message: '处理失败',
            type: 'error'
          })
        }
      }).catch(err => {
        this.$message({
          message: '处理异常',
          type: 'warning'
        })
        console.error(err)
      })
    },
    initExceptions () {
      let startTime = new Date(this.datevalues[0]).getTime() / 1000
      let endTime = new Date(this.datevalues[1]).getTime() / 1000
      getExceptions({
        'start': startTime,
        'end': endTime
      }).then(response => {
        this.tableData = response.data
        if (this.tableData && this.tableData.length > 0) {
          // 默认选中第一行
          this.$refs.singleTable.setCurrentRow(this.tableData[0])
          // this.imgsrc = this.tableData[0].imagepath
          // this.videoSrc = this.tableData[0].videopath
        }
      }).catch(error => {
        console.error('initExceptions error', error)
      })
    }
  },
  mounted () {
    this.initExceptions()
  },
  watch: {
    dialogVideoVisible (val) {
      if (!val) {
        this.$refs.videoPlayer.player.pause()
      } else {
        if (this.$refs.videoPlayer) {
          this.$refs.videoPlayer.player.src(this.videoSrc)
        } else {
          this.playerOptions.sources[0].src = this.videoSrc
        }
      }
    }
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

.video-js .vjs-big-play-button {
  font-size: 2.5em;
  line-height: 2.3em;
  height: 2.5em;
  width: 2.5em;
  -webkit-border-radius: 2.5em;
  -moz-border-radius: 2.5em;
  border-radius: 2.5em;
  background-color: #73859f;
  background-color: rgba(115, 133, 159, 0.5);
  border-width: 0.15em;
  margin-top: -1.25em;
  margin-left: -1.75em;
}
</style>
