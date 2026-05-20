<template>
  <div class="register">
    <h2>用户注册</h2>
    <div v-if="error" class="error-message">{{ error }}</div>
    <div v-if="success" class="success-message">{{ success }}</div>
    <form @submit.prevent="handleRegister">
      <div class="form-group">
        <label for="username">用户名</label>
        <input type="text" id="username" v-model="form.username" required placeholder="3-20个字符">
      </div>
      <div class="form-group">
        <label for="password">密码</label>
        <input type="password" id="password" v-model="form.password" required placeholder="6-20个字符">
      </div>
      <div class="form-group">
        <label for="phone">手机号（选填）</label>
        <input type="tel" id="phone" v-model="form.phone" placeholder="请输入手机号">
      </div>
      <div class="form-group">
        <label for="email">邮箱（选填）</label>
        <input type="email" id="email" v-model="form.email" placeholder="请输入邮箱">
      </div>
      <div class="form-group">
        <label for="nickname">昵称（选填）</label>
        <input type="text" id="nickname" v-model="form.nickname" placeholder="不填则使用用户名">
      </div>
      <button type="submit">注册</button>
    </form>
    <router-link to="/login">已有账号？登录</router-link>
  </div>
</template>

<script>
import { register } from '../api/auth'

export default {
  name: 'Register',
  data() {
    return {
      form: {
        username: '',
        password: '',
        phone: '',
        email: '',
        nickname: ''
      },
      error: '',
      success: ''
    }
  },
  methods: {
    async handleRegister() {
      this.error = ''
      this.success = ''
      
      if (!this.form.username || this.form.username.length < 3 || this.form.username.length > 20) {
        this.error = '用户名长度需在3-20位之间'
        return
      }
      
      if (!this.form.password || this.form.password.length < 6 || this.form.password.length > 20) {
        this.error = '密码长度需在6-20位之间'
        return
      }

      try {
        const response = await register(this.form)
        console.log('注册响应:', response)
        
        if (response && response.code === 200) {
          this.success = '注册成功，请登录'
          setTimeout(() => {
            this.$router.push('/login')
          }, 2000)
        } else {
          this.error = response?.message || '注册失败，请稍后重试'
        }
      } catch (error) {
        console.error('注册失败:', error)
        this.error = error.response?.data?.message || '注册失败，请检查网络连接或稍后重试'
      }
    }
  }
}
</script>

<style>
.register {
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

.success-message {
  background-color: #d4edda;
  color: #155724;
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
