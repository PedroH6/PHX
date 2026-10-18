import { useOutletContext } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { Field, PageHeading } from '../components/UI'

export default function Objectives(){
  const {notify}=useOutletContext()
  return <div><PageHeading eyebrow="Outcome Engine" title="Objetivos" description="Diga o resultado que você quer alcançar e deixe o PHX preparar a estratégia."/>
    <section className="grid gap-5 xl:grid-cols-[1fr_.8fr]">
      <form onSubmit={(e)=>{e.preventDefault();notify('Estratégia criada com IA ✨')}} className="glass-card p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Objetivo"><select><option>Preencher minha agenda</option><option>Recuperar clientes antigos</option></select></Field><Field label="Serviço"><select><option>Cardiologia</option><option>Clínica Médica</option></select></Field><Field label="Vagas disponíveis"><input defaultValue="18"/></Field><Field label="Meta"><input defaultValue="12"/></Field></div>
        <button className="gradient-button mt-6"><Sparkles size={18}/>Criar estratégia com IA</button>
      </form>
      <div className="glass-card p-5"><div className="rounded-[26px] bg-gradient-to-br from-violet-950 via-violet-700 to-fuchsia-500 p-6 text-white"><div className="text-xs font-black uppercase tracking-[.2em] text-violet-200">Resumo do outcome</div><h3 className="mt-3 text-2xl font-black">Preencher 12 de 18 vagas</h3><p className="mt-2 text-sm text-violet-100">Cardiologia • campanha orientada a resultado</p></div></div>
    </section>
  </div>
}