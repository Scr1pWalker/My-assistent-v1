// ─────────────────────────────────────────────
// 📌 stores/finance.js — хранилище данных (Pinia)
//
//    Pinia = глобальное хранилище.
//    Данные здесь доступны из ЛЮБОГО компонента.
//    Когда пользователь добавляет операцию в Accounting.vue,
//    Dashboard.vue сразу видит обновлённую сумму — вот зачем store.
//
//    Структура store:
//    state()     — данные (как data() в компоненте)
//    getters     — вычисляемые значения (как computed)
//    actions     — методы для изменения данных
// ─────────────────────────────────────────────

import { defineStore } from 'pinia'

// Константы налогового законодательства РК 2026
const TAX_RATE         = 0.03      // ИПН для упрощенки: 3%
const MRP_2026         = 3932      // МРП 2026 = 3 932 тенге
const MZP_2026         = 85000     // МЗП 2026 = 85 000 тенге
const ANNUAL_LIMIT_MRP = 24038     // Лимит дохода: 24 038 МРП
const ANNUAL_LIMIT_KZT = ANNUAL_LIMIT_MRP * MRP_2026  // ≈ 94 565 416 тенге

export const useFinanceStore = defineStore('finance', {
  // ── STATE: данные приложения ──────────────────
  state: () => ({
    // Профиль ИП
    ip: {
      name: 'Асель Нурова',
      bin:  '123456789012',
      regime: 'Упрощённая декларация'
    },

    // Список операций (доходов)
    transactions: [
      { id: 1, date: '2026-06-17', client: 'ООО "Алатау Трейд"',  amount: 350000, category: 'Услуги' },
      { id: 2, date: '2026-06-15', client: 'ИП Джаксыбеков',      amount: 470000, category: 'Консалтинг' },
      { id: 3, date: '2026-05-28', client: 'ТОО "Нур Технологии"', amount: 680000, category: 'Разработка' },
      { id: 4, date: '2026-05-10', client: 'ООО "Степной ветер"',  amount: 220000, category: 'Услуги' },
    ]
  }),

  // ── GETTERS: вычисляемые значения ─────────────
  getters: {
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

    // Общий доход за год
    annualIncome(state) {
      const year = new Date().getFullYear()
      return state.transactions
        .filter(t => new Date(t.date).getFullYear() === year)
        .reduce((sum, t) => sum + t.amount, 0)
    },

    // ИПН = 3% от месячного дохода
    monthlyTax() {
      return Math.round(this.monthlyIncome * TAX_RATE)
    },

    // ОПВ = 10% от МЗП (обязательные пенсионные взносы)
    opv() { return Math.round(MZP_2026 * 0.10) },

    // СО = 3.5% от МЗП (социальные отчисления)
    so()  { return Math.round(MZP_2026 * 0.035) },

    // ВОСМС = 5% от МЗП (взносы на обязательное соц. мед. страхование)
    vosms() { return Math.round(MZP_2026 * 0.05) },

    // Итого платежей за месяц
    totalMonthlyPayments() {
      return this.monthlyTax + this.opv + this.so + this.vosms
    },

    // Процент использования лимита
    annualLimitPercent() {
      return Math.min(100, (this.annualIncome / ANNUAL_LIMIT_KZT) * 100)
    },

    annualLimitKZT: () => ANNUAL_LIMIT_KZT
  },

  // ── ACTIONS: изменение данных ──────────────────
  actions: {
    addTransaction(transaction) {
      const newTx = {
        id: Date.now(),
        date: transaction.date || new Date().toISOString().split('T')[0],
        client: transaction.client,
        amount: Number(transaction.amount),
        category: transaction.category || 'Услуги'
      }
      this.transactions.unshift(newTx) // Добавляем в начало списка
    },

    removeTransaction(id) {
      this.transactions = this.transactions.filter(t => t.id !== id)
    }
  }
})
