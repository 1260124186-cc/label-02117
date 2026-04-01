<template>
  <div class="forbidden-view card">
    <el-result
      icon="warning"
      title="无权限访问"
      sub-title="当前账号没有访问该页面/报表的权限，请联系管理员或切换账号。"
    >
      <template #extra>
        <el-button type="primary" @click="goHome">返回首页</el-button>
        <el-button @click="goLogin">切换账号</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

function goHome() {
  router.push('/')
}

function goLogin() {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.forbidden-view {
  min-height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
}
</style>

