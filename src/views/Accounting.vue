<template>
  <div class="px-4 pt-12 pb-6">

    <h1 class="text-xl font-medium text-white mb-1">Учёт и налоги</h1>
    <p class="text-sm text-gray-500 mb-5">{{ currentYear }} год · Упрощённая декларация</p>

    <!-- ── КАЛЬКУЛЯТОР НАЛОГОВ ─────────────────
         Пользователь вводит сумму → всё считается автоматически
         v-model="calcAmount" связывает input с переменной calcAmount
         @input — событие при каждом вводе символа
    -->
    <div class="bg-surface-card rounded-2xl p-4 mb-4">
      <p class="text-xs text-gray-500 uppercase tracking-widest mb-3">Калькулятор налогов</p>

      <div class="relative mb-4">
        <input
          v-model="calcAmount"
          type="number"
          placeholder="Введите сумму дохода"
          class="w-full bg-surface-border/40 text-white text-base rounded-xl px-4 py-3.5
                 border border-white/10 outline-none focus:border-brand pr-12"
        />
        <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₸</span>
      </div>

      <!--
        v-if="calcAmount > 0": показываем результаты только если введена сумма
        Это лучше чем показывать нули — интерфейс чище
      -->
      <div v-if="calcAmount > 0" class="space-y-2.5">
        <!-- Каждая строка = один налог с объяснением -->
        <div v-for="item in calcResults" :key="item.label"
             class="flex justify-between items-center py-2 border-b border-surface-border/50">
          <div>
            <p class="text-sm text-gray-300">{{ item.label }}</p>
            <!-- Подсказка: как считается этот налог -->
            <p class="text-xs text-gray-600">{{ item.formula }}</p>
          </div>
          <p class="text-sm font-medium" :class="item.color">{{ formatKZT(item.value) }}</p>
        </div>

        <!-- Итого -->
        <div class="flex justify-between items-center pt-1">
          <p class="text-sm text-gray-400">Итого к уплате</p>
          <p class="text-base font-medium text-white">{{ formatKZT(totalCalc) }}</p>
        </div>

        <!-- Чистый доход -->
        <div class="bg-brand/10 rounded-xl p-3 mt-2">
          <div class="flex justify-between">
            <p class="text-sm text-gray-400">Чистый доход</p>
            <p class="text-sm font-medium text-brand">{{ formatKZT(calcAmount - totalCalc) }}</p>
          </div>
          <p class="text-xs text-gray-600 mt-0.5">
            {{ ((1 - totalCalc / calcAmount) * 100).toFixed(1) }}% остаётся у вас
          </p>
        </div>
      </div>
    </div>

    <!-- ── СРОКИ УПЛАТЫ ────────────────────────
         Важная информация по НК РК
    -->
    <div class="bg-surface-card rounded-2xl p-4 mb-5">
      <p class="text-xs text-gray-500 uppercase tracking-widest mb-3">Сроки уплаты 2026</p>
      <div class="space-y-2.5">
        <div v-for="deadline in deadlines" :key="deadline.label"
             class="flex items-center gap-3">
          <div class="w-2 h-2 rounded-full flex-shrink-0" :class="deadline.dotColor" />
          <div class="flex-1">
            <p class="text-sm text-gray-300">{{ deadline.label }}</p>
            <p class="text-xs text-gray-600">{{ deadline.desc }}</p>
          </div>
          <p class="text-xs font-medium" :class="deadline.dotColor.replace('bg-', 'text-')">
            {{ deadline.date }}
          </p>
        </div>
      </div>
    </div>

    <!-- ── ВСЕ ОПЕРАЦИИ ───────────────────────── -->
    <div class="flex justify-between items-center mb-3">
      <h2 class="text-xs text-gray-500 uppercase tracking-widest">Все операции</h2>
      <p class="text-xs text-gray-600">{{ store.transactions.length }} шт.</p>
    </div>

    <div v-if="store.transactions.length === 0" class="text-center py-8">
      <i class="ti ti-inbox text-4xl text-gray-700 block mb-2" />
      <p class="text-sm text-gray-600">Операций пока нет</p>
      <p class="text-xs text-gray-700 mt-1">Добавьте через кнопку + на главной</p>
    </div>

    <div v-else class="space-y-0">
      <div
        v-for="tx in store.transactions"
        :key="tx.id"
        class="flex items-center gap-3 py-3 border-b border-surface-border/50"
      >
        <div class="w-9 h-9 rounded-xl bg-green-900/30 flex items-center justify-center flex-shrink-0">
          <i class="ti ti-arrow-down-left text-green-400 text-base" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm text-gray-200 truncate">{{ tx.client }}</p>
          <p class="text-xs text-gray-600">{{ tx.date }} · {{ tx.category }}</p>
        </div>
        <div class="text-right flex-shrink-0">
          <p class="text-sm font-medium text-green-400">+{{ formatKZT(tx.amount) }}</p>
          <button
            @click="store.removeTransaction(tx.id)"
            class="text-xs text-gray-700 hover:text-red-400 transition-colors mt-0.5"
          >
            <i class="ti ti-trash text-xs" /> удалить
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useFinanceStore } from '@/stores/finance'

const store = useFinanceStore()
const currentYear = new Date().getFullYear()

// Сумма для калькулятора — ref() потому что меняется пользователем
const calcAmount = ref('')

// МЗП 2026 для расчёта фиксированных платежей
const MZP_2026 = 85000

// Результаты калькулятора — computed пересчитывается при изменении calcAmount
const calcResults = computed(() => [
  {
    label: 'ИПН (индивидуальный подоходный налог)',
    formula: `${calcAmount.value} × 3%`,
    value: Math.round(calcAmount.value * 0.03),
    color: 'text-purple-400'
  },
  {
    label: 'ОПВ (обязательные пенсионные взносы)',
    formula: `МЗП ${formatKZT(MZP_2026)} × 10%`,
    value: Math.round(MZP_2026 * 0.10),
    color: 'text-green-400'
  },
  {
    label: 'СО (социальные отчисления)',
    formula: `МЗП × 3.5%`,
    value: Math.round(MZP_2026 * 0.035),
    color: 'text-blue-400'
  },
  {
    label: 'ВОСМС (мед. страхование)',
    formula: `МЗП × 5%`,
    value: Math.round(MZP_2026 * 0.05),
    color: 'text-red-400'
  }
])

// Итого = сумма всех налогов
const totalCalc = computed(() =>
  calcResults.value.reduce((sum, item) => sum + item.value, 0)
)

// Сроки уплаты по НК РК 2026
const deadlines = [
  { label: 'Упрощённая декларация (ф.910)', desc: 'За 1-е полугодие', date: '15 авг', dotColor: 'bg-brand' },
  { label: 'Уплата налогов по ф.910',       desc: 'За 1-е полугодие', date: '25 авг', dotColor: 'bg-green-500' },
  { label: 'Упрощённая декларация (ф.910)', desc: 'За 2-е полугодие', date: '15 фев', dotColor: 'bg-brand' },
  { label: 'Уплата налогов по ф.910',       desc: 'За 2-е полугодие', date: '25 фев', dotColor: 'bg-green-500' },
  { label: 'ОПВ, СО, ВОСМС',               desc: 'Ежемесячно',        date: '25 числа', dotColor: 'bg-yellow-500' }
]

function formatKZT(n) {
  return new Intl.NumberFormat('ru-RU').format(Math.round(n)) + ' ₸'
}
</script>
