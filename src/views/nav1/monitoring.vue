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
          :ref="'card'"
          v-loading="loading"
          element-loading-text="拼命加载中"
          element-loading-spinner="el-icon-loading"
          element-loading-background="rgba(0, 0, 0, 0.8)"
        >
          <div
            slot="header"
            class="clearfix"
          >
            <span>路段:</span>
            <el-select
              v-model="positionId"
              placeholder="请选择"
              @focus="focusHandler"
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
              v-model="address"
              placeholder="请选择"
              @focus="focusHandler"
            >
              <el-option
                v-for="item in cameraOptions"
                :key="item.cameraId"
                :label="item.cameraId"
                :value="item.address"
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
          </div>

          <div>
            <div
              class="vxgplayer"
              id="vxg_media_player1"
              style="padding: 0;margin:0;"
            ></div>
            <!-- <video-player
              class="vjs-custom-skin"
              ref="videoPlayer"
              :options="playerOptions"
            >
            </video-player> -->
          </div>
        </el-card>
      </el-col>
    </el-row>
  </section>
</template>

<script>
import { getMonCameras } from '../../api/api'
require('../../common/js/vxgplayer-1.8.31.min.js')
export default {
  data () {
    return {
      loading: true,
      width: 0,
      isCas: false,
      interval: '',
      cameraOptions: [{
        cameraId: '',
        address: ''
      }],
      cameraId: '',
      address: '',
      curCamIndex: 0,
      positionOptions: [{
        positionId: ''
      }],
      positionId: '',
      posMap: {},
      curPosIndex: 0,
      cusplayer: ''
      // playerOptions: {
      //   height: '700',
      //   width: '1350',
      //   sources: [{
      //     type: 'rtmp/mp4',
      //     src: 'rtmp://live.hkstv.hk.lxdns.com/live/hks1'
      //   }],
      //   flash: {
      //     swf: '../../static/video-js.swf'
      //   },
      //   techOrder: ['flash'],
      //   autoplay: true,
      //   controls: true,
      //   preload:'auto'
      // }
    }
  },
  // computed: {
  //   player () {
  //     return this.$refs.videoPlayer.player
  //   }
  // },
  methods: {
    changstatus () {
      console.info('当前值是' + this.isCas)
      if (this.isCas) {
        if (this.interval) {
          clearInterval(this.interval)
        }
        // 开启轮播
        this.interval = setInterval(() => {
          console.info('切换定时器正在执行')
        }, 1000)
      } else {
        clearInterval(this.interval)
      }
    },
    focusHandler () {
      this.isCas = false
    },
    timer () {
      if (this.positionOptions.length === 0) {
        this.curPosIndex = 0
        this.curCamIndex = 0
      } else {
        // 当前为摄像头的最后一项
        if (this.curCamIndex >= this.cameraOptions.length - 1) {
          this.curCamIndex = 0
          // 当前为路段最后一项
          if (this.curPosIndex >= this.positionOptions.length - 1) {
            this.curPosIndex = 0
          } else {
            this.curPosIndex++
          }
          this.positionId = this.positionOptions[this.curPosIndex].positionId
        } else {
          this.curCamIndex++
          this.address = this.cameraOptions[this.curCamIndex].address
        }
      }
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
          this.isCas = true
        }
      }).catch(err => {
        console.error(err)
      })
    },
    createPlayer () {
      vxgplayer('vxg_media_player1', {
        width: this.width,
        height: 650,
        // url: 'rtsp://184.72.239.149/vod/mp4:BigBuckBunny_115k.mov',
        nmf_path: 'media_player.nmf',
        nmf_src: './static/media_player.nmf',
        // latency: 500,
        aspect_ratio_mode: 1,
        autohide: 3,
        controls: false,
        'auto-reconnect': true,
        connection_timeout: 5000,
        connection_udp: 0,
        custom_digital_zoom: false
      }).ready(() => {
        debugger
        this.loading = false
        this.cusplayer = this.cusplayer = vxgplayer('vxg_media_player1')
        console.log('ready player vxg_media_player1')
        this.cusplayer.onError(function (player) {
          console.log(player.error())
        })
        this.initCameras()
        // this.cusplayer.src('rtsp://184.72.239.149/vod/mp4:BigBuckBunny_115k.mov')
        // this.cusplayer.play()
        // vxgplayer(playerId).src('rtsp://184.72.239.149/vod/mp4:BigBuckBunny_115k.mov')
        // vxgplayer(playerId).play()
      })
    }
  },
  mounted () {
    this.width = this.$refs.card.$el.clientWidth
    this.createPlayer()
  },
  beforeDestroy () {
    clearInterval(this.interval)
    vxgplayer('vxg_media_player1').dispose()
  },
  watch: {
    positionId (val) {
      this.cameraOptions = this.posMap[val]
      this.address = this.cameraOptions[0].address
    },
    address (val) {
      this.cusplayer.src(val)
      this.cusplayer.play()
    },
    isCas (val) {
      if (val) {
        if (this.interval) {
          clearInterval(this.interval)
        }
        this.interval = setInterval(this.timer, 3000)
      } else {
        clearInterval(this.interval)
      }
    }
  }
}
</script>

<style scope>
.time {
  font-size: 13px;
  color: #999;
}

.bottom {
  margin-top: 13px;
  line-height: 12px;
}

.button {
  padding: 0;
  float: right;
}

.image {
  width: 100%;
  display: block;
  max-height: 650px;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}

.clearfix:after {
  clear: both;
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
.vxgplayer {
  padding: 0;
}
</style>
