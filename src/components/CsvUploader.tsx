import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Participant } from '../types';
import { INITIAL_PARTICIPANTS, CSV_SAMPLE_TEXT } from '../data/sampleData';
import { Upload, FileSpreadsheet, Download, RefreshCw, CheckCircle, AlertCircle, FileUp, Sparkles } from 'lucide-react';
import { saveAs } from 'file-saver';

interface CsvUploaderProps {
  onLoadParticipants: (participants: Participant[]) => void;
  currentCount: number;
}

export const CsvUploader: React.FC<CsvUploaderProps> = ({
  onLoadParticipants,
  currentCount,
}) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const downloadSampleCsv = () => {
    const blob = new Blob([CSV_SAMPLE_TEXT], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'modelo_importacao_certificados_15_alunos.csv');
  };

  const loadDefault15 = () => {
    onLoadParticipants(INITIAL_PARTICIPANTS);
    setSuccessMessage('15 alunos modelo do Exército Brasileiro carregados com sucesso!');
    setErrorMessage(null);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const processCsvFile = (file: File) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          setErrorMessage('O arquivo CSV selecionado está vazio.');
          return;
        }

        const parsedParticipants: Participant[] = [];

        results.data.forEach((row: any, index: number) => {
          // Flexible mapping across common column names
          const nome = row.nome || row.aluno || row.participante || row['nome completo'] || `Participante ${index + 1}`;
          const cpf = row.cpf || row['cpf nº'] || row.documento || '000.000.000-00';
          const registro = row.registro || row.cnh || row.matricula || row['nº registro'] || row['no registro'] || `0000000000${index + 1}`;
          const categoria = row.categoria || row.cat || row['categoria cnh'] || 'AD';
          const numero = row.numero || row.cert || row['numero certificado'] || row['num_cert'] || `${String(index + 1).padStart(3, '0')}/CVTE/2026`;
          const periodo = row.periodo || row.datas || undefined;
          const cargaHoraria = row.cargahoraria || row['carga horaria'] || row['ch'] || undefined;
          const dataEmissao = row.dataemissao || row['data de emissao'] || row['data'] || undefined;

          // Notes
          const notaLegislacao = row.notalegislacao || row.legislacao || row['nota legislacao'] || undefined;
          const notaDirecao = row.notadirecao || row.direcao || row['nota direcao'] || undefined;
          const notaSocorros = row.notasocorros || row.socorros || row['nota socorros'] || undefined;
          const notaConvivio = row.notaconvivio || row.convivio || row['nota convivio'] || undefined;

          parsedParticipants.push({
            id: `imported-${Date.now()}-${index}`,
            numeroCertificado: numero,
            nome: String(nome).toUpperCase(),
            cpf: String(cpf),
            registro: String(registro),
            categoria: String(categoria).toUpperCase(),
            periodo,
            cargaHoraria,
            dataEmissao,
            notaLegislacao,
            notaDirecao,
            notaSocorros,
            notaConvivio,
          });
        });

        if (parsedParticipants.length > 0) {
          onLoadParticipants(parsedParticipants);
          setSuccessMessage(`${parsedParticipants.length} participantes importados com sucesso do CSV!`);
          setTimeout(() => setSuccessMessage(null), 4000);
        } else {
          setErrorMessage('Não foi possível identificar as colunas no formato esperado.');
        }
      },
      error: (error) => {
        setErrorMessage(`Erro ao processar CSV: ${error.message}`);
      },
    });
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
      processCsvFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processCsvFile(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Drag & Drop Area */}
      <div
        id="csv-dropzone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 ${
          isDragging
            ? 'border-blue-500 bg-blue-100/60 scale-[1.01]'
            : 'border-blue-200/80 hover:border-blue-400 bg-blue-50/30 hover:bg-blue-50/60'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept=".csv,text/csv,application/vnd.ms-excel"
          className="hidden"
        />

        <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-xs">
          <FileSpreadsheet className="w-6 h-6" />
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-800">
            Arraste sua planilha CSV ou clique para selecionar
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Mala direta automatizada de alta performance (Excel, Google Planilhas, LibreOffice)
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
          <span className="text-[11px] font-medium bg-white px-2.5 py-1 rounded-md border border-slate-200 text-slate-600">
            Colunas: Nome, CPF, Registro, Categoria
          </span>
          <span className="text-[11px] font-semibold text-blue-700 bg-blue-100/70 px-2.5 py-1 rounded-md">
            Mala Direta Instantânea
          </span>
        </div>
      </div>

      {/* Helper Quick Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-2">
          <button
            id="btn-load-sample-15"
            onClick={loadDefault15}
            className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 active:scale-98 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition"
            title="Carrega os 15 alunos de exemplo para teste rápido do requisito de 1 minuto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Carregar 15 Alunos Modelo
          </button>

          <button
            id="btn-download-sample-csv"
            onClick={downloadSampleCsv}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 active:scale-98 text-slate-700 border border-slate-200 text-xs font-semibold px-3.5 py-2 rounded-xl shadow-2xs transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Baixar Modelo CSV
          </button>
        </div>

        <div className="text-xs font-medium text-slate-600">
          Total atual: <strong className="text-slate-900 font-bold">{currentCount}</strong> participantes
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium p-3 rounded-xl animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
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
