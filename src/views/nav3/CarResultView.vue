<template>
  <el-row>
    <el-col :span="18">
      <el-card
        :body-style="{ padding: '0px' }"
        shadow="hover"
      >
        <!-- <div slot="header">
          </div> -->
        <div v-show="imgsrc!=''">
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
        <!-- <div slot="header"></div> -->
        <div class='exception-list'>
          <el-scrollbar style="height:100%">
            <el-table
              ref="singleTable"
              :data="resultImgs"
              highlight-current-row
              @current-change="handleCurrentChange"
              style="width: 100%"
            >
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
</template>
<script>
import util from '../../common/js/util'
export default {
  props: [
    'resultImgs'
  ],
  data () {
    return {
      imgsrc: '',
      currentRow: ''
    }
  },
  methods: {
    handleCurrentChange (val, old) {
      if (val) {
        this.currentRow = val
        this.imgsrc = val.imagepath
      }
    },
    setFirstCurrent () {
      if (this.resultImgs && this.resultImgs.length > 0) {
        this.$refs.singleTable.setCurrentRow(this.resultImgs[0])
      }
    }
  },
  watch: {
    resultImgs (val) {
      if (val && val.length > 0) {
        for (let i of val) {
          i.datetime = util.formatDate.format(new Date(i.time * 1000), 'yyyy-MM-dd hh:mm:ss')
        }
      }
      this.setFirstCurrent()
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
</style>
