<template>
  <div class="login">
    <h2>用户登录</h2>
    <div v-if="error" class="error-message">{{ error }}</div>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="username">用户名</label>
        <input type="text" id="username" v-model="form.username" required>
      </div>
      <div class="form-group">
        <label for="password">密码</label>
        <input type="password" id="password" v-model="form.password" required>
      </div>
      <button type="submit">登录</button>
    </form>
    <router-link to="/register">注册新账号</router-link>
  </div>
</template>

<script>
import { login } from '../api/auth'

export default {
  name: 'Login',
  data() {
    return {
      form: {
        username: '',
        password: ''
      },
      error: ''
    }
  },
  methods: {
    async handleLogin() {
      try {
        const response = await login(this.form)
        console.log('登录成功:', response)
        // 存储 token
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('userId', response.data.userId)
        localStorage.setItem('username', response.data.username)
        // 跳转到首页
        this.$router.push('/')
      } catch (error) {
        console.error('登录失败:', error)
        this.error = '登录失败，请检查用户名和密码'
      }
    }
  }
}
</script>

<style>
.login {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 10px;
  border-radius: 3px;
  margin-bottom: 15px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 3px;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

button:hover {
  background-color: #35495e;
}

a {
  display: block;
  text-align: center;
  margin-top: 10px;
  text-decoration: none;
  color: #42b983;
}
</style>
