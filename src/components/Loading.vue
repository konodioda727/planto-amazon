<template>
<div class="loading">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
        </div>
</template>
<script>
export default {
   
}
</script>

<style lang="less" scoped>
@ballSize: 15px;
@ball-num: 30;
@containerSize: 200px;
@peg: 360deg/@ball-num;
@ani-duration: 2300ms;

.loading {
width: @containerSize;
height: @containerSize;
margin: 50px auto;
position: relative;
border-radius: 50%;

.dot {
position: absolute;
left: 50%;
top: 50%;
width: @ballSize;
height: @ballSize;
margin-top: -@ballSize / 2;
margin-left: -@ballSize / 2;
perspective: 80;
transform-style: preserve-3d;

// 通过before、 after 控制两个小球
&::before, &::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

&::after {
  background: #d4cdcd;
  top: -100%;
  animation: black-move @ani-duration infinite;
}

&::before {
  background: rgb(93, 93, 159);
  top: 100%;
  animation: white-move @ani-duration infinite;
}
}

@keyframes black-move {
0% {
animation-timing-function: ease-in;
transform: translate3d(0, 0, 0);
}
25% {
transform: translate3d(0, 100%, @ballSize);
animation-timing-function: ease-out;
}
50% {
transform: translate3d(0, 200%, 0);
animation-timing-function: ease-in;
}
75% {
transform: translate3d(0, 100%, -@ballSize);
animation-timing-function: ease-out;
}
}

@keyframes white-move {
0% {
animation-timing-function: ease-in;
transform: translate3d(0, 0, 0);
}
25% {
transform: translate3d(0, -100%, -@ballSize);
animation-timing-function: ease-out;
}
50% {
transform: translate3d(0, -200%, 0);
animation-timing-function: ease-in;
}
75% {
transform: translate3d(0, -100%, @ballSize);
animation-timing-function: ease-out;
}
}

.loop(@counter, @i: 1) when (@i =< @counter) {
  .dot:nth-child(@{i}) {
    transform: rotate(@peg * @i) translateY(-@containerSize / 2);
    &::before,
    &::after {
      animation-delay: -@ani-duration / 36 * @i * 6;
    }
  }
  .loop(@counter, (@i + 1));
}

.loop(36);
}
</style>