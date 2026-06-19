<template>
  <div class="px-4 pt-12 pb-6">

    <h1 class="text-xl font-medium text-white mb-1">АВР документы</h1>
    <p class="text-sm text-gray-500 mb-5">Акты выполненных работ (форма Р-1)</p>

    <!-- ── ПРЕДУПРЕЖДЕНИЕ ЕСЛИ НЕТ НАСТРОЕК ──
         Если пользователь не заполнил данные ИП в настройках —
         показываем подсказку. computed isSellerReady проверяет это.
    -->
    <div
      v-if="!isSellerReady"
      class="bg-yellow-900/30 border border-yellow-500/30 rounded-2xl p-4 mb-4 flex gap-3"
    >
      <i class="ti ti-alert-triangle text-yellow-400 text-xl flex-shrink-0 mt-0.5" />
      <div>
        <p class="text-sm text-yellow-300 font-medium">Заполните данные ИП</p>
        <p class="text-xs text-gray-400 mt-0.5">Перейдите в Настройки и заполните название, БИН и адрес — они автоматически попадут в АВР.</p>
        <RouterLink to="/settings" class="text-xs text-brand mt-2 block">
          Открыть настройки →
        </RouterLink>
      </div>
    </div>

    <!-- ── СПИСОК СОЗДАННЫХ АВР ───────────────
         v-if / v-else — два состояния: есть документы / нет документов
    -->
    <div v-if="documents.length > 0" class="mb-5">
      <p class="text-xs text-gray-500 uppercase tracking-widest mb-3">Созданные АВР</p>
      <div class="space-y-2">
        <div
          v-for="doc in documents"
          :key="doc.id"
          class="bg-surface-card rounded-2xl p-4 flex items-center gap-3"
        >
          <div class="w-10 h-10 bg-brand/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <i class="ti ti-file-text text-brand text-xl" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm text-white truncate">АВР № {{ doc.number }}</p>
            <p class="text-xs text-gray-500">{{ doc.buyer }} · {{ formatKZT(doc.amount) }}</p>
            <p class="text-xs text-gray-600">{{ doc.date }}</p>
          </div>
          <!-- Кнопка перегенерации PDF -->
          <button
            @click="regenerate(doc)"
            class="w-9 h-9 bg-surface-border/50 rounded-xl flex items-center justify-center flex-shrink-0"
          >
            <i class="ti ti-download text-gray-400 text-base" />
          </button>
          <button
            @click="deleteDoc(doc.id)"
            class="w-9 h-9 bg-red-900/30 rounded-xl flex items-center justify-center flex-shrink-0"
          >
            <i class="ti ti-trash text-red-400 text-base" />
          </button>
        </div>
      </div>
    </div>

    <!-- ── ФОРМА СОЗДАНИЯ АВР ─────────────────
         Разбита на 3 секции: данные заказчика, договор, услуга
    -->
    <div class="bg-surface-card rounded-2xl p-4 mb-4">
      <div class="flex items-center gap-2 mb-4">
        <i class="ti ti-file-plus text-brand text-xl" />
        <p class="text-sm font-medium text-white">Новый АВР</p>
      </div>

      <!-- Номер и дата -->
      <div class="flex gap-2 mb-3">
        <div class="flex-1">
          <label class="text-xs text-gray-500 mb-1 block">Номер АВР</label>
          <input
            v-model="form.number"
            placeholder="1"
            class="input-field"
          />
        </div>
        <div class="flex-1">
          <label class="text-xs text-gray-500 mb-1 block">Дата</label>
          <input
            v-model="form.date"
            type="date"
            class="input-field"
          />
        </div>
      </div>

      <!-- Данные заказчика -->
      <p class="text-xs text-gray-500 uppercase tracking-wider mb-2 mt-4">Заказчик</p>

      <div class="space-y-3 mb-4">
        <div>
          <label class="text-xs text-gray-500 mb-1 block">Название организации</label>
          <input
            v-model="form.buyer.companyName"
            placeholder='ТОО "Компания Заказчика"'
            class="input-field"
          />
        </div>
        <div>
          <label class="text-xs text-gray-500 mb-1 block">БИН / ИИН заказчика</label>
          <input
            v-model="form.buyer.bin"
            placeholder="123456789012"
            maxlength="12"
            class="input-field"
          />
        </div>
        <div>
          <label class="text-xs text-gray-500 mb-1 block">Адрес заказчика</label>
          <input
            v-model="form.buyer.address"
            placeholder="г. Алматы, ул. Абая 1"
            class="input-field"
          />
        </div>
      </div>

      <!-- Договор и услуга -->
      <p class="text-xs text-gray-500 uppercase tracking-wider mb-2">Договор и услуга</p>

      <div class="space-y-3">
        <div>
          <label class="text-xs text-gray-500 mb-1 block">Основание (договор)</label>
          <input
            v-model="form.contract"
            placeholder="Договор № 1 от 01.01.2026"
            class="input-field"
          />
        </div>
        <div>
          <label class="text-xs text-gray-500 mb-1 block">Наименование услуги / работ</label>
          <textarea
            v-model="form.service"
            placeholder="Разработка мобильного приложения, оказание консультационных услуг..."
            rows="3"
            class="input-field resize-none"
          />
        </div>
        <div>
          <label class="text-xs text-gray-500 mb-1 block">Сумма</label>
          <div class="relative">
            <input
              v-model="form.amount"
              type="number"
              placeholder="350000"
              class="input-field pr-8"
            />
            <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₸</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── ПРЕВЬЮ ПЕРЕД ГЕНЕРАЦИЕЙ ────────────
         Показываем краткое превью чтобы пользователь
         мог проверить данные перед скачиванием PDF
    -->
    <div v-if="isFormReady" class="bg-brand/10 border border-brand/20 rounded-2xl p-4 mb-4">
      <p class="text-xs text-gray-500 uppercase tracking-widest mb-3">Превью АВР</p>
      <div class="space-y-1.5 text-sm">
        <div class="flex justify-between">
          <span class="text-gray-500">АВР №</span>
          <span class="text-white">{{ form.number }} от {{ form.date }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">Исполнитель</span>
          <span class="text-white truncate ml-4 max-w-[55%] text-right">{{ store.settings.companyName }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">Заказчик</span>
          <span class="text-white truncate ml-4 max-w-[55%] text-right">{{ form.buyer.companyName }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">Услуга</span>
          <span class="text-white truncate ml-4 max-w-[55%] text-right">{{ form.service }}</span>
        </div>
        <div class="flex justify-between border-t border-brand/20 pt-2 mt-2">
          <span class="text-gray-400 font-medium">Сумма</span>
          <span class="text-white font-medium">{{ formatKZT(form.amount) }}</span>
        </div>
      </div>
    </div>

    <!-- ── КНОПКА ГЕНЕРАЦИИ PDF ───────────────── -->
    <button
      @click="generatePDF"
      :disabled="!isFormReady"
      class="w-full py-4 rounded-2xl font-medium text-sm transition-all flex items-center justify-center gap-2"
      :class="isFormReady
        ? 'bg-brand text-white active:opacity-90'
        : 'bg-surface-border/40 text-gray-600 cursor-not-allowed'"
    >
      <i class="ti ti-file-download text-lg" />
      Скачать АВР в PDF
    </button>

    <p class="text-xs text-gray-700 text-center mt-3">
      PDF скачается автоматически · Данные ИП берутся из настроек
    </p>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useFinanceStore } from '@/stores/finance'
import { generateAvr } from '@/utils/generateAvr'

const store = useFinanceStore()

// Загружаем сохранённые документы из localStorage
function loadDocs() {
  try { return JSON.parse(localStorage.getItem('avr_documents') || '[]') } catch { return [] }
}
function saveDocs(docs) {
  localStorage.setItem('avr_documents', JSON.stringify(docs))
}

const documents = ref(loadDocs())

// Автоматически определяем следующий номер АВР
const nextNumber = computed(() =>
  documents.value.length > 0
    ? Math.max(...documents.value.map(d => Number(d.number) || 0)) + 1
    : 1
)

// Форма — реактивный объект с вложенным объектом buyer
const form = ref({
  number:   String(nextNumber.value),
  date:     new Date().toLocaleDateString('ru', { day:'2-digit', month:'2-digit', year:'numeric' }).replace(/\//g, '.'),
  contract: '',
  service:  '',
  amount:   '',
  buyer: {
    companyName: '',
    bin:         '',
    address:     ''
  }
})

// Данные исполнителя берутся из настроек store
const isSellerReady = computed(() =>
  store.settings.companyName && store.settings.bin && store.settings.address
)

// Форма готова если заполнены все обязательные поля
const isFormReady = computed(() =>
  form.value.buyer.companyName &&
  form.value.buyer.bin.length === 12 &&
  form.value.service &&
  form.value.amount > 0
)

// Генерируем PDF и сохраняем в список
function generatePDF() {
  const avrData = {
    number:   form.value.number,
    date:     form.value.date,
    contract: form.value.contract,
    service:  form.value.service,
    amount:   Number(form.value.amount),
    seller:   store.settings,   // Данные ИП из настроек!
    buyer:    form.value.buyer
  }

  // Вызываем утилиту — она скачает PDF
  generateAvr(avrData)

  // Сохраняем в список документов
  const newDoc = {
    id:      Date.now(),
    number:  form.value.number,
    date:    form.value.date,
    buyer:   form.value.buyer.companyName,
    service: form.value.service,
    amount:  Number(form.value.amount),
    // Сохраняем всю форму для перегенерации
    fullData: avrData
  }

  documents.value.unshift(newDoc)
  saveDocs(documents.value)

  // Сбрасываем форму для следующего АВР
  form.value = {
    number:   String(nextNumber.value),
    date:     new Date().toLocaleDateString('ru', { day:'2-digit', month:'2-digit', year:'numeric' }).replace(/\//g, '.'),
    contract: '',
    service:  '',
    amount:   '',
    buyer: { companyName: '', bin: '', address: '' }
  }
}

// Перегенерация существующего документа
function regenerate(doc) {
  generateAvr(doc.fullData)
}

// Удаление документа из списка
function deleteDoc(id) {
  documents.value = documents.value.filter(d => d.id !== id)
  saveDocs(documents.value)
}

function formatKZT(n) {
  return new Intl.NumberFormat('ru-RU').format(Math.round(n)) + ' ₸'
}
</script>

<style scoped>
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
</style>
