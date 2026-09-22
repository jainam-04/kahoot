import React from 'react';
import { Download, Copy, FileSpreadsheet, Info, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { useTheme } from '../context/ThemeContext';

export default function UploadBaseTemplate({ onTriggerUpload }) {
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';

  // Sample data format matching existing spreadsheet parser
  const sampleData = [
    {
      question: "What is the capital of France?",
      opt1: "London",
      opt2: "Paris",
      opt3: "Berlin",
      opt4: "Madrid",
      correct: "2",
      time: "20"
    },
    {
      question: "Which element has chemical symbol 'O'?",
      opt1: "Gold",
      opt2: "Oxygen",
      opt3: "Osmium",
      opt4: "Hydrogen",
      correct: "2",
      time: "30"
    },
    {
      question: "What is 15 multiplied by 4?",
      opt1: "45",
      opt2: "50",
      opt3: "60",
      opt4: "75",
      correct: "3",
      time: "15"
    }
  ];

  // Download real .xlsx template file
  const handleDownloadExcelTemplate = () => {
    try {
      const templateRows = sampleData.map(row => ({
        "Question Text": row.question,
        "Option 1": row.opt1,
        "Option 2": row.opt2,
        "Option 3": row.opt3,
        "Option 4": row.opt4,
        "Correct Option Index (1-4)": Number(row.correct),
        "Time Limit in Seconds": Number(row.time)
      }));

      const worksheet = XLSX.utils.json_to_sheet(templateRows);
      
      const columnWidths = [
        { wch: 40 }, // Question Text
        { wch: 15 }, // Option 1
        { wch: 15 }, // Option 2
        { wch: 15 }, // Option 3
        { wch: 15 }, // Option 4
        { wch: 25 }, // Correct Option Index
        { wch: 22 }  // Time Limit in Seconds
      ];
      worksheet['!cols'] = columnWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Questions Template");
      XLSX.writeFile(workbook, "QuizForge_Question_Upload_Template.xlsx");
      toast.success('Downloaded Excel Base Template (.xlsx)!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate Excel template');
    }
  };

  // Copy CSV format string to clipboard
  const handleCopyCsvTemplate = () => {
    try {
      const csvString = `Question Text,Option 1,Option 2,Option 3,Option 4,Correct Option Index (1-4),Time Limit in Seconds
What is the capital of France?,London,Paris,Berlin,Madrid,2,20
Which element has chemical symbol 'O'?,Gold,Oxygen,Osmium,Hydrogen,2,30
What is 15 multiplied by 4?,45,50,60,75,3,15`;

      navigator.clipboard.writeText(csvString);
      toast.success('CSV Base Template copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <div className={`rounded-3xl p-5 sm:p-7 border space-y-5 transition-all duration-300 shadow-md ${
      isLight
        ? 'bg-white border-purple-200/90 text-slate-900 shadow-slate-200/60'
        : 'bg-[#12101c] border-purple-500/20 text-slate-100 shadow-purple-950/20'
    }`}>
      {/* Top Header & Actions */}
      <div className={`flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b ${
        isLight ? 'border-purple-100' : 'border-purple-500/15'
      }`}>
        <div className="flex items-start sm:items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-600/30 shrink-0">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className={`font-outfit text-base font-extrabold ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                Question Upload Base Template
              </h4>
              <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full border ${
                isLight
                  ? 'bg-purple-100 text-purple-800 border-purple-300'
                  : 'bg-purple-950/60 text-purple-300 border-purple-800/40'
              }`}>
                Excel / CSV
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Follow this exact column layout when preparing your bulk question spreadsheet file.
            </p>
          </div>
        </div>

        {/* Action Buttons Side-by-Side */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0 w-full sm:w-auto mt-2 lg:mt-0">
          <button
            type="button"
            onClick={handleDownloadExcelTemplate}
            className="btn-premium px-3 py-2 text-xs font-extrabold text-white rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download Template (.xlsx)</span>
          </button>

          <button
            type="button"
            onClick={handleCopyCsvTemplate}
            className={`px-3 py-2 text-xs font-extrabold rounded-xl border transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              isLight
                ? 'bg-purple-50 border-purple-300 text-purple-900 hover:bg-purple-100 shadow-xs'
                : 'bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-700'
            }`}
          >
            <Copy className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
            <span>Copy CSV</span>
          </button>

          {onTriggerUpload && (
            <button
              type="button"
              onClick={onTriggerUpload}
              className="btn-premium px-3 py-2 text-xs font-extrabold text-white rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
            >
              <UploadCloud className="h-3.5 w-3.5" />
              <span>Upload File</span>
            </button>
          )}
        </div>
      </div>

      {/* Visual Table Base Template Preview */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between text-xs font-bold px-1 gap-2">
          <span className={`uppercase tracking-wider text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Excel / CSV Column Structure Preview
          </span>
          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
            *Header row is automatically detected and skipped
          </span>
        </div>

        <div className={`overflow-x-auto rounded-2xl border shadow-xs max-w-full ${
          isLight ? 'bg-slate-50/80 border-purple-200/80' : 'bg-[#0b0a10] border-white/10'
        }`}>
          <table className="w-full text-left text-xs font-mono min-w-[700px]">
            <thead>
              <tr className={`border-b text-[11px] font-extrabold uppercase tracking-wider ${
                isLight
                  ? 'bg-purple-100 text-purple-950 border-purple-200'
                  : 'bg-purple-950/60 text-purple-300 border-white/10'
              }`}>
                <th className="px-3.5 py-2.5 whitespace-nowrap border-r border-purple-500/15">Col A: Question</th>
                <th className="px-3 py-2.5 whitespace-nowrap border-r border-purple-500/15">Col B: Opt 1</th>
                <th className="px-3 py-2.5 whitespace-nowrap border-r border-purple-500/15">Col C: Opt 2</th>
                <th className="px-3 py-2.5 whitespace-nowrap border-r border-purple-500/15">Col D: Opt 3</th>
                <th className="px-3 py-2.5 whitespace-nowrap border-r border-purple-500/15">Col E: Opt 4</th>
                <th className="px-3 py-2.5 whitespace-nowrap border-r border-purple-500/15 text-center">Col F: Correct (1-4)</th>
                <th className="px-3 py-2.5 whitespace-nowrap text-center">Col G: Time (s)</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${
              isLight ? 'divide-purple-100/80 text-slate-800' : 'divide-white/5 text-slate-200'
            }`}>
              {sampleData.map((row, idx) => (
                <tr key={idx} className={isLight ? 'hover:bg-purple-50/60' : 'hover:bg-white/5'}>
                  <td className="px-3.5 py-2.5 font-sans font-bold text-purple-700 dark:text-purple-400 whitespace-nowrap border-r border-purple-500/15">
                    {row.question}
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap border-r border-purple-500/15">{row.opt1}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap border-r border-purple-500/15">{row.opt2}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap border-r border-purple-500/15">{row.opt3}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap border-r border-purple-500/15">{row.opt4}</td>
                  <td className="px-3 py-2.5 text-center whitespace-nowrap border-r border-purple-500/15 font-black text-emerald-700 dark:text-emerald-400">
                    {row.correct}
                  </td>
                  <td className="px-3 py-2.5 text-center whitespace-nowrap font-black text-indigo-600 dark:text-indigo-400">
                    {row.time}s
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Guidelines Footer Note */}
      <div className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs ${
        isLight
          ? 'bg-sky-50 border-sky-200 text-sky-950'
          : 'bg-sky-950/30 border-sky-500/20 text-sky-300'
      }`}>
        <Info className="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400 mt-0.5" />
        <div className="space-y-1 text-[11px] leading-relaxed">
          <p className="font-bold">Format Guidelines & Tips:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li><strong>Col A:</strong> The exact question title or prompt text.</li>
            <li><strong>Cols B to E:</strong> The four multiple choice answer options (Option 1 through 4).</li>
            <li><strong>Col F:</strong> The number of the correct option (enter <code>1</code> for Option 1, <code>2</code> for Option 2, <code>3</code> for Option 3, or <code>4</code> for Option 4). Letters (A, B, C, D) are also supported automatically.</li>
            <li><strong>Col G:</strong> Optional timer duration per question in seconds (defaults to 20s if left blank).</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
