<template>
  <div class="px-4 pt-12 pb-6">

    <!-- ── ШАПКА ──────────────────────────────── -->
    <div class="mb-5">
      <p class="text-sm text-gray-500">Добрый день,</p>
      <h1 class="text-xl font-medium text-white mt-0.5">{{ store.ip.name }} 👋</h1>
    </div>

    <!-- ── УВЕДОМЛЕНИЕ О ЛИМИТЕ (появляется когда > 70%) ── -->
    <!--
      v-if: блок рендерится только если условие true.
      Здесь: показываем предупреждение когда использовано больше 70% лимита
    -->
    <div
      v-if="store.annualLimitPercent >= 70"
      class="mb-4 rounded-2xl p-4 flex gap-3 items-start"
      :class="store.annualLimitPercent >= 90 ? 'bg-red-900/30 border border-red-500/30' : 'bg-yellow-900/30 border border-yellow-500/30'"
    >
      <i
        class="ti ti-alert-triangle text-xl mt-0.5 flex-shrink-0"
        :class="store.annualLimitPercent >= 90 ? 'text-red-400' : 'text-yellow-400'"
      />
      <div>
        <p class="text-sm font-medium" :class="store.annualLimitPercent >= 90 ? 'text-red-300' : 'text-yellow-300'">
          {{ store.annualLimitPercent >= 90 ? '⚠️ Критично! Лимит почти исчерпан' : 'Внимание: приближаетесь к лимиту' }}
        </p>
        <p class="text-xs text-gray-400 mt-0.5">
          Использовано {{ store.annualLimitPercent.toFixed(1) }}% от {{ formatKZT(store.annualLimitKZT) }}
        </p>
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

    <!-- ── ГРАФИК ДОХОДОВ ПО МЕСЯЦАМ ─────────── -->
    <div class="bg-surface-card rounded-2xl p-4 mb-5">
      <p class="text-xs text-gray-500 mb-3 uppercase tracking-widest">Доходы за 6 месяцев</p>
      <!--
        SVG-график — рисуем прямо в HTML.
        viewBox="0 0 300 80" = координатная сетка 300×80 единиц.
        Каждый rect = столбик графика.
        :height и :y вычисляются реактивно из данных store.
      -->
      <svg viewBox="0 0 300 90" class="w-full" style="overflow: visible">
        <!-- Столбики -->
        <g v-for="(bar, i) in chartBars" :key="i">
          <rect
            :x="i * 50 + 5"
            :y="90 - bar.height - 25"
            width="38"
            :height="bar.height"
            :fill="bar.isCurrentMonth ? '#6C63FF' : '#2a2a35'"
            rx="6"
          />
          <!-- Сумма над столбиком -->
          <text
            :x="i * 50 + 24"
            :y="90 - bar.height - 28"
            text-anchor="middle"
            fill="#9ca3af"
            font-size="7"
          >{{ bar.shortAmount }}</text>
          <!-- Название месяца под столбиком -->
          <text
            :x="i * 50 + 24"
            y="88"
            text-anchor="middle"
            fill="#6b7280"
            font-size="8"
          >{{ bar.month }}</text>
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
            <input
              v-model="newTx.client"
              placeholder="Название клиента"
              class="w-full bg-surface-border/50 text-white text-sm rounded-xl px-4 py-3
                     border border-white/10 outline-none focus:border-brand"
            />
            <input
              v-model="newTx.amount"
              type="number"
              placeholder="Сумма в тенге"
              class="w-full bg-surface-border/50 text-white text-sm rounded-xl px-4 py-3
                     border border-white/10 outline-none focus:border-brand"
            />
            <input
              v-model="newTx.date"
              type="date"
              class="w-full bg-surface-border/50 text-white text-sm rounded-xl px-4 py-3
                     border border-white/10 outline-none focus:border-brand"
            />
            <select
              v-model="newTx.category"
              class="w-full bg-surface-border/50 text-white text-sm rounded-xl px-4 py-3
                     border border-white/10 outline-none focus:border-brand"
            >
              <option value="Услуги">Услуги</option>
              <option value="Консалтинг">Консалтинг</option>
              <option value="Разработка">Разработка</option>
              <option value="Торговля">Торговля</option>
              <option value="Прочее">Прочее</option>
            </select>
          </div>
          <button
            @click="addTransaction"
            class="w-full bg-brand text-white rounded-xl py-3.5 mt-4 font-medium text-sm active:opacity-90"
          >
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
const newTx = ref({
  client: '',
  amount: '',
  category: 'Услуги',
  date: new Date().toISOString().split('T')[0]  // Сегодняшняя дата по умолчанию
})

// ── НАЛОГОВЫЕ КАРТОЧКИ ────────────────────────
const taxes = computed(() => [
  { label: 'ИПН 3%',   value: store.monthlyTax, icon: 'ti-chart-pie',    color: '#818cf8' },
  { label: 'ОПВ 10%',  value: store.opv,         icon: 'ti-building-bank', color: '#34d399' },
  { label: 'СО 3.5%',  value: store.so,           icon: 'ti-shield-check', color: '#60a5fa' },
  { label: 'ВОСМС 5%', value: store.vosms,        icon: 'ti-heart',        color: '#f87171' }
])

// ── ЦВЕТ ПРОГРЕСС-БАРА В ЗАВИСИМОСТИ ОТ % ────
// computed: пересчитывается автоматически при изменении store
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

// ── ДАННЫЕ ДЛЯ ГРАФИКА (последние 6 месяцев) ─
const chartBars = computed(() => {
  const months = []
  const now = new Date()

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthIncome = store.transactions
      .filter(t => {
        const td = new Date(t.date)
        return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear()
      })
      .reduce((sum, t) => sum + t.amount, 0)

    months.push({
      month: d.toLocaleString('ru', { month: 'short' }),  // "янв", "фев"...
      income: monthIncome,
      isCurrentMonth: i === 0
    })
  }

  // Максимальный доход → нужен чтобы масштабировать столбики
  const maxIncome = Math.max(...months.map(m => m.income), 1)

  return months.map(m => ({
    ...m,
    // height: высота столбика от 4 до 55px пропорционально максимуму
    height: m.income > 0 ? Math.max(4, (m.income / maxIncome) * 55) : 4,
    // Короткая сумма: 820000 → "820к"
    shortAmount: m.income > 0 ? Math.round(m.income / 1000) + 'к' : ''
  }))
})

const currentMonth = computed(() =>
  new Date().toLocaleString('ru', { month: 'long', year: 'numeric' })
)

// ── МЕТОДЫ ───────────────────────────────────
function addTransaction() {
  if (!newTx.value.client || !newTx.value.amount) return
  store.addTransaction(newTx.value)
  newTx.value = { client: '', amount: '', category: 'Услуги', date: new Date().toISOString().split('T')[0] }
  showSheet.value = false
}

function formatKZT(amount) {
  return new Intl.NumberFormat('ru-RU').format(Math.round(amount)) + ' ₸'
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString('ru', { day: 'numeric', month: 'short' })
}
</script>

<style scoped>
.balance-card {
  background: linear-gradient(135deg, #6C63FF, #4A43CC);
}
.sheet-enter-active, .sheet-leave-active { transition: opacity 0.25s ease; }
.sheet-enter-active .relative, .sheet-leave-active .relative { transition: transform 0.25s ease; }
.sheet-enter-from { opacity: 0; }
.sheet-enter-from .relative { transform: translateY(100%); }
.sheet-leave-to { opacity: 0; }
.sheet-leave-to .relative { transform: translateY(100%); }
</style>
