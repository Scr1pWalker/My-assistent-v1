// ─────────────────────────────────────────────
// 📌 generateAvr.js — клиент для генерации АВР
//
// Вместо jsPDF вызываем Python backend:
// POST /api/avr/generate → получаем PDF bytes → скачиваем
//
// Почему так лучше:
// - xlsx → PDF через LibreOffice = точная копия официального бланка
// - Кириллица работает идеально
// - Легко обновлять шаблон
// ─────────────────────────────────────────────

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function generateAvr(data) {
  try {
    const response = await fetch(`${API_URL}/api/avr/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error(`Ошибка сервера: ${response.status}`)
    }

    // Получаем PDF как blob и скачиваем
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `АВР_${data.number}_${(data.date || '').replace(/\./g, '-')}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    return { success: true }
  } catch (err) {
    console.error('AVR generation error:', err)
    throw err
  }
}
