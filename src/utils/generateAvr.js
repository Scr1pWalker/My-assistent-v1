// ─────────────────────────────────────────────
// 📌 generateAvr.js — АВР форма Р-1
// Приложение 50 к приказу Министра финансов РК
// от 20 декабря 2012 года № 562
// ─────────────────────────────────────────────

import { jsPDF } from 'jspdf'

export function generateAvr(data) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  // A4 landscape: 297 × 210 мм
  const PW = 297
  const PH = 210
  const ML = 8   // margin left
  const MR = 8   // margin right
  const TW = PW - ML - MR  // table width = 281 мм

  // ── ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ───────────────
  function t(str, x, y, opts = {}) {
    if (str === null || str === undefined) str = ''
    doc.text(String(str), x, y, opts)
  }
  function ln(x1, y1, x2, y2) { doc.line(x1, y1, x2, y2) }
  function rect(x, y, w, h) { doc.rect(x, y, w, h) }
  function sf(size, style = 'normal') {
    doc.setFontSize(size)
    doc.setFont('helvetica', style)
  }

  // Обёртка текста внутри ячейки таблицы
  function cellText(str, x, y, w, size = 6.5, align = 'center') {
    sf(size)
    const lines = doc.splitTextToSize(String(str || ''), w - 2)
    const lineH = size * 0.45
    const startY = y + lineH
    lines.forEach((line, i) => {
      const tx = align === 'center' ? x + w / 2 : x + 1.5
      t(line, tx, startY + i * lineH * 1.3, { align })
    })
  }

  // ── 1. ШАПКА СПРАВА (Приложение 50...) ────
  sf(6.5)
  const rCol = PW - MR - 60
  t('Приложение 50', rCol + 30, 8, { align: 'center' })
  t('к приказу Министра финансов', rCol + 30, 12, { align: 'center' })
  t('Республики Казахстан', rCol + 30, 16, { align: 'center' })
  t('от 20 декабря 2012 года № 562', rCol + 30, 20, { align: 'center' })
  sf(7, 'bold')
  t('Форма Р-1', rCol + 30, 26, { align: 'center' })

  // ── 2. БЛОК ЗАКАЗЧИК / ИСПОЛНИТЕЛЬ ────────
  let y = 30

  // Внешний прямоугольник для шапки
  rect(ML, y, TW, 38)

  // Вертикальная линия: отделяем ИИН/БИН справа
  const binColW = 38
  ln(ML + TW - binColW, y, ML + TW - binColW, y + 38)

  // Горизонтальная после Заказчика
  ln(ML, y + 13, ML + TW, y + 13)
  // Подпись "полное наименование..."
  ln(ML, y + 18, ML + TW - binColW, y + 18)
  // Горизонтальная после Исполнителя
  ln(ML, y + 31, ML + TW, y + 31)
  // Подпись "полное наименование..."
  ln(ML, y + 36, ML + TW - binColW, y + 36)

  // Заголовок "ИИН/БИН" по центру правого блока
  sf(6.5, 'bold')
  t('ИИН/БИН', ML + TW - binColW + binColW / 2, y + 5, { align: 'center' })

  // ЗАКАЗЧИК
  sf(6.5, 'normal')
  t('Заказчик', ML + 1, y + 6)
  sf(7, 'bold')
  const buyerStr = [data.buyer.companyName, data.buyer.address].filter(Boolean).join(', ')
  const buyerLines = doc.splitTextToSize(buyerStr, TW - binColW - 20)
  buyerLines.forEach((l, i) => t(l, ML + 20, y + 6 + i * 4))
  sf(6.5, 'bold')
  t(data.buyer.bin || '', ML + TW - binColW + binColW / 2, y + 10, { align: 'center' })

  sf(6, 'italic')
  t('полное наименование, адрес, данные о средствах связи', ML + TW / 2 - binColW / 2, y + 16, { align: 'center' })

  // ИСПОЛНИТЕЛЬ
  sf(6.5, 'normal')
  t('Исполнитель', ML + 1, y + 23)
  sf(7, 'bold')
  const sellerStr = [data.seller.companyName, data.seller.address].filter(Boolean).join(', ')
  const sellerLines = doc.splitTextToSize(sellerStr, TW - binColW - 24)
  sellerLines.forEach((l, i) => t(l, ML + 24, y + 23 + i * 4))
  sf(6.5, 'bold')
  t(data.seller.bin || '', ML + TW - binColW + binColW / 2, y + 27, { align: 'center' })

  sf(6, 'italic')
  t('полное наименование, адрес, данные о средствах связи', ML + TW / 2 - binColW / 2, y + 34, { align: 'center' })

  y += 38

  // ── 3. ДОГОВОР + НОМЕР + ДАТА ─────────────
  rect(ML, y, TW, 10)

  // Вертикальная перед "Номер документа"
  const numColStart = ML + TW - 70
  ln(numColStart, y, numColStart, y + 10)
  // Разделитель между номером и датой
  ln(numColStart + 35, y, numColStart + 35, y + 10)

  sf(6.5, 'normal')
  t('Договор (контракт)', ML + 1, y + 4)
  sf(7)
  t(data.contract || '', ML + 35, y + 4)

  sf(6.5, 'normal')
  t('Номер документа', numColStart + 17.5, y + 3.5, { align: 'center' })
  t('Дата составления', numColStart + 52.5, y + 3.5, { align: 'center' })
  sf(8, 'bold')
  t(String(data.number || '1'), numColStart + 17.5, y + 8, { align: 'center' })
  t(data.date || '', numColStart + 52.5, y + 8, { align: 'center' })

  y += 10

  // ── 4. ЗАГОЛОВОК АВР ──────────────────────
  sf(11, 'bold')
  t('АКТ ВЫПОЛНЕННЫХ РАБОТ (ОКАЗАННЫХ УСЛУГ)', PW / 2, y + 7, { align: 'center' })
  y += 12

  // ── 5. ТАБЛИЦА ───────────────────────────
  // Ширины колонок (мм), сумма = TW = 281
  // 1:№  2:Наименование  3:Дата вып.  4:Сведения об отчёте  5:Ед.  6:Кол-во  7:Цена  8:Стоимость
  const cols = [8, 74, 20, 42, 14, 18, 22, 26]  // = 224... добавим остаток к col[1]
  // Пересчитаем чтобы сумма = TW
  const colsSum = cols.reduce((a, b) => a + b, 0)
  cols[1] += TW - colsSum  // добавляем разницу к "Наименование"

  // X-позиции каждой колонки
  const colX = []
  let cx = ML
  cols.forEach(w => { colX.push(cx); cx += w })

  const hdrH = 22  // высота заголовка таблицы

  // Внешний прямоугольник заголовка
  rect(ML, y, TW, hdrH)

  // Вертикальные линии колонок в заголовке
  cols.forEach((w, i) => {
    if (i > 0) ln(colX[i], y, colX[i], y + hdrH)
  })

  // Горизонтальная линия разделяющая "Выполнено работ" на подколонки
  ln(colX[5], y + hdrH * 0.45, ML + TW, y + hdrH * 0.45)

  // Тексты заголовков
  const hdrs = [
    { col: 0, text: '1' },
    { col: 1, text: '2' },
    { col: 2, text: '3' },
    { col: 3, text: '4' },
    { col: 4, text: '5' },
    { col: 5, text: '6' },
    { col: 6, text: '7' },
    { col: 7, text: '8' },
  ]

  // Номера колонок внизу
  hdrs.forEach(h => {
    sf(6.5, 'bold')
    t(h.text, colX[h.col] + cols[h.col] / 2, y + hdrH - 2, { align: 'center' })
  })

  // Подписи заголовков
  sf(5.5, 'normal')
  cellText('Номер по порядку', colX[0], y + 1, cols[0], 5.5)
  cellText('Наименование работ (услуг) (в разрезе их подвидов в соответствии с технической спецификацией, заданием, графиком выполнения работ (услуг) при их наличии)', colX[1], y + 1, cols[1], 5)
  cellText('Дата выполнения работ (оказания услуг)', colX[2], y + 1, cols[2], 5.5)
  cellText('Сведения об отчете о научных исследованиях, маркетинговых, консультационных и прочих услугах (дата, номер, количество страниц) (при их наличии)', colX[3], y + 1, cols[3], 5)
  cellText('Единица измерения', colX[4], y + 1, cols[4], 5.5)

  // "Выполнено работ (оказано услуг)" — объединённый заголовок
  sf(5.5, 'bold')
  t('Выполнено работ (оказано услуг)', colX[5] + (cols[5] + cols[6] + cols[7]) / 2, y + 5, { align: 'center' })

  // Подзаголовки
  sf(5.5, 'normal')
  cellText('количество', colX[5], y + hdrH * 0.45, cols[5], 5.5)
  cellText('цена за единицу', colX[6], y + hdrH * 0.45, cols[6], 5.5)
  cellText('стоимость', colX[7], y + hdrH * 0.45, cols[7], 5.5)

  y += hdrH

  // ── СТРОКИ ДАННЫХ ─────────────────────────
  const services = Array.isArray(data.services) ? data.services : [
    { name: data.service || '', unit: 'Услуга', qty: 1, price: Number(data.amount) || 0 }
  ]

  const rowH = 8
  let totalQty = 0
  let totalSum = 0

  services.forEach((svc, idx) => {
    const sum = (svc.qty || 1) * (svc.price || 0)
    totalQty += Number(svc.qty || 1)
    totalSum += sum

    rect(ML, y, TW, rowH)
    cols.forEach((w, i) => { if (i > 0) ln(colX[i], y, colX[i], y + rowH) })

    sf(7)
    cellText(String(idx + 1), colX[0], y, cols[0], 7)
    cellText(svc.name || '', colX[1], y, cols[1], 6.5, 'left')
    cellText(svc.workDate || '', colX[2], y, cols[2], 6.5)
    cellText(svc.reportInfo || '', colX[3], y, cols[3], 6.5)
    cellText(svc.unit || 'Услуга', colX[4], y, cols[4], 6.5)
    cellText(String(svc.qty || 1), colX[5], y, cols[5], 7)
    cellText(fmtNum(svc.price || 0), colX[6], y, cols[6], 7)
    cellText(fmtNum(sum), colX[7], y, cols[7], 7)

    y += rowH
  })

  // Строка ИТОГО
  rect(ML, y, TW, rowH)
  cols.forEach((w, i) => { if (i > 0) ln(colX[i], y, colX[i], y + rowH) })
  sf(7, 'bold')
  cellText('Итого', colX[4], y, cols[4] + cols[5], 7)
  cellText(String(totalQty), colX[5], y, cols[5], 7)
  cellText('х', colX[6], y, cols[6], 7)
  cellText(fmtNum(totalSum), colX[7], y, cols[7], 7)
  y += rowH

  // ── 6. СВЕДЕНИЯ ОБ ИСПОЛЬЗОВАНИИ ЗАПАСОВ ─
  sf(6.5, 'normal')
  rect(ML, y, TW, 7)
  t('Сведения об использовании запасов, полученных от заказчика', ML + 2, y + 4)
  sf(6, 'italic')
  t('наименование, количество, стоимость', ML + TW / 2, y + 4, { align: 'center' })
  y += 7

  // ── 7. ПРИЛОЖЕНИЕ ─────────────────────────
  rect(ML, y, TW, 8)
  sf(6, 'normal')
  const appText = 'Приложение: Перечень документации, в том числе отчет(ы) о маркетинговых, научных исследованиях, консультационных и прочих услугах (обязательны при его'
  t(appText, ML + 2, y + 3.5)
  t('(их) наличии) на _________________ страниц', ML + 14, y + 7)
  y += 8

  // ── 8. ПОДПИСИ ────────────────────────────
  const sigH = 16
  rect(ML, y, TW, sigH)
  ln(PW / 2, y, PW / 2, y + sigH)

  // Горизонтальные разделители для полей подписей
  const sigY1 = y + 6   // линия должности
  const sigY2 = y + 12  // линия расшифровки

  // Исполнитель (левая половина)
  sf(6.5, 'normal')
  t('Сдал (Исполнитель)', ML + 2, y + 4)

  // Линии для подписей исполнителя
  ln(ML + 42, sigY1, ML + 60, sigY1)   // должность
  ln(ML + 68, sigY1, ML + 86, sigY1)   // подпись
  ln(ML + 94, sigY1, ML + 130, sigY1)  // расшифровка

  sf(5.5, 'italic')
  t('должность', ML + 51, sigY1 + 3, { align: 'center' })
  t('подпись', ML + 77, sigY1 + 3, { align: 'center' })
  t('расшифровка подписи', ML + 112, sigY1 + 3, { align: 'center' })

  // ФИО исполнителя
  sf(7, 'normal')
  t(data.seller.signerName || data.seller.companyName || '', ML + 94, sigY1 - 1)

  // М.П. исполнителя
  sf(7, 'bold')
  t('М.П.', ML + 4, y + sigH - 2)

  // Заказчик (правая половина)
  const rHalf = PW / 2
  sf(6.5, 'normal')
  t('Принял (Заказчик)', rHalf + 2, y + 4)

  ln(rHalf + 42, sigY1, rHalf + 60, sigY1)
  ln(rHalf + 68, sigY1, rHalf + 86, sigY1)
  ln(rHalf + 94, sigY1, rHalf + 128, sigY1)

  sf(5.5, 'italic')
  t('должность', rHalf + 51, sigY1 + 3, { align: 'center' })
  t('подпись', rHalf + 77, sigY1 + 3, { align: 'center' })
  t('расшифровка подписи', rHalf + 111, sigY1 + 3, { align: 'center' })

  // Дата подписания заказчика
  sf(6.5, 'normal')
  t('Дата подписания (принятия) работ (услуг)', rHalf + 2, y + sigH - 5)
  ln(rHalf + 80, y + sigH - 5, rHalf + 115, y + sigH - 5)

  // М.П. заказчика
  sf(7, 'bold')
  t('М.П.', rHalf + 4, y + sigH - 1)

  // ── СОХРАНЯЕМ ─────────────────────────────
  const filename = `АВР_${data.number || '1'}_${(data.date || '').replace(/\./g, '-')}.pdf`
  doc.save(filename)
}

// ── УТИЛИТЫ ──────────────────────────────────
function fmtNum(n) {
  return new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}
