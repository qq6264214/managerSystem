<template>
  <section>
    <el-row>
      <el-col :span="18">
        <el-card
          :body-style="{ padding: '0px' }"
          shadow="hover"
        >
          <div
            slot="header"
            class="clearfix"
          >
            <el-button
              :type="isActive?'success':'primary'"
              icon="el-icon-view"
              @click="activeCarousel()"
            >{{carouselText}}</el-button>
            <el-button
              type="primary"
              icon="el-icon-caret-right"
              @click="viewExcVideo()"
            >查看异常视频</el-button>
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
                @row-click="handleRowClick"
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
        :ref="'videoPlayer'"
        :options="playerOptions"
      >
      </video-player>
    </el-dialog>
  </section>
</template>

<script>
import { getExceptions, updateException } from '../../api/api'
export default {
  data () {
    return {
      isActive: false,
      carouselText: '开始轮播',
      carouselInterval: '',
      carouselStep: 6000,
      imgsrc: '',
      dealVal: 0,
      dealOptions: [{
        label: '已处理',
        value: 0
      }, {
        label: '忽略',
        value: 1
      }],
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
      currentRow: null,
      currentRowIndex: 0,
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
          src: './static/newClient.mp4'
        }],
        notSupportedMessage: '此视频暂无法播放，请稍后再试'
      }

    }
  },
  computed: {
    player () {
      return this.$refs.videoPlayer.player
    }
  },
  methods: {
    activeCarousel () {
      this.isActive = !this.isActive
      if (this.isActive) {
        // 移除表格选中
        // this.$refs.singleTable.setCurrentRow();
        this.$refs.singleTable.setCurrentRow(this.tableData[this.currentRowIndex])
        this.carouselText = '轮播中...'
        this.carouselInterval = setInterval(() => {
          console.info('轮播中...')
          // 开始轮播
          if (this.tableData.length > 0) {
            if (this.currentRowIndex !== this.tableData.length - 1) {
              this.currentRowIndex++
            } else {
              this.currentRowIndex = 0
            }
            this.$refs.singleTable.setCurrentRow(this.tableData[this.currentRowIndex])
          }
        }, this.carouselStep)
      } else {
        this.stopCarousel()
      }
    },
    stopCarousel () {
      clearInterval(this.carouselInterval)
      this.carouselText = '开始轮播'
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
        this.currentRowIndex = this.tableData.indexOf(val)
      }
    },
    handleRowClick (row, event, column) {
      if (row) {
        this.isActive = false
        this.stopCarousel()
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
        console.error('initExceptions error', err)
      })
    },
    initExceptions () {
      let curTime = new Date().getTime() / 1000
      let dayStartTime = new Date(new Date().toLocaleDateString()).getTime() / 1000
      getExceptions({
        'start': dayStartTime,
        'end': curTime
      }).then(response => {
        this.tableData = response.data
        if (this.tableData && this.tableData.length > 0) {
          // 默认选中第一行
          // this.$refs.singleTable.setCurrentRow(this.tableData[0])
          // 默认开始轮播
          this.currentRowIndex = 0
          this.imgsrc = this.tableData[this.currentRowIndex].imagepath
          this.videoSrc = this.tableData[this.currentRowIndex].videopath
          this.activeCarousel()
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
  },
  beforeDestroy () {
    clearInterval(this.carouselInterval)
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
