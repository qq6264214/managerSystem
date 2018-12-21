<template>
  <el-row>
    <el-col
      :span="20"
      :offset="2"
    >
      <el-card
        :body-style="{ padding: '0px' }"
        :id="radom+'_card'"
      >
        <div>
          <imgEditor
            :canvasId="radom+'locus'"
            :imgSrc="locusSrc"
            :width="canvasWidth"
            :height="750"
            :canDraw="false"
            :points="points"
            :ref="'locusCanvas'"
          ></imgEditor>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>
<script>
import imgEditor from './ImgEditor'

const uuid = require('node-uuid')
export default {
  props: [
    'locusSrc', 'points', 'canvasWidth'
  ],
  data () {
    return {
      radom: uuid.v4(),
      curWidth: 0
    }
  },
  methods: {
    initCanvas () {
      this.$refs.locusCanvas.initDraw()
    }
  },
  components: {
    imgEditor
  },
  watch: {
    points (val) {
      debugger
      this.initCanvas()
    }
  }
}
</script>
