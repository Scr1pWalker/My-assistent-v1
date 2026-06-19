<template>
  <div class="px-4 pt-12 flex flex-col h-screen">
    <h1 class="text-xl font-medium text-white mb-1">AI-консультант</h1>
    <p class="text-sm text-gray-500 mb-4">Вопросы по Налоговому кодексу РК</p>

    <!-- Чат -->
    <div class="flex-1 overflow-y-auto space-y-3 mb-4">
      <div class="bg-surface-card rounded-2xl rounded-tl-sm p-3.5 max-w-[85%]">
        <p class="text-sm text-gray-200">
          Привет! Я помогу с вопросами по налогам ИП в Казахстане.
          Спрашивай о ставках, лимитах, сроках оплаты.
        </p>
      </div>
    </div>

    <!-- Поле ввода -->
    <div class="flex gap-2 pb-6">
      <input
        placeholder="Когда сдавать декларацию?"
        class="flex-1 bg-surface-card text-white text-sm rounded-xl px-4 py-3
               border border-white/10 outline-none focus:border-brand"
      />
      <button class="w-11 h-11 bg-brand rounded-xl flex items-center justify-center flex-shrink-0">
        <i class="ti ti-send text-white text-base" />
      </button>
    </div>

    <p class="text-xs text-gray-600 text-center mb-2">
      Этап 4 — подключим RAG по НК РК (FastAPI + LangChain)
    </p>
  </div>
</template>
