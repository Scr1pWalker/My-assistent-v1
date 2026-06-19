<template>
  <div class="px-4 pt-12 pb-6">

    <!-- ── ШАПКА С ДАТОЙ ─────────────────────── -->
    <div class="flex justify-between items-start mb-5">
      <div>
        <p class="text-sm text-gray-500">Добрый {{ greeting }},</p>
        <h1 class="text-xl font-medium text-white mt-0.5">{{ store.ip.name }} 👋</h1>
      </div>
      <!-- Текущая дата — всегда видна -->
      <div class="text-right">
        <p class="text-sm font-medium text-white">{{ todayFormatted }}</p>
        <p class="text-xs text-gray-500 mt-0.5">{{ dayOfWeek }}</p>
      </div>
    </div>

    <!-- ── УВЕДОМЛЕНИЯ ────────────────────────
         v-for по массиву alerts — каждый alert это объект с типом и текстом.
         Показываем только если есть хотя бы одно уведомление.
    -->
    <div v-if="alerts.length > 0" class="space-y-2 mb-4">
      <div
        v-for="alert in alerts"
        :key="alert.id"
        class="rounded-2xl p-4 flex gap-3 items-start"
        :class="alert.bgClass"
      >
        <i :class="['ti', alert.icon, 'text-xl mt-0.5 flex-shrink-0', alert.iconColor]" />
        <div class="flex-1">
          <p class="text-sm font-medium" :class="alert.titleColor">{{ alert.title }}</p>
          <p class="text-xs text-gray-400 mt-0.5">{{ alert.desc }}</p>
        </div>
        <!-- Дней осталось — бейдж -->
        <span
          v-if="alert.daysLeft !== undefined"
          class="text-xs font-medium px-2 py-1 rounded-lg flex-shrink-0"
          :class="alert.badgeClass"
        >
          {{ alert.daysLeft }}д
        </span>
      </div>
    </div>

    <!-- ── КАРТОЧКА ДОХОДА ────────────────────── -->
    <div class="balance-card rounded-2xl p-5 mb-4">
      <p class="text-xs text-white/60 mb-1">Доход за {{ currentMonth }}</p>
      <p class="text-3xl font-medium text-white tracking-tight">
        {{ formatKZT(store.monthlyIncome) }}
      </p>
      <p class="text-xs text-white/60 mt-1">
        Налог ИПН (3%): <span class="text-white/90">{{ formatKZT(store.monthlyTax) }}</span>
      </p>
    </div>

    <!-- ── ПРОГРЕСС ЛИМИТА ────────────────────── -->
    <div class="mb-5">
      <div class="flex justify-between text-xs mb-2">
        <span class="text-gray-500">Лимит дохода за год</span>
        <span class="font-medium" :class="limitColor">
          {{ store.annualLimitPercent.toFixed(1) }}%
        </span>
      </div>
      <div class="h-1.5 bg-surface-border rounded-full overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-700"
          :class="limitBarColor"
          :style="{ width: store.annualLimitPercent + '%' }"
        />
      </div>
      <p class="text-xs text-gray-600 mt-1.5 text-right">
        Осталось: {{ formatKZT(store.annualLimitKZT - store.annualIncome) }}
      </p>
    </div>

    <!-- ── КАРТОЧКИ НАЛОГОВ ── -->
    <div class="grid grid-cols-2 gap-2.5 mb-5">
      <div v-for="tax in taxes" :key="tax.label" class="bg-surface-card rounded-2xl p-3.5">
        <i :class="['ti', tax.icon, 'text-xl mb-2 block']" :style="{ color: tax.color }" />
        <p class="text-white font-medium text-sm">{{ formatKZT(tax.value) }}</p>
        <p class="text-gray-500 text-xs mt-0.5">{{ tax.label }}</p>
      </div>
    </div>

    <!-- ── ГРАФИК ─────────────────────────────── -->
    <div class="bg-surface-card rounded-2xl p-4 mb-5">
      <p class="text-xs text-gray-500 mb-3 uppercase tracking-widest">Доходы за 6 месяцев</p>
      <svg viewBox="0 0 300 90" class="w-full" style="overflow: visible">
        <g v-for="(bar, i) in chartBars" :key="i">
          <rect
            :x="i * 50 + 5" :y="90 - bar.height - 25"
            width="38" :height="bar.height"
            :fill="bar.isCurrentMonth ? '#6C63FF' : '#2a2a35'"
            rx="6"
          />
          <text :x="i * 50 + 24" :y="90 - bar.height - 28"
            text-anchor="middle" fill="#9ca3af" font-size="7">{{ bar.shortAmount }}</text>
          <text :x="i * 50 + 24" y="88"
            text-anchor="middle" fill="#6b7280" font-size="8">{{ bar.month }}</text>
        </g>
      </svg>
    </div>

    <!-- ── ПОСЛЕДНИЕ ОПЕРАЦИИ ─────────────────── -->
    <div class="flex justify-between items-center mb-3">
      <h2 class="text-xs text-gray-500 tracking-widest uppercase">Операции</h2>
      <RouterLink to="/accounting" class="text-xs text-brand">Все →</RouterLink>
    </div>

    <div class="space-y-0">
      <div
        v-for="tx in store.transactions.slice(0, 3)"
        :key="tx.id"
        class="flex items-center gap-3 py-3 border-b border-surface-border/50"
      >
        <div class="w-9 h-9 rounded-xl bg-green-900/30 flex items-center justify-center flex-shrink-0">
          <i class="ti ti-arrow-down-left text-green-400 text-base" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm text-gray-200 truncate">{{ tx.client }}</p>
          <p class="text-xs text-gray-600">{{ formatDate(tx.date) }} · {{ tx.category }}</p>
        </div>
        <p class="text-sm font-medium text-green-400 flex-shrink-0">
          +{{ formatKZT(tx.amount) }}
        </p>
      </div>
    </div>

    <!-- ── КНОПКА "+" ──────────────────────────── -->
    <button
      @click="showSheet = true"
      class="fixed bottom-24 right-5 w-14 h-14 bg-brand rounded-full
             flex items-center justify-center shadow-lg shadow-brand/30
             active:scale-95 transition-transform z-40"
    >
      <i class="ti ti-plus text-white text-2xl" />
    </button>

    <!-- ── BOTTOM SHEET ───────────────────────── -->
    <Transition name="sheet">
      <div v-if="showSheet" class="fixed inset-0 z-50 flex flex-col justify-end">
        <div class="absolute inset-0 bg-black/60" @click="showSheet = false" />
        <div class="relative bg-[#1c1c26] rounded-t-3xl p-6 pb-10 z-10">
          <div class="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-5" />
          <h3 class="text-white font-medium mb-4">Добавить доход</h3>
          <div class="space-y-3">
            <input v-model="newTx.client" placeholder="Название клиента"
              class="w-full bg-surface-border/50 text-white text-sm rounded-xl px-4 py-3
                     border border-white/10 outline-none focus:border-brand" />
            <input v-model="newTx.amount" type="number" placeholder="Сумма в тенге"
              class="w-full bg-surface-border/50 text-white text-sm rounded-xl px-4 py-3
                     border border-white/10 outline-none focus:border-brand" />
            <input v-model="newTx.date" type="date"
              class="w-full bg-surface-border/50 text-white text-sm rounded-xl px-4 py-3
                     border border-white/10 outline-none focus:border-brand" />
            <select v-model="newTx.category"
              class="w-full bg-surface-border/50 text-white text-sm rounded-xl px-4 py-3
                     border border-white/10 outline-none focus:border-brand">
              <option value="Услуги">Услуги</option>
              <option value="Консалтинг">Консалтинг</option>
              <option value="Разработка">Разработка</option>
              <option value="Торговля">Торговля</option>
              <option value="Прочее">Прочее</option>
            </select>
          </div>
          <button @click="addTransaction"
            class="w-full bg-brand text-white rounded-xl py-3.5 mt-4 font-medium text-sm">
            Добавить операцию
          </button>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useFinanceStore } from '@/stores/finance'

const store = useFinanceStore()
const showSheet = ref(false)
const newTx = ref({ client: '', amount: '', category: 'Услуги', date: new Date().toISOString().split('T')[0] })

// ── ДАТА И ПРИВЕТСТВИЕ ───────────────────────
const now = new Date()

// Приветствие по времени суток
const greeting = computed(() => {
  const h = now.getHours()
  if (h < 12) return 'утро'
  if (h < 17) return 'день'
  return 'вечер'
})

// Сегодняшняя дата: "19 июня 2026"
const todayFormatted = computed(() =>
  now.toLocaleString('ru', { day: 'numeric', month: 'long', year: 'numeric' })
)

// День недели: "Пятница"
const dayOfWeek = computed(() =>
  now.toLocaleString('ru', { weekday: 'long' })
)

// ── УМНЫЕ УВЕДОМЛЕНИЯ ────────────────────────
//
// Логика: считаем сколько дней до следующего 25-го числа (ОПВ/СО/ВОСМС)
// и до дат сдачи декларации ф.910 (15 авг и 15 фев).
// Если осталось ≤ 7 дней → красное уведомление
// Если осталось ≤ 3 дней → критическое уведомление

// Функция: сколько дней до заданной даты
function daysUntil(targetDate) {
  const diff = targetDate - now
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// Следующее 25-е число (дедлайн ОПВ/СО/ВОСМС)
function nextDeadlineDay(dayOfMonth) {
  const target = new Date(now.getFullYear(), now.getMonth(), dayOfMonth)
  if (target <= now) {
    // Если уже прошло — берём следующий месяц
    target.setMonth(target.getMonth() + 1)
  }
  return target
}

const alerts = computed(() => {
  const result = []

  // 1. Ежемесячные платежи — 25 число
  const next25 = nextDeadlineDay(25)
  const days25 = daysUntil(next25)

  if (days25 <= 7) {
    result.push({
      id: 'monthly',
      title: days25 <= 3 ? '🚨 Срочно! Уплата налогов' : '⏰ Скоро уплата налогов',
      desc: `ОПВ + СО + ВОСМС до 25 числа · осталось ${days25} дн.`,
      daysLeft: days25,
      icon: 'ti-clock',
      iconColor: days25 <= 3 ? 'text-red-400' : 'text-yellow-400',
      titleColor: days25 <= 3 ? 'text-red-300' : 'text-yellow-300',
      bgClass: days25 <= 3 ? 'bg-red-900/30 border border-red-500/30' : 'bg-yellow-900/30 border border-yellow-500/30',
      badgeClass: days25 <= 3 ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
    })
  }

  // 2. Декларация ф.910 за 1-е полугодие — 15 августа
  const aug15 = new Date(now.getFullYear(), 7, 15)
  const daysAug = daysUntil(aug15)
  if (daysAug > 0 && daysAug <= 7) {
    result.push({
      id: 'form910_1',
      title: '📋 Декларация ф.910',
      desc: `Сдать за 1-е полугодие до 15 августа · ${daysAug} дн.`,
      daysLeft: daysAug,
      icon: 'ti-file-text',
      iconColor: 'text-blue-400',
      titleColor: 'text-blue-300',
      bgClass: 'bg-blue-900/30 border border-blue-500/30',
      badgeClass: 'bg-blue-500/20 text-blue-400'
    })
  }

  // 3. Уплата ИПН за 1-е полугодие — 25 августа
  const aug25 = new Date(now.getFullYear(), 7, 25)
  const daysAug25 = daysUntil(aug25)
  if (daysAug25 > 0 && daysAug25 <= 7) {
    result.push({
      id: 'ipn_1',
      title: '💰 Уплата ИПН',
      desc: `ИПН за 1-е полугодие до 25 августа · ${daysAug25} дн.`,
      daysLeft: daysAug25,
      icon: 'ti-currency-tenge',
      iconColor: 'text-green-400',
      titleColor: 'text-green-300',
      bgClass: 'bg-green-900/30 border border-green-500/30',
      badgeClass: 'bg-green-500/20 text-green-400'
    })
  }

  // 4. Лимит дохода
  if (store.annualLimitPercent >= 90) {
    result.push({
      id: 'limit',
      title: '⚠️ Лимит дохода почти исчерпан',
      desc: `Использовано ${store.annualLimitPercent.toFixed(1)}% от годового лимита`,
      icon: 'ti-alert-triangle',
      iconColor: 'text-red-400',
      titleColor: 'text-red-300',
      bgClass: 'bg-red-900/30 border border-red-500/30',
      badgeClass: ''
    })
  } else if (store.annualLimitPercent >= 70) {
    result.push({
      id: 'limit_warn',
      title: 'Приближаетесь к лимиту дохода',
      desc: `Использовано ${store.annualLimitPercent.toFixed(1)}% от ${formatKZT(store.annualLimitKZT)}`,
      icon: 'ti-alert-triangle',
      iconColor: 'text-yellow-400',
      titleColor: 'text-yellow-300',
      bgClass: 'bg-yellow-900/30 border border-yellow-500/30',
      badgeClass: ''
    })
  }

  return result
})

// ── ОСТАЛЬНОЕ (без изменений) ─────────────────
const taxes = computed(() => [
  { label: 'ИПН 3%',   value: store.monthlyTax, icon: 'ti-chart-pie',     color: '#818cf8' },
  { label: 'ОПВ 10%',  value: store.opv,         icon: 'ti-building-bank', color: '#34d399' },
  { label: 'СО 3.5%',  value: store.so,           icon: 'ti-shield-check', color: '#60a5fa' },
  { label: 'ВОСМС 5%', value: store.vosms,        icon: 'ti-heart',        color: '#f87171' }
])

const limitColor = computed(() => {
  if (store.annualLimitPercent >= 90) return 'text-red-400'
  if (store.annualLimitPercent >= 70) return 'text-yellow-400'
  return 'text-brand'
})
const limitBarColor = computed(() => {
  if (store.annualLimitPercent >= 90) return 'bg-red-500'
  if (store.annualLimitPercent >= 70) return 'bg-yellow-500'
  return 'bg-brand'
})

const chartBars = computed(() => {
  const months = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const income = store.transactions
      .filter(t => { const td = new Date(t.date); return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear() })
      .reduce((sum, t) => sum + t.amount, 0)
    months.push({ month: d.toLocaleString('ru', { month: 'short' }), income, isCurrentMonth: i === 0 })
  }
  const max = Math.max(...months.map(m => m.income), 1)
  return months.map(m => ({
    ...m,
    height: m.income > 0 ? Math.max(4, (m.income / max) * 55) : 4,
    shortAmount: m.income > 0 ? Math.round(m.income / 1000) + 'к' : ''
  }))
})

const currentMonth = computed(() =>
  now.toLocaleString('ru', { month: 'long', year: 'numeric' })
)

function addTransaction() {
  if (!newTx.value.client || !newTx.value.amount) return
  store.addTransaction(newTx.value)
  newTx.value = { client: '', amount: '', category: 'Услуги', date: new Date().toISOString().split('T')[0] }
  showSheet.value = false
}

function formatKZT(n) {
  return new Intl.NumberFormat('ru-RU').format(Math.round(n)) + ' ₸'
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString('ru', { day: 'numeric', month: 'short' })
}
</script>

<style scoped>
.balance-card { background: linear-gradient(135deg, #6C63FF, #4A43CC); }
.sheet-enter-active, .sheet-leave-active { transition: opacity 0.25s ease; }
.sheet-enter-active .relative, .sheet-leave-active .relative { transition: transform 0.25s ease; }
.sheet-enter-from { opacity: 0; }
.sheet-enter-from .relative { transform: translateY(100%); }
.sheet-leave-to { opacity: 0; }
.sheet-leave-to .relative { transform: translateY(100%); }
</style>
