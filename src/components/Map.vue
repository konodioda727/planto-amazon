<!--
 描述: 商家地图分布图表
 作者: Jack Chen
 日期: 2021-04-28
-->
<!-- allData 包含三种会员 allData.children  name:string , value: [113.01, 123.23] -->

<template>
  <div class="com-container">
    <div @click="revertMap" class="back" :style="btnStyle" v-if="BackShow">
      返回
    </div>
    <div class="com-chart"  ref="map_ref" @click = "handleClick"></div>
    <div class="legend">
    <div v-for="(item, index) in legend" :key="index" class="legend-item">
      <span :style="{backgroundColor: item.color}" class="legend-marker"></span>
      <span class="legend-text">{{ item.name }}</span>
    </div>
  </div>
  </div>
</template>
<script src="https://cdn.jsdelivr.net/npm/echarts/map/js/world.js"></script>
<script>
import axios from "axios";
import { mapState } from "vuex";
import { getThemeValue } from "@/utils/theme_utils";
export default {
  data() {
    return {
      myChart: null,
      allData: null,
      mapData: {},
      countryList: ['United States','India','Australia'],
      titleFontSize: 0,
      BackShow: false,
      country:'world',
      arrObject:[],
      legendData: [{name:'密集',color:'#E8821C'},{name:'稀疏',color:'#E5DD45'},{name:'新增',color:'#4FF778'}]
    };
  },
  created() {
  },
  mounted() {
    // 在组件创建完成之后，进行回调函数的注册
    this.$socket.registerCallBack("mapData", this.getData);
    this.initChart();
    // this.getData();
    this.$socket.send({
      action: "getData",
      socketType: "mapData",
      chartName: "map",
      value: ""
    })
    window.addEventListener("resize", this.screenAdapter);
    this.screenAdapter();
  },
  destroyed() {
    window.removeEventListener("resize", this.screenAdapter);
    this.$socket.unRegisterCallBack("mapData");
  },
  computed: {
    ...mapState(["theme"]),
    btnStyle() {
      return {
        fontSize: this.titleFontSize / 2 + "px",
        color: getThemeValue(this.theme).labelColor
      };
    },
    legend() {
      return this.legendData.map((item, index) => {
        return {
          name: item.name,
          color: item.color || `hsl(${(360 / this.legendData.length) * index}, 70%, 50%)`
        };
      });
    }
  },
  watch: {
    theme() {
      this.myChart.dispose(); // 销毁当前的图表
      this.initChart(); // 重新以最新的主题名称初始化图表对象
      this.screenAdapter(); // 完成屏幕适配
      // this.updateChart(); // 更新图表展示
    },
  },
  methods: {
    MapMap(arr) {
      arr[0].map((item) => {
        this.arrObject.push({name:item,itemStyle: {areaColor: '#E8821C'},label: {
                show: true, // 显示标签
                color: '#fff', // 设置标签文字颜色
              },})
      })
      if(arr[1])
      arr[1].map((item) => {
        this.arrObject.push({name:item,itemStyle: {areaColor: '#4FF778'},label: {
                show: true, // 显示标签
                color: '#fff', // 设置标签文字颜色
              },})
      })
      if(arr[2])
      arr[2].map((item) => {
        this.arrObject.push({name:item,itemStyle: {areaColor: '#E5DD45'},label: {
                show: true, // 显示标签
                color: '#fff', // 设置标签文字颜色
              },})
      })
    },
    async initChart() {
      console.log('init',this.country);
      this.myChart = this.$echarts.init(this.$refs.map_ref, this.theme);
      const arr_World = [['USA', 'Brazil', 'Japan','Mexico','Egypt','Turkey','SA', 'India','Sweden','Australia','UK','PL','BE','FR',"IT",'ES'],
                            ['Nigeria','South Africa','Colombia','Chile'],
                            ['Canada']]
      const arr_India = [['Maharashtra','Karnataka','Delhi','Tamil Nadu'],,
                        ['Telangana','Gujarat','Uttar Pradesh','West Bengal']]
      const arr_USA = [["Washington",'New York','California','Illinois'],,
                      ['Texas','Georgia','Massachusetts','Florida','Tennessee']]
      const arr_Australia = [['New South Wales','Victoria', ''],['Western Australia','South Australia','Tasmania','Northern Territory'],
                            ['Queensland',]]
      
      switch (this.country) {
        case 'world':
          this.BackShow = false
          this.MapMap(arr_World)
          break;
        case 'India':
          this.MapMap(arr_India)
          break;
        case 'Australia':
          this.MapMap(arr_Australia)
          break;
        case 'USA':
          this.MapMap(arr_USA)
          break;
        default:
          break;
      }
      // console.log(arrObject);
      // 获取中国地图的矢量数据
      // 由于我们现在获取的地图矢量数据并不是从后端返回，所以不能使用this.$http
      
      const { data: ret } = await axios.get(
        `//${location.host}/static/map/world/${this.country}.json`
      );
      // console.log(ret);
      this.$echarts.registerMap("world", ret);
      const initOption = {
        title: {
          text: "▎ 站点分布",
          left: 20,
          top: 20,
        },
        series: {
            type: 'map',
            top:"10%",
            bottom:"5%",
            map: 'world',
            nameMap: {
              'Poland':'PL',
              'United Kingdom' : 'UK',
              'Italy':'IT',
              'France': 'FR',
              'Belgium': 'BE',
              'Spain':'ES',
              'Saudi Arabia':'SA',
              'United States': 'USA',
            },
            data: this.arrObject,
            itemStyle: {
              normal: {
                areaColor: '#5052EE',
                color: '#00ff00', // 设置颜色
              }
            },
            emphasis: {
              label: {
                show: true, // 显示标签
                color: '#fff', // 设置标签文字颜色
              },
            },
            
          },
      
        backgroundColor: getThemeValue(this.theme).bgColor,
        
      };
      this.myChart.setOption(initOption);
      this.myChart.on("click", async (arg) => {
        this.country = arg.name;
      
      });
      // this.in
    },
    handleClick() {
      // console.log('outside',this.country);
      if(this.country != 'world')
        this.BackShow = true
      this.initChart()
    },
    screenAdapter() {
      this.titleFontSize = (this.$refs.map_ref.offsetWidth / 100) * 3.6;
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: this.titleFontSize,
          },
        },
        legend: {
          itemWidth: this.titleFontSize / 2,
          itemHeight: this.titleFontSize / 2,
          textStyle: {
            fontSize: this.titleFontSize / 2,
          },
          show:true,
          left: "5%",
          bottom: "5%",
          orient: "vertical",
          data:['1','2','3']
        },
      };
      this.myChart.setOption(adapterOption);
      this.myChart.resize();
    },
    // 返回中国地图
    revertMap() {
      this.isShow = false;
      this.country = 'world'
      this.initChart()
    },
  },
};
</script>

<style lang="less" scoped>
.back {
  position: absolute;
  right: 5%;
  bottom: 10px;
  z-index: 999999;
  cursor: pointer;
}
.legend {
  position: absolute;
  bottom:10px;
  left:10px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-right: 10px;
}

.legend-marker {
  display: inline-block;
  width: 10px;
  height: 10px;
  margin-right: 5px;
}

.legend-text {
  font-size: 14px;
}
</style>