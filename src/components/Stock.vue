<!--
 描述: 库存销量分析图表统计
 作者: Jack Chen
 日期: 2021-04-28
-->

<template>
  <div class="com-container">
    <div class="modal" v-if="showModals" ref = 'modal'>
      <ul class="infoList">
        <li v-for="item,index in products" :key = "index"  class="infoListItem"><div @click="GetInfo" class="content">{{ item }}</div> </li>
      </ul>
      <div class="infoBox">
        <div class="loadBox" v-if="!LoadingShow">
          {{ infoDetail }}
        </div>
        <Loading v-if="LoadingShow"/>
      </div>
      <div class="card " :class = "{ animation: isAnimation }">
        <div class="front">
            <p>{{ frontText}}</p>
        </div>
        <div class="back">
            <p>{{ backText }}</p>
        </div>
    </div>

    </div>
    <div class="mask" v-if="showModals"  @click="hideModal" ></div>
    <div class="com-chart" ref="stock_ref" @click="showModal"></div>
  </div>
</template>

<script>
import axios from 'axios'
import { mapState } from "vuex";
import { getThemeValue } from "@/utils/theme_utils";
import { eventBus } from '../router';
import Loading from './Loading.vue'
export default {
  components: {
    Loading
  },
  data() {
    return {
      myChart: null,
      allData: [],
      curIndex: 0, // 当前显示的页数
      timer: null,
      showModals: false,
      products: '',
      list: [],
      infoDetail: '',
      selectedUrl:'',
      queryObj: ['Bright Paintbrushes','Angled Paintbrushes','Etching Materials','Pointed-Round Paintbrushes',
                  'Paintbrush Sets','Letterer Paintbrushes','Palettes','Filbert Paintbrushes','Foam Paintbrushes','Square-Wash Paintbrushes',
                'Palette Knives','Quill Paintbrushes','Script Paintbrushes','Mop Paintbrushes'],
      infoDetailTranslated: 'translated',
      obj:{},
      urls:[],
      isAnimation: false,
      LoadingShow: false,
      LoadingShowDetail: false,
      frontText: "",
      backText: '',
      selectedNum:0,
      PreparedText: ['来自GPT的解析：\n\n\n这是一个数据对象，包含有关在Amazon.com上找到的一支艺术画笔的信息。这支画笔是一支角度为5号的画笔，可用于丙烯、油画、水彩和面部彩绘。这支画笔有一个长柄，可以用作替换画笔。这支画笔的品牌是Santa Fe Art Supply。数据对象还包含有关画笔类别和类别路径的信息，以及在Amazon.com上销售该产品的卖家的图像。该对象还包含标记，指示该产品是否可供购买，是否已添加到购物车以及该产品是否有可用的优惠券。',
      '来自GPT的解析：\n\n\n该商品是一支Isabey品牌的艺术水彩画笔，型号为Cat Tongue，大小为4，使用天然西伯利亚蓝松鼠毛制作，具有优异的耐水性能，适用于绘制细节和曲线等需要精细控制的部分。笔柄光滑且采用天然木材制作，外观自然，具有良好的手感。该商品在美国亚马逊上销售，当前暂时缺货，无法购买。',
      "来自GPT的解析：\n\n\n这是一款在亚马逊上售卖的画笔，品牌为Loew-Cornell，型号为4250A-12 Angular Flat，适用于美术绘画。此画笔采用长柄斜刷设计，笔头为角度形，可用于绘制直线、斜线、曲线等不同线条。其尺寸为1英寸，适合于使用丙烯和水彩等颜料。该商品页面提供了商品链接、商品基础链接、商品标题、商品分类、品牌、商品图片、库存状态、商品重量、商品体积、商品排名、商品评论等详细信息。商品页面还提供了商品特点、商品反馈、商品评分等信息。其中，商品特点包括：角度形笔头、Taklon 毛刷、木质长柄、尺寸为1英寸、适用于丙烯和水彩等颜料；商品反馈包括“是否告诉我们更低的价格”和“登录”；商品评分包括5分制评分，以及按评分分布划分的评分百分比。此外，该产品页面还提供了一些相关商品的信息。该商品当前不可用，库存状态为“Currently unavailable. We don't know when or if this item will be back in stock.”，意味着该商品已售罄，暂时无法购买。商品页面中提供了一些与该商品相似的商品的信息供顾客参考。",
      "来自GPT的解析：\n\n\n这个商品是Mr. Pen的调色板纸，尺寸为9英寸 x 12英寸，一共有40张，适用于各种绘画颜料，包括丙烯、水彩、油画、粉彩等。纸张表面涂有聚合物涂层，可以轻松地用作一次性调色板，减少清理的麻烦。这个调色板纸适用于各种水平的艺术家，包括初学者、中级艺术家和专业人士。它的良好质量和易于使用的优点也受到了家长、艺术学生、老师和教练的欢迎。"
    ]
    };
  },
  created() {
    // console.log('list',this.list);
  },
  mounted() {
    // 在组件创建完成之后，进行回调函数的注册
    
    // this.getData(0)
    this.$socket.registerCallBack("stockData", this.getData);
    this.initChart();
    this.$socket.send({
      action: "getData",
      socketType: "stockData",
      chartName: "stock",
      value: ""
    })
    window.addEventListener("resize", this.screenAdapter);
    this.screenAdapter();
  },
  destroyed() {
    clearInterval(this.timer);
    window.removeEventListener("resize", this.screenAdapter);
    this.$socket.unRegisterCallBack("stockData");
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
    showModal() {
      const titleFontSize = this.$refs.stock_ref.offsetWidth / 100 * 3.6;
      // console.log(titleFontSize);
      if(titleFontSize > 20)
      this.showModals = true;
    },
    hideModal() {
      this.showModals = false;
    },
    async GetInfo(e) {
      // console.log('inner',e.target.innerHTML);
      switch (e.target.innerHTML) {
        case 'https://www.amazon.com/dp/B0059558OO':
          // console.log('selected');
          this.selectedNum = 1;
          break;
        case 'https://www.amazon.com/dp/B00486U6OC':
          // console.log('selected');
          this.selectedNum = 2;
          break;
        case 'https://www.amazon.com/dp/B09JCP9VRW':
          // console.log('selected');
          this.selectedNum = 3;
          break;
        default:
          this.selectedNum = 0;
          break;
      }
      this.LoadingShow = true
      setTimeout(() => {
        this.LoadingShow = false
        this.frontText = '等待GPT的回应中...'
        this.backText = 'Waiting...'
        this.isAnimation = true
        let timer = setInterval(() => {
          this.isAnimation = !this.isAnimation;
        }, 1600);
        setTimeout(() => {
        clearInterval(timer)
        this.frontText = this.PreparedText[this.selectedNum]
        this.backText = this.PreparedText[this.selectedNum]
      }, 5000);
      }, 2000);
      
      this.infoDetail = await axios.get(('http://118.31.54.166:2333/api/v1/parse/content'),{
        params: {
          url:e.target.innerHTML
        }
      }).then((res)=>{
        // console.log(res.data.data);
        return res.data.data
      })
    },
    initChart() {
      this.myChart = this.$echarts.init(this.$refs.stock_ref, this.theme);
      const initOption = {
        title: {
          text: '▎ 各商品分析',
          left: 20,
          top: 20
        },
        backgroundColor: getThemeValue(this.theme).bgColor,
      };
      // this.getData()
      this.myChart.setOption(initOption);
      this.myChart.on('mouseover', (e) => {
        // console.log('over');
        this.products = e.name
        clearInterval(this.timer);
      })
      this.myChart.on('mouseout', () => {
        this.startInterval();
      })
      this.myChart.on('click', (e) => {
        this.products = this.urls[this.queryObj.indexOf(e.name)]
        console.log(this.urls[this.queryObj.indexOf(e.name)]);
      })
    },
     async getData() {
      let tempArr = [],temp2Arr = []
      this.startInterval();
      for(let i = 0; i< this.queryObj.length; i++)
       await axios.get('http://118.31.54.166:2333/api/v1/parse/item',{
        params:{
          page:0,
          limit:15,
          category_name:this.queryObj[i]
        }
      }).then((res)=>{
        tempArr.push({name:this.queryObj[i],value:res.data.data.data.reviews_num})
        temp2Arr.push(res.data.data.data.url)
        // console.log('temp',this.queryObj[i]);
        this.allData = [...this.allData,{name:this.queryObj[i],value:res.data.data.data.reviews_num}]
        this.urls = temp2Arr
        if(i == this.queryObj.length-1)
        eventBus.$emit('allData', tempArr);
        // this.allData = tempArr
        // this.urls = temp2Arr
        // this.updateChart();
      })
      
      this.updateChart();
    },
    updateChart() {
      
      const centerArr = [
        ["18%", "40%"],
        ["50%", "40%"],
        ["82%", "40%"],
        ["34%", "75%"],
        ["66%", "75%"],
      ];
      const colorArr = [
        ['#4FF778', '#0BA82C'],
        ['#E5DD45', '#E8B11C'],
        ['#E8821C', '#E55455'],
        ['#5052EE', '#AB6EE5'],
        ['#23E5E5', '#2E72BF'],
      ]
      const start = this.curIndex * 5;
      const end = (this.curIndex + 1) * 5;
      let data = []
      this.allData? data = this.allData: data = ['1','2','3','4','5']
      const showData = data.slice(start, end);
      // const showData = this.allData;
      const seriesArr = showData.map((item, index) => {
        // console.log('arrmap',item.name,'url',this.urls[start+index]);
        return {
          type: "pie",
          // radius: [110, 100],
          center: centerArr[index],
          avoidLabelOverlap: false,
          hoverAnimation: false, // 关闭鼠标移入到饼图时的动画效果,
          label: {
            position: 'center',
            color: colorArr[index][0]
          },
          labelLine: {
            show: false // 隐藏指示线
          },
          data: [
            {
              name: item.name ,
              value: item.value,
              itemStyle: {
                color: new this.$echarts.graphic.LinearGradient(0, 1, 0, 0, [
                  {
                    offset: 0,
                    color: colorArr[index][0]
                  },
                  {
                    offset: 1,
                    color: colorArr[index][1]
                  }
                ]),
              }
            },
            {
              name: item.name,
              value: 2000,
              itemStyle: {
                color: getThemeValue(this.theme).backgroundColor,
              }
            },
          ]
        };
      });
      const dataOption = {
        series: seriesArr,
      };
      this.myChart.setOption(dataOption);
      // console.log('update',dataOption);
    },
    screenAdapter() {
      const titleFontSize = this.$refs.stock_ref.offsetWidth / 100 * 3.6;
      const innerRadius = titleFontSize * 2.4;
      const outerRadius = innerRadius * 1.125;
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        series: [
          {
            type: 'pie',
            radius: [outerRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 2
            }
          },
          {
            type: 'pie',
            radius: [outerRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 2
            }
          },
          {
            type: 'pie',
            radius: [outerRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 2
            }
          },
          {
            type: 'pie',
            radius: [outerRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 2
            }
          },
          {
            type: 'pie',
            radius: [outerRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 2
            }
          }
        ]
      };
      this.myChart.setOption(adapterOption);
      this.myChart.resize();
    },
    startInterval() {
      if (this.timer) {
        clearInterval(this.timer);
      }
      this.timer = setInterval(() => {
        this.curIndex++;
        if (this.curIndex > this.queryObj.length/5) {
          this.curIndex = 0;
        }
        this.updateChart();
      }, 5000)
    }
  },
};
</script>

<style lang="less" scoped>
li {
  list-style: none;
}
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
  height: 60px;
}

/* 滑块样式 */
::-webkit-scrollbar-thumb {
  background-color: #808080;
  border-radius: 10px;
}

/* 滑块悬停时的样式 */
::-webkit-scrollbar-thumb:hover {
  background-color: #999;
}

/* 滑道样式 */
::-webkit-scrollbar-track {
  background-color: #f7f7f7;
  display: none;
}
.mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  // background-color: rgba(200, 200, 200, 0.8);
  z-index: 100;
  // backdrop-filter: blur(5px);
}
.modal {
  position: absolute;
  top: 55%;
  left: 50%;
  width: 90%;
  height: 76%;
  transform: translate(-50%, -50%);
  display: flex;
  backdrop-filter: blur(5px);
  background: rgba(255, 255, 255, 0.9);
  color: #000;
  padding: 20px;
  z-index: 101 !important;
  overflow: auto;
  border-radius: 40px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2), 0 4px 8px rgba(0, 0, 0, 0.2);
  .infoList {
    margin-top: 20px;
    width: 20%;
    height: 90%;
    border-radius: 5px;
    overflow: auto;
    text-align: center;
    perspective: 60px;
    border-right: 1px solid rgba(0, 0, 0, .3);
    transform-style: preserve-3d;
    &::-webkit-scrollbar {
      display: none;
    }
    .infoListItem {
      &::-webkit-scrollbar {
        display: none;
      }
      
      cursor: pointer;
      overflow: hidden;
      width: 100%;
      height: 10%;
      line-height: 40px;
      border-bottom: 1px solid rgba(0, 0, 0, .1);
      margin-top: 4px;
      border-radius: 4px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2),;
      perspective: 70px;
      // background: rgba(255, 255, 255, 0.9);
      transform-style: preserve-3d;
      .content {
        // width: 100%;
        height: 100%;
        &::-webkit-scrollbar {
          display: none;
        }
        // overflow: auto;
        &:hover {
          transform: translateX(-120px); /* hover 时向上平移 50px */
        }
        transition: transform 0.8s;
      }
      &:hover {
        animation: trans .2s ease-in-out forwards;        
      }
      @keyframes trans {
        
        100% {
          background-color: #cccccc;
        }
      }
    }
  }
  .infoBox {
    width: 30%;
    height: 85%;
    margin-left: 20px;
    margin-top: 20px;
    overflow: auto;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2), 0 4px 8px rgba(0, 0, 0, 0.2);
    background: rgba(255, 255, 255, 0.8);
    padding: 1%;
    &::-webkit-scrollbar {
        display: none;
    }
  }
  .card{
      &::-webkit-scrollbar {
        display: none;
      }
      margin-left: 20px;
      margin-top: 20px;
      position: relative;
      width: 40%;
      height: 90%;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 10px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2), 0 4px 8px rgba(0, 0, 0, 0.2);
      cursor: pointer;
      transform-style: preserve-3d;
      animation: rotate-reverse 1.2s cubic-bezier(0.66,-0.47,0.33,1.5) forwards ;
  }
  .animation {
    animation: rotate 1.6s cubic-bezier(0.66,-0.47,0.33,1.5) forwards;
   
  }
  .animationReverse {
    animation: rotate-reverse 1.2s cubic-bezier(0.66,-0.47,0.33,1.5) 1.9s forwards ;
  }
  /* 设置鼠标移入卡片时执行动画 */
  .front,.back{
      position:absolute;
      top: 1%;
      left: 5%;
      width:90%;
      height:90%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-around;
      font-size: 20px;
      white-space: pre-line;
      overflow: auto;
      // background: rgba(255, 255, 255, 0.9);
      border-radius: 30px;
      backface-visibility: hidden;
      p {
        overflow: auto;
        &::-webkit-scrollbar {
        display: none;
    }
      }
       &::-webkit-scrollbar {
        display: none;
    }
  }
  .back{
      transform: rotateY(180deg);
  }
  @keyframes rotate{
      0%{
          transform: rotateY(0deg);
      }
      100%{
          transform: rotateY(180deg);
      }
  }
  @keyframes rotate-reverse{
      0%{
          transform: rotateY(180deg);
      }
      100%{
          transform: rotateY(0deg);
      }
    }
  
}
</style>