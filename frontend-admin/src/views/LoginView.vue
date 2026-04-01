<template>
  <div class="login-view">
    <!-- 左侧品牌区域 -->
    <div class="login-brand">
      <div class="brand-content">
        <el-icon :size="64" color="#ffffff"><DataAnalysis /></el-icon>
        <h1>ERP 报表系统</h1>
        <p>企业级数据报表管理平台</p>
        <ul class="feature-list">
          <li>
            <el-icon><Check /></el-icon>
            <span>多维度数据分析</span>
          </li>
          <li>
            <el-icon><Check /></el-icon>
            <span>灵活的报表视图</span>
          </li>
          <li>
            <el-icon><Check /></el-icon>
            <span>实时数据更新</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- 右侧登录表单 -->
    <div class="login-form-wrapper">
      <div class="login-card">
        <div class="login-header">
          <h2>欢迎登录</h2>
          <p>请输入您的账号信息</p>
        </div>

        <el-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          class="login-form"
          @submit.prevent="handleLogin"
        >
          <el-form-item prop="username">
            <el-input
              v-model="formData.username"
              placeholder="用户名"
              :prefix-icon="User"
              size="large"
              clearable
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="formData.password"
              type="password"
              placeholder="密码"
              :prefix-icon="Lock"
              size="large"
              show-password
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              :loading="loading"
              class="login-btn"
              @click="handleLogin"
            >
              {{ loading ? '登录中...' : '登 录' }}
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="copyright">
        © 2025 ERP Report System. All rights reserved.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Check } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()
const formRef = ref<FormInstance>()
const loading = ref(false)

const formData = reactive({
  username: '',
  password: ''
})

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

async function handleLogin() {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    auth.clearError()

    try {
      const ok = await auth.login(formData.username, formData.password)
      if (ok) {
        ElMessage.success('登录成功，正在跳转...')
        const redirect = (router.currentRoute.value.query.redirect as string) || '/'
        router.push(redirect)
      } else {
        ElMessage.error(auth.error || '用户名或密码错误')
      }
    } catch {
      ElMessage.error('登录失败，请重试')
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.login-view {
  min-height: 100vh;
  display: flex;
  background: var(--bg-base);
}

/* 左侧品牌区域 */
.login-brand {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  padding: var(--spacing-2xl);
}

.brand-content {
  max-width: 400px;
  color: var(--text-inverse);
  text-align: center;
}

.brand-content h1 {
  margin: var(--spacing-lg) 0 var(--spacing-sm);
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-inverse);
}

.brand-content > p {
  font-size: var(--font-size-md);
  opacity: 0.9;
  margin-bottom: var(--spacing-xl);
}

.feature-list {
  list-style: none;
  text-align: left;
  padding: 0;
  margin: 0;
}

.feature-list li {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) 0;
  font-size: var(--font-size-base);
  opacity: 0.9;
}

.feature-list li .el-icon {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  padding: 4px;
}

/* 右侧登录表单区域 */
.login-form-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl);
  background: var(--bg-container);
}

.login-card {
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.login-header h2 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm);
}

.login-header p {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  margin: 0;
}

.login-form {
  margin-top: var(--spacing-lg);
}

.login-btn {
  width: 100%;
  height: 44px;
  font-size: var(--font-size-md);
}


.copyright {
  margin-top: var(--spacing-xl);
  font-size: var(--font-size-xs);
  color: var(--text-disabled);
}

/* 响应式 */
@media (max-width: 768px) {
  .login-view {
    flex-direction: column;
  }

  .login-brand {
    padding: var(--spacing-xl);
    min-height: 200px;
  }

  .brand-content h1 {
    font-size: var(--font-size-2xl);
  }

  .feature-list {
    display: none;
  }

  .login-form-wrapper {
    padding: var(--spacing-lg);
  }
}

/* 输入框样式 - 无背景色 */
:deep(.el-input__wrapper) {
  padding: 8px 12px;
  background-color: transparent !important;
  box-shadow: 0 0 0 1px var(--border-color) inset;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px var(--color-primary) inset;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px var(--color-primary) inset;
}

:deep(.el-form-item) {
  margin-bottom: var(--spacing-lg);
}
</style>
