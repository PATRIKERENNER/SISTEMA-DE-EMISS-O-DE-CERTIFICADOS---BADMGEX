import React from 'react';
import { CoursePreset, CourseTypeId } from '../types';
import { OFFICIAL_COURSE_PRESETS } from '../data/coursesPresets';
import { 
  Flame, 
  Truck, 
  Siren, 
  GraduationCap, 
  Bus, 
  FileSpreadsheet, 
  Download, 
  Check, 
  Users,
  Sparkles
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface CourseSelectorProps {
  activeCourseId: CourseTypeId;
  onSelectCourse: (preset: CoursePreset) => void;
  participantCountByCourse: Record<string, number>;
  onImportForCourse?: (courseId: CourseTypeId) => void;
}

export const CourseSelector: React.FC<CourseSelectorProps> = ({
  activeCourseId,
  onSelectCourse,
  participantCountByCourse,
}) => {
  const getCourseIcon = (id: CourseTypeId) => {
    switch (id) {
      case 'mopp':
        return <Flame className="w-4 h-4 text-amber-600" />;
      case 'cargas_indivisiveis':
        return <Truck className="w-4 h-4 text-indigo-600" />;
      case 'cve':
        return <Siren className="w-4 h-4 text-red-600" />;
      case 'transporte_escolar':
        return <GraduationCap className="w-4 h-4 text-yellow-600" />;
      case 'transporte_coletivo':
        return <Bus className="w-4 h-4 text-emerald-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-blue-600" />;
    }
  };

  const handleDownloadSpecificTemplate = (preset: CoursePreset, e: React.MouseEvent) => {
    e.stopPropagation();

    const sampleRow = {
      Numero: `001/${preset.sigla}/2026`,
      Nome: 'NOME COMPLETO DO CONDUTOR',
      CPF: '000.000.000-00',
      Registro: '00000000000',
      Categoria: 'AD',
      Periodo: '08 a 16 de junho de 2026',
      CargaHoraria: preset.cargaHorariaPadrao,
      DataEmissao: 'Brasília-DF, 18 de junho de 2026',
      NotaLegislacao: '10',
      NotaDirecao: '10',
      NotaSocorros: '10',
      NotaConvivio: '10',
    };

    const worksheet = XLSX.utils.json_to_sheet([sampleRow]);
    worksheet['!cols'] = [
      { wch: 18 }, { wch: 38 }, { wch: 18 }, { wch: 16 }, { wch: 12 },
      { wch: 28 }, { wch: 14 }, { wch: 32 }, { wch: 16 }, { wch: 14 },
      { wch: 16 }, { wch: 16 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Alunos_${preset.sigla}`);
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, `modelo_planilha_${preset.sigla.toLowerCase()}_2026.xlsx`);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
              Cursos Especializados CONTRAN
            </span>
            <span className="text-xs text-slate-500">
              Selecione o curso para gerenciar planilhas separadas por turma
            </span>
          </div>
          <h3 className="text-sm font-bold text-slate-800 mt-1">
            Tipos de Curso Regulamentados (Res. 789/2020 & 1.020/2025)
          </h3>
        </div>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {OFFICIAL_COURSE_PRESETS.map((preset) => {
          const isSelected = activeCourseId === preset.id;
          const count = participantCountByCourse[preset.id] || 0;

          return (
            <div
              key={preset.id}
              onClick={() => onSelectCourse(preset)}
              className={`relative cursor-pointer rounded-xl p-3 border transition-all flex flex-col justify-between text-left ${
                isSelected
                  ? 'bg-blue-50/50 border-blue-600 shadow-sm ring-1 ring-blue-600'
                  : 'bg-slate-50/70 hover:bg-slate-100/80 border-slate-200 text-slate-700'
              }`}
            >
              {isSelected && (
                <span className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-0.5 shadow-2xs">
                  <Check className="w-3 h-3" />
                </span>
              )}

              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-2xs">
                    {getCourseIcon(preset.id)}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900 leading-tight">
                      {preset.nomeCurto}
                    </h4>
                    <span className="text-[10px] font-mono font-bold text-slate-500">
                      Sigla: {preset.sigla}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                  {preset.subtitulo}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-[10px]">
                <span className={`font-bold flex items-center gap-1 px-2 py-0.5 rounded-md ${
                  count > 0 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-slate-200/70 text-slate-600'
                }`}>
                  <Users className="w-3 h-3" />
                  {count} {count === 1 ? 'aluno' : 'alunos'}
                </span>

                <button
                  type="button"
                  onClick={(e) => handleDownloadSpecificTemplate(preset, e)}
                  title={`Baixar planilha modelo para ${preset.nomeCurto}`}
                  className="p-1 hover:bg-white text-slate-600 hover:text-blue-700 rounded transition border border-transparent hover:border-slate-200"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
