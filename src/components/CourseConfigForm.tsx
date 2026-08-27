import React, { useState } from 'react';
import { CourseConfig, DisciplineItem, SignatureItem } from '../types';
import { DEFAULT_COURSE_CONFIG } from '../data/sampleData';
import { Settings, BookOpen, UserCheck, Shield, RotateCcw, Plus, Trash2, CheckCircle, FileSignature } from 'lucide-react';

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
        },
      ]
    : [];

  const handleSignatureChange = (index: number, field: keyof SignatureItem, value: string) => {
    const updated = [...currentSignatures];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    // Also keep legacy fields in sync with first signature for full compatibility
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

  const addSignature = () => {
    const newSig: SignatureItem = {
      id: `sig-${Date.now()}`,
      nome: 'NOME DA AUTORIDADE / RESPONSÁVEL',
      cargo: 'Cargo / Função',
      cpf: '',
    };
    const updated = [...currentSignatures, newSig];
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

  const removeSignature = (index: number) => {
    const updated = currentSignatures.filter((_, i) => i !== index);
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs animate-fade-in">
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

          <div className="grid grid-cols-2 gap-2">
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
                Edite os nomes e cargos, adicione novas autoridades ou remova assinaturas conforme a necessidade da turma.
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

          {/* List of Dynamic Signatures */}
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
              {currentSignatures.map((sig, idx) => (
                <div
                  key={sig.id || `sig-${idx}`}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                >
                  <div className="sm:col-span-5">
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">
                      Assinatura #{idx + 1} — Nome da Autoridade
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

                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">
                      CPF / Doc (Opcional)
                    </label>
                    <input
                      type="text"
                      value={sig.cpf || ''}
                      onChange={(e) => handleSignatureChange(idx, 'cpf', e.target.value)}
                      placeholder="000.000.000-00"
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono text-center"
                    />
                  </div>

                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeSignature(idx)}
                      className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                      title="Excluir esta assinatura"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
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
              key={disc.id}
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
            >
              <div className="sm:col-span-5">
                <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                  Disciplina #{idx + 1}
                </label>
                <input
                  type="text"
                  value={disc.nome}
                  onChange={(e) => handleDisciplineChange(idx, 'nome', e.target.value)}
                  className="w-full p-1.5 bg-white border border-slate-200 rounded-md font-semibold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                  C. Horária
                </label>
                <input
                  type="text"
                  value={disc.cargaHoraria}
                  onChange={(e) => handleDisciplineChange(idx, 'cargaHoraria', e.target.value)}
                  className="w-full p-1.5 bg-white border border-slate-200 rounded-md text-center"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                  Instrutor
                </label>
                <input
                  type="text"
                  value={disc.instrutor}
                  onChange={(e) => handleDisciplineChange(idx, 'instrutor', e.target.value)}
                  className="w-full p-1.5 bg-white border border-slate-200 rounded-md"
                />
              </div>

              <div className="sm:col-span-1 flex justify-end">
                <button
                  onClick={() => removeDiscipline(idx)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition"
                  title="Remover disciplina"
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
