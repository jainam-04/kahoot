import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useQuery } from '@tanstack/react-query';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  BarChart3, ArrowLeft, Loader2, Download, Trophy, 
  CheckCircle, XCircle, AlertCircle, FileSpreadsheet, FileText, Crown, Medal
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, 
  WidthType, AlignmentType, HeadingLevel, ShadingType 
} from 'docx';
import AnimatedPage from '../components/AnimatedPage';
import { getResultBySession } from '../services/resultService';

const isUnansweredAnswer = (answer) => {
  const value = answer?.answerIndex;
  return value === null || value === undefined || value === '' || value === -1 || Number.isNaN(Number(value));
};

const getSubmittedAnswers = (answers = []) => (answers || []).filter((answer) => !isUnansweredAnswer(answer));

export default function ResultsAnalytics() {
  const { sessionId } = useParams();
  const id = sessionId;
  const navigate = useNavigate();

  // Fetch Session Results
  const { 
    data, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['result-details', id],
    queryFn: () => getResultBySession(id),
    refetchOnWindowFocus: false,
  });

  const result = data?.result;
  const players = result?.players || [];
  const { themeMode } = useTheme();
  const isDark = themeMode !== 'light';
  const sortedPlayers = [...players].sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
  const playerSummaries = sortedPlayers.map((player, index) => {
    const submittedAnswers = getSubmittedAnswers(player.answers || []);
    const correct = submittedAnswers.filter((answer) => answer.isCorrect).length;
    const wrong = submittedAnswers.filter((answer) => !answer.isCorrect).length;
    const unanswered = Math.max(0, (result?.totalQuestions || 0) - submittedAnswers.length);
    const percentage = result?.totalQuestions ? Math.round((correct / result.totalQuestions) * 100) : 0;

    return {
      ...player,
      rank: player.rank || index + 1,
      name: player.name || player.username || `Player ${index + 1}`,
      correct,
      wrong,
      unanswered,
      percentage,
      totalScore: player.totalScore || 0,
    };
  });

  // Calculate Metrics
  const totalPlayers = playerSummaries.length;
  const winnerName = result?.winner || (playerSummaries[0]?.name) || 'No winner registered';
  const totalQuestions = result?.totalQuestions || 0;
  const avgCorrect = totalPlayers
    ? Math.round((playerSummaries.reduce((sum, p) => sum + (p.correct || 0), 0) / totalPlayers) * 10) / 10
    : 0;

  const accuracy = totalPlayers && totalQuestions
    ? Math.round((playerSummaries.reduce((sum, p) => sum + (p.correct || 0), 0) / (totalPlayers * totalQuestions)) * 100)
    : 0;

  const completionPercentage = totalQuestions ? Math.round(((totalQuestions - playerSummaries.reduce((sum, player) => sum + player.unanswered, 0)) / totalQuestions) * 100) : 0;

  // Calculate fastest solver / highlights for each question
  const questionHighlights = [];
  for (let qIdx = 0; qIdx < totalQuestions; qIdx++) {
    let fastestPlayer = null;
    let minTime = Infinity;
    
    playerSummaries.forEach((p) => {
      const ans = p.answers?.find(a => a.questionIndex === qIdx);
      if (ans && ans.isCorrect) {
        if (ans.timeTaken < minTime) {
          minTime = ans.timeTaken;
          fastestPlayer = {
            name: p.name,
            timeTaken: (ans.timeTaken / 1000).toFixed(2)
          };
        }
      }
    });
    
    questionHighlights.push({
      questionNumber: qIdx + 1,
      fastestPlayer: fastestPlayer
    });
  }

  // Safe autoTable Invocation Helper
  const runAutoTable = (docObj, tableOptions) => {
    if (typeof autoTable === 'function') {
      autoTable(docObj, tableOptions);
    } else if (autoTable && typeof autoTable.default === 'function') {
      autoTable.default(docObj, tableOptions);
    } else if (typeof docObj.autoTable === 'function') {
      docObj.autoTable(tableOptions);
    } else {
      console.warn('autoTable plugin method not found directly, attempting fallback');
    }
  };

  // Export Standings to CSV file
  const handleExportCSV = () => {
    if (!result) {
      toast.error('No result data loaded yet');
      return;
    }

    try {
      const escapeCSV = (val) => {
        if (val === undefined || val === null) return '';
        let str = String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const lines = [];
      
      // Metadata Header Block
      lines.push('=== Quizzy REPORT ===');
      if (result.organizationName) {
        lines.push(`Organization Name,${escapeCSV(result.organizationName)}`);
      }
      lines.push(`Quiz Title,${escapeCSV(result.quizTitle || 'Quizzy Match')}`);
      lines.push(`Category,${escapeCSV(result.quizCategory || result.quiz?.category || 'General')}`);
      lines.push(`Played At,${escapeCSV(result.playedAt ? new Date(result.playedAt).toLocaleString() : new Date().toLocaleString())}`);
      lines.push(`Session ID,${escapeCSV(id)}`);
      lines.push(`Total Questions,${escapeCSV(totalQuestions)}`);
      lines.push(`Total Challengers,${escapeCSV(totalPlayers)}`);
      lines.push(`Lobby Accuracy,${escapeCSV(accuracy + '%')}`);
      lines.push(`Winner Crown,${escapeCSV(winnerName)}`);
      lines.push(`Average Correct,${escapeCSV(`${avgCorrect} / ${totalQuestions}`)}`);
      lines.push(''); // blank line divider
      
      // Standings Header
      lines.push('=== PLAYER STANDINGS ===');
      lines.push(['Rank', 'Player Name', 'Mobile Number', 'Correct Answers', 'Wrong Answers', 'Not Answered', 'Accuracy (%)', 'Total Score'].map(escapeCSV).join(','));
      
      // Standings Rows
      if (playerSummaries.length > 0) {
        playerSummaries.forEach((p) => {
          const playerAccuracy = totalQuestions ? Math.round((p.correct / totalQuestions) * 100) + '%' : '0%';
          lines.push([
            p.rank,
            p.name,
            p.mobileNumber || 'N/A',
            p.correct,
            p.wrong,
            p.unanswered,
            playerAccuracy,
            p.totalScore
          ].map(escapeCSV).join(','));
        });
      } else {
        lines.push(['-', 'No player data recorded', '0', '0', '0', '0%', '0'].map(escapeCSV).join(','));
      }
      
      lines.push(''); // blank line divider
      
      // Highlights Header
      lines.push('=== QUESTION HIGHLIGHTS (FASTEST CORRECT SOLVERS) ===');
      lines.push(['Question', 'Fastest Solver', 'Time Taken'].map(escapeCSV).join(','));
      
      // Highlights Rows
      questionHighlights.forEach(hl => {
        lines.push([
          `Question ${hl.questionNumber}`,
          hl.fastestPlayer ? hl.fastestPlayer.name : 'No correct answers',
          hl.fastestPlayer ? `${hl.fastestPlayer.timeTaken}s` : 'N/A'
        ].map(escapeCSV).join(','));
      });

      // Prepare UTF-8 CSV blob to support Excel compatibility
      const csvString = lines.join('\r\n');
      const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvString], { type: 'text/csv;charset=utf-8;' });
      
      const cleanTitle = (result.quizTitle || 'Battle_Report').replace(/[^a-zA-Z0-9_-]/g, '_');
      const prefix = result.organizationName ? result.organizationName.replace(/[^a-zA-Z0-9_-]/g, '_') : 'Quizzy';
      const fileName = `${prefix}_${cleanTitle}_${id ? id.slice(-6) : 'report'}.csv`;

      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      toast.success('CSV Report exported successfully!');
    } catch (err) {
      console.error('CSV Export error:', err);
      toast.error('Error generating CSV export');
    }
  };

  // ── PDF Export ────────────────────────────────────────────────────────────
  const handleExportPDF = () => {
    if (!result) {
      toast.error('No result data loaded yet');
      return;
    }

    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();
      const margin = 14;

      // ── Brand Header ────────────────────────────────────────────
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(30, 41, 59);
      doc.text('Quizzy', margin, 20);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text('Battle Performance Report', margin, 27);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text(result.quizTitle || 'Quiz Match', margin, 35);

      const dateStr = result.playedAt
        ? new Date(result.playedAt).toLocaleString()
        : new Date().toLocaleString();
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(dateStr, pageW - margin, 35, { align: 'right' });

      let currentY = 35;

      if (result.organizationName) {
        currentY += 7;
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text(result.organizationName, margin, currentY);
      }

      // Add line separator
      currentY += 5;
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(margin, currentY, pageW - margin, currentY);

      let cursorY = currentY + 10;

      // ── Summary Cards ───────────────────────────────────────────
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text('MATCH SUMMARY', margin, cursorY);
      cursorY += 8;

      const summaryItems = [
        ['Winner', winnerName],
        ['Total Players', String(totalPlayers)],
        ['Total Questions', String(totalQuestions)],
        ['Avg Correct', `${avgCorrect} / ${totalQuestions}`],
        ['Accuracy', `${accuracy}%`],
      ];

      const cardW = (pageW - margin * 2 - 12) / summaryItems.length;
      summaryItems.forEach(([label, val], i) => {
        const x = margin + i * (cardW + 3);
        
        doc.setDrawColor(226, 232, 240);
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(x, cursorY, cardW, 18, 1.5, 1.5, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(15, 23, 42);
        const maxValWidth = cardW - 3;
        const valLines = doc.splitTextToSize(val, maxValWidth);
        doc.text(valLines[0] || '', x + cardW / 2, cursorY + 7.5, { align: 'center' });

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(100, 116, 139);
        doc.text(label.toUpperCase(), x + cardW / 2, cursorY + 14, { align: 'center' });
      });
      cursorY += 28;

      // ── Player Rankings Table ────────────────────────────────────
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text('PLAYER RANKINGS', margin, cursorY);
      cursorY += 4;

      const rankMedals = ['1st', '2nd', '3rd'];
      const tableRows = playerSummaries.length > 0
        ? playerSummaries.map((p) => {
            const medal = p.rank <= 3 ? rankMedals[p.rank - 1] : `#${p.rank}`;
            return [
              medal,
              p.name,
              p.mobileNumber || 'N/A',
              String(p.correct || 0),
              String(p.wrong || 0),
              String(p.unanswered || 0),
              `${p.totalScore || 0} pts`,
            ];
          })
        : [['-', 'No players recorded', '0', '0', '0', '0 pts']];

      runAutoTable(doc, {
        startY: cursorY,
        head: [['Rank', 'Player Name', 'Mobile', 'Correct', 'Wrong', 'Not Answered', 'Final Score']],
        body: tableRows,
        theme: 'grid',
        styles: {
          font: 'helvetica',
          fontSize: 9,
          cellPadding: 4,
          textColor: [50, 50, 50],
          lineColor: [226, 232, 240],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [241, 245, 249],
          textColor: [30, 41, 59],
          fontStyle: 'bold',
        },
        columnStyles: {
          0: { cellWidth: 15, halign: 'center' },
          2: { halign: 'center' },
          3: { halign: 'center' },
          4: { halign: 'center' },
          5: { halign: 'center' },
          6: { halign: 'right', fontStyle: 'bold' },
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        rowPageBreak: 'auto',
        margin: { left: margin, right: margin },
      });

      const lastY = doc.lastAutoTable ? doc.lastAutoTable.finalY : cursorY + 40;
      cursorY = lastY + 10;

      // ── Fastest Solvers ─────────────────────────────────────────
      if (questionHighlights.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(30, 41, 59);
        doc.text('FASTEST CORRECT SOLVERS', margin, cursorY);
        cursorY += 4;

        runAutoTable(doc, {
          startY: cursorY,
          head: [['Question', 'Fastest Solver', 'Time Taken']],
          body: questionHighlights.map((hl) => [
            `Q${hl.questionNumber}`,
            hl.fastestPlayer ? hl.fastestPlayer.name : '—',
            hl.fastestPlayer ? `${hl.fastestPlayer.timeTaken}s` : 'N/A',
          ]),
          theme: 'grid',
          styles: {
            font: 'helvetica',
            fontSize: 9,
            cellPadding: 4,
            textColor: [50, 50, 50],
            lineColor: [226, 232, 240],
            lineWidth: 0.1,
          },
          headStyles: {
            fillColor: [241, 245, 249],
            textColor: [30, 41, 59],
            fontStyle: 'bold',
          },
          alternateRowStyles: { fillColor: [248, 250, 252] },
          margin: { left: margin, right: margin },
        });
      }

      // ── Footer ──────────────────────────────────────────────────
      const totalPages = doc.internal.getNumberOfPages();
      for (let pg = 1; pg <= totalPages; pg++) {
        doc.setPage(pg);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.5);
        doc.line(margin, doc.internal.pageSize.getHeight() - 15, pageW - margin, doc.internal.pageSize.getHeight() - 15);
        
        doc.text(
          `Quizzy  •  Generated ${new Date().toLocaleString()}  •  Page ${pg} of ${totalPages}`,
          pageW / 2,
          doc.internal.pageSize.getHeight() - 8,
          { align: 'center' }
        );
      }

      const cleanTitle = (result.quizTitle || 'Battle_Report').replace(/[^a-zA-Z0-9_-]/g, '_');
      const prefix = result.organizationName ? result.organizationName.replace(/[^a-zA-Z0-9_-]/g, '_') : 'Quizzy';
      const fileName = `${prefix}_${cleanTitle}_${id ? id.slice(-6) : 'report'}.pdf`;

      doc.save(fileName);
      toast.success('PDF report downloaded!');
    } catch (err) {
      console.error('PDF Export error:', err);
      toast.error('Error generating PDF report');
    }
  };

  // ── Native Word (.docx) Export ────────────────────────────────────────────
  const handleExportWord = async () => {
    if (!result) {
      toast.error('No result data loaded yet');
      return;
    }

    try {
      toast.loading('Generating Word document...', { id: 'export-word' });

      const title = result.quizTitle || 'Quizzy Match';
      const category = result.quizCategory || result.quiz?.category || 'General';
      const playedDate = result.playedAt ? new Date(result.playedAt).toLocaleString() : new Date().toLocaleString();

      const wordDoc = new Document({
        sections: [{
          properties: {},
          children: [
            // Title Header
            new Paragraph({
              alignment: AlignmentType.LEFT,
              children: [
                new TextRun({
                  text: 'Quizzy',
                  bold: true,
                  size: 32,
                  color: '4F46E5',
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Battle Performance Report • Generated ${new Date().toLocaleString()}`,
                  size: 18,
                  color: '64748B',
                }),
              ],
            }),
            new Paragraph({ text: '' }),

            // Quiz Info
            new Paragraph({
              children: [
                new TextRun({
                  text: title,
                  bold: true,
                  size: 24,
                  color: '0F172A',
                }),
              ],
            }),
            ...(result.organizationName ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: result.organizationName,
                    italics: true,
                    size: 20,
                    color: '64748B',
                  }),
                ],
              })
            ] : []),
            new Paragraph({
              children: [
                new TextRun({ text: `Category: `, bold: true, size: 20 }),
                new TextRun({ text: `${category}   |   `, size: 20 }),
                new TextRun({ text: `Winner: `, bold: true, size: 20 }),
                new TextRun({ text: `${winnerName}   |   `, size: 20 }),
                new TextRun({ text: `Played Date: `, bold: true, size: 20 }),
                new TextRun({ text: `${playedDate}`, size: 20 }),
              ],
            }),
            new Paragraph({ text: '' }),

            // Section 1: Summary Table
            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              children: [
                new TextRun({
                  text: 'MATCH SUMMARY',
                  bold: true,
                  size: 22,
                  color: '334155',
                }),
              ],
            }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: winnerName, bold: true, size: 20 })] }),
                        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'WINNER', size: 14, color: '64748B' })] }),
                      ],
                      shading: { fill: 'F8FAFC', type: ShadingType.CLEAR, color: 'auto' },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(totalPlayers), bold: true, size: 20 })] }),
                        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'TOTAL PLAYERS', size: 14, color: '64748B' })] }),
                      ],
                      shading: { fill: 'F8FAFC', type: ShadingType.CLEAR, color: 'auto' },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(totalQuestions), bold: true, size: 20 })] }),
                        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'TOTAL QUESTIONS', size: 14, color: '64748B' })] }),
                      ],
                      shading: { fill: 'F8FAFC', type: ShadingType.CLEAR, color: 'auto' },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${avgCorrect} / ${totalQuestions}`, bold: true, size: 20 })] }),
                        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'AVG CORRECT', size: 14, color: '64748B' })] }),
                      ],
                      shading: { fill: 'F8FAFC', type: ShadingType.CLEAR, color: 'auto' },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${accuracy}%`, bold: true, size: 20 })] }),
                        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'ACCURACY', size: 14, color: '64748B' })] }),
                      ],
                      shading: { fill: 'F8FAFC', type: ShadingType.CLEAR, color: 'auto' },
                    }),
                  ],
                }),
              ],
            }),
            new Paragraph({ text: '' }),

            // Section 2: Player Standings Table
            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              children: [
                new TextRun({
                  text: 'PLAYER STANDINGS',
                  bold: true,
                  size: 22,
                  color: '334155',
                }),
              ],
            }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: ['Rank', 'Player Name', 'Mobile Number', 'Correct', 'Wrong', 'Not Answered', 'Final Score'].map((headerText, i) => 
                    new TableCell({
                      children: [
                        new Paragraph({
                          alignment: i === 1 ? AlignmentType.LEFT : i === 5 ? AlignmentType.RIGHT : AlignmentType.CENTER,
                          children: [new TextRun({ text: headerText, bold: true, color: 'FFFFFF', size: 18 })],
                        }),
                      ],
                      shading: { fill: '4F46E5', type: ShadingType.CLEAR, color: 'auto' },
                    })
                  ),
                }),
                ...(playerSummaries.length > 0
                  ? playerSummaries.map((p, idx) => 
                      new TableRow({
                        children: [
                          new TableCell({
                            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: p.rank <= 3 ? ['1st', '2nd', '3rd'][p.rank - 1] : `#${p.rank}`, bold: true, size: 18 })] })],
                            shading: { fill: idx % 2 === 0 ? 'FFFFFF' : 'F8FAFC', type: ShadingType.CLEAR, color: 'auto' },
                          }),
                          new TableCell({
                            children: [new Paragraph({ children: [new TextRun({ text: p.name, bold: true, size: 18 })] })],
                            shading: { fill: idx % 2 === 0 ? 'FFFFFF' : 'F8FAFC', type: ShadingType.CLEAR, color: 'auto' },
                          }),
                          new TableCell({
                            children: [new Paragraph({ children: [new TextRun({ text: p.mobileNumber || 'N/A', size: 14 })] })],
                            shading: { fill: idx % 2 === 0 ? 'FFFFFF' : 'F8FAFC', type: ShadingType.CLEAR, color: 'auto' },
                          }),
                          new TableCell({
                            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(p.correct), bold: true, color: '16A34A', size: 18 })] })],
                            shading: { fill: idx % 2 === 0 ? 'FFFFFF' : 'F8FAFC', type: ShadingType.CLEAR, color: 'auto' },
                          }),
                          new TableCell({
                            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(p.wrong), color: 'DC2626', size: 18 })] })],
                            shading: { fill: idx % 2 === 0 ? 'FFFFFF' : 'F8FAFC', type: ShadingType.CLEAR, color: 'auto' },
                          }),
                          new TableCell({
                            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(p.unanswered), color: 'D97706', size: 18 })] })],
                            shading: { fill: idx % 2 === 0 ? 'FFFFFF' : 'F8FAFC', type: ShadingType.CLEAR, color: 'auto' },
                          }),
                          new TableCell({
                            children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `${p.totalScore} pts`, bold: true, color: '4F46E5', size: 18 })] })],
                            shading: { fill: idx % 2 === 0 ? 'FFFFFF' : 'F8FAFC', type: ShadingType.CLEAR, color: 'auto' },
                          }),
                        ],
                      })
                    )
                  : [
                      new TableRow({
                        children: [
                          new TableCell({
                            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'No player data recorded', size: 18 })] })],
                            columnSpan: 6,
                          }),
                        ],
                      }),
                    ]
                ),
              ],
            }),
            new Paragraph({ text: '' }),

            // Section 3: Question Highlights Table
            ...(questionHighlights.length > 0 ? [
              new Paragraph({
                heading: HeadingLevel.HEADING_2,
                children: [
                  new TextRun({
                    text: 'FASTEST CORRECT SOLVERS',
                    bold: true,
                    size: 22,
                    color: '334155',
                  }),
                ],
              }),
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: ['Question', 'Fastest Solver', 'Time Taken'].map((headerText, i) => 
                      new TableCell({
                        children: [
                          new Paragraph({
                            alignment: i === 2 ? AlignmentType.RIGHT : AlignmentType.LEFT,
                            children: [new TextRun({ text: headerText, bold: true, color: 'FFFFFF', size: 18 })],
                          }),
                        ],
                        shading: { fill: '4F46E5', type: ShadingType.CLEAR, color: 'auto' },
                      })
                    ),
                  }),
                  ...questionHighlights.map((hl, idx) => 
                    new TableRow({
                      children: [
                        new TableCell({
                          children: [new Paragraph({ children: [new TextRun({ text: `Q${hl.questionNumber}`, bold: true, size: 18 })] })],
                          shading: { fill: idx % 2 === 0 ? 'FFFFFF' : 'F8FAFC', type: ShadingType.CLEAR, color: 'auto' },
                        }),
                        new TableCell({
                          children: [new Paragraph({ children: [new TextRun({ text: hl.fastestPlayer ? hl.fastestPlayer.name : '—', size: 18 })] })],
                          shading: { fill: idx % 2 === 0 ? 'FFFFFF' : 'F8FAFC', type: ShadingType.CLEAR, color: 'auto' },
                        }),
                        new TableCell({
                          children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: hl.fastestPlayer ? `${hl.fastestPlayer.timeTaken}s` : 'N/A', bold: true, size: 18 })] })],
                          shading: { fill: idx % 2 === 0 ? 'FFFFFF' : 'F8FAFC', type: ShadingType.CLEAR, color: 'auto' },
                        }),
                      ],
                    })
                  ),
                ],
              }),
            ] : []),

            // Footer
            new Paragraph({ text: '' }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: 'Quizzy • Official Multiplayer Battle Report',
                  size: 16,
                  color: '94A3B8',
                }),
              ],
            }),
          ],
        }],
      });

      const buffer = await Packer.toBlob(wordDoc);
      const cleanTitle = (result.quizTitle || 'Battle_Report').replace(/[^a-zA-Z0-9_-]/g, '_');
      const prefix = result.organizationName ? result.organizationName.replace(/[^a-zA-Z0-9_-]/g, '_') : 'Quizzy';
      const fileName = `${prefix}_${cleanTitle}_${id ? id.slice(-6) : 'report'}.docx`;

      const link = document.createElement('a');
      const url = URL.createObjectURL(buffer);
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);

      toast.success('Native Word (.docx) document downloaded!', { id: 'export-word' });
    } catch (err) {
      console.error('Word Export error:', err);
      toast.error('Error generating Word document', { id: 'export-word' });
    }
  };

  if (isLoading) {
    return (
      <AnimatedPage>
        <div className={`flex-1 flex items-center justify-center min-h-[70vh] ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
          <div className="text-center space-y-4">
            <Loader2 className={`h-10 w-10 animate-spin mx-auto ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Compiling analytics report...</p>
          </div>
        </div>
      </AnimatedPage>
    );
  }

  if (error || !result) {
    return (
      <AnimatedPage>
        <div className={`flex-1 flex flex-col items-center justify-center min-h-[70vh] text-center px-4 ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
          <BarChart3 className={`h-12 w-12 mb-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          <h2 className="font-outfit text-xl font-bold">Report Not Found</h2>
          <p className={`text-sm mt-1 max-w-[280px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            The requested battle logs could not be loaded. Please return to the dashboard.
          </p>
          <button onClick={() => navigate('/dashboard')} className="btn-premium btn-primary-gradient px-4 py-2.5 text-xs font-bold mt-5">
            Go to Dashboard
          </button>
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <div className={`relative min-h-screen p-6 sm:p-8 transition-colors duration-300 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
        <div className={`absolute inset-0 pointer-events-none ${isDark ? 'bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_35%)]' : 'bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.08),_transparent_35%)]'}`} />

        <div className="mx-auto max-w-7xl relative z-10 space-y-6 text-left">
          <div className={`rounded-[28px] border p-6 sm:p-8 shadow-xl ${isDark ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-white'}`}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <button onClick={() => navigate('/dashboard')} className={`rounded-xl p-2 transition ${isDark ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'}`} aria-label="Back">
                    <ArrowLeft className="h-4.5 w-4.5" />
                  </button>
                  <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] ${isDark ? 'bg-blue-500/10 text-blue-300' : 'bg-blue-50 text-blue-700'}`}>
                    {result.quizTitle ? 'Performance Report' : 'Battle Report'}
                  </span>
                </div>

                <div className="space-y-2">
                  <h1 className={`font-outfit text-3xl sm:text-4xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{result.quizTitle || 'Quiz Match'}</h1>
                  <div className={`flex flex-wrap gap-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    <span className={`rounded-full px-3 py-1 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>Category: {result.quizCategory || result.quiz?.category || 'General'}</span>
                    <span className={`rounded-full px-3 py-1 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>Player: {winnerName}</span>
                    <span className={`rounded-full px-3 py-1 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>Date: {result.playedAt ? new Date(result.playedAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button onClick={handleExportCSV} className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${isDark ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                  <FileSpreadsheet className="h-4 w-4" />
                  Export CSV
                </button>
                <button onClick={handleExportWord} className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${isDark ? 'bg-blue-900/40 text-blue-200 hover:bg-blue-900/60 border border-blue-700/50' : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'}`}>
                  <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Export Word
                </button>
                <button onClick={handleExportPDF} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 shadow-md">
                  <Download className="h-4 w-4" />
                  Export PDF
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
              <div className={`rounded-2xl border p-5 ${isDark ? 'border-slate-800 bg-slate-950/70' : 'border-slate-200 bg-slate-50'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-[10px] font-semibold uppercase tracking-[0.28em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Quiz Summary</p>
                    <h2 className={`mt-1 text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Performance Snapshot</h2>
                  </div>
                  <div className={`rounded-full px-3 py-1 text-sm font-semibold ${isDark ? 'bg-emerald-500/10 text-emerald-300' : 'bg-emerald-50 text-emerald-700'}`}>
                    {accuracy}% accuracy
                  </div>
                </div>

                <div className="mt-4 space-y-4">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Completion</span>
                      <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{completionPercentage}%</span>
                    </div>
                    <div className={`h-2.5 rounded-full ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                      <div className="h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500" style={{ width: `${completionPercentage}%` }} />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className={`rounded-xl border p-3 ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
                      <p className={`text-[10px] uppercase tracking-[0.25em] ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Final Score</p>
                      <p className={`mt-1 text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{playerSummaries[0]?.totalScore || 0} pts</p>
                    </div>
                    <div className={`rounded-xl border p-3 ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
                      <p className={`text-[10px] uppercase tracking-[0.25em] ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Rank</p>
                      <p className={`mt-1 text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>#{playerSummaries[0]?.rank || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`rounded-2xl border p-5 ${isDark ? 'border-slate-800 bg-slate-950/70' : 'border-slate-200 bg-slate-50'}`}>
                <p className={`text-[10px] font-semibold uppercase tracking-[0.28em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Quick Facts</p>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Quiz Date</span>
                    <span className={`font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{result.playedAt ? new Date(result.playedAt).toLocaleDateString() : 'Pending'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Quiz Time</span>
                    <span className={`font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{result.playedAt ? new Date(result.playedAt).toLocaleTimeString() : 'Pending'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Questions</span>
                    <span className={`font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{totalQuestions}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Players</span>
                    <span className={`font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{totalPlayers}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Correct Answers', value: `${avgCorrect} / ${totalQuestions}`, icon: <CheckCircle className="h-5 w-5 text-emerald-500" />, accent: isDark ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300' : 'border-emerald-200 bg-emerald-50 text-emerald-700' },
              { label: 'Incorrect Answers', value: playerSummaries.reduce((sum, player) => sum + player.wrong, 0), icon: <XCircle className="h-5 w-5 text-rose-500" />, accent: isDark ? 'border-rose-500/20 bg-rose-500/10 text-rose-300' : 'border-rose-200 bg-rose-50 text-rose-700' },
              { label: 'Not Submitted', value: playerSummaries.reduce((sum, player) => sum + player.unanswered, 0), icon: <AlertCircle className="h-5 w-5 text-amber-500" />, accent: isDark ? 'border-amber-500/20 bg-amber-500/10 text-amber-300' : 'border-amber-200 bg-amber-50 text-amber-700' },
              { label: 'Average Score', value: `${Math.round(playerSummaries.reduce((sum, player) => sum + player.totalScore, 0) / Math.max(totalPlayers, 1))} pts`, icon: <Trophy className="h-5 w-5 text-blue-500" />, accent: isDark ? 'border-blue-500/20 bg-blue-500/10 text-blue-300' : 'border-blue-200 bg-blue-50 text-blue-700' },
            ].map((card, idx) => (
              <div key={idx} className={`rounded-2xl border p-5 shadow-sm ${isDark ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-white'}`}>
                <div className="flex items-center justify-between">
                  <div className={`rounded-xl p-2 ${card.accent}`}>{card.icon}</div>
                  <span className={`text-[10px] font-semibold uppercase tracking-[0.24em] ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{card.label}</span>
                </div>
                <p className={`mt-5 text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{card.value}</p>
              </div>
            ))}
          </div>

          <div className={`rounded-[28px] border p-6 shadow-sm ${isDark ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-white'}`}>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className={`h-5 w-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                <h3 className={`text-sm font-semibold uppercase tracking-[0.28em] ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Player Rankings</h3>
              </div>
              <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Live score breakdown</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className={`border-b text-xs uppercase tracking-[0.24em] ${isDark ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-500'}`}>
                    <th className="px-3 py-3">Rank</th>
                    <th className="px-3 py-3">Player</th>
                    <th className="px-3 py-3 text-center">Correct</th>
                    <th className="px-3 py-3 text-center">Incorrect</th>
                    <th className="px-3 py-3 text-center">Not Submitted</th>
                    <th className="px-3 py-3 text-center">Score</th>
                    <th className="px-3 py-3 text-center">%</th>
                  </tr>
                </thead>
                <tbody>
                  {playerSummaries.map((player) => (
                    <tr key={player.rank} className={`border-b transition hover:opacity-90 ${isDark ? 'border-slate-800 hover:bg-slate-800/60' : 'border-slate-200 hover:bg-slate-50'}`}>
                      <td className={`px-3 py-3 font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{player.rank === 1 ? <Crown className="inline h-4 w-4 text-yellow-500" /> : player.rank === 2 ? <Medal className="inline h-4 w-4 text-slate-400" /> : player.rank === 3 ? <Medal className="inline h-4 w-4 text-amber-600" /> : `#${player.rank}`}</td>
                      <td className={`px-3 py-3 font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{player.name}</td>
                      <td className={`px-3 py-3 text-center ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{player.correct}</td>
                      <td className={`px-3 py-3 text-center ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>{player.wrong}</td>
                      <td className={`px-3 py-3 text-center ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>{player.unanswered}</td>
                      <td className={`px-3 py-3 text-center font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{player.totalScore} pts</td>
                      <td className={`px-3 py-3 text-center font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{player.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={`rounded-[28px] border p-6 shadow-sm ${isDark ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-white'}`}>
            <div className="mb-4 flex items-center gap-2">
              <FileSpreadsheet className={`h-5 w-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              <h3 className={`text-sm font-semibold uppercase tracking-[0.28em] ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Fastest Correct Solvers</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {questionHighlights.map((hl, idx) => (
                <div key={idx} className={`rounded-2xl border p-4 ${isDark ? 'border-slate-800 bg-slate-950/70' : 'border-slate-200 bg-slate-50'}`}>
                  <p className={`text-[10px] font-semibold uppercase tracking-[0.24em] ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Question {hl.questionNumber}</p>
                  <p className={`mt-2 font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{hl.fastestPlayer ? hl.fastestPlayer.name : 'No correct answers'}</p>
                  {hl.fastestPlayer && <p className={`mt-1 text-sm ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>{hl.fastestPlayer.timeTaken}s</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
