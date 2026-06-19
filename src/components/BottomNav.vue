<!--
  📌 BottomNav.vue — нижняя навигационная панель

  Это КОМПОНЕНТ — переиспользуемый кусочек UI.
  Он появляется на каждом экране (мы вставим его в App.vue).

  Как работает активное состояние:
  - useRoute() даёт нам текущий маршрут
  - route.name === item.to.name → сравниваем имя маршрута с именем пункта
  - Если совпадает → добавляем класс 'active'
-->

<template>
  <!-- glass = glassmorphism из style.css -->
  <nav class="glass fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50">
    <div class="flex justify-around items-center px-2 pb-safe pt-2">

      <!-- v-for: Vue-директива, создаёт элемент для каждого пункта в массиве navItems -->
      <RouterLink
        v-for="item in navItems"
        :key="item.to.name"
        :to="item.to"
        class="nav-tab"
        :class="{ active: route.name === item.to.name }"
      >
        <!-- Иконка: динамическое имя класса через :class -->
        <span class="nav-icon" :class="item.icon" />
        <span class="nav-label">{{ item.label }}</span>
      </RouterLink>

    </div>
  </nav>
</template>

<script setup>
// Composition API — это современный способ писать Vue 3
import { useRoute } from 'vue-router'

const route = useRoute() // Хук → даёт объект текущего маршрута

// Данные навигации — массив объектов
const navItems = [
  { to: { name: 'dashboard'  }, icon: 'ti ti-layout-dashboard', label: 'Главная'  },
  { to: { name: 'accounting' }, icon: 'ti ti-calculator',        label: 'Учёт'    },
  { to: { name: 'documents'  }, icon: 'ti ti-file-text',         label: 'АВР'     },
  { to: { name: 'ai'         }, icon: 'ti ti-message-circle',    label: 'AI'      }
]
</script>

<style scoped>
/* scoped = стили работают ТОЛЬКО в этом компоненте, не утекают наружу */

.nav-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 8px 20px;
  border-radius: 14px;
  text-decoration: none;
  transition: background 0.15s ease;
  color: #555;
  flex: 1;
}

.nav-tab.active {
  color: #6C63FF;
}

.nav-icon {
  font-size: 22px;
  line-height: 1;
}

.nav-label {
  font-size: 10px;
  letter-spacing: 0.2px;
}

/* Отступ снизу для устройств с "чёлкой" (iPhone X+) */
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 12px);
}
</style>
