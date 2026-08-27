import React, { useState } from 'react';
import { Participant, CourseConfig } from '../types';
import { Search, UserPlus, Trash2, Edit2, Eye, Download, Check, X, Users, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import { downloadSingleCertificate } from '../services/pdfGenerator';
import { exportParticipantsToExcel } from '../services/spreadsheetService';

interface ParticipantsTableProps {
  participants: Participant[];
  config: CourseConfig;
  selectedIndex: number;
  onSelectParticipant: (index: number) => void;
  onUpdateParticipant: (index: number, updated: Participant) => void;
  onAddParticipant: (participant: Participant) => void;
  onDeleteParticipant: (index: number) => void;
  onClearAll: () => void;
  onOpenBatchModal?: () => void;
}

export const ParticipantsTable: React.FC<ParticipantsTableProps> = ({
  participants,
  config,
  selectedIndex,
  onSelectParticipant,
  onUpdateParticipant,
  onAddParticipant,
  onDeleteParticipant,
  onClearAll,
  onOpenBatchModal,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Participant | null>(null);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newParticipant, setNewParticipant] = useState<Partial<Participant>>({
    nome: '',
    cpf: '',
    registro: '',
    categoria: 'AD',
  });

  const filteredParticipants = participants
    .map((p, originalIndex) => ({ ...p, originalIndex }))
    .filter((p) => {
      const term = searchTerm.toLowerCase();
      return (
        p.nome.toLowerCase().includes(term) ||
        p.cpf.includes(term) ||
        p.registro.includes(term) ||
        p.numeroCertificado.toLowerCase().includes(term)
      );
    });

  const startEditing = (idx: number) => {
    setEditingIndex(idx);
    setEditForm({ ...participants[idx] });
  };

  const saveEditing = () => {
    if (editingIndex !== null && editForm) {
      onUpdateParticipant(editingIndex, editForm);
      setEditingIndex(null);
      setEditForm(null);
    }
  };

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParticipant.nome) return;

    const nextIndex = participants.length + 1;
    const certNum = `${String(nextIndex).padStart(3, '0')}/${config.siglaCurso}/${config.ano}`;

    const created: Participant = {
      id: `manual-${Date.now()}`,
      numeroCertificado: newParticipant.numeroCertificado || certNum,
      nome: (newParticipant.nome || '').toUpperCase(),
      cpf: newParticipant.cpf || '000.000.000-00',
      registro: newParticipant.registro || '00000000000',
      categoria: (newParticipant.categoria || 'AD').toUpperCase(),
      periodo: newParticipant.periodo,
      cargaHoraria: newParticipant.cargaHoraria,
      dataEmissao: newParticipant.dataEmissao,
    };

    onAddParticipant(created);
    setNewParticipant({ nome: '', cpf: '', registro: '', categoria: 'AD' });
    setShowAddForm(false);
  };

  return (
    <div className="flex flex-col gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      {/* Table Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              2. Base de Formandos
            </h2>
            <h3 className="text-sm font-bold text-slate-800">
              Lista de Participantes ({participants.length})
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome, CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 w-48 sm:w-60 bg-slate-50/50"
            />
          </div>

          {/* Export to Excel */}
          {participants.length > 0 && (
            <button
              id="btn-export-excel"
              onClick={() => exportParticipantsToExcel(participants, config.nomeCurso || 'curso')}
              className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition"
              title="Exportar lista atual para planilha Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exportar Excel</span>
            </button>
          )}

          {/* Quick Batch Print Button */}
          {participants.length > 0 && onOpenBatchModal && (
            <button
              id="btn-table-batch-print"
              onClick={onOpenBatchModal}
              className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xs transition"
              title="Imprimir todos os certificados de uma vez"
            >
              <span>🖨️ Imprimir Todos</span>
            </button>
          )}

          {/* Add Manual */}
          <button
            id="btn-show-add-participant"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
          >
            <UserPlus className="w-3.5 h-3.5" />
            {showAddForm ? 'Cancelar' : 'Adicionar'}
          </button>

          {/* Clear All */}
          {participants.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Deseja realmente limpar toda a lista de alunos?')) {
                  onClearAll();
                }
              }}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              title="Limpar todos"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Inline Add Participant Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddNew}
          className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-5 gap-3 animate-fade-in"
        >
          <div className="sm:col-span-2">
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Nome Completo *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: CARLOS HENRIQUE DA SILVA"
              value={newParticipant.nome}
              onChange={(e) => setNewParticipant({ ...newParticipant, nome: e.target.value })}
              className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              CPF
            </label>
            <input
              type="text"
              placeholder="000.000.000-00"
              value={newParticipant.cpf}
              onChange={(e) => setNewParticipant({ ...newParticipant, cpf: e.target.value })}
              className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Nº Registro / CNH
            </label>
            <input
              type="text"
              placeholder="07575025319"
              value={newParticipant.registro}
              onChange={(e) => setNewParticipant({ ...newParticipant, registro: e.target.value })}
              className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
            />
          </div>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Cat.
              </label>
              <input
                type="text"
                placeholder="AD"
                value={newParticipant.categoria}
                onChange={(e) => setNewParticipant({ ...newParticipant, categoria: e.target.value })}
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold py-2 px-3 rounded-lg shadow-xs transition"
            >
              Salvar
            </button>
          </div>
        </form>
      )}

      {/* Participants Table Container */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-[320px] overflow-y-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3 font-bold text-slate-600 w-12 text-center">#</th>
              <th className="py-2.5 px-3 font-bold text-slate-600">Certificado</th>
              <th className="py-2.5 px-3 font-bold text-slate-600">Nome do Aluno</th>
              <th className="py-2.5 px-3 font-bold text-slate-600">CPF</th>
              <th className="py-2.5 px-3 font-bold text-slate-600">Nº Registro</th>
              <th className="py-2.5 px-3 font-bold text-slate-600 text-center">Cat.</th>
              <th className="py-2.5 px-3 font-bold text-slate-600 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredParticipants.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  Nenhum participante encontrado.
                </td>
              </tr>
            ) : (
              filteredParticipants.map((p) => {
                const isSelected = p.originalIndex === selectedIndex;
                const isEditing = editingIndex === p.originalIndex;

                if (isEditing && editForm) {
                  return (
                    <tr key={p.id} className="bg-amber-50/70">
                      <td className="py-2 px-3 font-mono font-bold text-center text-amber-800">
                        {p.originalIndex + 1}
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={editForm.numeroCertificado}
                          onChange={(e) => setEditForm({ ...editForm, numeroCertificado: e.target.value })}
                          className="w-full text-xs p-1 bg-white border border-amber-300 rounded font-mono"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={editForm.nome}
                          onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                          className="w-full text-xs p-1 bg-white border border-amber-300 rounded font-semibold"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={editForm.cpf}
                          onChange={(e) => setEditForm({ ...editForm, cpf: e.target.value })}
                          className="w-full text-xs p-1 bg-white border border-amber-300 rounded font-mono"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={editForm.registro}
                          onChange={(e) => setEditForm({ ...editForm, registro: e.target.value })}
                          className="w-full text-xs p-1 bg-white border border-amber-300 rounded font-mono"
                        />
                      </td>
                      <td className="py-2 px-2 text-center">
                        <input
                          type="text"
                          value={editForm.categoria}
                          onChange={(e) => setEditForm({ ...editForm, categoria: e.target.value })}
                          className="w-12 text-xs p-1 bg-white border border-amber-300 rounded text-center font-bold"
                        />
                      </td>
                      <td className="py-2 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={saveEditing}
                            className="p-1 text-emerald-700 hover:bg-emerald-100 rounded"
                            title="Salvar alterações"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingIndex(null);
                              setEditForm(null);
                            }}
                            className="p-1 text-slate-500 hover:bg-slate-200 rounded"
                            title="Cancelar"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr
                    key={p.id}
                    onClick={() => onSelectParticipant(p.originalIndex)}
                    className={`cursor-pointer transition ${
                      isSelected
                        ? 'bg-blue-50/80 font-medium text-blue-950'
                        : 'hover:bg-slate-50/80 text-slate-700'
                    }`}
                  >
                    <td className="py-2.5 px-3 text-center font-mono text-slate-400">
                      {p.originalIndex + 1}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      {p.numeroCertificado}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900 truncate max-w-[200px]">
                      {p.nome}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {p.cpf}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {p.registro}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-block bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded text-[11px] border border-slate-200">
                        {p.categoria}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onSelectParticipant(p.originalIndex)}
                          className={`p-1.5 rounded-lg transition ${
                            isSelected ? 'bg-blue-200/80 text-blue-800' : 'text-slate-500 hover:bg-slate-100'
                          }`}
                          title="Visualizar modelo"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => startEditing(p.originalIndex)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => downloadSingleCertificate(p, config)}
                          className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                          title="Baixar PDF individual"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteParticipant(p.originalIndex)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Remover participante"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
