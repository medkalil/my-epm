import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import type { NavKey } from './services/api'
import { AuditPage, DashboardPage, LandingPage, ProjectsPage, ProvisionPage, RegisterPage, SettingsPage, SignInPage, TasksPage, TeamPage } from './pages'
import './styles.css'

function App() {
  const [screen, setScreen] = useState<NavKey | 'landing' | 'signin' | 'register' | 'provision'>('overview')
  const navigate = (key: NavKey) => setScreen(key)
  if (screen === 'landing') return <LandingPage onNavigate={navigate} />
  if (screen === 'signin') return <SignInPage onNavigate={navigate} />
  if (screen === 'register') return <RegisterPage onNavigate={navigate} />
  if (screen === 'provision') return <ProvisionPage onNavigate={navigate} />
  const pages = { overview: DashboardPage, projects: ProjectsPage, tasks: TasksPage, team: TeamPage, settings: SettingsPage, audit: AuditPage }
  const Page = pages[screen]
  return <Page onNavigate={navigate} />
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
