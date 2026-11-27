import React, { useState } from 'react';
import { Download, Copy, FileSpreadsheet, Info, UploadCloud, FileText, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { copyToClipboard } from '../utils/clipboard';
import { useTheme } from '../context/ThemeContext';

export default function UploadBaseTemplate({ onTriggerUpload, onFileSelected }) {
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';
  const [isDragging, setIsDragging] = useState(false);

  // Sample data format matching existing spreadsheet parser
  const sampleData = [
    {
      question: 'What is the capital of France?',
      opt1: 'London',
      opt2: 'Paris',
      opt3: 'Berlin',
      opt4: 'Madrid',
      correct: '2',
      time: '20'
    },
    {
      question: "Which element has chemical symbol 'O'?",
      opt1: 'Gold',
      opt2: 'Oxygen',
      opt3: 'Osmium',
      opt4: 'Hydrogen',
      correct: '2',
      time: '30'
    },
    {
      question: 'What is 15 multiplied by 4?',
      opt1: '45',
      opt2: '50',
      opt3: '60',
      opt4: '75',
      correct: '3',
      time: '15'
    }
  ];

  // Download real .xlsx template file
  const handleDownloadExcelTemplate = async () => {
    try {
      const XLSX = await import('xlsx');
      const templateRows = sampleData.map((row) => ({
        'Question Text': row.question,
        'Option 1': row.opt1,
        'Option 2': row.opt2,
        'Option 3': row.opt3,
        'Option 4': row.opt4,
        'Correct Option Index (1-4)': Number(row.correct),
        'Time Limit in Seconds': Number(row.time)
      }));

      const worksheet = XLSX.utils.json_to_sheet(templateRows);
      worksheet['!cols'] = [
        { wch: 40 }, // Question Text
        { wch: 15 }, // Option 1
        { wch: 15 }, // Option 2
        { wch: 15 }, // Option 3
        { wch: 15 }, // Option 4
        { wch: 25 }, // Correct Option Index
        { wch: 22 }  // Time Limit in Seconds
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Questions Template');
      XLSX.writeFile(workbook, 'Gubbi_Question_Upload_Template.xlsx');
      toast.success('Downloaded Excel Template (.xlsx)!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate Excel template');
    }
  };

  // Download real .csv template file
  const handleDownloadCsvTemplate = () => {
    try {
      const csvString = `\uFEFFQuestion Text,Option 1,Option 2,Option 3,Option 4,Correct Option Index (1-4),Time Limit in Seconds\r\nWhat is the capital of France?,London,Paris,Berlin,Madrid,2,20\r\nWhich element has chemical symbol 'O'?,Gold,Oxygen,Osmium,Hydrogen,2,30\r\nWhat is 15 multiplied by 4?,45,50,60,75,3,15\r\n`;
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Gubbi_Question_Upload_Template.csv';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      toast.success('Downloaded CSV Template (.csv)!');
    } catch (err) {
      toast.error('Failed to download CSV template');
    }
  };

  // Copy CSV format string to clipboard
  const handleCopyCsvTemplate = async () => {
    try {
      const csvString = `Question Text,Option 1,Option 2,Option 3,Option 4,Correct Option Index (1-4),Time Limit in Seconds
What is the capital of France?,London,Paris,Berlin,Madrid,2,20
Which element has chemical symbol 'O'?,Gold,Oxygen,Osmium,Hydrogen,2,30
What is 15 multiplied by 4?,45,50,60,75,3,15`;

      const success = await copyToClipboard(csvString);
      if (success) {
        toast.success('CSV Template copied to clipboard!');
      } else {
        toast.error('Failed to copy to clipboard');
      }
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      const ext = file.name.split('.').pop().toLowerCase();
      if (['xlsx', 'xls', 'csv'].includes(ext)) {
        if (onFileSelected) {
          onFileSelected(file);
        } else if (onTriggerUpload) {
          onTriggerUpload();
        }
      } else {
        toast.error('Please upload an Excel (.xlsx/.xls) or CSV (.csv) file.');
      }
    }
  };

  return (
    <div className="w-full space-y-4 sm:space-y-5">
      {/* ─── SECTION 1: DOWNLOAD SAMPLE TEMPLATES ─── */}
      <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
        isLight
          ? 'bg-gradient-to-br from-purple-50/70 via-white to-indigo-50/50 border-[#E9D5FF]'
          : 'bg-slate-900/60 border-purple-900/40'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-[#7C3AED] dark:text-purple-300 flex items-center justify-center shrink-0 shadow-xs">
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-200/70 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200">
                  Step 1
                </span>
                <h4 className="text-xs sm:text-sm font-extrabold text-[#0F172A] dark:text-white truncate">
                  Download Sample Format
                </h4>
              </div>
              <p className="text-[11px] sm:text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
                Download a pre-formatted template with all columns and sample questions.
              </p>
            </div>
          </div>

          {/* Action Buttons: Wrap responsively on all screens */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
            <button
              type="button"
              onClick={handleDownloadExcelTemplate}
              className="flex-1 sm:flex-none min-w-[145px] sm:min-w-0 h-9 sm:h-10 px-3.5 sm:px-4 rounded-xl font-bold text-[11.5px] sm:text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-xs hover:shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap active:scale-[0.98]"
            >
              <FileSpreadsheet className="w-4 h-4 shrink-0" />
              <span>Download Excel (.xlsx)</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadCsvTemplate}
              className="flex-1 sm:flex-none min-w-[140px] sm:min-w-0 h-9 sm:h-10 px-3.5 sm:px-4 rounded-xl font-bold text-[11.5px] sm:text-xs text-[#6C28FE] dark:text-purple-300 bg-white dark:bg-slate-800 border border-[#E9D5FF] dark:border-purple-800/50 hover:bg-[#FAF5FF] dark:hover:bg-purple-950/40 shadow-2xs flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap active:scale-[0.98]"
            >
              <FileText className="w-4 h-4 text-[#7C3AED] dark:text-purple-400 shrink-0" />
              <span>Download CSV (.csv)</span>
            </button>

            <button
              type="button"
              onClick={handleCopyCsvTemplate}
              className="w-full sm:w-auto h-9 sm:h-10 px-3.5 rounded-xl font-semibold text-[11.5px] sm:text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap active:scale-[0.98]"
              title="Copy CSV structure text to clipboard"
            >
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>Copy Text</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── SECTION 2: DRAG & DROP UPLOAD ZONE ─── */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={onTriggerUpload}
        className={`p-5 sm:p-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-[#7C3AED] bg-[#FAF5FF] scale-[1.01]'
            : isLight
              ? 'border-[#DDD6FE] hover:border-[#8B5CF6] bg-[#FCFBFE] hover:bg-[#FAF8FF]'
              : 'border-purple-900/50 hover:border-purple-500 bg-slate-900/30 hover:bg-slate-900/50'
        }`}
      >
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#FAF5FF] dark:bg-purple-950/70 border border-[#E9D5FF] dark:border-purple-800/40 flex items-center justify-center text-[#7C3AED] dark:text-purple-400 mb-2.5 shadow-2xs">
          <UploadCloud className="w-6 h-6" />
        </div>
        <p className="font-extrabold text-xs sm:text-sm text-[#0F172A] dark:text-white">
          Upload Your Prepared Questions
        </p>
        <p className="text-[11px] sm:text-xs text-[#64748B] dark:text-slate-400 mt-1 max-w-md">
          Drag & drop your completed <span className="font-semibold text-purple-700 dark:text-purple-300">.xlsx</span>, <span className="font-semibold text-purple-700 dark:text-purple-300">.xls</span>, or <span className="font-semibold text-purple-700 dark:text-purple-300">.csv</span> file here, or click to browse.
        </p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onTriggerUpload) onTriggerUpload();
          }}
          className="mt-3.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#6C28FE] to-[#4F46E5] hover:brightness-110 shadow-sm shadow-purple-600/25 flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Browse File from Device</span>
        </button>
      </div>

      {/* ─── SECTION 3: COLUMN LAYOUT & FORMAT GUIDE ─── */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 px-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              Format Guide
            </span>
            <span className="text-xs font-bold text-[#334155] dark:text-slate-200">
              Expected Column Structure (7 Columns)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="sm:hidden text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
              ← Scroll to see all columns →
            </span>
            <span className="hidden sm:inline text-[10.5px] text-[#7C3AED] dark:text-purple-400 font-medium">
              *Header row is automatically skipped by parser
            </span>
          </div>
        </div>

        {/* Responsive Table with horizontal scroll support on small screens */}
        <div className={`overflow-x-auto rounded-2xl border shadow-2xs ${
          isLight ? 'bg-white border-[#E2E8F0]' : 'bg-slate-900 border-slate-800'
        }`}>
          <table className="w-full text-left text-xs min-w-[720px]">
            <thead>
              <tr className={`border-b text-[10.5px] font-extrabold uppercase tracking-wider ${
                isLight
                  ? 'bg-[#F8FAFC] text-[#475569] border-[#E2E8F0]'
                  : 'bg-slate-800/70 text-slate-300 border-slate-700'
              }`}>
                <th className="px-3.5 py-2.5 whitespace-nowrap border-r border-[#E2E8F0] dark:border-slate-800">
                  Col A: Question Text
                </th>
                <th className="px-3 py-2.5 whitespace-nowrap border-r border-[#E2E8F0] dark:border-slate-800">
                  Col B: Option 1
                </th>
                <th className="px-3 py-2.5 whitespace-nowrap border-r border-[#E2E8F0] dark:border-slate-800">
                  Col C: Option 2
                </th>
                <th className="px-3 py-2.5 whitespace-nowrap border-r border-[#E2E8F0] dark:border-slate-800">
                  Col D: Option 3
                </th>
                <th className="px-3 py-2.5 whitespace-nowrap border-r border-[#E2E8F0] dark:border-slate-800">
                  Col E: Option 4
                </th>
                <th className="px-3 py-2.5 whitespace-nowrap border-r border-[#E2E8F0] dark:border-slate-800 text-center">
                  Col F: Correct (1-4 / A-D)
                </th>
                <th className="px-3 py-2.5 whitespace-nowrap text-center">
                  Col G: Time (s)
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y text-[11.5px] ${
              isLight ? 'divide-slate-100 text-[#1E293B]' : 'divide-slate-800 text-slate-200'
            }`}>
              {sampleData.map((row, idx) => (
                <tr key={idx} className={isLight ? 'hover:bg-[#FAF5FF]/50' : 'hover:bg-slate-800/40'}>
                  <td className="px-3.5 py-2.5 font-semibold text-[#6C28FE] dark:text-purple-300 whitespace-nowrap border-r border-[#E2E8F0] dark:border-slate-800">
                    {row.question}
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap border-r border-[#E2E8F0] dark:border-slate-800">{row.opt1}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap border-r border-[#E2E8F0] dark:border-slate-800">{row.opt2}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap border-r border-[#E2E8F0] dark:border-slate-800">{row.opt3}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap border-r border-[#E2E8F0] dark:border-slate-800">{row.opt4}</td>
                  <td className="px-3 py-2.5 text-center whitespace-nowrap border-r border-[#E2E8F0] dark:border-slate-800">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-md font-black text-xs bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                      {row.correct}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center whitespace-nowrap font-bold text-indigo-600 dark:text-indigo-400">
                    {row.time}s
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── SECTION 4: HELPFUL TIPS & RULES ─── */}
      <div className={`p-3.5 sm:p-4 rounded-xl border flex items-start gap-2.5 text-xs ${
        isLight
          ? 'bg-sky-50/80 border-sky-200 text-sky-950'
          : 'bg-sky-950/30 border-sky-500/20 text-sky-200'
      }`}>
        <Info className="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400 mt-0.5" />
        <div className="space-y-1 text-[11px] sm:text-xs leading-relaxed">
          <p className="font-bold">Column Rules & Helpful Tips:</p>
          <ul className="list-disc list-inside space-y-0.5 text-[#334155] dark:text-sky-200">
            <li><strong>Column A:</strong> The exact question title or prompt.</li>
            <li><strong>Columns B to E:</strong> The 4 multiple choice options.</li>
            <li><strong>Column F:</strong> The correct option number (<code>1</code>, <code>2</code>, <code>3</code>, or <code>4</code>) or letter (<code>A</code>, <code>B</code>, <code>C</code>, <code>D</code>).</li>
            <li><strong>Column G:</strong> Question timer in seconds (e.g. <code>20</code>, <code>30</code>). Defaults to 20s if left blank.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
