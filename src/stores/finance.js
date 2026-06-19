// ─────────────────────────────────────────────
// 📌 stores/finance.js — хранилище данных
//
// Новое в этой версии:
// - settings: данные ИП и налоговые параметры
// - localStorage: данные сохраняются между перезагрузками
//   (persist = сохранить). Без этого при F5 всё сбрасывается.
// ─────────────────────────────────────────────

import { defineStore } from 'pinia'

const MRP_2026 = 3932
const ANNUAL_LIMIT_MRP = 24038

// Загружаем сохранённые данные из localStorage
// JSON.parse — превращаем строку обратно в объект
function load(key, fallback) {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : fallback
  } catch { return fallback }
}

// Сохраняем объект в localStorage
// JSON.stringify — превращаем объект в строку для хранения
function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export const useFinanceStore = defineStore('finance', {
  state: () => ({
    // ── НАСТРОЙКИ ИП ───────────────────────────
    // load() — берём из localStorage или используем дефолт
    settings: load('ip_settings', {
      // Данные ИП / ТОО (для АВР)
      companyName:  '',        // "ИП Иванов Иван Иванович"
      bin:          '',        // БИН/ИИН 12 цифр
      address:      '',        // Юридический адрес
      bankName:     '',        // Название банка
      bankAccount:  '',        // Номер счёта (IBAN)
      phone:        '',        // Телефон
      email:        '',        // Email

      // Налоговые параметры
      // Пользователь может изменить зарплатную базу:
      // вместо МЗП 85 000 ₸ поставить свою сумму
      salaryBase:   85000,     // База для расчёта ОПВ/СО/ВОСМС
      taxRegime:    'simplified', // Режим: simplified = упрощёнка

      // Ставки (можно будет расширить)
      ipnRate:      3,         // ИПН % (для упрощёнки = 3%)
      opvRate:      10,        // ОПВ %
      soRate:       3.5,       // СО %
      vosmcRate:    5,         // ВОСМС %
    }),

    // ── ОПЕРАЦИИ ───────────────────────────────
    transactions: load('ip_transactions', [
      { id: 1, date: '2026-06-17', client: 'ООО "Алатау Трейд"',   amount: 350000, category: 'Услуги'     },
      { id: 2, date: '2026-06-15', client: 'ИП Джаксыбеков',       amount: 470000, category: 'Консалтинг' },
      { id: 3, date: '2026-05-28', client: 'ТОО "Нур Технологии"', amount: 680000, category: 'Разработка'  },
      { id: 4, date: '2026-05-10', client: 'ООО "Степной ветер"',  amount: 220000, category: 'Услуги'     },
    ])
  }),

  getters: {
    // Данные ИП для удобства
    ip: (state) => ({
      name:   state.settings.companyName || 'Моё ИП',
      bin:    state.settings.bin,
      regime: 'Упрощённая декларация'
    }),

    // Зарплатная база из настроек (не фиксированный МЗП!)
    salaryBase: (state) => state.settings.salaryBase,

    // Доход за текущий месяц
    monthlyIncome(state) {
      const now = new Date()
      return state.transactions
        .filter(t => {
          const d = new Date(t.date)
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
        })
        .reduce((sum, t) => sum + t.amount, 0)
    },

    // Доход за год
    annualIncome(state) {
      const year = new Date().getFullYear()
      return state.transactions
        .filter(t => new Date(t.date).getFullYear() === year)
        .reduce((sum, t) => sum + t.amount, 0)
    },

    // Налоги — теперь используют настройки пользователя
    monthlyTax(state) {
      return Math.round(this.monthlyIncome * (state.settings.ipnRate / 100))
    },
    opv(state)   { return Math.round(state.settings.salaryBase * (state.settings.opvRate  / 100)) },
    so(state)    { return Math.round(state.settings.salaryBase * (state.settings.soRate   / 100)) },
    vosms(state) { return Math.round(state.settings.salaryBase * (state.settings.vosmcRate / 100)) },

    totalMonthlyPayments() {
      return this.monthlyTax + this.opv + this.so + this.vosms
    },

    annualLimitPercent() {
      const limit = ANNUAL_LIMIT_MRP * MRP_2026
      return Math.min(100, (this.annualIncome / limit) * 100)
    },

    annualLimitKZT: () => ANNUAL_LIMIT_MRP * MRP_2026
  },

  actions: {
    // Сохраняем настройки — в store И в localStorage
    saveSettings(newSettings) {
      this.settings = { ...this.settings, ...newSettings }
      save('ip_settings', this.settings)
    },

    addTransaction(tx) {
      const newTx = {
        id:       Date.now(),
        date:     tx.date || new Date().toISOString().split('T')[0],
        client:   tx.client,
        amount:   Number(tx.amount),
        category: tx.category || 'Услуги'
      }
      this.transactions.unshift(newTx)
      save('ip_transactions', this.transactions) // Сохраняем в localStorage
    },

    removeTransaction(id) {
      this.transactions = this.transactions.filter(t => t.id !== id)
      save('ip_transactions', this.transactions)
    }
  }
})
