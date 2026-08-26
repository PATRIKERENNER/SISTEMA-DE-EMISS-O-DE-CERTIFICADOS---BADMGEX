import React, { useState } from 'react';
import { Participant, CourseConfig } from './types';
import { DEFAULT_COURSE_CONFIG, INITIAL_PARTICIPANTS } from './data/sampleData';
import { Header } from './components/Header';
import { CertificatePreview } from './components/CertificatePreview';
import { CsvUploader } from './components/CsvUploader';
import { ParticipantsTable } from './components/ParticipantsTable';
import { CourseConfigForm } from './components/CourseConfigForm';
import { BatchGeneratorModal } from './components/BatchGeneratorModal';
import { HelpModal } from './components/HelpModal';
import { 
  Eye, 
  Users, 
  Settings, 
  Zap, 
  FileSpreadsheet, 
  CheckCircle2, 
  Clock, 
  Shield, 
  Award,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function App() {
  const [participants, setParticipants] = useState<Participant[]>(INITIAL_PARTICIPANTS);
  const [courseConfig, setCourseConfig] = useState<CourseConfig>(DEFAULT_COURSE_CONFIG);
  const [selectedParticipantIndex, setSelectedParticipantIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'preview' | 'participants' | 'config'>('preview');
  const [isBatchModalOpen, setIsBatchModalOpen] = useState<boolean>(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);

  // Safe current participant
  const currentParticipant = participants[selectedParticipantIndex] || participants[0] || {
    id: 'fallback',
    numeroCertificado: '001/CVTE/2026',
    nome: 'CARLOS HENRIQUE CAETANO DA SILVA',
    cpf: '067.440.731-84',
    registro: '07575025319',
    categoria: 'AD',
  };

  const handleUpdateParticipant = (index: number, updated: Participant) => {
    const next = [...participants];
    next[index] = updated;
    setParticipants(next);
  };

  const handleAddParticipant = (newP: Participant) => {
    setParticipants([...participants, newP]);
    setSelectedParticipantIndex(participants.length);
  };

  const handleDeleteParticipant = (index: number) => {
    const next = participants.filter((_, i) => i !== index);
    setParticipants(next);
    if (selectedParticipantIndex >= next.length) {
      setSelectedParticipantIndex(Math.max(0, next.length - 1));
    }
  };

  const handleClearAll = () => {
    setParticipants([]);
    setSelectedParticipantIndex(0);
  };

  const handleLoadCsvParticipants = (imported: Participant[]) => {
    setParticipants(imported);
    setSelectedParticipantIndex(0);
    setActiveTab('preview');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Official Institutional Header */}
      <Header
        totalParticipants={participants.length}
        onOpenBatchModal={() => setIsBatchModalOpen(true)}
        onOpenHelp={() => setIsHelpModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* Quick Requirement & Benchmark Banner */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100/80 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-slate-800 tracking-tight">
                  Sistema de Emissão em Massa SGEx / B ADM QGEX
                </span>
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> ⚡ 15 Certificados em &lt; 2.5s (Meta: &lt; 60s)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Mala direta automatizada de alta precisão. Diagramação A4 paisagem, brasões oficiais vetoriais e verso programático.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsHelpModalOpen(true)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3 py-2 rounded-xl transition border border-slate-200"
            >
              Guia de Uso
            </button>

            <button
              id="btn-quick-run-batch"
              onClick={() => setIsBatchModalOpen(true)}
              className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 active:scale-98 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-md shadow-blue-200/50 transition border border-blue-600"
            >
              <Zap className="w-4 h-4 fill-white" />
              Testar Cronômetro (15 Alunos)
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs max-w-fit">
          <button
            id="tab-preview"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition ${
              activeTab === 'preview'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Eye className="w-4 h-4" />
            Visualizar Certificado
          </button>

          <button
            id="tab-participants"
            onClick={() => setActiveTab('participants')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition ${
              activeTab === 'participants'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4" />
            Alunos & Planilha CSV
            <span className={`text-[11px] px-2 py-0.2 rounded-full font-bold ${
              activeTab === 'participants' ? 'bg-white text-blue-700' : 'bg-slate-100 text-slate-600'
            }`}>
              {participants.length}
            </span>
          </button>

          <button
            id="tab-config"
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition ${
              activeTab === 'config'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Settings className="w-4 h-4" />
            Configurações do Curso
          </button>
        </div>

        {/* Tab 1: Preview View */}
        {activeTab === 'preview' && (
          <div className="flex flex-col gap-6 animate-fade-in">
            {participants.length === 0 ? (
              <div className="bg-white p-12 rounded-xl border border-slate-200 text-center flex flex-col items-center gap-4 shadow-sm">
                <div className="w-16 h-16 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  Nenhum aluno carregado no momento
                </h3>
                <p className="text-xs text-slate-500 max-w-md">
                  Importe sua planilha CSV ou carregue os 15 alunos modelo para visualizar e emitir os certificados.
                </p>
                <button
                  onClick={() => {
                    setParticipants(INITIAL_PARTICIPANTS);
                    setSelectedParticipantIndex(0);
                  }}
                  className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-sm"
                >
                  Carregar 15 Alunos Modelo do Exército
                </button>
              </div>
            ) : (
              <CertificatePreview
                participant={currentParticipant}
                config={courseConfig}
                allParticipants={participants}
                currentIndex={selectedParticipantIndex}
                onSelectParticipant={(idx) => setSelectedParticipantIndex(idx)}
              />
            )}
          </div>
        )}

        {/* Tab 2: Participants & CSV View */}
        {activeTab === 'participants' && (
          <div className="flex flex-col gap-6 animate-fade-in">
            {/* CSV Uploader Box */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    1. Importação de Dados
                  </h2>
                  <h3 className="text-sm font-bold text-slate-800">
                    Mala Direta via Planilha CSV
                  </h3>
                </div>
              </div>

              <CsvUploader
                onLoadParticipants={handleLoadCsvParticipants}
                currentCount={participants.length}
              />
            </div>

            {/* Participants Table */}
            <ParticipantsTable
              participants={participants}
              config={courseConfig}
              selectedIndex={selectedParticipantIndex}
              onSelectParticipant={(idx) => {
                setSelectedParticipantIndex(idx);
                setActiveTab('preview');
              }}
              onUpdateParticipant={handleUpdateParticipant}
              onAddParticipant={handleAddParticipant}
              onDeleteParticipant={handleDeleteParticipant}
              onClearAll={handleClearAll}
            />
          </div>
        )}

        {/* Tab 3: Course Configuration Form */}
        {activeTab === 'config' && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <CourseConfigForm
              config={courseConfig}
              onChangeConfig={(newCfg) => setCourseConfig(newCfg)}
            />
          </div>
        )}
      </main>

      {/* Footer in Professional Polish Style */}
      <footer className="bg-slate-900 text-white mt-12 py-3 px-4 sm:px-8 text-[10px] font-medium tracking-wider flex flex-wrap items-center justify-between gap-3 border-t border-slate-800">
        <div>
          <span>SISTEMA SGCERT PRO • BASE ADMINISTRATIVA DO QGEX / FORTE CAXIAS</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>PROCESSADOR: V8 JS OPTIMIZED</span>
          <span>FORMATO: A4 PAISAGEM</span>
          <span className="text-blue-400 font-semibold">PRONTO PARA VERCEL & GITHUB</span>
        </div>
      </footer>

      {/* Modals */}
      <BatchGeneratorModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        participants={participants}
        config={courseConfig}
      />

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </div>
  );
}
