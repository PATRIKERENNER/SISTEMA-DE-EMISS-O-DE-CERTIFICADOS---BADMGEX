import React, { useState, useEffect } from 'react';
import { CertificateVerificationRecord } from '../types';
import { 
  findCertificateVerification, 
  getAllRegisteredCertificates,
  getVerificationUrl
} from '../services/verificationService';
import { 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Printer, 
  QrCode, 
  Calendar, 
  Clock, 
  Award, 
  UserCheck, 
  Building2, 
  Copy, 
  Check,
  ExternalLink,
  History
} from 'lucide-react';
import { SGExLogo, BAdmQgexLogo } from './OfficialLogos';

interface VerificationPortalProps {
  initialCode?: string;
  onClose?: () => void;
  onSelectParticipantForPreview?: (codigo: string) => void;
}

export const VerificationPortal: React.FC<VerificationPortalProps> = ({
  initialCode = '',
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>(initialCode);
  const [result, setResult] = useState<CertificateVerificationRecord | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [recentRecords, setRecentRecords] = useState<CertificateVerificationRecord[]>([]);

  useEffect(() => {
    const recents = getAllRegisteredCertificates();
    setRecentRecords(recents.slice(0, 5));

    if (initialCode && initialCode.trim() !== '') {
      handleSearch(initialCode);
    }
  }, [initialCode]);

  const handleSearch = (queryToSearch?: string) => {
    const query = queryToSearch !== undefined ? queryToSearch : searchQuery;
    if (!query || query.trim() === '') return;

    const found = findCertificateVerification(query);
    setResult(found);
    setHasSearched(true);
  };

  const handleCopyLink = () => {
    if (!result) return;
    const url = getVerificationUrl(result.codigoVerificacao);
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white p-6 sm:p-8">
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300 mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-blue-300 bg-blue-900/60 px-3 py-1 rounded-full border border-blue-700/50 mb-2">
            Portal Oficial de Autenticidade Digital
          </span>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Validação e Autenticidade de Certificados
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl">
            Consulte a legitimidade de certificados emitidos pela IET - Base Administrativa do Quartel-General do Exército (Forte Caxias).
          </p>

          {/* Search Bar */}
          <div className="w-full max-w-xl mt-6 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Insira o Código (ex: SGCERT-2026-MOPP-...) ou CPF"
                className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 font-mono text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
              />
            </div>
            <button
              type="button"
              onClick={() => handleSearch()}
              className="bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              Verificar
            </button>
          </div>
        </div>
      </div>

      {/* Main Body: Result or Prompt */}
      <div className="p-6 sm:p-8 max-w-4xl mx-auto w-full">
        {result ? (
          <div className="flex flex-col gap-6 animate-fade-in">
            {/* Success Official Certificate Banner */}
            <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-6 shadow-xs relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-emerald-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shrink-0">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                      Certidão de Autenticidade Oficial
                    </span>
                    <h3 className="text-lg font-black text-emerald-950 mt-1">
                      CERTIFICADO REGISTRADO E AUTÊNTICO
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 shadow-2xs transition"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Link Copiado!' : 'Copiar Link'}
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-3.5 py-2 rounded-xl shadow-xs transition"
                  >
                    <Printer className="w-4 h-4" />
                    Imprimir Certidão
                  </button>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 text-slate-800">
                {/* Participant Box */}
                <div className="bg-white/80 rounded-xl p-4 border border-emerald-200/80 shadow-2xs">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-700" /> Dados do Titular
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px] font-bold">NOME COMPLETO:</span>
                      <span className="font-extrabold text-sm text-slate-900">{result.nomeAluno}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <span className="text-slate-500 block text-[10px] font-bold">CPF:</span>
                        <span className="font-mono font-bold">{result.cpf}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] font-bold">REGISTRO CNH / CAT:</span>
                        <span className="font-mono font-bold">{result.registro} ({result.categoria})</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Course Box */}
                <div className="bg-white/80 rounded-xl p-4 border border-emerald-200/80 shadow-2xs">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-700" /> Dados do Curso
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px] font-bold">CURSO:</span>
                      <span className="font-extrabold text-xs text-slate-900">{result.cursoNome}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <span className="text-slate-500 block text-[10px] font-bold">CARGA HORÁRIA:</span>
                        <span className="font-bold">{result.cargaHoraria}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] font-bold">CERTIFICADO Nº:</span>
                        <span className="font-mono font-bold">{result.numeroCertificado}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Period & Issuance */}
                <div className="bg-white/80 rounded-xl p-4 border border-emerald-200/80 shadow-2xs">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-emerald-700" /> Período e Emissão
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px] font-bold">PERÍODO DE REALIZAÇÃO:</span>
                      <span className="font-semibold">{result.periodo}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] font-bold">LOCAL E DATA DE EMISSÃO:</span>
                      <span className="font-semibold">{result.dataEmissao}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] font-bold">FUNDAMENTAÇÃO LEGAL:</span>
                      <span className="text-[11px] text-slate-700">{result.resolucaoContran}</span>
                    </div>
                  </div>
                </div>

                {/* Issuing Authority */}
                <div className="bg-white/80 rounded-xl p-4 border border-emerald-200/80 shadow-2xs">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-emerald-700" /> Entidade Emissora & Assinaturas
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px] font-bold">INSTITUIÇÃO:</span>
                      <span className="font-bold">{result.unidade}</span>
                      <span className="block text-[11px] font-mono text-slate-600">{result.cnpj}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] font-bold">ASSINATURAS CADASTRADAS:</span>
                      <div className="mt-1 space-y-1">
                        {result.assinaturas.map((sig, idx) => (
                          <p key={idx} className="text-[11px] text-slate-800">
                            • <strong>{sig.nome}</strong> ({sig.cargo})
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Code Verification Badge Footer */}
              <div className="mt-6 pt-4 border-t border-emerald-200 flex flex-wrap items-center justify-between gap-3 text-[11px]">
                <div>
                  <span className="text-slate-500">Chave Oficial de Autenticação:</span>{' '}
                  <span className="font-mono font-extrabold text-slate-900 bg-white px-2 py-1 rounded border border-emerald-300">
                    {result.codigoVerificacao}
                  </span>
                </div>
                <div className="text-slate-500">
                  Registro gerado em: {result.timestampRegistro}
                </div>
              </div>
            </div>
          </div>
        ) : hasSearched ? (
          /* Not Found Banner */
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 text-center animate-fade-in flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-amber-950">
              Certificado Não Localizado
            </h3>
            <p className="text-xs text-amber-800 max-w-md mt-1">
              Não encontramos nenhum registro com a chave ou documento inserido (<strong>{searchQuery}</strong>).
              Verifique se digitou o código exatamente como impresso no certificado.
            </p>
          </div>
        ) : (
          /* Initial Prompt / Recent Registry */
          <div className="flex flex-col gap-6 text-center">
            <div className="p-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <QrCode className="w-10 h-10 text-blue-600 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800">
                Digite a Chave de Autenticação ou Aponte a Câmera para o QR Code
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Todos os certificados gerados no sistema recebem um código de autenticação único (ex: <code>SGCERT-2026-MOPP-XXXX-XXXX</code>) que comprova a conclusão legítima do curso.
              </p>
            </div>

            {recentRecords.length > 0 && (
              <div className="text-left bg-white border border-slate-200 rounded-xl p-4">
                <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-3">
                  <History className="w-3.5 h-3.5 text-blue-600" />
                  Certificados Registrados Recentemente no Sistema
                </h4>
                <div className="divide-y divide-slate-100">
                  {recentRecords.map((rec) => (
                    <div
                      key={rec.codigoVerificacao}
                      onClick={() => {
                        setSearchQuery(rec.codigoVerificacao);
                        handleSearch(rec.codigoVerificacao);
                      }}
                      className="py-2 flex items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-lg cursor-pointer transition text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900">{rec.nomeAluno}</span>
                        <span className="text-slate-500 text-[11px] block">
                          {rec.cursoNome} • Cert. {rec.numeroCertificado}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 font-bold">
                        {rec.codigoVerificacao}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
