<template>
  <div class="px-4 pt-12 pb-6">

    <h1 class="text-xl font-medium text-white mb-1">Настройки</h1>
    <p class="text-sm text-gray-500 mb-5">Данные ИП и налоговые параметры</p>

    <!-- ── БЛОК 1: ДАННЫЕ ИП / ТОО ──────────────
         Эти данные будут автоматически вставляться в АВР.
         v-model="form.companyName" — двусторонняя привязка:
         ввёл в поле → сразу обновилась переменная form.companyName
    -->
    <div class="bg-surface-card rounded-2xl p-4 mb-4">
      <div class="flex items-center gap-2 mb-4">
        <i class="ti ti-building text-brand text-xl" />
        <p class="text-sm font-medium text-white">Данные организации</p>
      </div>

      <div class="space-y-3">
        <div>
          <label class="text-xs text-gray-500 mb-1 block">Название ИП / ТОО</label>
          <input
            v-model="form.companyName"
            placeholder="ИП Иванов Иван Иванович"
            class="input-field"
          />
        </div>

        <div>
          <label class="text-xs text-gray-500 mb-1 block">БИН / ИИН</label>
          <input
            v-model="form.bin"
            placeholder="123456789012"
            maxlength="12"
            class="input-field"
          />
          <!-- Подсказка: показываем если введено неверное количество цифр -->
          <p v-if="form.bin && form.bin.length !== 12" class="text-xs text-red-400 mt-1">
            БИН/ИИН должен содержать 12 цифр
          </p>
        </div>

        <div>
          <label class="text-xs text-gray-500 mb-1 block">Юридический адрес</label>
          <input
            v-model="form.address"
            placeholder="г. Алматы, ул. Абая 1"
            class="input-field"
          />
        </div>

        <div>
          <label class="text-xs text-gray-500 mb-1 block">Телефон</label>
          <input
            v-model="form.phone"
            placeholder="+7 777 000 00 00"
            class="input-field"
          />
        </div>

        <div>
          <label class="text-xs text-gray-500 mb-1 block">Email</label>
          <input
            v-model="form.email"
            placeholder="ip@example.com"
            type="email"
            class="input-field"
          />
        </div>
      </div>
    </div>

    <!-- ── БЛОК 2: БАНКОВСКИЕ ДАННЫЕ ─────────── -->
    <div class="bg-surface-card rounded-2xl p-4 mb-4">
      <div class="flex items-center gap-2 mb-4">
        <i class="ti ti-building-bank text-green-400 text-xl" />
        <p class="text-sm font-medium text-white">Банковские реквизиты</p>
      </div>

      <div class="space-y-3">
        <div>
          <label class="text-xs text-gray-500 mb-1 block">Название банка</label>
          <select v-model="form.bankName" class="input-field">
            <option value="">Выберите банк</option>
            <option value="Kaspi Bank">Kaspi Bank</option>
            <option value="Halyk Bank">Halyk Bank</option>
            <option value="ForteBank">ForteBank</option>
            <option value="Jusan Bank">Jusan Bank</option>
            <option value="Freedom Bank">Freedom Bank</option>
            <option value="БЦК">БЦК (Банк ЦентрКредит)</option>
            <option value="Другой">Другой</option>
          </select>
        </div>

        <div>
          <label class="text-xs text-gray-500 mb-1 block">Номер счёта (IBAN)</label>
          <input
            v-model="form.bankAccount"
            placeholder="KZ00 0000 0000 0000 0000"
            class="input-field font-mono"
          />
        </div>
      </div>
    </div>

    <!-- ── БЛОК 3: НАЛОГОВЫЕ ПАРАМЕТРЫ ──────────
         Ключевая фича: пользователь задаёт свою зарплатную базу.
         Все расчёты ОПВ/СО/ВОСМС будут использовать это значение.
    -->
    <div class="bg-surface-card rounded-2xl p-4 mb-4">
      <div class="flex items-center gap-2 mb-1">
        <i class="ti ti-calculator text-purple-400 text-xl" />
        <p class="text-sm font-medium text-white">Налоговые параметры</p>
      </div>
      <p class="text-xs text-gray-600 mb-4 ml-7">
        По умолчанию ОПВ/СО/ВОСМС считаются от МЗП (85 000 ₸).
        Если вы платите себе другую зарплату — укажите её здесь.
      </p>

      <!-- Зарплатная база с живым пересчётом -->
      <div class="mb-4">
        <label class="text-xs text-gray-500 mb-1 block">
          Зарплатная база (для ОПВ / СО / ВОСМС)
        </label>
        <div class="relative">
          <input
            v-model="form.salaryBase"
            type="number"
            placeholder="85000"
            class="input-field pr-8"
          />
          <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₸</span>
        </div>

        <!-- Живой пересчёт налогов при вводе суммы -->
        <div v-if="form.salaryBase > 0" class="mt-3 bg-surface-border/30 rounded-xl p-3 space-y-1.5">
          <p class="text-xs text-gray-500 mb-2">Ежемесячные платежи с этой базы:</p>
          <div class="flex justify-between text-xs">
            <span class="text-gray-400">ОПВ (10%)</span>
            <span class="text-green-400">{{ formatKZT(form.salaryBase * 0.10) }}</span>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-gray-400">СО (3.5%)</span>
            <span class="text-blue-400">{{ formatKZT(form.salaryBase * 0.035) }}</span>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-gray-400">ВОСМС (5%)</span>
            <span class="text-red-400">{{ formatKZT(form.salaryBase * 0.05) }}</span>
          </div>
          <div class="border-t border-surface-border pt-1.5 flex justify-between text-xs">
            <span class="text-gray-300">Итого в месяц</span>
            <span class="text-white font-medium">{{ formatKZT(form.salaryBase * 0.185) }}</span>
          </div>
        </div>
      </div>

      <!-- Налоговый режим -->
      <div class="mb-3">
        <label class="text-xs text-gray-500 mb-1 block">Налоговый режим</label>
        <select v-model="form.taxRegime" class="input-field">
          <option value="simplified">Упрощённая декларация (ф.910) — 3%</option>
          <option value="patent">Патент — фиксированная сумма</option>
        </select>
      </div>

      <!-- Ставка ИПН (только для упрощёнки) -->
      <div v-if="form.taxRegime === 'simplified'">
        <label class="text-xs text-gray-500 mb-1 block">Ставка ИПН (%)</label>
        <input
          v-model="form.ipnRate"
          type="number"
          min="1" max="20"
          class="input-field"
        />
        <p class="text-xs text-gray-600 mt-1">Стандартная ставка для упрощёнки — 3%</p>
      </div>
    </div>

    <!-- ── КНОПКА СОХРАНЕНИЯ ──────────────────── -->
    <!--
      :disabled="!isFormValid" — кнопка неактивна пока форма не заполнена
      @click="saveSettings" — при клике вызываем метод
    -->
    <button
      @click="saveSettings"
      :disabled="!isFormValid"
      class="w-full py-4 rounded-2xl font-medium text-sm transition-all"
      :class="isFormValid
        ? 'bg-brand text-white active:opacity-90'
        : 'bg-surface-border/40 text-gray-600 cursor-not-allowed'"
    >
      <i class="ti ti-check mr-2" />
      Сохранить настройки
    </button>

    <!-- Уведомление об успешном сохранении -->
    <Transition name="toast">
      <div
        v-if="saved"
        class="fixed bottom-28 left-1/2 -translate-x-1/2 bg-green-900/90 border border-green-500/30
               text-green-300 text-sm px-5 py-3 rounded-2xl flex items-center gap-2 z-50"
      >
        <i class="ti ti-check" /> Настройки сохранены!
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useFinanceStore } from '@/stores/finance'

const store = useFinanceStore()

// form — локальная копия настроек для редактирования.
// Мы не меняем store напрямую — сначала пользователь редактирует форму,
// потом нажимает "Сохранить" → тогда обновляем store.
// Spread оператор {...} копирует все поля объекта.
const form = ref({ ...store.settings })

// Флаг для показа уведомления "Сохранено!"
const saved = ref(false)

// Валидация: кнопка активна только если заполнены обязательные поля
const isFormValid = computed(() =>
  form.value.companyName.trim().length > 0 &&
  form.value.bin.length === 12 &&
  form.value.salaryBase > 0
)

// Сохраняем настройки в store (который сохранит в localStorage)
function saveSettings() {
  store.saveSettings(form.value)

  // Показываем уведомление на 2 секунды
  saved.value = true
  setTimeout(() => { saved.value = false }, 2000)
}

function formatKZT(n) {
  return new Intl.NumberFormat('ru-RU').format(Math.round(n)) + ' ₸'
}
</script>

<style scoped>
/* Единый стиль для всех полей ввода в настройках */
.input-field {
  width: 100%;
  background: rgba(42, 42, 53, 0.5);
  color: white;
  font-size: 0.875rem;
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  outline: none;
  transition: border-color 0.15s;
  display: block;
}
.input-field:focus { border-color: #6C63FF; }
.input-field::placeholder { color: #4b5563; }

/* Выпадающий список */
select.input-field { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 1rem center; padding-right: 2.5rem; }

/* Анимация тоста */
.toast-enter-active, .toast-leave-active { transition: opacity 0.3s, transform 0.3s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(10px); }
</style>
