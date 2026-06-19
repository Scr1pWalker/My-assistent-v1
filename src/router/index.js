import { createRouter, createWebHashHistory } from 'vue-router'

const Dashboard  = () => import('@/views/Dashboard.vue')
const Accounting = () => import('@/views/Accounting.vue')
const Documents  = () => import('@/views/Documents.vue')
const AiConsult  = () => import('@/views/AiConsult.vue')
const Settings   = () => import('@/views/Settings.vue')

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', name: 'dashboard', component: Dashboard,  meta: { title: 'Главная'       } },
  { path: '/accounting',name: 'accounting',component: Accounting, meta: { title: 'Учёт'          } },
  { path: '/documents', name: 'documents', component: Documents,  meta: { title: 'АВР документы' } },
  { path: '/ai',        name: 'ai',        component: AiConsult,  meta: { title: 'AI-консультант'} },
  { path: '/settings',  name: 'settings',  component: Settings,   meta: { title: 'Настройки'     } }
]

const router = createRouter({ history: createWebHashHistory(), routes })

router.afterEach((to) => {
  document.title = `${to.meta.title || 'ИП Помощник'} — КЗ`
})

export default router
