import React from 'react';
import { SGExLogo, BAdmQgexLogo } from './OfficialLogos';
import { Zap, HelpCircle, ShieldCheck, FileSpreadsheet, Award } from 'lucide-react';

interface HeaderProps {
  totalParticipants: number;
  onOpenBatchModal: () => void;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalParticipants,
  onOpenBatchModal,
  onOpenHelp,
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-40 shadow-xs">
      {/* Left: Branding & Logos */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
          <SGExLogo className="w-7 h-9 shrink-0" />
          <BAdmQgexLogo className="w-7 h-9 shrink-0" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
              SGCERT <span className="text-blue-600 font-extrabold">Pro</span>
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              <ShieldCheck className="w-3 h-3 text-blue-600" /> B ADM QGEX / Forte Caxias
            </span>
          </div>
          <p className="text-[11px] text-slate-500 hidden sm:block">
            Mala direta automatizada de alta performance • Certificados A4 em PDF
          </p>
        </div>
      </div>

      {/* Right: Navigation & Actions */}
      <div className="flex items-center gap-3">
        <button
          id="btn-help-guide"
          onClick={onOpenHelp}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-xl transition border border-slate-200"
          title="Instruções de uso"
        >
          <HelpCircle className="w-4 h-4 text-blue-600" />
          <span className="hidden md:inline">Instruções de Uso</span>
        </button>

        <div className="h-7 w-[1px] bg-slate-200 mx-1 hidden sm:block"></div>

        <button
          id="btn-trigger-batch-modal"
          onClick={onOpenBatchModal}
          className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 active:scale-98 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-md shadow-blue-200/50 transition border border-blue-600"
        >
          <Zap className="w-4 h-4 fill-white" />
          <span>{totalParticipants > 0 ? `Emitir ${totalParticipants} Certificados` : 'Emitir Certificados'}</span>
        </button>

        <div className="hidden lg:flex w-8 h-8 rounded-full bg-slate-100 border border-slate-200 items-center justify-center text-xs font-bold text-slate-600" title="Perfil Militar / Operador">
          AD
        </div>
      </div>
    </header>
  );
};

