<template>
  <div class="px-4 pt-12">
    <h1 class="text-xl font-medium text-white mb-2">АВР документы</h1>
    <p class="text-sm text-gray-500 mb-6">Акты выполненных работ</p>

    <div class="bg-surface-card rounded-2xl p-5 text-center">
      <div class="w-14 h-14 bg-brand/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
        <i class="ti ti-file-text text-brand text-2xl" />
      </div>
      <p class="text-white font-medium mb-1">Генерация АВР (Р-1)</p>
      <p class="text-sm text-gray-500 mb-4">
        Этап 3 — создадим форму и PDF-генератор
      </p>
      <div class="bg-surface-border/30 rounded-xl p-3 text-left">
        <p class="text-xs text-gray-400">Будет включено:</p>
        <p class="text-xs text-gray-300 mt-1">✓ Форма заказчика и услуги</p>
        <p class="text-xs text-gray-300">✓ Автозаполнение из БИН</p>
        <p class="text-xs text-gray-300">✓ PDF с подписью и печатью</p>
      </div>
    </div>
  </div>
</template>
