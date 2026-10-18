import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import Dashboard from './pages/Dashboard'
import Objectives from './pages/Objectives'
import Campaigns from './pages/Campaigns'
import InboxPage from './pages/InboxPage'
import Clients from './pages/Clients'
import Schedule from './pages/Schedule'
import Settings from './pages/Settings'

export default function App(){return <Routes><Route element={<AppLayout/>}><Route index element={<Navigate to="/dashboard" replace/>}/><Route path="/dashboard" element={<Dashboard/>}/><Route path="/objetivos" element={<Objectives/>}/><Route path="/campanhas" element={<Campaigns/>}/><Route path="/inbox" element={<InboxPage/>}/><Route path="/clientes" element={<Clients/>}/><Route path="/agenda" element={<Schedule/>}/><Route path="/configuracoes" element={<Settings/>}/></Route><Route path="*" element={<Navigate to="/dashboard" replace/>}/></Routes>}