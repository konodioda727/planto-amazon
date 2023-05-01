<template>
    <div class="home-page">
        <vue-particles
                color="#2E16A8"
                :particleOpacity="0.7"
                :particlesNumber="60"
                shapeType="circle"
                :particleSize="6"
                linesColor="#409eff"
                :linesWidth="1"
                :lineLinked="true"
                :lineOpacity="0.4"
                :linesDistance="150"
                :moveSpeed="4"
                :hoverEffect="true"
                hoverMode="grab"
                :clickEffect="true"
                clickMode="push"
                class="back">
            </vue-particles>
        <div class="centerBox">
            <div class="logo"></div>
            <div class="name">基于自监督学习的Web数据智能管理系统</div>
            <textarea name="" id="" cols="30" rows="10" placeholder="请输入SQL语句（不输入将以默认值发送）"></textarea>
            <div class="button" @click = "hoverPage">完成</div>
        </div>
        
        <div class="hover" v-if="hoverShow">
            <div class="mask" @click = "hoverClose"></div>
            <div class="modal">
                <Loading v-if="LoadingShow"/>
                <div class="contanier" v-if="!LoadingShow">
                    <div class="content">{{ renderData }}</div>
                    <!-- <div class="content"  v-for="item,index in renderList" :key = "index">{{ item }}</div> -->
                </div>
            </div>
            <router-link to="/screen" style="text-decoration: none;" class="navigator"><div class="button longer" @click = "hoverPage">前往数据可视化界面</div></router-link>
        </div>
    </div>
    
</template>
  
<script>
import axios from 'axios';
import Loading from '../components/Loading.vue'
  export default {
    components: {
      Loading
    },
    data() {
      return {
        hoverShow: false,
        LoadingShow: true,
        renderData: '',
        renderList:[],
        data : "select\ndom_base_uri(dom) as `url`,\ndom_first_text(dom, &apos;#productTitle&apos;) as `title`,\nstr_substring_after(dom_first_href(dom, &apos;#wayfinding-breadcrumbs_container ul li:last-child a&apos;), &apos;&node=&apos;) as `category`,\ndom_first_slim_html(dom, &apos;#bylineInfo&apos;) as `brand`,\ncast(dom_all_slim_htmls(dom, &apos;#imageBlock img&apos;) as varchar) as `gallery`,\ndom_first_slim_html(dom, &apos;#landingImage, #imgTagWrapperId img, #imageBlock img:expr(width > 400)&apos;) as `img`,\ndom_first_text(dom, &apos;#price tr td:contains(List Price) ~ td&apos;) as `listprice`,\ndom_first_text(dom, &apos;#price tr td:matches(^Price) ~ td&apos;) as `price`,\nstr_first_float(dom_first_text(dom, &apos;#reviewsMedley .AverageCustomerReviews span:contains(out of)&apos;), 0.0) as `score`\nfrom load_out_pages(&apos; https://www.amazon.com/b?node=3117954011&apos;, &apos;a[href~=/dp/]&apos;, 1, 10);",
      };
    },
    mounted() {
        axios.get(`//${location.host}/static/template.json`).then((res) => {
            this.renderData = JSON.stringify(res.data[0])
            // console.log('render',JSON.stringify(res.data[0]));
        })
    },
    methods: {
        async hoverPage() {
            var config = {
                method: 'post',
                url: 'http://118.31.54.166:8182/api/x/e',
                headers: { 
                    'Access-Control-Request-Headers': 'text/plain', 
                },
                data : this.data
            };
            this.renderList = await axios(config)
                .then(function (response) {
                console.log(JSON.stringify(response.data));
                this.renderData = response.data
                this.renderList = response.data.slice('\n')
                console.log('renderList',this.renderList);
                return response.split('\n')
                })
                .catch(function () {
                    let response = 'render\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n22\n44\n55\n66\n67567\n8\n\n7k\n7\n'
                    return response.split('\n')
            });
            this.hoverShow = true
            setTimeout(() => {
                this.LoadingShow = false;
            }, 4000);
        },
        hoverClose() {
            this.hoverShow = false
            this.LoadingShow = true;
        }
    },
  };
</script>
  
<style lang="less" scoped>
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
    .back {
        width: 100vw;
        height: 100vh;
        position: absolute;
        top: 0;
        left: 0;
        z-index: -1;
    }
    @keyframes appear {
        0% {
            scale: 0;
            opacity: 0;
        }
        100% {
            scale: 1;
            opacity: 1;
            
        }
    }
    .mask {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 100;
    }
    .modal {
        animation: appear .3s ease-in-out forwards;
        position: absolute;
        top: 50%;
        left: 50%;
        width: 62%;
        height: 84%;
        transform: translate(-50%, -50%);
        // background: url('../../public/static/template.json');
        // display: flex;
        backdrop-filter: blur(5px);
        background: rgba(255, 255, 255, 0.9);
        color: #000;
        padding: 20px;
        z-index: 101 !important;
        overflow: auto;
        border-radius: 40px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2), 0 4px 8px rgba(0, 0, 0, 0.2);
        &::-webkit-scrollbar {
            display: none;
        }
        .content {
            margin: 10px auto;
            &::-webkit-scrollbar {
                display: none;
            }
            width: 800px;
            overflow: auto;
        }
    }
    .button{
        // animation: appear .4s ease-in-out forwards;
        margin-top: 30px;
        color: #2E16A8;
        cursor: pointer;
        background-color: #fff;
        width: 80px;
        height: 40px;
        line-height: 40px;
        text-align: center;
        border-radius: 10px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2), 0 4px 8px rgba(0, 0, 0, 0.2);
        &:hover {
            animation: color .3s ease-in-out forwards;
        }
        &:active {
            animation: colorReverse .3s ease-in-out forwards;
        }
    }
    @keyframes color {
        0% {
            opacity: 1;
            color: #2E16A8;
            background-color: #fff;
        }
        100% {
            opacity: 1;
            color: #fff;
            background-color: #2E16A8;
        }
    }
    @keyframes colorReverse {
        0% {
            color: #fff;
            background-color: #2E16A8;
        }
        100% {
            color: #fff;
            background-color: #083fff;
        }
    }
    .navigator {
        position: absolute;
        bottom: 50px;
        left:50%;
        transform: translateX(-50%);
        z-index: 103;
    }
    .longer {
        width: 200px;
    }
    .home-page {
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 0 auto;
        .centerBox {
            display: flex;
            flex-direction: column;
            align-items: center;
            align-content: center;
            margin-top: 30px;
            
            .logo {
                width: 400px;
                height: 300px;
                background: url('../assets/logo6.png') no-repeat;
                background-size: 400px,400px;
                // background: url('../../public/static/praticales.json');
            }
            .name {
                margin-top: 0;
                font-size: 40px;
                line-height: 40px;
                color: #2E16A8;
                background-color: #fff;
            }
            textarea {
                margin-top: 50px;
                appearance: none;
                border-radius: 10px;
                outline: none;
                border: 0;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2), 0 4px 8px rgba(0, 0, 0, 0.2);
                font-size: 16px;
                padding: 10px;
                width: 400px;
                height: 100px;
                resize: none;
            }
            
        }
    }
</style>