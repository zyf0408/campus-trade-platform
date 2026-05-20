<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>发布求购</h3>
        <button class="btn-close" @click="$emit('close')">&times;</button>
      </div>
      
      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>求购标题 <span class="required">*</span></label>
            <input 
              v-model="form.title" 
              type="text" 
              placeholder="例如：求购高等数学教材"
              required
              maxlength="200"
            >
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>分类 <span class="required">*</span></label>
              <select v-model="form.categoryId" required>
                <option value="">请选择分类</option>
                <option :value="5">教材</option>
                <option :value="6">考研资料</option>
                <option :value="7">文具</option>
                <option :value="8">笔记</option>
                <option :value="9">日用品</option>
                <option :value="10">装饰品</option>
                <option :value="11">运动器材</option>
                <option :value="12">手机</option>
                <option :value="13">电脑</option>
                <option :value="14">平板</option>
                <option :value="15">配件</option>
              </select>
            </div>
            <div class="form-group">
              <label>成色要求</label>
              <select v-model="form.conditionRequirement">
                <option :value="null">不限</option>
                <option :value="9">九成新以上</option>
                <option :value="8">八成新以上</option>
                <option :value="7">七成新以上</option>
                <option :value="6">六成新以上</option>
                <option :value="5">五成新以上</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>最低预算 (元)</label>
              <input 
                v-model.number="form.budgetMin" 
                type="number" 
                min="0"
                step="0.01"
                placeholder="0"
              >
            </div>
            <div class="form-group">
              <label>最高预算 (元)</label>
              <input 
                v-model.number="form.budgetMax" 
                type="number" 
                min="0"
                step="0.01"
                placeholder="不限"
              >
            </div>
          </div>

          <div class="form-group">
            <label>需求描述</label>
            <textarea 
              v-model="form.description" 
              rows="4"
              placeholder="详细描述你需要的商品，如品牌、型号、版本等信息..."
            ></textarea>
          </div>

          <div class="form-group">
            <label>关键词</label>
            <input 
              v-model="form.keywords" 
              type="text" 
              placeholder="多个关键词用逗号分隔，如：高等数学,同济版,第七版"
            >
          </div>

          <div class="form-group">
            <label>期望自提地点</label>
            <input 
              v-model="form.pickupLocation" 
              type="text" 
              placeholder="例如：东区食堂、图书馆门口"
            >
          </div>

          <div class="form-row checkbox-row">
            <label class="checkbox-label">
              <input v-model="form.isNegotiable" type="checkbox" :true-value="1" :false-value="0">
              接受议价
            </label>
            <label class="checkbox-label">
              <input v-model="form.onlyHighCredit" type="checkbox" :true-value="1" :false-value="0">
              仅匹配高信誉卖家(≥80分)
            </label>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="$emit('close')">取消</button>
            <button type="submit" class="btn-submit" :disabled="submitting">
              {{ submitting ? '发布中...' : '发布求购' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { publishRequest } from '../api/purchase.js'

export default {
  name: 'PublishRequest',
  emits: ['close', 'success'],
  setup(props, { emit }) {
    const submitting = ref(false)
    const form = reactive({
      title: '',
      categoryId: '',
      description: '',
      budgetMin: null,
      budgetMax: null,
      conditionRequirement: null,
      keywords: '',
      pickupLocation: '',
      isNegotiable: 1,
      onlyHighCredit: 0
    })

    const handleSubmit = async () => {
      if (!form.title.trim()) {
        alert('请输入求购标题')
        return
      }
      if (!form.categoryId) {
        alert('请选择分类')
        return
      }

      submitting.value = true
      try {
        const data = {
          ...form,
          title: form.title.trim(),
          keywords: form.keywords ? form.keywords.split(',').map(k => k.trim()).join(',') : ''
        }
        const res = await publishRequest(data)
        if (res.code === 200) {
          alert('求购发布成功！')
          emit('success')
        } else {
          alert(res.message || '发布失败')
        }
      } catch (error) {
        console.error('发布求购失败:', error)
        alert('发布失败，请重试')
      } finally {
        submitting.value = false
      }
    }

    return {
      form,
      submitting,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: #fff;
  border-radius: 8px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  color: #333;
}

.required {
  color: #ff4d4f;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #42b983;
}

.form-row {
  display: flex;
  gap: 15px;
}

.form-row .form-group {
  flex: 1;
}

.checkbox-row {
  display: flex;
  gap: 20px;
  margin: 15px 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 14px;
}

.checkbox-label input {
  width: auto;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.btn-cancel {
  padding: 10px 24px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-submit {
  padding: 10px 24px;
  background: #42b983;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-submit:disabled {
  background: #ccc;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .checkbox-row {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
