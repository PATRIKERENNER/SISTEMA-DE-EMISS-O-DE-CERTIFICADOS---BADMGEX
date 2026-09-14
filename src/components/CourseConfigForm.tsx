import React, { useState } from 'react';
import { CourseConfig, DisciplineItem, SignatureItem, SignatureType, CoursePreset } from '../types';
import { DEFAULT_COURSE_CONFIG } from '../data/sampleData';
import { OFFICIAL_COURSE_PRESETS } from '../data/coursesPresets';
import { generateQrCodeDataUrl } from '../services/verificationService';
import { 
  Settings, 
  BookOpen, 
  UserCheck, 
  Shield, 
  RotateCcw, 
  Plus, 
  Trash2, 
  CheckCircle, 
  FileSignature,
  PenTool,
  Image as ImageIcon,
  QrCode,
  Upload,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface CourseConfigFormProps {
  config: CourseConfig;
  onChangeConfig: (newConfig: CourseConfig) => void;
}

export const CourseConfigForm: React.FC<CourseConfigFormProps> = ({
  config,
  onChangeConfig,
}) => {
  const [activeTab, setActiveTab] = useState<'geral' | 'assinatura' | 'disciplinas'>('geral');
  const [savedNote, setSavedNote] = useState<boolean>(false);

  const handleChange = (field: keyof CourseConfig, value: any) => {
    onChangeConfig({
      ...config,
      [field]: value,
    });
    setSavedNote(true);
    setTimeout(() => setSavedNote(false), 2000);
  };

  const handleApplyPreset = (preset: CoursePreset) => {
    onChangeConfig({
      ...config,
      tipoCursoId: preset.id,
      nomeCurso: preset.nomeCompleto,
      subtituloCurso: preset.subtitulo,
      siglaCurso: preset.sigla,
      numeroTurma: `001/${preset.sigla}/${config.ano || '2026'}`,
      cargaHorariaGeral: preset.cargaHorariaPadrao,
      resolucaoContran: preset.resolucaoPadrao,
      disciplinas: preset.disciplinas,
    });
    setSavedNote(true);
    setTimeout(() => setSavedNote(false), 2000);
  };

  const handleDisciplineChange = (index: number, field: keyof DisciplineItem, value: string) => {
    const updated = [...config.disciplinas];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    handleChange('disciplinas', updated);
  };

  const addDiscipline = () => {
    const newDisc: DisciplineItem = {
      id: `disc-${Date.now()}`,
      nome: 'Nova Disciplina',
      cargaHoraria: '10h/a',
      avaliacaoPadrao: '10',
      instrutor: 'NOME DO INSTRUTOR',
    };
    handleChange('disciplinas', [...config.disciplinas, newDisc]);
  };

  const removeDiscipline = (index: number) => {
    const updated = config.disciplinas.filter((_, i) => i !== index);
    handleChange('disciplinas', updated);
  };

  // Signatures Management
  const currentSignatures: SignatureItem[] = config.assinaturas && config.assinaturas.length > 0
    ? config.assinaturas
    : (config.nomeDiretor || config.cargoDiretor)
    ? [
        {
          id: 'sig-1',
          nome: config.nomeDiretor || '',
          cargo: config.cargoDiretor || '',
          cpf: config.cpfDiretor || '',
          tipoAssinatura: 'manual',
        },
      ]
    : [];

  const saveSignatures = (updated: SignatureItem[]) => {
    onChangeConfig({
      ...config,
      assinaturas: updated,
      nomeDiretor: updated[0]?.nome || '',
      cargoDiretor: updated[0]?.cargo || '',
      cpfDiretor: updated[0]?.cpf || '',
    });
    setSavedNote(true);
    setTimeout(() => setSavedNote(false), 2000);
  };

  const handleSignatureChange = (index: number, field: keyof SignatureItem, value: any) => {
    const updated = [...currentSignatures];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    saveSignatures(updated);
  };

  const handleSignatureTypeChange = async (index: number, tipo: SignatureType) => {
    const updated = [...currentSignatures];
    const item = { ...updated[index], tipoAssinatura: tipo };
    if (tipo === 'qrcode' && item.dadosQrCode && !item.qrCodeDataUrl) {
      item.qrCodeDataUrl = await generateQrCodeDataUrl(item.dadosQrCode, 160);
    }
    updated[index] = item;
    saveSignatures(updated);
  };

  const handleSignatureQrCodeChange = async (index: number, text: string) => {
    const updated = [...currentSignatures];
    let qrUrl = '';
    if (text.trim() !== '') {
      qrUrl = await generateQrCodeDataUrl(text, 160);
    }
    updated[index] = {
      ...updated[index],
      dadosQrCode: text,
      qrCodeDataUrl: qrUrl,
    };
    saveSignatures(updated);
  };

  const handleSignatureImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const updated = [...currentSignatures];
      updated[index] = {
        ...updated[index],
        tipoAssinatura: 'imagem',
        imagemUrl: dataUrl,
      };
      saveSignatures(updated);
    };
    reader.readAsDataURL(file);
  };

  const removeSignatureImage = (index: number) => {
    const updated = [...currentSignatures];
    updated[index] = {
      ...updated[index],
      imagemUrl: undefined,
    };
    saveSignatures(updated);
  };

  const addSignature = () => {
    const newSig: SignatureItem = {
      id: `sig-${Date.now()}`,
      nome: 'NOME DA AUTORIDADE / RESPONSÁVEL',
      cargo: 'Cargo / Função',
      cpf: '',
      tipoAssinatura: 'manual',
    };
    saveSignatures([...currentSignatures, newSig]);
  };

  const removeSignature = (index: number) => {
    const updated = currentSignatures.filter((_, i) => i !== index);
    saveSignatures(updated);
  };

  const resetToOfficialTemplate = () => {
    if (window.confirm('Restaurar dados padrão do Exército Brasileiro (Forte Caxias / CVTE 2026)?')) {
      onChangeConfig(DEFAULT_COURSE_CONFIG);
    }
  };

  const clearSignatureFields = () => {
    onChangeConfig({
      ...config,
      assinaturas: [],
      nomeDiretor: '',
      cargoDiretor: '',
      cpfDiretor: '',
      incluirAssinaturaImagem: false,
    });
    setSavedNote(true);
    setTimeout(() => setSavedNote(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      {/* Header with Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
            <Settings className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              3. Parâmetros Institucionais
            </h2>
            <h3 className="text-sm font-bold text-slate-800">
              Configurações do Certificado & Curso
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {savedNote && (
            <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Salvo automaticamente
            </span>
          )}
          <button
            id="btn-reset-official-config"
            onClick={resetToOfficialTemplate}
            className="flex items-center gap-1 text-slate-600 hover:text-slate-900 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
            title="Restaurar padrão oficial do Exército"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            Restaurar Modelo
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('geral')}
          className={`px-4 py-2.5 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'geral'
              ? 'border-blue-700 text-blue-700 bg-blue-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Dados do Curso & Legal
        </button>
        <button
          onClick={() => setActiveTab('assinatura')}
          className={`px-4 py-2.5 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'assinatura'
              ? 'border-blue-700 text-blue-700 bg-blue-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          Assinaturas ({currentSignatures.length}) & Unidade
        </button>
        <button
          onClick={() => setActiveTab('disciplinas')}
          className={`px-4 py-2.5 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'disciplinas'
              ? 'border-blue-700 text-blue-700 bg-blue-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          Grade / Verso ({config.disciplinas.length})
        </button>
      </div>

      {/* Tab 1: General & Legal */}
      {activeTab === 'geral' && (
        <div className="flex flex-col gap-4 text-xs animate-fade-in">
          {/* Quick preset chips */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 block mb-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Predefinições Rápidas por Curso Especializado CONTRAN:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {OFFICIAL_COURSE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition border ${
                    config.siglaCurso === preset.sigla
                      ? 'bg-blue-600 text-white border-blue-700 shadow-2xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  {preset.nomeCurto}
                </button>
              ))}
            </div>
          </div>

          {/* Opções de Fundo e Marca d'água */}
          <div className="bg-emerald-50/70 border border-emerald-200 p-3.5 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-lg overflow-hidden border border-emerald-300 bg-white shrink-0 shadow-2xs">
                <img
                  src="/fundo-certificado.jpg"
                  alt="Miniatura Fundo"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  Imagem de Fundo Oficial (Frente e Verso)
                </p>
                <p className="text-[10.5px] text-slate-600">
                  Foto em marca d'água da Praça dos Cristais / Concha Acústica QGEx com a Bandeira Nacional inserida em ambos os lados do certificado gerado.
                </p>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={config.incluirMarcaDagua !== false}
                onChange={(e) => handleChange('incluirMarcaDagua', e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <span className="text-xs font-bold text-slate-800 hidden sm:inline">Ativo nos 2 lados</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">
                Nome Completo do Curso
              </label>
              <input
                type="text"
                value={config.nomeCurso}
                onChange={(e) => handleChange('nomeCurso', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Subtítulo do Cabeçalho
              </label>
              <input
                type="text"
                value={config.subtituloCurso}
                onChange={(e) => handleChange('subtituloCurso', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Sigla do Curso
                </label>
                <input
                  type="text"
                  value={config.siglaCurso}
                  onChange={(e) => handleChange('siglaCurso', e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Ano
                </label>
                <input
                  type="text"
                  value={config.ano}
                  onChange={(e) => handleChange('ano', e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1" title="Número da Turma impresso no canto superior direito do certificado">
                  Nº da Turma (Canto Sup. Direito)
                </label>
                <input
                  type="text"
                  value={config.numeroTurma || `001/${config.siglaCurso}/${config.ano}`}
                  onChange={(e) => handleChange('numeroTurma', e.target.value)}
                  placeholder={`001/${config.siglaCurso}/${config.ano}`}
                  className="w-full p-2 bg-blue-50/70 border border-blue-300 rounded-lg text-blue-950 font-mono font-bold"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">
                Instituição Certificadora
              </label>
              <input
                type="text"
                value={config.instituicao}
                onChange={(e) => handleChange('instituicao', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Instrução Detran-DF
              </label>
              <input
                type="text"
                value={config.instrucaoDetran}
                onChange={(e) => handleChange('instrucaoDetran', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Resolução CONTRAN
              </label>
              <input
                type="text"
                value={config.resolucaoContran}
                onChange={(e) => handleChange('resolucaoContran', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Período Padrão do Curso
              </label>
              <input
                type="text"
                value={config.periodoGeral}
                onChange={(e) => handleChange('periodoGeral', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Carga Horária
                </label>
                <input
                  type="text"
                  value={config.cargaHorariaGeral}
                  onChange={(e) => handleChange('cargaHorariaGeral', e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Validade
                </label>
                <input
                  type="text"
                  value={config.validadeAnos}
                  onChange={(e) => handleChange('validadeAnos', e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">
                Local e Data de Emissão
              </label>
              <input
                type="text"
                value={config.localDataGeral}
                onChange={(e) => handleChange('localDataGeral', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold"
              />
            </div>

            {/* Authenticity Verification Code Toggle */}
            <div className="sm:col-span-2 bg-blue-50/70 border border-blue-200 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
                <div>
                  <span className="font-bold text-slate-900 block text-xs">
                    Código e QR Code de Autenticidade Digital
                  </span>
                  <span className="text-[11px] text-slate-600">
                    Gera chave única no certificado para validação pública e auditoria contra fraudes.
                  </span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.incluirCodigoVerificacao !== false}
                  onChange={(e) => handleChange('incluirCodigoVerificacao', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Signature & Unit */}
      {activeTab === 'assinatura' && (
        <div className="flex flex-col gap-4 text-xs animate-fade-in">
          {/* Action banner with Add button */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-bold text-slate-800 flex items-center gap-1.5">
                <FileSignature className="w-4 h-4 text-blue-700" />
                Assinaturas do Certificado ({currentSignatures.length})
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Configure cada autoridade com assinatura manual (linha limpa), imagem escaneada/rubrica ou QR Code de validação digital.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={addSignature}
                className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs transition"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Assinatura
              </button>
              {currentSignatures.length > 0 && (
                <button
                  type="button"
                  onClick={clearSignatureFields}
                  className="text-xs text-red-600 hover:text-red-700 bg-white hover:bg-red-50 px-2.5 py-1.5 rounded-lg border border-red-200 transition font-semibold"
                  title="Limpar todas as assinaturas"
                >
                  Limpar Todas
                </button>
              )}
            </div>
          </div>

          {/* List of Dynamic Signatures with Type Selector */}
          {currentSignatures.length === 0 ? (
            <div className="text-center p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl">
              <p className="text-slate-500 font-medium">Nenhuma assinatura configurada no momento.</p>
              <button
                type="button"
                onClick={addSignature}
                className="mt-2 text-xs font-bold text-blue-700 hover:underline"
              >
                + Adicionar a primeira assinatura
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {currentSignatures.map((sig, idx) => {
                const tipo = sig.tipoAssinatura || 'manual';

                return (
                  <div
                    key={sig.id || `sig-${idx}`}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-3"
                  >
                    {/* Header: Title + Type selector + Remove button */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
                      <span className="font-extrabold text-slate-800 text-xs">
                        Assinatura #{idx + 1}
                      </span>

                      {/* Type Switcher: Manual / Imagem / QR Code */}
                      <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
                        <button
                          type="button"
                          onClick={() => handleSignatureTypeChange(idx, 'manual')}
                          className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition ${
                            tipo === 'manual'
                              ? 'bg-blue-600 text-white shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <PenTool className="w-3 h-3" /> Caneta
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSignatureTypeChange(idx, 'imagem')}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition ${
                            tipo === 'imagem'
                              ? 'bg-blue-600 text-white shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <ImageIcon className="w-3 h-3" /> Imagem / Rubrica
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeSignature(idx)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition"
                        title="Excluir esta assinatura"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Signature Text Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-5">
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">
                          Nome da Autoridade
                        </label>
                        <input
                          type="text"
                          value={sig.nome}
                          onChange={(e) => handleSignatureChange(idx, 'nome', e.target.value)}
                          placeholder="Ex: Carlos Henrique Ferreira De Mello"
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg font-bold text-slate-900"
                        />
                      </div>

                      <div className="sm:col-span-4">
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">
                          Cargo / Função
                        </label>
                        <input
                          type="text"
                          value={sig.cargo}
                          onChange={(e) => handleSignatureChange(idx, 'cargo', e.target.value)}
                          placeholder="Ex: Diretor Geral, Coordenador, etc."
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-800"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">
                          CPF / Doc (Opcional)
                        </label>
                        <input
                          type="text"
                          value={sig.cpf || ''}
                          onChange={(e) => handleSignatureChange(idx, 'cpf', e.target.value)}
                          placeholder="000.000.000-00"
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono"
                        />
                      </div>
                    </div>

                    {/* Conditional: Image upload & preview */}
                    {tipo === 'imagem' && (
                      <div className="p-3 bg-white border border-slate-200 rounded-lg flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <span className="text-[11px] font-bold text-slate-800 block">
                            Arquivo de Assinatura / Rubrica (PNG ou JPG transparente)
                          </span>
                          <span className="text-[10px] text-slate-500">
                            A imagem será impressa centralizada logo acima da linha de assinatura.
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          {sig.imagemUrl ? (
                            <div className="flex items-center gap-2">
                              <div className="h-10 px-3 bg-slate-50 border border-slate-200 rounded flex items-center justify-center">
                                <img
                                  src={sig.imagemUrl}
                                  alt="Assinatura"
                                  className="h-8 max-w-[100px] object-contain"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeSignatureImage(idx)}
                                className="text-xs text-red-600 hover:text-red-700 font-semibold underline"
                              >
                                Remover Imagem
                              </button>
                            </div>
                          ) : (
                            <label className="cursor-pointer flex items-center gap-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold px-3 py-1.5 rounded-lg border border-blue-200 transition">
                              <Upload className="w-3.5 h-3.5" />
                              <span>Carregar Assinatura</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleSignatureImageUpload(idx, e)}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Unit and CNPJ settings */}
          <div className="pt-2 border-t border-slate-200">
            <h4 className="font-bold text-slate-800 text-xs mb-3">
              Dados da Unidade Militar e CNPJ (Rodapé)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  CNPJ da Base Administrativa
                </label>
                <input
                  type="text"
                  value={config.cnpj}
                  onChange={(e) => handleChange('cnpj', e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nome da Unidade Militar
                </label>
                <input
                  type="text"
                  value={config.nomeUnidade}
                  onChange={(e) => handleChange('nomeUnidade', e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 uppercase font-bold"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Programmatic Content / Back Page */}
      {activeTab === 'disciplinas' && (
        <div className="flex flex-col gap-3 text-xs animate-fade-in">
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
              <input
                type="checkbox"
                checked={config.incluirVerso}
                onChange={(e) => handleChange('incluirVerso', e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              Emitir Verso com Conteúdo Programático
            </label>
            <button
              onClick={addDiscipline}
              className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white px-2.5 py-1 rounded-lg text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" /> Adicionar Matéria
            </button>
          </div>

          {config.disciplinas.map((disc, idx) => (
            <div
              key={disc.id || `disc-${idx}`}
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
            >
              <div className="sm:col-span-5">
                <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                  Nome da Matéria #{idx + 1}
                </label>
                <input
                  type="text"
                  value={disc.nome}
                  onChange={(e) => handleDisciplineChange(idx, 'nome', e.target.value)}
                  className="w-full p-1.5 bg-white border border-slate-200 rounded-lg font-medium text-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                  Carga Horária
                </label>
                <input
                  type="text"
                  value={disc.cargaHoraria}
                  onChange={(e) => handleDisciplineChange(idx, 'cargaHoraria', e.target.value)}
                  className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-center"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                  Instrutor Responsável
                </label>
                <input
                  type="text"
                  value={disc.instrutor}
                  onChange={(e) => handleDisciplineChange(idx, 'instrutor', e.target.value)}
                  className="w-full p-1.5 bg-white border border-slate-200 rounded-lg"
                />
              </div>

              <div className="sm:col-span-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeDiscipline(idx)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition"
                  title="Excluir disciplina"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
