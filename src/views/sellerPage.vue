<!--
 描述: 这个组件对应于路由 /sellerPage 而展示，在这个组件中，通过子组件注册的方式，要显示出seller.vue这个组件
 作者: Jack Chen
 日期: 2021-04-28
-->

<template>
  <div class="com-page">
    <Seller />
  </div>
</template>

<script>
import Seller from "@/components/Seller";

export default {
  components: {
    Seller,
  },
  data() {
    return {};
  },
  methods: {},
};
</script>

<style lang="less" scoped>
</style>