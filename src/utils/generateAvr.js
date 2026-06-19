// ─────────────────────────────────────────────
// 📌 utils/generateAvr.js — генерация АВР в PDF
//
// jsPDF рисует PDF как canvas: устанавливаем шрифт,
// координаты (x, y) и пишем текст или линии.
// Начало координат (0,0) — верхний левый угол страницы.
// Единица измерения — мм. A4 = 210×297 мм.
// ─────────────────────────────────────────────

import { jsPDF } from 'jspdf'

// Кириллица в jsPDF требует подключения шрифта.
// Используем встроенный способ через UTF-8 + latin encoding trick:
// рисуем текст через doc.text() с encoding 'UTF-8'

export function generateAvr(data) {
  // data = { seller, buyer, contract, service, amount, date, number }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const W = 210  // ширина страницы
  const margin = 20
  const contentW = W - margin * 2

  // ── Вспомогательные функции ───────────────
  function text(str, x, y, opts = {}) {
    doc.text(String(str || ''), x, y, opts)
  }

  function line(x1, y1, x2, y2) {
    doc.line(x1, y1, x2, y2)
  }

  function setFont(size = 10, style = 'normal') {
    doc.setFontSize(size)
    doc.setFont('helvetica', style)
  }

  // ── ШАПКА ────────────────────────────────
  setFont(12, 'bold')
  text('АКТ ВЫПОЛНЕННЫХ РАБОТ (ОКАЗАННЫХ УСЛУГ)', W / 2, 25, { align: 'center' })

  setFont(10, 'normal')
  text(`№ ${data.number || '1'}`, W / 2, 32, { align: 'center' })
  text(`от ${data.date}`, W / 2, 38, { align: 'center' })

  // Горизонтальная линия под шапкой
  line(margin, 42, W - margin, 42)

  // ── СТОРОНЫ ───────────────────────────────
  let y = 50

  setFont(9, 'bold')
  text('ИСПОЛНИТЕЛЬ:', margin, y)
  setFont(9, 'normal')
  y += 6
  text(data.seller.companyName || '', margin, y)
  y += 5
  text(`БИН/ИИН: ${data.seller.bin || ''}`, margin, y)
  y += 5
  text(`Адрес: ${data.seller.address || ''}`, margin, y)
  y += 5
  if (data.seller.bankAccount) {
    text(`Банк: ${data.seller.bankName || ''}, IBAN: ${data.seller.bankAccount}`, margin, y)
    y += 5
  }
  if (data.seller.phone) {
    text(`Тел: ${data.seller.phone}`, margin, y)
    y += 5
  }

  y += 4
  setFont(9, 'bold')
  text('ЗАКАЗЧИК:', margin, y)
  setFont(9, 'normal')
  y += 6
  text(data.buyer.companyName || '', margin, y)
  y += 5
  text(`БИН/ИИН: ${data.buyer.bin || ''}`, margin, y)
  y += 5
  if (data.buyer.address) {
    text(`Адрес: ${data.buyer.address}`, margin, y)
    y += 5
  }

  y += 4
  line(margin, y, W - margin, y)
  y += 8

  // ── ОСНОВАНИЕ ─────────────────────────────
  setFont(9, 'normal')
  text(`Основание: ${data.contract || 'Договор об оказании услуг'}`, margin, y)
  y += 10

  // ── ТАБЛИЦА УСЛУГ ─────────────────────────
  // Рисуем таблицу вручную: rect + text по координатам

  const tableTop = y
  const colWidths = [10, 75, 25, 25, 35]  // №, Наименование, Ед., Кол-во, Сумма
  const colHeaders = ['№', 'Наименование работ/услуг', 'Ед.изм', 'Кол-во', 'Сумма (₸)']
  const rowH = 10
  const tableW = contentW

  // Заголовок таблицы
  setFont(8, 'bold')
  doc.setFillColor(240, 240, 240)
  doc.rect(margin, y, tableW, rowH, 'F')
  doc.rect(margin, y, tableW, rowH, 'S')

  let colX = margin
  colHeaders.forEach((h, i) => {
    text(h, colX + colWidths[i] / 2, y + 6.5, { align: 'center' })
    if (i < colHeaders.length - 1) {
      line(colX + colWidths[i], y, colX + colWidths[i], y + rowH)
    }
    colX += colWidths[i]
  })

  y += rowH

  // Строка с услугой
  setFont(8, 'normal')
  doc.rect(margin, y, tableW, rowH, 'S')

  const serviceLines = doc.splitTextToSize(data.service || 'Услуги', colWidths[1] - 2)
  const actualRowH = Math.max(rowH, serviceLines.length * 5 + 4)

  // Перерисовываем строку с правильной высотой
  doc.rect(margin, y, tableW, actualRowH, 'S')
  colX = margin

  // № 1
  text('1', colX + colWidths[0] / 2, y + 6.5, { align: 'center' })
  colX += colWidths[0]
  line(colX, y, colX, y + actualRowH)

  // Наименование
  doc.text(serviceLines, colX + 2, y + 6.5)
  colX += colWidths[1]
  line(colX, y, colX, y + actualRowH)

  // Единица измерения
  text('услуга', colX + colWidths[2] / 2, y + 6.5, { align: 'center' })
  colX += colWidths[2]
  line(colX, y, colX, y + actualRowH)

  // Количество
  text('1', colX + colWidths[3] / 2, y + 6.5, { align: 'center' })
  colX += colWidths[3]
  line(colX, y, colX, y + actualRowH)

  // Сумма
  text(formatKZT(data.amount), colX + colWidths[4] / 2, y + 6.5, { align: 'center' })

  y += actualRowH

  // Строка ИТОГО
  setFont(9, 'bold')
  doc.rect(margin, y, tableW, rowH, 'S')
  text('ИТОГО:', margin + 2, y + 6.5)
  text(formatKZT(data.amount), W - margin - colWidths[4] / 2, y + 6.5, { align: 'center' })
  y += rowH + 8

  // ── НДС ───────────────────────────────────
  setFont(9, 'normal')
  text('НДС: не облагается (упрощённая декларация)', margin, y)
  y += 6
  setFont(10, 'bold')
  text(`Итого к оплате: ${formatKZT(data.amount)}`, margin, y)
  y += 6

  // Сумма прописью (упрощённо)
  setFont(8, 'normal')
  text(`(${amountToWords(data.amount)} тенге 00 тиын)`, margin, y)
  y += 12

  // ── ПОДПИСИ ───────────────────────────────
  line(margin, y, W - margin, y)
  y += 8

  setFont(9, 'bold')
  text('ИСПОЛНИТЕЛЬ', margin + 20, y, { align: 'center' })
  text('ЗАКАЗЧИК', W - margin - 20, y, { align: 'center' })
  y += 10

  setFont(9, 'normal')

  // Линия подписи Исполнителя
  line(margin, y + 5, margin + 55, y + 5)
  text('подпись', margin + 27, y + 9, { align: 'center' })

  // Линия подписи Заказчика
  line(W - margin - 55, y + 5, W - margin, y + 5)
  text('подпись', W - margin - 27, y + 9, { align: 'center' })

  y += 20
  setFont(8, 'normal')
  doc.setTextColor(150, 150, 150)
  text(data.seller.companyName || '', margin, y)
  text(data.buyer.companyName || '', W - margin, y, { align: 'right' })

  // ── СОХРАНЯЕМ PDF ─────────────────────────
  const filename = `AVR_${data.number || '1'}_${data.date.replace(/\./g, '-')}.pdf`
  doc.save(filename)
}

// ── ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ───────────────────

function formatKZT(n) {
  return new Intl.NumberFormat('ru-RU').format(Math.round(n)) + ' ₸'
}

// Упрощённая конвертация суммы в слова (только для тенге)
function amountToWords(amount) {
  const num = Math.round(amount)
  if (num === 0) return 'Ноль'

  const ones = ['','один','два','три','четыре','пять','шесть','семь','восемь','девять',
                'десять','одиннадцать','двенадцать','тринадцать','четырнадцать','пятнадцать',
                'шестнадцать','семнадцать','восемнадцать','девятнадцать']
  const tens = ['','','двадцать','тридцать','сорок','пятьдесят',
                'шестьдесят','семьдесят','восемьдесят','девяносто']
  const hundreds = ['','сто','двести','триста','четыреста','пятьсот',
                    'шестьсот','семьсот','восемьсот','девятьсот']

  function chunk(n, isMillion) {
    let result = ''
    const h = Math.floor(n / 100)
    const t = Math.floor((n % 100))
    const o = n % 10

    if (h) result += hundreds[h] + ' '
    if (t < 20 && t > 0) {
      result += (isMillion
        ? ones[t].replace('один','один').replace('два','два')
        : ones[t]) + ' '
    } else {
      if (Math.floor(t / 10)) result += tens[Math.floor(t / 10)] + ' '
      if (o) result += ones[o] + ' '
    }
    return result.trim()
  }

  let result = ''
  const millions = Math.floor(num / 1000000)
  const thousands = Math.floor((num % 1000000) / 1000)
  const rest = num % 1000

  if (millions) result += chunk(millions, true) + ' миллион' + (millions > 1 ? 'ов' : '') + ' '
  if (thousands) result += chunk(thousands, false) + ' тысяч' + (thousands % 10 === 1 && thousands !== 11 ? 'а' : thousands % 10 < 5 && (thousands < 10 || thousands > 20) ? 'и' : '') + ' '
  if (rest) result += chunk(rest, false)

  return result.trim().charAt(0).toUpperCase() + result.trim().slice(1)
}
