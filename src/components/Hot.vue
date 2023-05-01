
<template>
  <div class="com-container">
    <div class="com-chart" ref="hot_ref"></div>
    <span class="iconfont arr-left" @click="toLeft" :style="comStyle"
      >&#xe6ef;</span
    >
    <span class="iconfont arr-right" @click="toRight" :style="comStyle"
      >&#xe6ed;</span
    >
    <!-- new -->
    
    <span class="cat-name" :style="comStyle" @click="ChangeSelected">{{ catName }}</span>
  </div>
</template>

<script>
import axios from 'axios'
import { mapState } from "vuex";
import { getThemeValue } from "@/utils/theme_utils";
export default {
  data() {
    return {
      myChart: null,
      allData: null,
      curIndex: 0, // 当前所展示出的一级分类数据
      titleFontSize: 0,
      FormScore:true,
      DataType:['score','star_num'],
      queryList: ['arts-crafts','Industrial','appliances','hpc','automotive','office-products','pet-supplies','lawn-garden','kitchen']
    };
  },
  created() {
  },
  mounted() {
    this.initChart();
    this.getData();
    window.addEventListener("resize", this.screenAdapter);
    this.screenAdapter();
  },
  destroyed() {
    window.removeEventListener("resize", this.screenAdapter);
    this.$socket.unRegisterCallBack("hotData");
  },
  computed: {
    ...mapState(["theme"]),
    catName() {
      let addition = '';
      this.FormScore? addition = 'score': addition = 'star_num'
      if (!this.allData) {
        return "";
      } else {
        return this.allData[0].CategoryInUrl+'\n--'+addition;
      }
    },
    
    // 设置给标题的样式
    comStyle() {
      return {
        fontSize: this.titleFontSize + "px",
        color: getThemeValue(this.theme).labelColor
      };
    },
  },
  watch: {
    theme() {
      this.myChart.dispose(); // 销毁当前的图表
      this.initChart(); // 重新以最新的主题名称初始化图表对象
      this.screenAdapter(); // 完成屏幕适配
      this.updateChart(); // 更新图表展示
    },
  },
  methods: {
    
    initChart() {
      this.myChart = this.$echarts.init(this.$refs.hot_ref, this.theme);
      const initOption = {
        title: {
          text: "▎ 各类商品平均评分及获赞总数统计",
          left: 20,
          top: 20,
        },
        legend: {
          top: "12%",
          icon: "circle",
          type: 'scroll'
        },
        toolbox: {
          show: true,
          feature: {
            mark: { show: true },
            dataView: { show: true, readOnly: false },
            restore: { show: true },
            saveAsImage: { show: true }
          }
        },
        backgroundColor: getThemeValue(this.theme).bgColor,
        tooltip: {
          show: true,
          
        },
        series: [
          {
            type: "pie",
            radius: [20, 140],
            center: ['25%', '50%'],
            roseType: 'radius',
            label: {
              show: false,
            },
            emphasis: {
              label: {
                show: true,
              },
              labelLine: {
                show: false,
              },
            },
          },
        ],
      };
      this.myChart.setOption(initOption);
    },
    getData() {
      // const { data: ret } = await this.$http.get("hotproduct");
      axios.get(`http://118.31.54.166:2333/api/v1/parse/categories`,{
      params:{
        category_in_url:this.queryList[this.curIndex],
        rank:"star_num"
      }
    }).then((res)=>{
      console.log('back',res.data.data.data);
      this.allData = res.data.data.data
      this.updateChart();
    })
      
    },
    updateChart() {
      // console.log('allData',this.allData);
      
      const legendData = this.allData.map((item) => {
        return item.SelectedCategory;
      });
      
      const seriesData = this.allData.map((item) => {
        let cat = '';
        if(this.FormScore)
        cat = item.Score
        else 
        cat = item.StarNum
        return {
          name: item.SelectedCategory,
          value: cat,
          // children: item.children,
        };
      });
      const dataOption = {
        legend: {
          data: legendData,
        },
        series: [
          {
            data: seriesData,
          },
        ],
      };
      this.myChart.setOption(dataOption);
    },
    screenAdapter() {
      this.titleFontSize = (this.$refs.hot_ref.offsetWidth / 100) * 3.6;
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: this.titleFontSize,
          },
        },
        legend: {
          itemWidth: this.titleFontSize,
          itemHeight: this.titleFontSize,
          itemGap: this.titleFontSize / 2,
          textStyle: {
            fontSize: this.titleFontSize / 2,
          },
        },
        series: [
          {
            radius: this.titleFontSize * 4,
            center: ["50%", "50%"],
          },
        ],
      };
      this.myChart.setOption(adapterOption);
      this.myChart.resize();
    },
    toLeft() {
      this.curIndex--;
      if (this.curIndex < 0) {
        this.curIndex = this.queryList.length - 1;
      }
      this.getData()
    },
    toRight() {
      this.curIndex++;
      if (this.curIndex > this.queryList.length - 1) {
        this.curIndex = 0;
      }
      this.getData()
    },
    ChangeSelected() {
      this.FormScore = !this.FormScore
      // console.log('score',this.FormScore);
      this.updateChart()
    }
  },
};
</script>
<style lang="less" scoped>
.arr-left {
  position: absolute;
  left: 10%;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
}
.arr-right {
  position: absolute;
  right: 10%;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
}
.cat-name {
  cursor: pointer;
  position: absolute;
  left: 80%;
  bottom: 5%;
}
</style>