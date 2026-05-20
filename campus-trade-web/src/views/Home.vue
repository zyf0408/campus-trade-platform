<template>
  <div class="home">
    <h1>校园二手交易平台</h1>
    <p>欢迎使用校园二手交易平台</p>
    <router-link to="/products">浏览商品</router-link>
    <router-link to="/login">登录</router-link>
    <router-link to="/register">注册</router-link>
  </div>
</template>

<script>
export default {
  name: 'Home'
}
</script>

<style>
.home {
  text-align: center;
  margin-top: 50px;
}

a {
  margin: 0 10px;
  text-decoration: none;
  color: #42b983;
}
</style>
