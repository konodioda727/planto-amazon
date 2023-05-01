<!--
 描述: 销量趋势图表统计：商品、商家、地区
 作者: Jack Chen
 日期: 2021-04-28
-->

<template>
  <div class="com-container">
    <div class="title" :style="comStyle">
      <span>{{ "▎ " + showTitle }}</span>
      <span
        class="iconfont icon-arrow-down title-icon"
        :style="comStyle"
        @click="showChoice = !showChoice"
      ></span>
      <div class="select-con" v-show="showChoice" :style="marginStyle">
        <div
          class="select-item"
          v-for="item in selectTypes"
          :key="item.key"
          @click="handleSelect(item.key)"
        >
          {{ item.text }}
        </div>
      </div>
    </div>
    <div class="com-chart" ref="trend_ref"></div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { getThemeValue } from "@/utils/theme_utils";
export default {
  data() {
    return {
      myChart: null,
      allData: null,
      showChoice: false, // 是否显示可选项
      choiceType: "map", // 显示数据类型
      titleFontSize: 0, // 指明标题字体大小
    };
  },
  created() {
  },
  mounted() {
    // 在组件创建完成之后，进行回调函数的注册
    this.$socket.registerCallBack("trendData", this.getData);
    this.initChart();
    // this.getData();
    // 发送数据给服务端，告诉服务端，前端现在需要数据
    this.$socket.send({
      action: "getData",
      socketType: "trendData",
      chartName: "trend",
      value: ""
    })
    window.addEventListener("resize", this.screenAdapter);
    this.screenAdapter();
  },
  destroyed() {
    window.removeEventListener("resize", this.screenAdapter);
    // 在组件销毁时，进行回调函数取消
    this.$socket.unRegisterCallBack("trendData");
  },
  computed: {
    ...mapState(["theme"]),
    selectTypes() {
      if (!this.allData) {
        return [];
      } else {
        return this.allData.type.filter((item) => {
          return item.key !== this.choiceType;
        });
      }
    },
    showTitle() {
      if (!this.allData) {
        return "";
      } else {
        return this.allData[this.choiceType].title;
      }
    },
    // 设置给标题的样式
    comStyle() {
      return {
        fontSize: this.titleFontSize + "px",
        color: getThemeValue(this.theme).labelColor
      };
    },
    marginStyle() {
      return {
        marginLeft: this.titleFontSize + "px",
        backgroundColor: getThemeValue(this.theme).bgColor
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
      this.myChart = this.$echarts.init(this.$refs.trend_ref, this.theme);
      const initOption = {
        grid: {
          left: "3%",
          top: "30%",
          right: "4%",
          bottom: "1%",
          containLabel: true,
        },
        backgroundColor: getThemeValue(this.theme).bgColor,
        tooltip: {
          trigger: "axis",
        },
        legend: {
          left: 20,
          top: "15%",
          icon: "circle",
          data:['2022','2021']
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
        },
        yAxis: {
          type: "value",
        },
      };
      this.myChart.setOption(initOption);
    },
    // 参数ret就是服务端发送给客户端的图表数据
    getData(ret) {
      // const { data: ret } = await this.$http.get("trend");
      this.allData = ret;
      this.updateChart();
    },
    updateChart() {
      // 半透明颜色值
      const colorArr1 = [
        "rgba(73, 146, 255, .5)",
        "rgba(124, 255, 178, .5)",
        "rgba(253, 221, 96, .5)",
        "rgba(255, 110, 118, .5)",
        "rgba(88, 217, 249, .5)",
      ];
      // 全透明颜色值
      const colorArr2 = [
        "rgba(73, 146, 255, 0)",
        "rgba(124, 255, 178, 0)",
        "rgba(253, 221, 96, 0)",
        "rgba(255, 110, 118, 0)",
        "rgba(88, 217, 249, 0)",
      ];
      // 类目轴数据
      const timeArr =['美国','日本','德国','英国','印度','意大利','法国','加拿大','西班牙','巴西','墨西哥','澳大利亚','土耳其','荷兰','阿联酋','埃及','波兰','瑞典','沙特阿拉伯','新加坡'];
      // y轴数据 series下的数据
      // console.log('allData',this.allData);
      // const valueArr = this.allData[this.choiceType].data;
      const vD = [{name:'2022',data:[2894.0,641.0,548.0,474.0,335.5,229.0,212.0,203.0,178.0,101.5,95.7,44.8,32.0,27.2,20.8,8.3,11.6,17.9,20.8,5.1]},
      {name:'2021',data:[2700.0,623.7,500.4,428.2,325.2,211.1,201.9,193.4,170.2,168.6,113.9,63.1,41.0,26.5,23.0,20.2,18.7,16.6,15.6,8.3]}]
      const seriesArr = vD.map((item, index) => {
        // console.log('data',valueArr);
        return {
          name: item.name,
          type: "line",
          data: item.data,
          smooth: true,
          stack: "map",
          areaStyle: {
            color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: colorArr1[index],
              },
              {
                offset: 1,
                color: colorArr2[index],
              },
            ]),
          },
        };
      });
      // 图例数据
      // const legendArr = valueArr.map((item) => {
      //   return item.name;
      // });
      const dataOption = {
        xAxis: {
          data: timeArr,
          axisLabel : {//坐标轴刻度标签的相关设置。
          interval:0,
          // rotate:45,
          formatter : function(params){
             var newParamsName = "";// 最终拼接成的字符串
                      var paramsNameNumber = params.length;// 实际标签的个数
                      var provideNumber = 1;// 每行能显示的字的个数
                      var rowNumber = Math.ceil(paramsNameNumber / provideNumber);// 换行的话，需要显示几行，向上取整
                      /**
                       * 判断标签的个数是否大于规定的个数， 如果大于，则进行换行处理 如果不大于，即等于或小于，就返回原标签
                       */
                      // 条件等同于rowNumber>1
                      if (paramsNameNumber > provideNumber) {
                          /** 循环每一行,p表示行 */
                          for (var p = 0; p < rowNumber; p++) {
                              var tempStr = "";// 表示每一次截取的字符串
                              var start = p * provideNumber;// 开始截取的位置
                              var end = start + provideNumber;// 结束截取的位置
                              // 此处特殊处理最后一行的索引值
                              if (p === rowNumber - 1) {
                                  // 最后一次不换行
                                  tempStr = params.substring(start, paramsNameNumber);
                              } else {
                                  // 每一次拼接字符串并换行
                                  tempStr = params.substring(start, end) + "\n";
                              }
                              newParamsName += tempStr;// 最终拼成的字符串
                          }

                      } else {
                          // 将旧标签的值赋给新标签
                          newParamsName = params;
                      }
                      //将最终的字符串返回
                      return newParamsName
          }}
        },
        legend: {
          data:['2022','2021']
        },
        series: seriesArr,
      };
      this.myChart.setOption(dataOption);
    },
    screenAdapter() {
      this.titleFontSize = (this.$refs.trend_ref.offsetWidth / 100) * 3.6;
      const adapterOption = {
        legend: {
          itemWidth: this.titleFontSize,
          itemHeight: this.titleFontSize,
          itemGap: this.titleFontSize,
          textStyle: {
            fontSize: this.titleFontSize / 2,
          },
          data:['2022','2021'],
        },
      };
      this.myChart.setOption(adapterOption);
      this.myChart.resize();
    },
    handleSelect(curType) {
      this.choiceType = curType;
      this.updateChart();
      this.showChoice = false;
    },
  },
};
</script>

<style lang="less" scoped>
.title {
  position: absolute;
  left: 20px;
  top: 20px;
  z-index: 999;
  .title-icon {
    margin-left: 10px;
    cursor: pointer;
  }
  // .select-con {
  //   background-color: #100c2a;
  // }
}
</style>