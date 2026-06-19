<template>
  <nav class="glass fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50">
    <div class="flex justify-around items-center px-1 pb-safe pt-2">
      <RouterLink
        v-for="item in navItems"
        :key="item.to.name"
        :to="item.to"
        class="nav-tab"
        :class="{ active: route.name === item.to.name }"
      >
        <span class="nav-icon" :class="item.icon" />
        <span class="nav-label">{{ item.label }}</span>
      </RouterLink>
    </div>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()

const navItems = [
  { to: { name: 'dashboard'  }, icon: 'ti ti-layout-dashboard', label: 'Главная'  },
  { to: { name: 'accounting' }, icon: 'ti ti-calculator',        label: 'Учёт'    },
  { to: { name: 'documents'  }, icon: 'ti ti-file-text',         label: 'АВР'     },
  { to: { name: 'ai'         }, icon: 'ti ti-message-circle',    label: 'AI'      },
  { to: { name: 'settings'   }, icon: 'ti ti-settings',          label: 'Настройки'}
]
</script>

<style scoped>
.nav-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 6px 10px;
  border-radius: 14px;
  text-decoration: none;
  transition: background 0.15s ease;
  color: #555;
  flex: 1;
}
.nav-tab.active { color: #6C63FF; }
.nav-icon { font-size: 20px; line-height: 1; }
.nav-label { font-size: 9px; letter-spacing: 0.2px; }
.pb-safe { padding-bottom: env(safe-area-inset-bottom, 12px); }
</style>
