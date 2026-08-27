import React from 'react';
import { X, CheckCircle, FileSpreadsheet, Zap, Printer, Shield, ArrowRight, Lightbulb } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Lightbulb className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Guia Rápido de Utilização (Sem Complicação)
              </h3>
              <p className="text-xs text-slate-300">
                Como emitir seus certificados em segundos sem precisar de conhecimentos de TI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-5 text-slate-700 text-sm">
          {/* Step 1 */}
          <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="w-7 h-7 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
              1
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                Carregar os Alunos (Via Planilha CSV ou Cadastro Manual)
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                Basta arrastar sua planilha Excel/CSV contendo as colunas <em>Nome, CPF, Registro, Categoria</em> para a área de importação, ou baixar o modelo pronto clicando em <strong className="text-blue-700">"Baixar Modelo CSV"</strong>.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="w-7 h-7 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
              2
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                Visualização Fiel e Detecção de Variáveis
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                Veja na tela exatamente como o certificado ficará impresso. Ative o botão <strong className="text-red-700">"Destacar Variáveis"</strong> para conferir os campos substituídos (sublinhados em vermelho, exatamente como no modelo da mala direta).
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="w-7 h-7 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
              3
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                Emissão em Massa Instantânea com Cronômetro
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                Clique no botão <strong className="text-blue-700">"Gerar Certificados"</strong>. O sistema processa todos os alunos em lote instantaneamente (certificados gerados em aproximadamente 1 a 2.5 segundos, muito abaixo do limite de 1 minuto).
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="w-7 h-7 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
              4
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                Opções de Download e Impressão
              </h4>
              <ul className="text-xs text-slate-600 mt-1 space-y-1 list-disc pl-4">
                <li><strong>ZIP de PDFs:</strong> Cada aluno recebe seu arquivo PDF separado nomeado com número e nome.</li>
                <li><strong>PDF Consolidado:</strong> Um único documento com todas as páginas frente e verso sequenciais.</li>
                <li><strong>Impressão Direta:</strong> Pronto para imprimir na gráfica ou na impressora do QGEx em formato A4 Paisagem.</li>
              </ul>
            </div>
          </div>

          {/* Comparison with traditional mail merge */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h5 className="font-bold text-blue-900 text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-blue-700" /> Vantagens sobre a Mala Direta Tradicional (Word/Office):
            </h5>
            <p className="text-xs text-blue-950 leading-relaxed">
              Não desconfigura margens, preserva fontes e logomarcas oficiais vetoriais em alta resolução, não exige instalação de pacotes de escritório e gera dezenas de certificados em poucos cliques direto no navegador.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Base Administrativa do Quartel-General do Exército – Forte Caxias</span>
          <button
            onClick={onClose}
            className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-4 py-2 rounded-xl transition shadow-xs"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
