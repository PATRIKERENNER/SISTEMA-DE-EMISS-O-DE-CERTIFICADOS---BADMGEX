import React from 'react';
import { Participant } from '../types';
import { Printer, Eye, Zap, Layers, FileText, CheckCircle2, ArrowRight } from 'lucide-react';

interface PrintChoiceBannerProps {
  participants: Participant[];
  onChooseSingle: () => void;
  onChooseBatch: () => void;
}

export const PrintChoiceBanner: React.FC<PrintChoiceBannerProps> = ({
  participants,
  onChooseSingle,
  onChooseBatch,
}) => {
  if (!participants || participants.length === 0) return null;

  return (
    <div
      id="print-choice-container"
      className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-blue-900/60 relative overflow-hidden animate-fade-in"
    >
      {/* Decorative glow background */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-blue-800/60 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/40 text-blue-400 flex items-center justify-center shrink-0 shadow-inner">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300">
                Dados Carregados com Sucesso
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {participants.length} {participants.length === 1 ? 'Aluno' : 'Alunos'}
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-white tracking-tight mt-0.5">
              Escolha como deseja imprimir ou emitir os certificados:
            </h3>
          </div>
        </div>
      </div>

      {/* Two Choice Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        {/* Choice 1: Print One by One */}
        <button
          id="btn-choice-single-print"
          onClick={onChooseSingle}
          type="button"
          className="group text-left bg-white/10 hover:bg-white/15 border-2 border-white/10 hover:border-blue-400/80 rounded-xl p-5 transition-all duration-200 flex flex-col justify-between gap-4 cursor-pointer shadow-sm hover:shadow-md hover:scale-[1.01]"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="w-11 h-11 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center border border-blue-400/30 group-hover:bg-blue-600 group-hover:text-white transition">
              <Eye className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold tracking-wider text-blue-300 uppercase bg-blue-900/60 px-2.5 py-1 rounded-full border border-blue-700/50">
              Individual
            </span>
          </div>

          <div>
            <h4 className="text-base font-bold text-white group-hover:text-blue-200 transition flex items-center gap-1.5">
              <span>Imprimir 1 Certificado por Vez</span>
            </h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Visualize a prévia de cada aluno (Frente e Verso), confira os dados e imprima ou baixe o PDF individualmente.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-300 group-hover:text-white group-hover:translate-x-1 transition pt-2 border-t border-white/10">
            <span>Abrir Prévia Individual</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>

        {/* Choice 2: Print ALL at once (Batch) */}
        <button
          id="btn-choice-batch-print"
          onClick={onChooseBatch}
          type="button"
          className="group text-left bg-gradient-to-br from-blue-600/90 to-blue-800/90 hover:from-blue-600 hover:to-blue-700 border-2 border-blue-400/60 hover:border-emerald-400 rounded-xl p-5 transition-all duration-200 flex flex-col justify-between gap-4 cursor-pointer shadow-lg shadow-blue-950/50 hover:scale-[1.01]"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="w-11 h-11 rounded-xl bg-white/20 text-white flex items-center justify-center border border-white/30 group-hover:bg-white group-hover:text-blue-800 transition">
              <Printer className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold tracking-wider text-emerald-200 uppercase bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/50 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-300 fill-amber-300" />
              Recomendado
            </span>
          </div>

          <div>
            <h4 className="text-base font-bold text-white group-hover:text-emerald-100 transition flex items-center gap-1.5">
              <span>Imprimir TODOS os Certificados de Uma Vez</span>
            </h4>
            <p className="text-xs text-blue-100 mt-1 leading-relaxed">
              Gere todos os <strong className="text-white">{participants.length} certificados</strong> de uma única vez em <strong>PDF Único</strong> pronto para impressão contínua ou em arquivo <strong>ZIP</strong>.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-200 group-hover:text-white group-hover:translate-x-1 transition pt-2 border-t border-white/20">
            <span>Gerar Todos ({participants.length} Certificados)</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>
      </div>
    </div>
  );
};
