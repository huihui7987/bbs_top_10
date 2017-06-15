<template>

  <div id="app">
    <el-row>
      <!-- nav -->
      <el-col :span="3" class="nav-vertical">
        <h1 class="primary-title">BBS.BYR.CN</h1>
        <h2 class="vice-title">十大热帖回顾</h2>
        <el-steps :space="200" direction="vertical" :active="currentStep" class="steps" finish-status="success">
          <el-step title="选择日期" @click.native="handleStepChange(0)"></el-step>
          <el-step title="选择时间" @click.native="handleStepChange(1)"></el-step>
          <el-step title="选择主题" @click.native="handleStepChange(2)"></el-step>
        </el-steps>
      </el-col>
      <el-col :span="21" class="main">
        <!-- bg -->
        <div class="bg"></div>
        <!-- datepicker -->
        <div class="datepicker">
          <transition name="datepicker" appear v-on:after-enter="datepickerAfterEnter">
            <template>
              <div class="block" v-if="currentStep==0">
                <el-date-picker v-model="date" type="date" placeholder="选择日期"
                  format="yyyy-MM-dd" :picker-options="pickerOptions">
                </el-date-picker>
              </div>
            </template>
          </transition>
        </div>
        <!-- commit-list -->
        <div class="commitpicker">
          <transition name="commitpicker" appear>
            <template>
              <div class="grid-content bg-purple" v-if="currentStep==1">
                <div class="commit-list">
                  <el-table
                    :data="processedCommitList" show-overflow-tooltip highlight-current-row
                    @row-click="handleCommitChange" stripe border>
                    <el-table-column type="index" width="50" align="center"></el-table-column>
                    <el-table-column property="commit.message" label="更新时间"
                    :formatter="beaMsg" align="center"></el-table-column>
                  </el-table>
                </div>
              </div>
            </template>
          </transition>
        </div>
        <!-- topic-picker -->
        <div class="topicpicker">
          <transition name="topicpicker" appear>
            <template>
              <div class="grid-content bg-purple-light" v-if="currentStep>=2">
                <div class="topic-list">
                  <el-table :data="tableData" show-overflow-tooltip border style="width: 100%" @row-click="showTopicDetail">
                    <el-table-column prop="title" label="Title" align="center"></el-table-column>
                    <el-table-column prop="author" label="Author" width="150" align="center"></el-table-column>
                    <el-table-column prop="pubDate" label="Pub Date" width="200" align="center"
                                     :formatter="beaDate">
                    </el-table-column>
                    <!-- <el-table-column prop="link" label="Link" align="center"></el-table-column> -->
                  </el-table>
                </div>
              </div>
            </template>
          </transition>
        </div>
        <!-- topic-picker-mobile -->
        <div class="topicpicker-mobile" style="display: none;">
          <transition name="topicpicker" appear>
            <template>
              <div class="grid-content bg-purple-light" v-if="currentStep>=2">
                <div class="topic-list">
                  <el-table :data="tableData" show-overflow-tooltip border style="width: 100%" @row-click="showTopicDetail">
                    <el-table-column prop="title" label="Title" align="center"></el-table-column>
                  </el-table>
                </div>
              </div>
            </template>
          </transition>
        </div>
        <!-- topic detail dialog -->
        <el-dialog :title="currentTopicTitle" v-model="dialogVisible"
          size="small" :modal="true" :lock-scroll="true" :show-close="false" top="12%" @close="closeCurrentTopic">
          <span v-html="currentTopicHtml"></span>
          <span slot="footer" class="dialog-footer">
            <el-button type="primary" @click.native="goTo">原帖</el-button>
            <el-button @click.native="dialogVisible=false">关闭</el-button>
          </span>
        </el-dialog>
      </el-col>
  </el-row>
</template>

<script>
exports.default = {
  name: 'app',
  data () {
    return {
      date: new Date(),
      sourceCommitList: [],
      count: 0,
      currentRow: null,
      currentCommitSha: null,
      currentTopicHtml: null,
      currentTopicTitle: null,
      currentTopicLink: null,
      currentStep: 0,
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() < new Date('2016-11-01').getTime() ||
                 time.getTime() > new Date();
        }
      },
      loadingOptions: {
        target: '.main',
        text: '加载中'
      },
      fullscreenLoading: false,
      tableData: null,
      dialogVisible: false,
      show: true,
      ajaxUrlPrefix: 'http://api.52byr.com',
    };
  },
  created() {
    console.info('created');
  },
  ready() {
    console.info('ready');
  },
  mounted() {
    this.$http.get(`${this.ajaxUrlPrefix}/newvisitor`).then((response) => {
      this.$notify.info({
        title: 'Welcome',
        message: `今天第 ${response.body} 位访客`,
        duration: 3000
      });
    });
  },
  methods: {
    update() {
      let date = this.localeDate(this.date);
      //begin loading
      let loadingInstance = this.$loading(this.loadingOptions);
      this.$http.get(`${this.ajaxUrlPrefix}/commits/${date}`).then((response) => {
        //clear topics
        this.tableData = null;

        //end loading
        loadingInstance.close();

        let data = response.body;
        this.sourceCommitList = data;
        this.count = data.length;
        console.log(`found ${data.length} items`);
        this.currentStep = 1;
      });
    },
    fetchOne(sha) {
      //date 传入形式为 2016-11-21 其中该日期为 +8:00
      //begin loading
      let loadingInstance = this.$loading(this.loadingOptions);
      let date = this.localeDate(this.date);
      this.$http.get(`${this.ajaxUrlPrefix}/commits/${date}/${sha}`).then((response) => {
        //end loading
        loadingInstance.close();

        let data = response.body;
        this.addUrlPrefix(data);
        this.currentStep = 2;
      });
    },
    goTo() {
      this.dialogVisible = false;
      setTimeout(() => {
        window.open(this.currentTopicLink, '_blank');
      }, 500);
    },
    localeDate(date) {
      let tmpDate = new Date(date);
      let year = tmpDate.getFullYear();
      let month = tmpDate.getMonth() + 1;
      let day = tmpDate.getDate();

      month = (month < 10) ? '0' + month : month;
      day = (day < 10) ? '0' + day : day;

      return year + '-' + month + '-' + day;
    },
    addUrlPrefix(data) {
      this.tableData = data.map(val => {
        //处理 description中 img 的 src，bbs 主站图片统一加上 prefix http://bbs.byr.cn
        let beautifyPrefix = (description) => {
          let parser = new DOMParser();
          let doc = parser.parseFromString(description, 'text/html');
          let imgs = doc.querySelectorAll('img');
          imgs = [].slice.call(imgs);
          imgs.map(img => {
            let src = img.getAttribute('src');
            if(src.indexOf('http') === -1){
              img.setAttribute('src', 'http://bbs.byr.cn' + src);
            }
          });
          return doc.body.innerHTML;
        };
        val.description = beautifyPrefix(val.description);
        return val;
      });
    },
    showTopicDetail(row) {
      this.currentTopicHtml = row.description;
      this.currentTopicTitle = row.title;
      this.currentTopicLink = row.link;
      this.dialogVisible = true;
      this.currentStep = 3;
    },
    handleCommitChange(row) {
      if(row.sha){
        this.fetchOne(row.sha);
      }
    },
    handleStepChange(step) {
      if(step < this.currentStep){
        this.currentStep = step;
      }
    },
    beaMsg(row) {
      let val = row.commit.message;
      return val.indexOf('change') >= 0 ? new Date(val.slice(24)).toLocaleString()
                                        : new Date(val.slice(22)).toLocaleString();
    },
    beaDate(row) {
      let val = row.pubDate;
      return new Date(val).toLocaleString();
    },
    datepickerAfterEnter() {
      let input = this.$el.querySelector('input');
      input.dispatchEvent(new Event('focus'));
    },
    closeCurrentTopic() {
      this.currentStep = 2;
    },
  },
  computed: {
    processedCommitList() {
      return this.sourceCommitList.filter((item) => {
        return item.commit.message.indexOf('new') >= 0;
      }).reverse();
    },
  },
  watch: {
    date() {
      if(this.date){
        this.update();
      }else{
        this.processedCommitList.length = 0;
        this.sourceCommitList.length = 0;
      }
    }
  }
};
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  width: 100%;
  height: 100%;
}

html, body{
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}

.el-row{
  width: 100%;
  height: 100%;
}

/*mobile begin*/
@media screen and (max-width: 800px){
  .el-row .nav-vertical{
    min-width: 100px;
  }

  .el-row .nav-vertical .primary-title,
  .el-row .nav-vertical .vice-title{
    font-size: 14px;
  }

  .el-row .main{
    max-width: calc(100% - 100px);
    position: relative;
  }

  .commit-list,
  .topic-list{
    width: 96%;
    margin: 0 auto 0;
  }

  .topicpicker-mobile{
    display: block !important;
    position: absolute;
    top: 50%;
    transform: translate(0, -50%);
    width: 100%;
    z-index: 999;
    margin-top: 0;
  }

  .topicpicker{
    display: none;
  }

  .el-dialog--small{
    width: 80%;
  }
}
/*mobile end*/

.el-row .nav-vertical{
  height: 100%;
  background: #1F2D3D;
  position: relative;
  /*background: #fff;*/
}

.el-row .main{
  position: relative;
  height: 100%;
  box-sizing: border-box;
  overflow-y: hidden;
}

.el-row .primary-title{
  font-size: 20px;
  color: #FFFFFF;
}

.el-row .vice-title{
  font-size: 16px;
  color: #FFFFFF;
}

.el-row .steps{
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  cursor: pointer;
}

.bg {
  position: absolute;
  width: 100%;
  height: 100%;
  /*background: url(./assets/bg.png);*/
  background-size: cover;
  /*filter: blur(5px);*/
  background-color: #F2F2F2;
  /*background-color: #324057;*/
}

/*datepicker transition*/
.datepicker{
  position: absolute;
  top: 50%;
  margin-top: -144px;
  transform: translate(0, -50%);
  width: 100%;
  z-index: 999;
  /*margin-top: 0;*/
}

.datepicker input{
  cursor: pointer;
}

.datepicker-enter{
  opacity: 0;
  margin-top: 100px;
  /*margin-top: 0;*/
  transition: all 1s;
}

.datepicker-leave-active{
  /*margin-top: -100px;*/
  margin-top: -200px;
  opacity: 0;
}

.datepicker-enter-active,
.datepicker-leave-active{
  transition: all 1s;
}

/*commitpicker transition*/
.commitpicker{
  position: absolute;
  top: 50%;
  transform: translate(0, -50%);
  width: 100%;
  z-index: 999;
  margin-top: 0;
  /*transition: all 1s;*/
  /*transition: all 1s ease-in-out;*/
}

.commitpicker-enter{
  opacity: 0;
  margin-top: 200px;
  transition: all 1s;
}

.commitpicker-leave-active{
  margin-top: -200px;
  opacity: 0;
}

.commitpicker-enter-active,
.commitpicker-leave-active{
  transition: all 1s;
}

/*topicpicker transition*/
.topicpicker{
  position: absolute;
  top: 50%;
  transform: translate(0, -50%);
  width: 100%;
  z-index: 999;
  margin-top: 0;
  /*transition: all 1s;*/
  /*transition: all 1s ease-in-out;*/
}

.topicpicker-enter{
  opacity: 0;
  margin-top: 400px;
  transition: all 3s;
}

.topicpicker-leave-active{
  margin-top: -200px;
  opacity: 0;
}

.topicpicker-enter-active,
.topicpicker-leave-active{
  transition: all 1s;
}

.commit-list,
.topic-list{
  /*text-align: left;*/
  /*padding-left: 25px;*/
  /*margin-top: 30px;*/
  /*width: 250px;*/
  width: 80%;
  margin: 0 auto 0;
}

.markdown{
  white-space: normal;
}

/*element ui begin*/
.el-date-editor{
  width: 254px;
}

.nav-vertical .steps .el-step__title.is-process{
  color: #13ce66
}

.nav-vertical .steps .el-step__head.is-process{
  background-color: #13ce66;
  border: #13ce66;
}

.nav-vertical .steps .is-process .el-step__line.is-vertical{

}

.nav-vertical .steps .el-step__title.is-wait{

}

.nav-vertical .steps .el-step__head.is-wait{

}

.el-dialog__wrapper{
  left: 6.2%;
}

.el-dialog__header,
.el-dialog__body{
  text-align: left;
}

.el-table .is-center{
  cursor: pointer;
}
/*element ui end*/

img {
  max-width: 100%;
}
</style>
