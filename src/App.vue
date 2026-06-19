<!--
  📌 App.vue — корневой компонент (оболочка приложения)

  Это самый "верхний" компонент — он оборачивает всё остальное.
  Внутри него:
  1. <RouterView> — сюда Vue вставляет текущий экран (Dashboard, Accounting...)
  2. <BottomNav> — навигация, видна на всех экранах
  3. <Transition> — анимация при переключении экранов

  App.vue сам по себе не содержит бизнес-логику —
  он просто держит структуру.
-->

<template>
  <div class="relative min-h-dvh bg-[#0f0f13]">

    <!-- RouterView: placeholder, куда роутер вставляет нужный экран -->
    <!-- Transition: обёртка для анимации переходов (из style.css) -->
    <Transition name="page" mode="out-in">
      <RouterView class="pb-24" /> <!-- pb-24 = отступ снизу под навбар -->
    </Transition>

    <!-- Нижняя навигация — всегда видна -->
    <BottomNav />

  </div>
</template>

<script setup>
import BottomNav from '@/components/BottomNav.vue'
// RouterView и Transition регистрировать не нужно — они глобальные
</script>
