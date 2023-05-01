<!--
 描述: 销售排行图表统计
 作者: Jack Chen
 日期: 2021-04-28
-->

<template>
  <div class="com-container">
    <div class="com-chart" ref="rank_ref"></div>
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
      startValue: 0, // 区域缩放的起点值
      endValue: 9, // 区域缩放的终点值
      timer: null, // 定时器的标识
      y1data: [2894.0,641.0,548.0,474.0,335.5,229.0,212.0,203.0,178.0,101.5,95.7,44.8,32.0,27.2,20.8,8.3,11.6,17.9,20.8,5.1],
      y2data: [2700.0,623.7,500.4,428.2,325.2,211.1,201.9,193.4,170.2,168.6,113.9,63.1,41.0,26.5,23.0,20.2,18.7,16.6,15.6,8.3],
      xdata: ['美国','日本','德国','英国','印度','意大利','法国','加拿大','西班牙','巴西','墨西哥','澳大利亚','土耳其','荷兰','阿联酋','埃及','波兰','瑞典','沙特阿拉伯','新加坡']
    };
  },
  created() {
  },
  mounted() {
    // 在组件创建完成之后，进行回调函数的注册
    this.$socket.registerCallBack("rankData", this.getData);
    this.initChart();
    // this.getData();
    this.$socket.send({
      action: "getData",
      socketType: "rankData",
      chartName: "rank",
      value: ""
    })
    window.addEventListener("resize", this.screenAdapter);
    this.screenAdapter();
  },
  destroyed() {
    clearInterval(this.timer);
    window.removeEventListener("resize", this.screenAdapter);
    this.$socket.unRegisterCallBack("rankData");
  },
  computed: {
    ...mapState(["theme"]),
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
      this.myChart = this.$echarts.init(this.$refs.rank_ref, this.theme);
      const initOption = {
        title: {
          text: "▎ 各站点访问量（单位：百万）",
          left: 20,
          top: 20,
        },
        grid: {
          top: "40%",
          left: "5%",
          right: "5%",
          bottom: "5%",
          containLabel: true,
        },
        backgroundColor: getThemeValue(this.theme).bgColor,
        tooltip: {
          trigger: "axis",
        },
        legend: {
          data:['2022年12月','2021年12月']
        },
        xAxis: {
          type: "category",
          data: this.xdata
        },
        yAxis: {
          // type: "value",
          
        },
        series: [
          {
            name:'2021年12月',
            type: "bar",
            
            data:this.y1data
          },
          {
            name:'2022年12月',
            type: "bar",
           
            data: this.y2data
          },
        ],
      };
      this.myChart.setOption(initOption);
      this.myChart.on("mouseover", () => {
        clearInterval(this.timer);
      });
      this.myChart.on("mouseout", () => {
        this.startInterval();
      });
    },
    getData(ret) {
      // const { data: ret } = await this.$http.get("rank");
      // console.log(ret);
      this.allData = ret;
      this.allData.sort((a, b) => {
        return b.value - a.value;
      });
      this.updateChart();
      this.startInterval();
    },
    updateChart() {
      const colorArr = [
        ["#0BA82C", "#4FF778"],
        ["#2E728F", "#23E5E5"],
        ["#5052EE", "#AB6EE5"],
      ];
      // 所有省份形成的数组
      const provinceArr = this.xdata
      // 所有省份对应的销售金额
      // const valueArr = this.allData.map((item) => {
      //   return item.value;
      // });
      const dataOption = {
        dataZoom: {
          show: false,
          startValue: this.startValue,
          endValue: this.endValue,
        },
        xAxis: {
          data: provinceArr,
          axisLabel : {//坐标轴刻度标签的相关设置。
          interval:0,
          // rotate:45,
          formatter : function(params){
             var newParamsName = "";// 最终拼接成的字符串
                      var paramsNameNumber = params.length;// 实际标签的个数
                      var provideNumber = 2;// 每行能显示的字的个数
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
          data:['2022年12月','2021年12月']
        },
        series: [
          {
            data: this.y1data,
            itemStyle: {
              color: (arg) => {
                let targetColorArr = null;
                if (arg.value > 200) {
                  targetColorArr = colorArr[0];
                } else if (arg.value > 100) {
                  targetColorArr = colorArr[1];
                } else {
                  targetColorArr = colorArr[2];
                }
                return new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    color: targetColorArr[0],
                  },
                  {
                    offset: 1,
                    color: targetColorArr[1],
                  },
                ]);
              },
            },
          },{
            data: this.y2data,
            itemStyle: {
              color: (arg) => {
                let targetColorArr = null;
                if (arg.value > 200) {
                  targetColorArr = colorArr[2];
                } else if (arg.value > 100) {
                  targetColorArr = colorArr[1];
                } else {
                  targetColorArr = colorArr[0];
                }
                return new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    color: targetColorArr[0],
                  },
                  {
                    offset: 1,
                    color: targetColorArr[1],
                  },
                ]);
              },
            },
          },
        ],
      }
      this.myChart.setOption(dataOption);
    },
    screenAdapter() {
      const titleFontSize = (this.$refs.rank_ref.offsetWidth / 100) * 3.6;
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize,
          },
        },
        legend: {
          data:['2022年12月','2021年12月']
        },
        series: [
          {
            barWidth: titleFontSize,
            itemStyle: {
              borderRadius: [titleFontSize / 2, titleFontSize / 2, 0, 0],
            },
          },{
            barWidth: titleFontSize,
            itemStyle: {
              borderRadius: [titleFontSize / 2, titleFontSize / 2, 0, 0],
            },
          },
        ],
      };
      this.myChart.setOption(adapterOption);
      this.myChart.resize();
    },
    startInterval() {
      if (this.timer) {
        clearInterval(this.timer);
      }

      this.timer = setInterval(() => {
        this.startValue++;
        this.endValue++;
        if (this.endValue > this.allData.length - 1) {
          this.startValue = 0;
          this.endValue = 9;
        }
        this.updateChart();
      }, 2000);
    },
  },
};
</script>

<style lang="less" scoped>
</style>