import React, { useState, useEffect, useRef } from 'react';
import { Participant, CourseConfig, GenerationBenchmark } from '../types';
import { generateMergedBatchPdf, generateAndDownloadZip } from '../services/pdfGenerator';
import confetti from 'canvas-confetti';
import { 
  Zap, 
  Timer, 
  CheckCircle2, 
  Download, 
  FileArchive, 
  FileText, 
  Sparkles, 
  X, 
  AlertTriangle, 
  Play,
  RotateCcw,
  Trophy,
  Gauge
} from 'lucide-react';

interface BatchGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
  config: CourseConfig;
}

export const BatchGeneratorModal: React.FC<BatchGeneratorModalProps> = ({
  isOpen,
  onClose,
  participants,
  config,
}) => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [currentStatusText, setCurrentStatusText] = useState<string>('Pronto para iniciar');
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [benchmark, setBenchmark] = useState<GenerationBenchmark | null>(null);
  const [mode, setMode] = useState<'zip' | 'merged'>('zip');
  
  const timerRef = useRef<number | null>(null);
  const startTimestampRef = useRef<number>(0);

  useEffect(() => {
    if (!isOpen) {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsRunning(false);
      setProgress(0);
      setElapsedMs(0);
      setBenchmark(null);
    }
  }, [isOpen]);

  const runBatchGeneration = async (generationMode: 'zip' | 'merged') => {
    setMode(generationMode);
    setIsRunning(true);
    setProgress(0);
    setElapsedMs(0);
    setBenchmark(null);
    setCurrentStatusText('Iniciando processamento em lote...');

    startTimestampRef.current = performance.now();

    // Start UI millisecond stopwatch
    timerRef.current = window.setInterval(() => {
      const now = performance.now();
      setElapsedMs(Math.round(now - startTimestampRef.current));
    }, 25);

    try {
      if (generationMode === 'zip') {
        const result = await generateAndDownloadZip(
          participants,
          config,
          (current, total, msg) => {
            setProgress(Math.round((current / total) * 100));
            setCurrentStatusText(msg);
          }
        );
        if (timerRef.current) clearInterval(timerRef.current);
        setBenchmark(result);
        setElapsedMs(result.timeMs);
      } else {
        const { doc, benchmark: result } = await generateMergedBatchPdf(
          participants,
          config,
          (current, total) => {
            setProgress(Math.round((current / total) * 100));
            setCurrentStatusText(`Gerando página ${current} de ${total}...`);
          }
        );
        if (timerRef.current) clearInterval(timerRef.current);
        doc.save(`Certificados_Consolidados_${config.siglaCurso}_${config.ano}_(${participants.length}_alunos).pdf`);
        setBenchmark(result);
        setElapsedMs(result.timeMs);
      }

      // Success Confetti
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
      setCurrentStatusText('Geração concluída com sucesso!');
    } catch (error) {
      console.error(error);
      if (timerRef.current) clearInterval(timerRef.current);
      setCurrentStatusText('Ocorreu um erro durante a geração.');
    } finally {
      setIsRunning(false);
    }
  };

  if (!isOpen) return null;

  // Format Elapsed Time (e.g. 01.42s)
  const formattedTime = (elapsedMs / 1000).toFixed(2);
  const isGoalMet = benchmark ? benchmark.timeSeconds < 60 : elapsedMs < 60000;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fade-in">
      <div 
        id="batch-generator-modal"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden flex flex-col"
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Emissão em Massa com Cronômetro
              </h3>
              <p className="text-xs text-slate-300">
                Requisito Não Funcional: Gerar {participants.length} certificados em &lt; 1 minuto
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isRunning}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition disabled:opacity-30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col gap-6">
          {participants.length === 0 ? (
            <div className="text-center py-6 flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                Nenhum participante na lista de emissão
              </h4>
              <p className="text-xs text-slate-500 max-w-sm">
                Importe uma planilha CSV na aba "Alunos & Planilha CSV" para processar a geração de certificados em lote.
              </p>
              <button
                onClick={onClose}
                className="mt-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition"
              >
                Voltar e Importar Alunos
              </button>
            </div>
          ) : (
            <>
              {/* Real-time Chronometer / Benchmark Display */}
              <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden">
                {/* Subtle glowing background */}
                <div className="absolute inset-0 bg-radial from-blue-900/30 to-transparent pointer-events-none"></div>

                <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <Timer className="w-4 h-4 animate-pulse" />
                  Cronômetro de Validação de Desempenho
                </div>

                {/* Big Timer */}
                <div className="font-mono text-5xl sm:text-6xl font-black tracking-tight text-white my-1">
                  {formattedTime}
                  <span className="text-2xl text-blue-400 font-sans ml-1">s</span>
                </div>

                {/* Goal badge */}
                <div className="mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-950 text-blue-300 border border-blue-800">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  Meta: Emissão em &lt; 60 segundos
                </div>

                {/* Live Progress Bar */}
                <div className="w-full mt-5">
                  <div className="flex justify-between text-xs text-slate-400 font-medium mb-1.5">
                    <span>{currentStatusText}</span>
                    <span className="font-mono text-blue-400 font-bold">{progress}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full transition-all duration-150"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Benchmark Results Card on Complete */}
              {benchmark && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Validação Aprovada com Excelência!</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white p-2.5 rounded-lg border border-emerald-100 shadow-2xs">
                      <span className="text-[11px] text-slate-500 block">Tempo Total</span>
                      <span className="text-base font-bold text-emerald-700 font-mono">
                        {benchmark.timeSeconds}s
                      </span>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-emerald-100 shadow-2xs">
                      <span className="text-[11px] text-slate-500 block">Média / Cert</span>
                      <span className="text-base font-bold text-slate-800 font-mono">
                        {benchmark.averagePerCertMs}ms
                      </span>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-emerald-100 shadow-2xs">
                      <span className="text-[11px] text-slate-500 block">Velocidade</span>
                      <span className="text-base font-bold text-emerald-600 font-mono">
                        {benchmark.certsPerSecond} cert/s
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-emerald-700 text-center font-medium">
                    ⚡ O sistema gerou {benchmark.totalCount} certificados em alta velocidade!
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  id="btn-run-batch-zip"
                  onClick={() => runBatchGeneration('zip')}
                  disabled={isRunning}
                  className="flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 active:scale-98 text-white font-bold py-3.5 px-4 rounded-xl shadow-md shadow-blue-200/50 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <FileArchive className="w-4 h-4" />
                  {isRunning && mode === 'zip' ? 'Gerando ZIP...' : `Baixar em ZIP (${participants.length} PDFs)`}
                </button>

                <button
                  id="btn-run-batch-merged"
                  onClick={() => runBatchGeneration('merged')}
                  disabled={isRunning}
                  className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 active:scale-98 text-white font-bold py-3.5 px-4 rounded-xl shadow-xs transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <FileText className="w-4 h-4" />
                  {isRunning && mode === 'merged' ? 'Gerando PDF...' : `PDF Único (${participants.length} Alunos)`}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>{participants.length} registros prontos para emissão</span>
          <button
            onClick={onClose}
            className="font-semibold text-slate-700 hover:text-slate-900"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
