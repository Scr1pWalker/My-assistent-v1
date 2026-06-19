// ─────────────────────────────────────────────
// 📌 generateAvr.js — АВР форма Р-1
// Приложение 50 к приказу Министра финансов РК
// от 20 декабря 2012 года № 562
//
// Используем шрифт Roboto с кириллицей
// ─────────────────────────────────────────────

import { jsPDF } from 'jspdf'
import { RobotoRegular, RobotoBold } from './fonts.js'

function initFonts(doc) {
  // Регистрируем шрифт Roboto (поддержка кириллицы)
  doc.addFileToVFS('Roboto-Regular.ttf', RobotoRegular)
  doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal')
  doc.addFileToVFS('Roboto-Bold.ttf', RobotoBold)
  doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold')
}

export function generateAvr(data) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  initFonts(doc)
  doc.setFont('Roboto', 'normal')

  const PW = 297
  const ML = 8
  const MR = 8
  const TW = PW - ML - MR

  // ── ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ───────────────
  function t(str, x, y, opts = {}) {
    doc.text(String(str ?? ''), x, y, opts)
  }
  function ln(x1, y1, x2, y2) { doc.line(x1, y1, x2, y2) }
  function rect(x, y, w, h) { doc.rect(x, y, w, h) }

  function sf(size, style = 'normal') {
    doc.setFontSize(size)
    doc.setFont('Roboto', style)
  }

  function cellText(str, x, y, w, h, size = 6, align = 'center') {
    sf(size)
    const lines = doc.splitTextToSize(String(str ?? ''), w - 2)
    const lineH = size * 0.42
    const totalH = lines.length * lineH * 1.3
    const startY = y + (h - totalH) / 2 + lineH
    lines.forEach((line, i) => {
      const tx = align === 'center' ? x + w / 2 : align === 'right' ? x + w - 1.5 : x + 1.5
      t(line, tx, startY + i * lineH * 1.3, { align })
    })
  }

  // ── 1. ШАПКА СПРАВА ───────────────────────
  sf(6)
  t('Приложение 50',                    PW - MR,  8, { align: 'right' })
  t('к приказу Министра финансов',      PW - MR, 12, { align: 'right' })
  t('Республики Казахстан',             PW - MR, 16, { align: 'right' })
  t('от 20 декабря 2012 года № 562',    PW - MR, 20, { align: 'right' })
  sf(7, 'bold')
  t('Форма Р-1',                        PW - MR, 26, { align: 'right' })

  // ── 2. ЗАКАЗЧИК / ИСПОЛНИТЕЛЬ ─────────────
  let y = 30
  const binW = 38

  rect(ML, y, TW, 38)
  ln(ML + TW - binW, y, ML + TW - binW, y + 38)
  ln(ML, y + 13, ML + TW, y + 13)
  ln(ML, y + 18, ML + TW - binW, y + 18)
  ln(ML, y + 31, ML + TW, y + 31)
  ln(ML, y + 36, ML + TW - binW, y + 36)

  sf(6.5, 'bold')
  t('ИИН/БИН', ML + TW - binW + binW / 2, y + 5, { align: 'center' })

  // Заказчик
  sf(6.5, 'normal')
  t('Заказчик', ML + 1, y + 6)
  sf(7, 'bold')
  const buyerStr = [data.buyer.companyName, data.buyer.address].filter(Boolean).join(', ')
  doc.splitTextToSize(buyerStr, TW - binW - 22).forEach((l, i) =>
    t(l, ML + 22, y + 6 + i * 4.5))
  t(data.buyer.bin || '', ML + TW - binW + binW / 2, y + 10, { align: 'center' })
  sf(5.5, 'italic')
  t('полное наименование, адрес, данные о средствах связи',
    ML + (TW - binW) / 2, y + 16.5, { align: 'center' })

  // Исполнитель
  sf(6.5, 'normal')
  t('Исполнитель', ML + 1, y + 23)
  sf(7, 'bold')
  const sellerStr = [data.seller.companyName, data.seller.address].filter(Boolean).join(', ')
  doc.splitTextToSize(sellerStr, TW - binW - 26).forEach((l, i) =>
    t(l, ML + 26, y + 23 + i * 4.5))
  t(data.seller.bin || '', ML + TW - binW + binW / 2, y + 27, { align: 'center' })
  sf(5.5, 'italic')
  t('полное наименование, адрес, данные о средствах связи',
    ML + (TW - binW) / 2, y + 34.5, { align: 'center' })

  y += 38

  // ── 3. ДОГОВОР + НОМЕР + ДАТА ─────────────
  rect(ML, y, TW, 10)
  const ndStart = ML + TW - 70
  ln(ndStart, y, ndStart, y + 10)
  ln(ndStart + 35, y, ndStart + 35, y + 10)

  sf(6.5, 'normal')
  t('Договор (контракт)', ML + 1, y + 4.5)
  sf(7)
  t(data.contract || '', ML + 38, y + 4.5)
  sf(6, 'normal')
  t('Номер документа', ndStart + 17.5, y + 3.5, { align: 'center' })
  t('Дата составления', ndStart + 52.5, y + 3.5, { align: 'center' })
  sf(8, 'bold')
  t(String(data.number || '1'), ndStart + 17.5, y + 8.5, { align: 'center' })
  t(data.date || '', ndStart + 52.5, y + 8.5, { align: 'center' })

  y += 10

  // ── 4. ЗАГОЛОВОК ──────────────────────────
  sf(11, 'bold')
  t('АКТ ВЫПОЛНЕННЫХ РАБОТ (ОКАЗАННЫХ УСЛУГ)', PW / 2, y + 7, { align: 'center' })
  y += 13

  // ── 5. ТАБЛИЦА ────────────────────────────
  // Колонки: №, Наименование, Дата вып., Сведения, Ед., Кол-во, Цена, Стоимость
  const cols = [8, 72, 22, 40, 14, 18, 26, 28]
  const colsSum = cols.reduce((a, b) => a + b, 0)
  cols[1] += TW - colsSum  // добиваем до TW

  const colX = []
  let cx = ML
  cols.forEach(w => { colX.push(cx); cx += w })

  const hH = 24  // высота заголовка таблицы

  rect(ML, y, TW, hH)
  cols.forEach((_, i) => { if (i > 0) ln(colX[i], y, colX[i], y + hH) })

  // Разделитель "Выполнено работ" на подколонки
  const splitY = y + hH * 0.42
  ln(colX[5], splitY, ML + TW, splitY)

  // Номера колонок (внизу)
  ;['1','2','3','4','5','6','7','8'].forEach((n, i) => {
    sf(6.5, 'bold')
    t(n, colX[i] + cols[i] / 2, y + hH - 1.5, { align: 'center' })
  })

  // Тексты заголовков
  cellText('Номер по порядку', colX[0], y, cols[0], hH * 0.85, 5.5)
  cellText('Наименование работ (услуг) (в разрезе их подвидов в соответствии с технической спецификацией, заданием, графиком выполнения работ (услуг) при их наличии)', colX[1], y, cols[1], hH * 0.85, 5)
  cellText('Дата выполнения работ (оказания услуг)', colX[2], y, cols[2], hH * 0.85, 5.5)
  cellText('Сведения об отчете о научных исследованиях, маркетинговых, консультационных и прочих услугах (дата, номер, количество страниц) (при их наличии)', colX[3], y, cols[3], hH * 0.85, 5)
  cellText('Единица измерения', colX[4], y, cols[4], hH * 0.85, 5.5)

  sf(5.5, 'bold')
  t('Выполнено работ (оказано услуг)',
    colX[5] + (cols[5] + cols[6] + cols[7]) / 2, y + 5, { align: 'center' })

  cellText('количество', colX[5], splitY, cols[5], hH - hH * 0.42 - 4, 5.5)
  cellText('цена за единицу', colX[6], splitY, cols[6], hH - hH * 0.42 - 4, 5.5)
  cellText('стоимость', colX[7], splitY, cols[7], hH - hH * 0.42 - 4, 5.5)

  y += hH

  // ── СТРОКИ УСЛУГ ──────────────────────────
  const services = Array.isArray(data.services) ? data.services : [
    { name: data.service || '', unit: 'Услуга', qty: 1, price: Number(data.amount) || 0 }
  ]

  const rowH = 9
  let totalQty = 0
  let totalSum = 0

  services.forEach((svc, idx) => {
    const qty = Number(svc.qty) || 1
    const price = Number(svc.price) || 0
    const sum = qty * price
    totalQty += qty
    totalSum += sum

    rect(ML, y, TW, rowH)
    cols.forEach((_, i) => { if (i > 0) ln(colX[i], y, colX[i], y + rowH) })

    cellText(String(idx + 1),            colX[0], y, cols[0], rowH, 7)
    cellText(svc.name || '',             colX[1], y, cols[1], rowH, 6.5, 'left')
    cellText(svc.workDate || '',         colX[2], y, cols[2], rowH, 6.5)
    cellText(svc.reportInfo || '',       colX[3], y, cols[3], rowH, 6.5)
    cellText(svc.unit || 'Услуга',       colX[4], y, cols[4], rowH, 6.5)
    cellText(String(qty),                colX[5], y, cols[5], rowH, 7)
    cellText(fmtNum(price),              colX[6], y, cols[6], rowH, 7)
    cellText(fmtNum(sum),                colX[7], y, cols[7], rowH, 7)

    y += rowH
  })

  // Строка ИТОГО
  rect(ML, y, TW, rowH)
  cols.forEach((_, i) => { if (i > 0) ln(colX[i], y, colX[i], y + rowH) })
  sf(7, 'bold')
  cellText('Итого', colX[4], y, cols[4] + cols[5], rowH, 7)
  cellText(String(totalQty),   colX[5], y, cols[5], rowH, 7)
  cellText('х',                colX[6], y, cols[6], rowH, 7)
  cellText(fmtNum(totalSum),   colX[7], y, cols[7], rowH, 7)
  y += rowH

  // ── 6. ЗАПАСЫ ─────────────────────────────
  rect(ML, y, TW, 7)
  sf(6.5, 'normal')
  t('Сведения об использовании запасов, полученных от заказчика', ML + 2, y + 4)
  sf(5.5, 'italic')
  t('наименование, количество, стоимость', PW / 2, y + 4, { align: 'center' })
  y += 7

  // ── 7. ПРИЛОЖЕНИЕ ─────────────────────────
  rect(ML, y, TW, 8)
  sf(6, 'normal')
  t('Приложение: Перечень документации, в том числе отчет(ы) о маркетинговых, научных исследованиях, консультационных и прочих услугах (обязательны при его', ML + 2, y + 3.5)
  t('(их) наличии) на _________________ страниц', ML + 14, y + 7)
  y += 8

  // ── 8. ПОДПИСИ ────────────────────────────
  const sigH = 18
  rect(ML, y, TW, sigH)
  ln(PW / 2, y, PW / 2, y + sigH)

  const sigLineY = y + 9

  // ИСПОЛНИТЕЛЬ (левая половина)
  sf(6.5, 'normal')
  t('Сдал (Исполнитель)', ML + 2, y + 5)

  ln(ML + 44, sigLineY, ML + 64, sigLineY)   // должность
  ln(ML + 72, sigLineY, ML + 90, sigLineY)   // подпись
  ln(ML + 98, sigLineY, ML + 136, sigLineY)  // расшифровка

  sf(5.5, 'italic')
  t('должность',          ML + 54,  sigLineY + 3, { align: 'center' })
  t('подпись',            ML + 81,  sigLineY + 3, { align: 'center' })
  t('расшифровка подписи',ML + 117, sigLineY + 3, { align: 'center' })

  // ФИО исполнителя
  sf(7, 'normal')
  t(data.seller.signerName || '', ML + 98, sigLineY - 1)

  sf(7, 'bold')
  t('М.П.', ML + 4, y + sigH - 2)

  // ЗАКАЗЧИК (правая половина)
  const rH = PW / 2 + 2
  sf(6.5, 'normal')
  t('Принял (Заказчик)', rH, y + 5)

  ln(rH + 42, sigLineY, rH + 62, sigLineY)
  ln(rH + 70, sigLineY, rH + 88, sigLineY)
  ln(rH + 96, sigLineY, rH + 132, sigLineY)

  sf(5.5, 'italic')
  t('должность',          rH + 52,  sigLineY + 3, { align: 'center' })
  t('подпись',            rH + 79,  sigLineY + 3, { align: 'center' })
  t('расшифровка подписи',rH + 114, sigLineY + 3, { align: 'center' })

  sf(6.5, 'normal')
  t('Дата подписания (принятия) работ (услуг)', rH, y + sigH - 4)
  ln(rH + 84, y + sigH - 4, rH + 118, y + sigH - 4)

  sf(7, 'bold')
  t('М.П.', rH, y + sigH - 1)

  // ── СОХРАНЯЕМ ─────────────────────────────
  const filename = `АВР_${data.number || '1'}_${(data.date || '').replace(/\./g, '-')}.pdf`
  doc.save(filename)
}

function fmtNum(n) {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(n) || 0)
}
