import React, { useState, useEffect } from 'react';
import { Participant, CourseConfig } from '../types';
import { SGExLogo, BAdmQgexLogo, DirectorSignature, BaroqueCorner, CertificateFlourish } from './OfficialLogos';
import { Download, Printer, Eye, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, CheckCircle, Sparkles, Zap, ShieldCheck, QrCode } from 'lucide-react';
import { downloadSingleCertificate } from '../services/pdfGenerator';
import { generateVerificationCode, generateQrCodeDataUrl, getVerificationUrl } from '../services/verificationService';

interface CertificatePreviewProps {
  participant: Participant;
  config: CourseConfig;
  allParticipants: Participant[];
  currentIndex: number;
  onSelectParticipant: (index: number) => void;
  onOpenBatchModal?: () => void;
  onOpenVerification?: (code: string) => void;
}

export const CertificatePreview: React.FC<CertificatePreviewProps> = ({
  participant,
  config,
  allParticipants,
  currentIndex,
  onSelectParticipant,
  onOpenBatchModal,
  onOpenVerification,
}) => {
  const [viewSide, setViewSide] = useState<'front' | 'back'>('front');
  const [showVariableHighlights, setShowVariableHighlights] = useState<boolean>(false);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [verificationQrDataUrl, setVerificationQrDataUrl] = useState<string>('');

  const periodo = participant.periodo || config.periodoGeral;
  const cargaHoraria = participant.cargaHoraria || config.cargaHorariaGeral;
  const dataEmissao = participant.dataEmissao || config.localDataGeral;
  const verificationCode = participant.codigoVerificacao || generateVerificationCode(participant, config);

  useEffect(() => {
    let isMounted = true;
    if (config.incluirCodigoVerificacao !== false) {
      const url = getVerificationUrl(verificationCode);
      generateQrCodeDataUrl(url, 120)
        .then((qr) => {
          if (isMounted) setVerificationQrDataUrl(qr);
        })
        .catch((err) => console.warn('Falha ao gerar QR na prévia', err));
    }
    return () => {
      isMounted = false;
    };
  }, [verificationCode, config.incluirCodigoVerificacao]);

  const numTurma = config.numeroTurma || participant.numeroCertificado || `001/${config.siglaCurso}/${config.ano}`;

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await downloadSingleCertificate(participant, config);
    } catch (e) {
      console.error(e);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        {/* Navigation between participants */}
        <div className="flex items-center gap-2">
          <button
            id="btn-prev-participant"
            onClick={() => onSelectParticipant(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition text-slate-700"
            title="Participante anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Aluno
            </span>
            <select
              id="select-participant"
              value={currentIndex}
              onChange={(e) => onSelectParticipant(Number(e.target.value))}
              className="font-medium text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 focus:outline-hidden focus:ring-2 focus:ring-blue-500 max-w-[200px] sm:max-w-xs truncate"
            >
              {allParticipants.map((p, idx) => (
                <option key={p.id} value={idx}>
                  #{idx + 1} - {p.nome} ({p.numeroCertificado})
                </option>
              ))}
            </select>
            <span className="text-xs text-slate-400">
              de {allParticipants.length}
            </span>
          </div>

          <button
            id="btn-next-participant"
            onClick={() => onSelectParticipant(Math.min(allParticipants.length - 1, currentIndex + 1))}
            disabled={currentIndex === allParticipants.length - 1}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition text-slate-700"
            title="Próximo participante"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* View mode toggle: Frente vs Verso */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            id="btn-view-front"
            onClick={() => setViewSide('front')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
              viewSide === 'front'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📄 Frente (Certificado)
          </button>
          <button
            id="btn-view-back"
            onClick={() => setViewSide('back')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
              viewSide === 'back'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📋 Verso (Conteúdo)
          </button>
        </div>

        {/* Highlight Variable Fields & Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            id="btn-toggle-highlights"
            onClick={() => setShowVariableHighlights(!showVariableHighlights)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition ${
              showVariableHighlights
                ? 'bg-red-50 text-red-700 border-red-300 font-semibold'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
            title="Destaca em vermelho os campos variáveis da mala direta conforme modelo"
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            {showVariableHighlights ? 'Ocultar Variáveis' : 'Destacar Variáveis'}
          </button>

          <div className="hidden sm:flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            <button
              onClick={() => setZoomScale(Math.max(0.6, zoomScale - 0.15))}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-md"
              title="Reduzir zoom"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono text-slate-600 px-2">
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              onClick={() => setZoomScale(Math.min(1.4, zoomScale + 0.15))}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-md"
              title="Aumentar zoom"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Actions */}
          {onOpenVerification && (
            <button
              id="btn-verify-current-cert"
              onClick={() => onOpenVerification(verificationCode)}
              className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold px-3 py-1.5 rounded-lg shadow-2xs transition active:scale-95"
              title="Verificar autenticidade digital deste certificado no portal oficial"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Validar Autenticidade</span>
            </button>
          )}

          <button
            id="btn-download-individual-pdf"
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xs transition active:scale-95 disabled:opacity-50"
            title="Baixar PDF deste aluno"
          >
            <Download className="w-3.5 h-3.5" />
            {isDownloading ? 'Gerando...' : 'Baixar PDF'}
          </button>

          <button
            id="btn-print-preview"
            onClick={handlePrint}
            className="hidden sm:flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xs transition active:scale-95"
            title="Imprimir certificado deste aluno"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimir Este
          </button>

          {allParticipants.length > 1 && onOpenBatchModal && (
            <button
              id="btn-preview-batch-print"
              onClick={onOpenBatchModal}
              className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xs transition active:scale-95"
              title="Imprimir todos os certificados da turma de uma só vez"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>Imprimir Todos ({allParticipants.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* A4 Landscape Document Preview Container (Professional Polish Stage) */}
      <div className="w-full overflow-x-auto bg-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center border border-slate-300 shadow-inner min-h-[560px] relative">
        {/* Floating live status header bar */}
        <div className="w-full max-w-4xl flex items-center justify-between mb-4 px-2 z-20">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full border border-slate-300 text-[10px] font-bold text-slate-700 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            PRÉVIA DINÂMICA EM TEMPO REAL
          </div>
          <div className="text-[11px] font-medium text-slate-600 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full border border-slate-300">
            Mostrando: Participante #{currentIndex + 1} de {allParticipants.length}
          </div>
        </div>

        <div
          id="certificate-print-area"
          style={{
            transform: `scale(${zoomScale})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out',
            width: '980px',
            minWidth: '980px',
            height: '690px',
            minHeight: '690px',
          }}
          className="relative bg-white text-slate-900 shadow-2xl rounded-sm p-10 flex flex-col justify-between select-none border-2 border-slate-900 overflow-hidden"
        >
          {/* Background Watermark Image (Praça dos Cristais / Concha Acústica QGEx com Bandeira Nacional) */}
          {config.incluirMarcaDagua !== false && (
            <div className="absolute inset-2 pointer-events-none select-none z-0 overflow-hidden">
              <img
                src={config.imagemFundoUrl || '/fundo-certificado.jpg'}
                alt="Fundo Oficial Certificado"
                className="w-full h-full object-cover opacity-90"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          {/* Ornate Baroque Corners */}
          <div className="absolute top-2 left-2 pointer-events-none z-1">
            <BaroqueCorner className="w-16 h-16" />
          </div>
          <div className="absolute top-2 right-2 pointer-events-none rotate-90 z-1">
            <BaroqueCorner className="w-16 h-16" />
          </div>
          <div className="absolute bottom-2 left-2 pointer-events-none -rotate-90 z-1">
            <BaroqueCorner className="w-16 h-16" />
          </div>
          <div className="absolute bottom-2 right-2 pointer-events-none rotate-180 z-1">
            <BaroqueCorner className="w-16 h-16" />
          </div>

          {/* Inner Double Thin Border */}
          <div className="absolute inset-4 border border-slate-800 pointer-events-none z-1"></div>
          <div className="absolute inset-5 border border-slate-400/60 pointer-events-none z-1"></div>

          {viewSide === 'front' ? (
            /* FRONT OF CERTIFICATE */
            <div className="relative z-10 flex flex-col justify-between h-full px-6 py-2">
              {/* Header Section */}
              <div className="flex items-start justify-between">
                {/* SGEx Crest */}
                <div className="flex flex-col items-center">
                  <SGExLogo className="w-20 h-24 drop-shadow-xs" />
                </div>

                {/* Main Title & Flourish */}
                <div className="flex flex-col items-center text-center -mt-1 flex-1 px-4">
                  <h1
                    style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                    className="text-4xl sm:text-5xl font-black tracking-wider text-amber-600 drop-shadow-xs uppercase"
                  >
                    CERTIFICADO
                  </h1>
                  <p className="text-base font-bold text-slate-800 tracking-wide mt-1">
                    {config.subtituloCurso}
                  </p>
                  <div className="mt-1 flex items-center justify-center">
                    <CertificateFlourish className="w-64 h-5 text-slate-700" />
                  </div>
                </div>

                {/* B ADM QGEX Crest & Turma / Certificate ID */}
                <div className="flex flex-col items-center">
                  <BAdmQgexLogo className="w-20 h-24 drop-shadow-xs" />
                  <div className="mt-1 text-center font-bold text-sm text-slate-900 tracking-wider">
                    {showVariableHighlights ? (
                      <span className="text-red-700 border-b-2 border-red-600 font-extrabold px-1" title="Número da Turma (idêntico para todos os alunos)">
                        {config.numeroTurma || participant.numeroCertificado || `001/${config.siglaCurso}/${config.ano}`}
                      </span>
                    ) : (
                      <span>{config.numeroTurma || participant.numeroCertificado || `001/${config.siglaCurso}/${config.ano}`}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Main Body Paragraph */}
              <div className="my-auto px-4 py-2">
                <p
                  style={{ fontFamily: 'Georgia, "Times New Roman", serif', lineHeight: '1.85' }}
                  className="text-justify text-[16.5px] text-slate-900"
                >
                  <span>{config.instituicao} ({config.instrucaoDetran}) certifica que </span>
                  
                  {/* Nome */}
                  <span className={`font-black ${showVariableHighlights ? 'text-red-700 underline decoration-red-500 decoration-2 font-black' : 'text-slate-950'}`}>
                    {participant.nome}
                  </span>
                  
                  <span>, inscrito no CPF nº </span>
                  
                  {/* CPF */}
                  <span className={`font-black ${showVariableHighlights ? 'text-red-700 underline decoration-red-500 decoration-2 font-black' : 'text-slate-950'}`}>
                    {participant.cpf}
                  </span>
                  
                  <span> e no Nº REGISTRO </span>
                  
                  {/* Registro */}
                  <span className={`font-black ${showVariableHighlights ? 'text-red-700 underline decoration-red-500 decoration-2 font-black' : 'text-slate-950'}`}>
                    {participant.registro}
                  </span>
                  
                  <span>, categoria </span>
                  
                  {/* Categoria */}
                  <span className={`font-black ${showVariableHighlights ? 'text-red-700 underline decoration-red-500 decoration-2 font-black' : 'text-slate-950'}`}>
                    “{participant.categoria}”
                  </span>
                  
                  <span>, concluiu com aproveitamento o </span>
                  <span className="font-black text-slate-950">{config.nomeCurso}</span>
                  <span>, ministrado pela IET - Forte Caxias, no período de </span>
                  
                  {/* Periodo */}
                  <span className={`font-black ${showVariableHighlights ? 'text-red-700 underline decoration-red-500 decoration-2 font-black' : 'text-slate-950'}`}>
                    {periodo}
                  </span>
                  
                  <span>, com carga horária de </span>
                  
                  {/* Carga Horaria */}
                  <span className={`font-black ${showVariableHighlights ? 'text-red-700 underline decoration-red-500 decoration-2 font-black' : 'text-slate-950'}`}>
                    {cargaHoraria}
                  </span>
                  
                  <span>, com validade de </span>
                  <span className="font-black text-slate-950">{config.validadeAnos}</span>
                  <span> após o término do curso, conforme </span>
                  <span className="font-black text-slate-950">{config.resolucaoContran}</span>
                  <span>.</span>
                </p>

                {/* Issue Date */}
                <div className="text-center mt-6">
                  <span className="font-black text-[15.5px] text-slate-950">
                    {showVariableHighlights ? (
                      <span className="text-red-700 underline decoration-red-500 decoration-2 font-black">
                        {dataEmissao}
                      </span>
                    ) : (
                      dataEmissao
                    )}
                  </span>
                </div>
              </div>

              {/* Signatures & Footer Section (Clean official layout without QR Code) */}
              <div className="pt-2 px-2 border-t border-transparent flex flex-col gap-3">
                {/* Dynamic Signatures Row */}
                {(() => {
                  const activeSignatures = (config.assinaturas && config.assinaturas.length > 0)
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

                  if (activeSignatures.length === 0) {
                    return (
                      <div className="flex items-end justify-between">
                        <div className="w-56 border-t-2 border-slate-900 pt-1 text-center">
                          <p className="text-xs font-black text-slate-950 uppercase">Assinatura da Autoridade</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] font-black text-slate-950 tracking-wider">
                            {config.cnpj}
                          </p>
                          <p className="text-[10px] font-black text-slate-800 tracking-tight uppercase">
                            {config.nomeUnidade}
                          </p>
                        </div>
                      </div>
                    );
                  }

                  if (activeSignatures.length === 1) {
                    const sig = activeSignatures[0];
                    return (
                      <div className="flex items-end justify-between">
                        <div className="flex flex-col items-center text-center">
                          <div className="h-10 flex items-end justify-center">
                            {sig.tipoAssinatura === 'imagem' && sig.imagemUrl ? (
                              <img
                                src={sig.imagemUrl}
                                alt={sig.nome || 'Assinatura'}
                                className="h-10 max-w-[160px] object-contain -mb-1 select-none pointer-events-none"
                              />
                            ) : (
                              config.incluirAssinaturaImagem && (
                                <DirectorSignature className="w-36 h-12 -mb-2" />
                              )
                            )}
                          </div>
                          <div className="w-64 border-t-2 border-slate-900 pt-1">
                            {sig.nome && (
                              <p className="text-xs font-black text-slate-950 leading-tight uppercase">
                                {sig.nome}
                              </p>
                            )}
                            {sig.cargo && (
                              <p className="text-[11px] font-bold text-slate-800 leading-tight mt-0.5">
                                {sig.cargo}
                              </p>
                            )}
                            {sig.cpf && (
                              <p className="text-[10px] font-bold text-slate-700 font-mono mt-0.5">
                                CPF: {sig.cpf}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* CNPJ & Military Unit Footer */}
                        <div className="text-right">
                          <p className="text-[11px] font-black text-slate-950 tracking-wider">
                            {config.cnpj}
                          </p>
                          <p className="text-[10px] font-black text-slate-800 tracking-tight uppercase">
                            {config.nomeUnidade}
                          </p>
                        </div>
                      </div>
                    );
                  }

                  // 2, 3 or more signatures
                  return (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-start justify-around gap-4 w-full">
                        {activeSignatures.map((sig, idx) => (
                          <div key={sig.id || `sig-${idx}`} className="flex-1 max-w-[220px] flex flex-col items-center text-center">
                            <div className="h-10 flex items-end justify-center">
                              {sig.tipoAssinatura === 'imagem' && sig.imagemUrl ? (
                                <img
                                  src={sig.imagemUrl}
                                  alt={sig.nome || 'Assinatura'}
                                  className="h-9 max-w-[130px] object-contain -mb-1 select-none pointer-events-none"
                                />
                              ) : (
                                idx === 0 && config.incluirAssinaturaImagem && (
                                  <DirectorSignature className="w-32 h-10 -mb-2" />
                                )
                              )}
                            </div>
                            <div className="w-full border-t-2 border-slate-900 pt-1">
                              {sig.nome && (
                                <p className="text-[11px] font-black text-slate-950 leading-tight uppercase">
                                  {sig.nome}
                                </p>
                              )}
                              {sig.cargo && (
                                <p className="text-[10px] font-bold text-slate-800 leading-tight mt-0.5">
                                  {sig.cargo}
                                </p>
                              )}
                              {sig.cpf && (
                                <p className="text-[9.5px] font-bold text-slate-700 font-mono mt-0.5">
                                  {sig.cpf}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="text-right border-t border-slate-300 pt-1">
                        <p className="text-[11px] font-black text-slate-950 tracking-wider">
                          {config.cnpj}
                        </p>
                        <p className="text-[10px] font-black text-slate-800 uppercase">
                          {config.nomeUnidade}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          ) : (
            /* BACK OF CERTIFICATE (CONTEÚDO PROGRAMÁTICO & NOTAS / MENÇÕES) */
            <div className="relative z-10 flex flex-col justify-between h-full px-6 py-2">
              {/* Back Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <SGExLogo className="w-16 h-20" />
                
                <div className="text-center flex-1 px-4">
                  <h2 className="text-base font-black tracking-wide text-slate-900 uppercase">
                    BASE ADMINISTRATIVA DO QUARTEL-GENERAL DO EXÉRCITO
                  </h2>
                  <h3 className="text-sm font-bold text-slate-800 tracking-wider">
                    “FORTE CAXIAS”
                  </h3>
                  <div className="mt-1 inline-block bg-white px-4 py-0.5 rounded-full border border-slate-300">
                    <span className="text-xs font-black text-slate-900 tracking-widest uppercase">
                      CONTEÚDO PROGRAMÁTICO
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <BAdmQgexLogo className="w-16 h-20" />
                  <span className="text-xs font-black text-slate-950 mt-1">
                    {numTurma}
                  </span>
                </div>
              </div>

                  {/* Concluinte Identification Bar (Bold variable data) */}
                  <div className="bg-slate-100/90 border border-slate-300 rounded px-3 py-1.5 flex flex-wrap items-center justify-between text-xs my-1 text-slate-900 shadow-2xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-600 font-bold uppercase text-[11px]">CONCLUENTE:</span>
                      <span className="font-black text-slate-950 uppercase">{participant.nome}</span>
                    </div>
                    <div className="flex items-center gap-4 text-[11px]">
                      <div>
                        <span className="text-slate-600 font-bold">CPF: </span>
                        <span className="font-black text-slate-950">{participant.cpf}</span>
                      </div>
                      <div>
                        <span className="text-slate-600 font-bold">REG. CNH: </span>
                        <span className="font-black text-slate-950">{participant.registro}</span>
                      </div>
                      <div>
                        <span className="text-slate-600 font-bold">TURMA: </span>
                        <span className="font-black text-slate-950">{numTurma}</span>
                      </div>
                    </div>
                  </div>

              {/* Student Grades Panel: LT / DD / PSAI / CCS */}
              <div className="grid grid-cols-4 gap-2 my-1">
                <div className="bg-white/95 border-2 border-slate-900 rounded p-1.5 text-center shadow-2xs">
                  <div className="text-[10px] font-black text-slate-800 uppercase tracking-tight">
                    LEGISLAÇÃO (LT)
                  </div>
                  <div className="text-base font-black text-slate-950 mt-0.5">
                    {participant.notaLegislacao || '10'}
                  </div>
                </div>
                <div className="bg-white/95 border-2 border-slate-900 rounded p-1.5 text-center shadow-2xs">
                  <div className="text-[10px] font-black text-slate-800 uppercase tracking-tight">
                    DIREÇÃO DEFENSIVA (DD)
                  </div>
                  <div className="text-base font-black text-slate-950 mt-0.5">
                    {participant.notaDirecao || '10'}
                  </div>
                </div>
                <div className="bg-white/95 border-2 border-slate-900 rounded p-1.5 text-center shadow-2xs">
                  <div className="text-[10px] font-black text-slate-800 uppercase tracking-tight">
                    1º SOCORROS (PSAI)
                  </div>
                  <div className="text-base font-black text-slate-950 mt-0.5">
                    {participant.notaSocorros || '10'}
                  </div>
                </div>
                <div className="bg-white/95 border-2 border-slate-900 rounded p-1.5 text-center shadow-2xs">
                  <div className="text-[10px] font-black text-slate-800 uppercase tracking-tight">
                    CONVÍVIO SOCIAL (CCS)
                  </div>
                  <div className="text-base font-black text-slate-950 mt-0.5">
                    {participant.notaConvivio || '10'}
                  </div>
                </div>
              </div>

              {/* Table of Programmatic Content with Grades */}
              <div className="my-auto">
                <table className={`w-full border-collapse border-2 border-slate-900 text-center ${config.incluirMarcaDagua !== false ? 'bg-white/80' : 'bg-white'}`}>
                  <thead>
                    <tr className={`${config.incluirMarcaDagua !== false ? 'bg-white/85' : 'bg-white'} border-b-2 border-slate-900`}>
                      <th className="py-2 px-4 text-xs font-black text-slate-950 border-r border-slate-900 uppercase tracking-wider w-[32%]">
                        DISCIPLINA
                      </th>
                      <th className="py-2 px-3 text-xs font-black text-slate-950 border-r border-slate-900 uppercase tracking-wider w-[16%]">
                        CARGA HORÁRIA
                      </th>
                      <th className="py-2 px-3 text-xs font-black text-slate-950 border-r border-slate-900 uppercase tracking-wider w-[16%] bg-amber-50/50">
                        NOTA / MENÇÃO
                      </th>
                      <th className="py-2 px-4 text-xs font-black text-slate-950 uppercase tracking-wider w-[36%]">
                        INSTRUTOR
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {config.disciplinas.map((disc, idx) => {
                      const studentGrades = [
                        participant.notaLegislacao,
                        participant.notaDirecao,
                        participant.notaSocorros,
                        participant.notaConvivio,
                      ];
                      const grade = studentGrades[idx] || disc.avaliacaoPadrao || '10';

                      return (
                        <tr
                          key={disc.id}
                          className={`border-b border-slate-800 ${config.incluirMarcaDagua !== false ? 'bg-white/75' : 'bg-white'}`}
                        >
                          <td className="py-2.5 px-4 text-xs font-black text-slate-950 border-r border-slate-800 text-left">
                            {disc.nome}
                          </td>
                          <td className="py-2.5 px-3 text-xs font-black text-slate-950 border-r border-slate-800">
                            {disc.cargaHoraria}
                          </td>
                          <td className="py-2.5 px-3 text-xs font-black text-slate-950 border-r border-slate-800 bg-amber-50/30">
                            {showVariableHighlights ? (
                              <span className="text-red-700 underline font-black text-sm">{grade}</span>
                            ) : (
                              <span className="text-sm font-black text-slate-950">{grade}</span>
                            )}
                          </td>
                          <td className="py-2.5 px-4 text-xs font-bold text-slate-900 text-left">
                            {disc.instrutor}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Back Footer (Clean official institutional layout without QR Code) */}
              <div className="text-center border-t border-slate-300 pt-2 flex flex-wrap items-center justify-between gap-2">
                <p className="text-[10.5px] font-bold text-slate-700">
                  Documento autêntico expedido pela Base Administrativa do QGEx / Forte Caxias nos termos da legislação de trânsito em vigor.
                </p>
                {config.incluirCodigoVerificacao !== false && (
                  <span className="text-[10px] font-mono font-black text-slate-800">
                    Chave de Registro: {verificationCode}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
