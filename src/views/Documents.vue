<template>
  <div class="px-4 pt-12 pb-6">

    <h1 class="text-xl font-medium text-white mb-1">АВР документы</h1>
    <p class="text-sm text-gray-500 mb-4">Форма Р-1 · Приказ МФ РК № 562 от 20.12.2012</p>

    <!-- Предупреждение если не заполнены настройки -->
    <div v-if="!isSellerReady" class="bg-yellow-900/30 border border-yellow-500/30 rounded-2xl p-4 mb-4 flex gap-3">
      <i class="ti ti-alert-triangle text-yellow-400 text-xl flex-shrink-0 mt-0.5" />
      <div>
        <p class="text-sm text-yellow-300 font-medium">Заполните данные ИП в настройках</p>
        <p class="text-xs text-gray-400 mt-0.5">Название, БИН и адрес нужны для АВР.</p>
        <RouterLink to="/settings" class="text-xs text-brand mt-2 block">Открыть настройки →</RouterLink>
      </div>
    </div>

    <!-- Список созданных АВР -->
    <div v-if="documents.length > 0" class="mb-5">
      <p class="text-xs text-gray-500 uppercase tracking-widest mb-3">Созданные АВР</p>
      <div class="space-y-2">
        <div v-for="doc in documents" :key="doc.id"
             class="bg-surface-card rounded-2xl p-4 flex items-center gap-3">
          <div class="w-10 h-10 bg-brand/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <i class="ti ti-file-text text-brand text-xl" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm text-white">АВР № {{ doc.number }} от {{ doc.date }}</p>
            <p class="text-xs text-gray-500 truncate">{{ doc.buyer }}</p>
            <p class="text-xs text-brand font-medium">{{ formatKZT(doc.amount) }}</p>
          </div>
          <button @click="regenerate(doc)"
            class="w-9 h-9 bg-surface-border/50 rounded-xl flex items-center justify-center">
            <i class="ti ti-download text-gray-400 text-base" />
          </button>
          <button @click="deleteDoc(doc.id)"
            class="w-9 h-9 bg-red-900/30 rounded-xl flex items-center justify-center">
            <i class="ti ti-trash text-red-400 text-base" />
          </button>
        </div>
      </div>
    </div>

    <!-- ── ФОРМА ─────────────────────────────── -->
    <div class="bg-surface-card rounded-2xl p-4 mb-4">
      <div class="flex items-center gap-2 mb-4">
        <i class="ti ti-file-plus text-brand text-xl" />
        <p class="text-sm font-medium text-white">Новый АВР</p>
      </div>

      <!-- Номер и дата -->
      <div class="flex gap-2 mb-4">
        <div class="w-24">
          <label class="text-xs text-gray-500 mb-1 block">№ АВР</label>
          <input v-model="form.number" placeholder="1" class="input-field" />
        </div>
        <div class="flex-1">
          <label class="text-xs text-gray-500 mb-1 block">Дата составления</label>
          <input v-model="form.date" type="date" class="input-field" />
        </div>
      </div>

      <!-- Договор -->
      <div class="mb-4">
        <label class="text-xs text-gray-500 mb-1 block">Договор (контракт)</label>
        <input v-model="form.contract" placeholder="№ 1 от 01.01.2026" class="input-field" />
      </div>

      <!-- ЗАКАЗЧИК -->
      <p class="text-xs text-gray-500 uppercase tracking-wider mb-2 mt-2">Заказчик</p>
      <div class="space-y-3 mb-4">
        <div>
          <label class="text-xs text-gray-500 mb-1 block">Название организации</label>
          <input v-model="form.buyer.companyName" placeholder='ТОО "Компания"' class="input-field" />
        </div>
        <div>
          <label class="text-xs text-gray-500 mb-1 block">БИН / ИИН заказчика</label>
          <input
            v-model="form.buyer.bin"
            placeholder="123456789012"
            maxlength="12"
            class="input-field"
            :class="form.buyer.bin && form.buyer.bin.length !== 12 ? 'border-red-500' : ''"
          />
          <p v-if="form.buyer.bin && form.buyer.bin.length !== 12"
             class="text-xs text-red-400 mt-1 flex items-center gap-1">
            <i class="ti ti-alert-circle" />
            БИН/ИИН должен содержать ровно 12 цифр (сейчас {{ form.buyer.bin.length }})
          </p>
          <p v-else-if="form.buyer.bin.length === 12"
             class="text-xs text-green-400 mt-1 flex items-center gap-1">
            <i class="ti ti-check" /> Верно
          </p>
        </div>
        <div>
          <label class="text-xs text-gray-500 mb-1 block">Адрес</label>
          <input v-model="form.buyer.address" placeholder="г. Алматы, ул. Абая 1" class="input-field" />
        </div>
      </div>

      <!-- УСЛУГИ — можно добавить несколько строк -->
      <div class="flex justify-between items-center mb-2">
        <p class="text-xs text-gray-500 uppercase tracking-wider">Услуги / Работы</p>
        <button @click="addServiceRow"
          class="text-xs text-brand flex items-center gap-1">
          <i class="ti ti-plus text-xs" /> Добавить строку
        </button>
      </div>

      <div class="space-y-3 mb-2">
        <div v-for="(svc, idx) in form.services" :key="idx"
             class="bg-surface-border/20 rounded-xl p-3">
          <div class="flex justify-between items-start mb-2">
            <p class="text-xs text-gray-500">Строка {{ idx + 1 }}</p>
            <button v-if="form.services.length > 1" @click="removeServiceRow(idx)"
              class="text-red-400 text-xs">
              <i class="ti ti-x" />
            </button>
          </div>
          <div class="space-y-2">
            <div>
              <label class="text-xs text-gray-600 mb-1 block">Наименование услуги / работы</label>
              <textarea v-model="svc.name" rows="2" placeholder="Описание услуги..." class="input-field resize-none text-xs" />
            </div>
            <div class="flex gap-2">
              <div class="flex-1">
                <label class="text-xs text-gray-600 mb-1 block">Дата вып. работ</label>
                <input v-model="svc.workDate" type="date" class="input-field text-xs" />
              </div>
              <div class="w-20">
                <label class="text-xs text-gray-600 mb-1 block">Ед. изм.</label>
                <select v-model="svc.unit" class="input-field text-xs">
                  <option>Услуга</option>
                  <option>Штук</option>
                  <option>Час</option>
                  <option>День</option>
                  <option>Месяц</option>
                </select>
              </div>
            </div>
            <div class="flex gap-2">
              <div class="flex-1">
                <label class="text-xs text-gray-600 mb-1 block">Кол-во</label>
                <input v-model="svc.qty" type="number" min="1" placeholder="1" class="input-field text-xs" />
              </div>
              <div class="flex-1">
                <label class="text-xs text-gray-600 mb-1 block">Цена за ед. (₸)</label>
                <input v-model="svc.price" type="number" placeholder="0" class="input-field text-xs" />
              </div>
              <div class="flex-1">
                <label class="text-xs text-gray-600 mb-1 block">Сумма</label>
                <p class="input-field text-xs text-brand bg-surface-border/10">
                  {{ formatKZT((svc.qty || 1) * (svc.price || 0)) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Итого -->
      <div class="bg-brand/10 border border-brand/20 rounded-xl p-3 mt-3">
        <div class="flex justify-between text-sm">
          <span class="text-gray-400">Итого по АВР</span>
          <span class="text-white font-medium">{{ formatKZT(totalAmount) }}</span>
        </div>
        <p class="text-xs text-gray-600 mt-1">НДС: не облагается (упрощённая декларация)</p>
      </div>
    </div>

    <!-- Кнопка генерации -->
    <button
      @click="generatePDF"
      :disabled="!isFormReady"
      class="w-full py-4 rounded-2xl font-medium text-sm transition-all flex items-center justify-center gap-2"
      :class="isFormReady ? 'bg-brand text-white' : 'bg-surface-border/40 text-gray-600 cursor-not-allowed'"
    >
      <i class="ti ti-file-download text-lg" />
      Скачать АВР · Форма Р-1 (PDF)
    </button>
    <p class="text-xs text-gray-700 text-center mt-2">
      Приложение 50 к приказу МФ РК от 20.12.2012 № 562
    </p>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useFinanceStore } from '@/stores/finance'
import { generateAvr } from '@/utils/generateAvr'

const store = useFinanceStore()

function loadDocs() {
  try { return JSON.parse(localStorage.getItem('avr_documents') || '[]') } catch { return [] }
}
function saveDocs(docs) { localStorage.setItem('avr_documents', JSON.stringify(docs)) }

const documents = ref(loadDocs())

const nextNumber = computed(() =>
  documents.value.length > 0 ? Math.max(...documents.value.map(d => Number(d.number) || 0)) + 1 : 1
)

function emptyService() {
  return { name: '', workDate: '', unit: 'Услуга', qty: 1, price: '', reportInfo: '' }
}

const form = ref({
  number:   String(nextNumber.value),
  date:     new Date().toISOString().split('T')[0],
  contract: '',
  buyer: { companyName: '', bin: '', address: '' },
  services: [emptyService()]
})

const isSellerReady = computed(() =>
  store.settings.companyName && store.settings.bin && store.settings.address
)

const totalAmount = computed(() =>
  form.value.services.reduce((sum, s) => sum + (Number(s.qty) || 1) * (Number(s.price) || 0), 0)
)

const isFormReady = computed(() =>
  form.value.buyer.companyName &&
  form.value.buyer.bin.length === 12 &&
  form.value.services.some(s => s.name && s.price > 0)
)

function addServiceRow() { form.value.services.push(emptyService()) }
function removeServiceRow(idx) { form.value.services.splice(idx, 1) }

function generatePDF() {
  // Форматируем дату: из yyyy-mm-dd в dd.mm.yyyy для PDF
  const dateParts = form.value.date.split('-')
  const dateFormatted = dateParts.length === 3
    ? `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}`
    : form.value.date

  const avrData = {
    number:   form.value.number,
    date:     dateFormatted,
    contract: form.value.contract,
    services: form.value.services.map(s => ({
      ...s,
      qty:   Number(s.qty) || 1,
      price: Number(s.price) || 0,
      workDate: s.workDate ? s.workDate.split('-').reverse().join('.') : ''
    })),
    seller:   store.settings,
    buyer:    form.value.buyer
  }

  generateAvr(avrData)

  // Сохраняем в список
  const newDoc = {
    id:       Date.now(),
    number:   form.value.number,
    date:     dateFormatted,
    buyer:    form.value.buyer.companyName,
    amount:   totalAmount.value,
    fullData: avrData
  }
  documents.value.unshift(newDoc)
  saveDocs(documents.value)

  // Сброс формы
  form.value = {
    number:   String(nextNumber.value),
    date:     new Date().toISOString().split('T')[0],
    contract: '',
    buyer:    { companyName: '', bin: '', address: '' },
    services: [emptyService()]
  }
}

function regenerate(doc) { generateAvr(doc.fullData) }
function deleteDoc(id) {
  documents.value = documents.value.filter(d => d.id !== id)
  saveDocs(documents.value)
}

function formatKZT(n) {
  return new Intl.NumberFormat('ru-RU').format(Math.round(n || 0)) + ' ₸'
}
</script>

<style scoped>
.input-field {
  width: 100%;
  background: rgba(42, 42, 53, 0.5);
  color: white;
  font-size: 0.875rem;
  border-radius: 0.75rem;
  padding: 0.6rem 0.875rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  outline: none;
  transition: border-color 0.15s;
  display: block;
}
.input-field:focus { border-color: #6C63FF; }
.input-field::placeholder { color: #4b5563; }
select.input-field {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  padding-right: 2rem;
}
</style>
