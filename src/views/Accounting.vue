<template>
  <div class="px-4 pt-12 pb-6">

    <h1 class="text-xl font-medium text-white mb-1">Учёт и налоги</h1>
    <p class="text-sm text-gray-500 mb-5">Упрощённая декларация · {{ currentYear }}</p>

    <!-- ── ВЫБОР ПЕРИОДА ──────────────────────────
         Пользователь выбирает: месяц или квартал или полугодие или год.
         v-model="selectedPeriod" — привязка к переменной.
         Все расчёты ниже автоматически пересчитаются при смене периода.
    -->
    <div class="bg-surface-card rounded-2xl p-4 mb-4">
      <p class="text-xs text-gray-500 uppercase tracking-widest mb-3">Период</p>

      <!-- Кнопки выбора типа периода -->
      <div class="flex gap-2 mb-3">
        <button
          v-for="p in periodTypes"
          :key="p.value"
          @click="periodType = p.value"
          class="flex-1 py-2 rounded-xl text-xs font-medium transition-colors"
          :class="periodType === p.value
            ? 'bg-brand text-white'
            : 'bg-surface-border/40 text-gray-500'"
        >
          {{ p.label }}
        </button>
      </div>

      <!-- Выбор конкретного месяца / квартала / полугодия / года -->
      <div class="flex gap-2">
        <!-- Год — всегда показываем -->
        <select
          v-model="selectedYear"
          class="bg-surface-border/40 text-white text-sm rounded-xl px-3 py-2.5
                 border border-white/10 outline-none focus:border-brand"
        >
          <option v-for="y in availableYears" :key="y" :value="y">{{ y }}</option>
        </select>

        <!-- Месяц — только когда тип "месяц" -->
        <select
          v-if="periodType === 'month'"
          v-model="selectedMonth"
          class="flex-1 bg-surface-border/40 text-white text-sm rounded-xl px-3 py-2.5
                 border border-white/10 outline-none focus:border-brand"
        >
          <option v-for="(m, i) in months" :key="i" :value="i">{{ m }}</option>
        </select>

        <!-- Квартал -->
        <select
          v-if="periodType === 'quarter'"
          v-model="selectedQuarter"
          class="flex-1 bg-surface-border/40 text-white text-sm rounded-xl px-3 py-2.5
                 border border-white/10 outline-none focus:border-brand"
        >
          <option value="1">I квартал (янв–мар)</option>
          <option value="2">II квартал (апр–июн)</option>
          <option value="3">III квартал (июл–сен)</option>
          <option value="4">IV квартал (окт–дек)</option>
        </select>

        <!-- Полугодие -->
        <select
          v-if="periodType === 'half'"
          v-model="selectedHalf"
          class="flex-1 bg-surface-border/40 text-white text-sm rounded-xl px-3 py-2.5
                 border border-white/10 outline-none focus:border-brand"
        >
          <option value="1">1-е полугодие (янв–июн)</option>
          <option value="2">2-е полугодие (июл–дек)</option>
        </select>
      </div>

      <!-- Подпись выбранного периода -->
      <p class="text-xs text-brand mt-2">📅 {{ periodLabel }}</p>
    </div>

    <!-- ── ИТОГИ ЗА ПЕРИОД ────────────────────── -->
    <div class="grid grid-cols-2 gap-2.5 mb-4">
      <div class="bg-surface-card rounded-2xl p-3.5 col-span-2">
        <p class="text-xs text-gray-500 mb-1">Доход за период</p>
        <p class="text-2xl font-medium text-white">{{ formatKZT(periodIncome) }}</p>
        <p class="text-xs text-gray-600 mt-0.5">{{ periodTxCount }} операций</p>
      </div>
      <div class="bg-surface-card rounded-2xl p-3.5">
        <i class="ti ti-chart-pie text-purple-400 text-lg mb-1 block" />
        <p class="text-white font-medium text-sm">{{ formatKZT(periodTax) }}</p>
        <p class="text-gray-500 text-xs mt-0.5">ИПН 3%</p>
      </div>
      <div class="bg-surface-card rounded-2xl p-3.5">
        <i class="ti ti-building-bank text-green-400 text-lg mb-1 block" />
        <p class="text-white font-medium text-sm">{{ formatKZT(periodSocial) }}</p>
        <p class="text-gray-500 text-xs mt-0.5">ОПВ + СО + ВОСМС</p>
      </div>
    </div>

    <!-- Итого к уплате за период -->
    <div class="bg-brand/10 border border-brand/20 rounded-2xl p-4 mb-5">
      <div class="flex justify-between items-center">
        <div>
          <p class="text-sm text-gray-400">Итого к уплате</p>
          <p class="text-xs text-gray-600 mt-0.5">{{ periodLabel }}</p>
        </div>
        <p class="text-xl font-medium text-white">{{ formatKZT(periodTotal) }}</p>
      </div>
      <div class="mt-3 pt-3 border-t border-brand/20">
        <div class="flex justify-between text-xs">
          <span class="text-gray-500">Чистый доход</span>
          <span class="text-green-400">{{ formatKZT(periodIncome - periodTotal) }}</span>
        </div>
        <div class="flex justify-between text-xs mt-1">
          <span class="text-gray-500">Налоговая нагрузка</span>
          <span class="text-gray-300">
            {{ periodIncome > 0 ? ((periodTotal / periodIncome) * 100).toFixed(1) : 0 }}%
          </span>
        </div>
      </div>
    </div>

    <!-- ── КАЛЬКУЛЯТОР ────────────────────────── -->
    <div class="bg-surface-card rounded-2xl p-4 mb-4">
      <p class="text-xs text-gray-500 uppercase tracking-widest mb-3">Калькулятор</p>
      <div class="relative mb-3">
        <input
          v-model="calcAmount"
          type="number"
          placeholder="Введите сумму дохода"
          class="w-full bg-surface-border/40 text-white text-base rounded-xl px-4 py-3
                 border border-white/10 outline-none focus:border-brand pr-8"
        />
        <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₸</span>
      </div>
      <div v-if="calcAmount > 0" class="space-y-2">
        <div v-for="item in calcResults" :key="item.label"
             class="flex justify-between items-center py-1.5 border-b border-surface-border/50">
          <div>
            <p class="text-sm text-gray-300">{{ item.label }}</p>
            <p class="text-xs text-gray-600">{{ item.formula }}</p>
          </div>
          <p class="text-sm font-medium" :class="item.color">{{ formatKZT(item.value) }}</p>
        </div>
        <div class="flex justify-between pt-1">
          <p class="text-sm text-gray-400">Итого</p>
          <p class="text-base font-medium text-white">{{ formatKZT(totalCalc) }}</p>
        </div>
      </div>
    </div>

    <!-- ── СРОКИ УПЛАТЫ ────────────────────────── -->
    <div class="bg-surface-card rounded-2xl p-4 mb-5">
      <p class="text-xs text-gray-500 uppercase tracking-widest mb-3">Сроки уплаты {{ currentYear }}</p>
      <div class="space-y-2.5">
        <div v-for="d in deadlines" :key="d.label" class="flex items-center gap-3">
          <div class="w-2 h-2 rounded-full flex-shrink-0" :class="d.dotColor" />
          <div class="flex-1">
            <p class="text-sm text-gray-300">{{ d.label }}</p>
            <p class="text-xs text-gray-600">{{ d.desc }}</p>
          </div>
          <p class="text-xs font-medium" :class="d.dotColor.replace('bg-','text-')">{{ d.date }}</p>
        </div>
      </div>
    </div>

    <!-- ── ОПЕРАЦИИ ЗА ПЕРИОД ─────────────────── -->
    <div class="flex justify-between items-center mb-3">
      <h2 class="text-xs text-gray-500 uppercase tracking-widest">Операции за период</h2>
      <p class="text-xs text-gray-600">{{ periodTxCount }} шт.</p>
    </div>

    <div v-if="periodTransactions.length === 0" class="text-center py-8">
      <i class="ti ti-inbox text-4xl text-gray-700 block mb-2" />
      <p class="text-sm text-gray-600">Нет операций за этот период</p>
    </div>

    <div v-else class="space-y-0">
      <div
        v-for="tx in periodTransactions"
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
const MZP_2026 = 85000

// ── ВЫБОР ПЕРИОДА ────────────────────────────
const periodTypes = [
  { label: 'Месяц',      value: 'month'   },
  { label: 'Квартал',    value: 'quarter' },
  { label: 'Полугодие',  value: 'half'    },
  { label: 'Год',        value: 'year'    }
]

const periodType    = ref('month')
const selectedYear  = ref(currentYear)
const selectedMonth = ref(new Date().getMonth())  // 0 = январь
const selectedQuarter = ref(Math.ceil((new Date().getMonth() + 1) / 3))
const selectedHalf  = ref(new Date().getMonth() < 6 ? 1 : 2)

const availableYears = [2024, 2025, 2026]

const months = ['Январь','Февраль','Март','Апрель','Май','Июнь',
                'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']

// Человекочитаемое название периода
const periodLabel = computed(() => {
  if (periodType.value === 'month')
    return `${months[selectedMonth.value]} ${selectedYear.value}`
  if (periodType.value === 'quarter')
    return `${selectedQuarter.value}-й квартал ${selectedYear.value}`
  if (periodType.value === 'half')
    return `${selectedHalf.value}-е полугодие ${selectedYear.value}`
  return `${selectedYear.value} год`
})

// Функция: попадает ли дата операции в выбранный период
function inPeriod(dateStr) {
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = d.getMonth() // 0-11

  if (y !== selectedYear.value) return false

  if (periodType.value === 'month')
    return m === selectedMonth.value

  if (periodType.value === 'quarter') {
    // Квартал 1 = месяцы 0,1,2 / квартал 2 = 3,4,5 / и т.д.
    const q = Math.ceil((m + 1) / 3)
    return q === Number(selectedQuarter.value)
  }

  if (periodType.value === 'half')
    return selectedHalf.value === 1 ? m < 6 : m >= 6

  return true // год — все операции этого года
}

// Отфильтрованные операции за период
const periodTransactions = computed(() =>
  store.transactions.filter(t => inPeriod(t.date))
)

const periodTxCount = computed(() => periodTransactions.value.length)

// Доход за период — сумма всех операций
const periodIncome = computed(() =>
  periodTransactions.value.reduce((sum, t) => sum + t.amount, 0)
)

// Налоги за период
const periodTax = computed(() => Math.round(periodIncome.value * 0.03))

// Социальные платежи: считаем сколько месяцев в периоде
const monthsInPeriod = computed(() => {
  if (periodType.value === 'month')   return 1
  if (periodType.value === 'quarter') return 3
  if (periodType.value === 'half')    return 6
  return 12
})

const periodSocial = computed(() =>
  (Math.round(MZP_2026 * 0.10) + Math.round(MZP_2026 * 0.035) + Math.round(MZP_2026 * 0.05))
  * monthsInPeriod.value
)

const periodTotal = computed(() => periodTax.value + periodSocial.value)

// ── КАЛЬКУЛЯТОР ──────────────────────────────
const calcAmount = ref('')

const calcResults = computed(() => [
  { label: 'ИПН 3%',   formula: `${calcAmount.value} × 3%`,  value: Math.round(calcAmount.value * 0.03),   color: 'text-purple-400' },
  { label: 'ОПВ 10%',  formula: `МЗП × 10%`,                 value: Math.round(MZP_2026 * 0.10),           color: 'text-green-400'  },
  { label: 'СО 3.5%',  formula: `МЗП × 3.5%`,                value: Math.round(MZP_2026 * 0.035),          color: 'text-blue-400'   },
  { label: 'ВОСМС 5%', formula: `МЗП × 5%`,                  value: Math.round(MZP_2026 * 0.05),           color: 'text-red-400'    }
])

const totalCalc = computed(() =>
  calcResults.value.reduce((sum, i) => sum + i.value, 0)
)

// ── СРОКИ ────────────────────────────────────
const deadlines = [
  { label: 'ОПВ + СО + ВОСМС',          desc: 'Ежемесячно',        date: '25 числа',  dotColor: 'bg-yellow-500' },
  { label: 'Декларация ф.910 (1-е полуг)', desc: 'За янв–июн',     date: '15 авг',    dotColor: 'bg-brand'      },
  { label: 'Уплата налогов (1-е полуг)', desc: 'ИПН за янв–июн',   date: '25 авг',    dotColor: 'bg-green-500'  },
  { label: 'Декларация ф.910 (2-е полуг)', desc: 'За июл–дек',     date: '15 фев',    dotColor: 'bg-brand'      },
  { label: 'Уплата налогов (2-е полуг)', desc: 'ИПН за июл–дек',   date: '25 фев',    dotColor: 'bg-green-500'  },
]

function formatKZT(n) {
  return new Intl.NumberFormat('ru-RU').format(Math.round(n)) + ' ₸'
}
</script>
