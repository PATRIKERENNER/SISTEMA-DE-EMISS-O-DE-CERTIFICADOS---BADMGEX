import React, { useState, useRef } from 'react';
import { Participant } from '../types';
import {
  parseSpreadsheetFile,
  downloadExcelTemplate,
  downloadCsvTemplate,
} from '../services/spreadsheetService';
import { FileSpreadsheet, Download, CheckCircle, AlertCircle, FileCheck, FileCode } from 'lucide-react';

interface CsvUploaderProps {
  onLoadParticipants: (participants: Participant[]) => void;
  currentCount: number;
  onChooseSingle?: () => void;
  onChooseBatch?: () => void;
}

export const CsvUploader: React.FC<CsvUploaderProps> = ({
  onLoadParticipants,
  currentCount,
  onChooseSingle,
  onChooseBatch,
}) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const processFile = async (file: File) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const parsedParticipants = await parseSpreadsheetFile(file);

      if (!parsedParticipants || parsedParticipants.length === 0) {
        setErrorMessage('Nenhum dado válido de participante foi encontrado no arquivo.');
        setIsLoading(false);
        return;
      }

      onLoadParticipants(parsedParticipants);
      const fileExt = file.name.toLowerCase().endsWith('.xlsx')
        ? 'Excel (.xlsx)'
        : file.name.toLowerCase().endsWith('.xls')
        ? 'Excel (.xls)'
        : 'CSV';

      setSuccessMessage(
        `${parsedParticipants.length} participantes importados com sucesso a partir do arquivo ${fileExt}!`
      );
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setErrorMessage(`Erro ao processar o arquivo: ${err.message || 'Formato inválido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Drag & Drop Area */}
      <div
        id="spreadsheet-dropzone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 ${
          isDragging
            ? 'border-emerald-500 bg-emerald-50 scale-[1.01]'
            : 'border-blue-200/80 hover:border-emerald-500 bg-blue-50/30 hover:bg-emerald-50/40'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
          className="hidden"
        />

        <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
          <FileSpreadsheet className="w-7 h-7" />
        </div>

        <div>
          <p className="text-sm font-bold text-slate-800">
            {isLoading ? 'Processando planilha...' : 'Arraste sua planilha Excel (.xlsx) ou CSV'}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Clique para selecionar do computador ou solte o arquivo Excel (.xlsx / .xls) ou CSV aqui
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-md border border-emerald-200">
            <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
            Suporta Excel (.xlsx / .xls)
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-md border border-blue-200">
            <FileCode className="w-3.5 h-3.5 text-blue-600" />
            Suporta CSV (.csv)
          </span>
          <span className="text-[11px] font-medium bg-white px-2.5 py-1 rounded-md border border-slate-200 text-slate-600">
            Colunas: Nome, CPF, Registro, Categoria, Notas...
          </span>
        </div>
      </div>

      {/* Helper Quick Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-download-sample-excel"
            onClick={downloadExcelTemplate}
            className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition"
            title="Baixar modelo formatado em Excel (.xlsx)"
          >
            <Download className="w-3.5 h-3.5" />
            Baixar Modelo Excel (.xlsx)
          </button>

          <button
            id="btn-download-sample-csv"
            onClick={downloadCsvTemplate}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 active:scale-98 text-slate-700 border border-slate-200 text-xs font-semibold px-3.5 py-2 rounded-xl shadow-2xs transition"
            title="Baixar modelo em formato CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Baixar Modelo (.csv)
          </button>
        </div>

        <div className="text-xs font-medium text-slate-600">
          Total carregado: <strong className="text-slate-900 font-bold">{currentCount}</strong> participantes
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium p-3 rounded-xl animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {/* Quick Action Bar when data is loaded */}
      {currentCount > 0 && onChooseBatch && onChooseSingle && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800">
              Pronto para emissão!
            </span>
            <span className="text-xs text-slate-600">
              Escolha a opção de impressão:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-quick-single-preview"
              onClick={onChooseSingle}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-100 active:scale-98 text-slate-800 border border-slate-300 text-xs font-bold px-3.5 py-1.5 rounded-lg shadow-2xs transition"
            >
              <span>📄 Imprimir 1 por Vez (Prévia)</span>
            </button>

            <button
              id="btn-quick-batch-print"
              onClick={onChooseBatch}
              className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 active:scale-98 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg shadow-sm shadow-blue-200 transition"
            >
              <span>🖨️ Imprimir TODOS de Uma Vez ({currentCount})</span>
            </button>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 text-xs font-medium p-3 rounded-xl animate-fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
