import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BarChart3, ArrowLeft, Loader2, Download, Trophy,
  CheckCircle, XCircle, AlertCircle, FileSpreadsheet, FileText, Crown, Medal,
  Menu, Search, Settings, LogOut, ChevronDown, Check, X, Pencil
} from 'lucide-react';
import toast from 'react-hot-toast';
import AnimatedPage from '../components/AnimatedPage';
import AppSidebar from '../components/AppSidebar';
import TopHeader from '../components/TopHeader';
import HostProfileModal from '../components/HostProfileModal';
import PlanComparisonTable from '../components/PlanComparisonTable';
import { getResultBySession, updatePlayerMobile } from '../services/resultService';
import { clearAuthSession, getStoredUser } from '../utils/auth';
import { useScrollLock } from '../utils/scrollLock';

const isUnansweredAnswer = (answer) => {
  const value = answer?.answerIndex;
  return value === null || value === undefined || value === '' || value === -1 || Number.isNaN(Number(value));
};

const getSubmittedAnswers = (answers = []) => (answers || []).filter((answer) => !isUnansweredAnswer(answer));

export default function ResultsAnalytics() {
  const { sessionId } = useParams();
  const id = sessionId;
  const navigate = useNavigate();

  const [user, setUser] = useState(() => getStoredUser());
  const [activeModal, setActiveModal] = useState(null); // 'profile' | 'upgrade' | null
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [headerSearch, setHeaderSearch] = useState('');
  const profileDropdownRef = useRef(null);

  // Lock background scroll when analytics modal is active
  useScrollLock(Boolean(activeModal));

  // Sync stored user profile across windows & storage
  useEffect(() => {
    const handleProfileSync = (e) => {
      if (e && 'detail' in e) {
        setUser(e.detail);
      } else {
        setUser(getStoredUser());
      }
    };
    window.addEventListener('user-profile-updated', handleProfileSync);
    window.addEventListener('storage', handleProfileSync);
    return () => {
      window.removeEventListener('user-profile-updated', handleProfileSync);
      window.removeEventListener('storage', handleProfileSync);
    };
  }, []);

  // Dismiss profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const queryClient = useQueryClient();
  const [editingPlayerName, setEditingPlayerName] = useState(null);
  const [phoneInput, setPhoneInput] = useState('');
  const [isSavingPhone, setIsSavingPhone] = useState(false);

  const startEditPhone = (player) => {
    setEditingPlayerName(player.name || player.fullName);
    setPhoneInput(player.mobileNumber || player.phone || player.phoneNumber || '');
  };

  const handleSavePhone = async (player) => {
    const cleanNum = phoneInput.trim();
    if (cleanNum && !/^[0-9]{10}$/.test(cleanNum)) {
      toast.error('Mobile number must be a 10-digit number');
      return;
    }
    setIsSavingPhone(true);
    try {
      const pName = player.name || player.fullName;
      const res = await updatePlayerMobile(id, pName, cleanNum);
      if (res.success) {
        queryClient.setQueryData(['result-details', id], (old) => {
          if (!old?.result) return old;
          const updatedPlayers = (old.result.players || []).map(p => {
            const matches = (p.name === pName || p.fullName === pName);
            return matches ? { ...p, mobileNumber: cleanNum } : p;
          });
          return { ...old, result: { ...old.result, players: updatedPlayers } };
        });
        toast.success(`Updated phone number for ${player.fullName || pName}!`);
        setEditingPlayerName(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update phone number');
    } finally {
      setIsSavingPhone(false);
    }
  };

  const userInitial = (user?.name || user?.fullName || 'U').charAt(0).toUpperCase();
  const userName = user?.name || user?.fullName || 'User';

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
    const fullName = player.fullName || player.name || player.username || `Player ${index + 1}`;
    const nickname = player.nickname || player.name || fullName;
    const mobileNumber = player.mobileNumber || player.phone || player.phoneNumber || player.mobile || player.contactNumber || '';

    return {
      ...player,
      rank: player.rank || index + 1,
      name: fullName,
      fullName: fullName,
      nickname: nickname,
      mobileNumber: mobileNumber,
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
      lines.push('=== Gubbi REPORT ===');
      if (result.organizationName) {
        lines.push(`Organization Name,${escapeCSV(result.organizationName)}`);
      }
      lines.push(`Quiz Title,${escapeCSV(result.quizTitle || 'Gubbi Match')}`);
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
      lines.push(['Rank', 'Full Name', 'Phone / Mobile Number', 'Nickname', 'Correct Answers', 'Wrong Answers', 'Not Answered', 'Accuracy (%)', 'Total Score'].map(escapeCSV).join(','));

      // Standings Rows
      if (playerSummaries.length > 0) {
        playerSummaries.forEach((p) => {
          const playerAccuracy = totalQuestions ? Math.round((p.correct / totalQuestions) * 100) + '%' : '0%';
          lines.push([
            p.rank,
            p.fullName,
            p.mobileNumber || 'N/A',
            p.nickname,
            p.correct,
            p.wrong,
            p.unanswered,
            playerAccuracy,
            p.totalScore
          ].map(escapeCSV).join(','));
        });
      } else {
        lines.push(['-', 'No player data recorded', 'N/A', '-', '0', '0', '0', '0%', '0'].map(escapeCSV).join(','));
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
      const prefix = result.organizationName ? result.organizationName.replace(/[^a-zA-Z0-9_-]/g, '_') : 'Gubbi';
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

  // ── Excel (.xlsx) Export ──────────────────────────────────────────────────
  const handleExportExcel = async () => {
    if (!result) {
      toast.error('No result data loaded yet');
      return;
    }

    try {
      toast.loading('Preparing Excel spreadsheet...', { id: 'export-excel' });
      const XLSX = await import('xlsx');

      const title = result.quizTitle || 'Quiz Match';
      const category = result.quizCategory || result.quiz?.category || 'General';
      const playedDate = result.playedAt ? new Date(result.playedAt).toLocaleString() : new Date().toLocaleString();

      // 1. Standings Data
      const standingsData = playerSummaries.map((p) => {
        const playerAccuracy = totalQuestions ? Math.round((p.correct / totalQuestions) * 100) + '%' : '0%';
        return {
          'Rank': p.rank,
          'Full Name': p.fullName,
          'Phone / Mobile Number': p.mobileNumber || 'Not provided',
          'Nickname': p.nickname || p.fullName,
          'Correct Answers': p.correct,
          'Wrong Answers': p.wrong,
          'Not Answered': p.unanswered,
          'Accuracy': playerAccuracy,
          'Final Score (pts)': p.totalScore,
        };
      });

      // 2. Summary Overview Data
      const overviewData = [
        { 'Metric': 'Quiz Title', 'Value': title },
        { 'Metric': 'Category', 'Value': category },
        { 'Metric': 'Organization', 'Value': result.organizationName || 'N/A' },
        { 'Metric': 'Winner', 'Value': winnerName },
        { 'Metric': 'Played Date', 'Value': playedDate },
        { 'Metric': 'Total Questions', 'Value': totalQuestions },
        { 'Metric': 'Total Players', 'Value': totalPlayers },
        { 'Metric': 'Average Correct', 'Value': `${avgCorrect} / ${totalQuestions}` },
        { 'Metric': 'Lobby Accuracy', 'Value': `${accuracy}%` },
      ];

      // 3. Highlights Data
      const highlightsData = questionHighlights.map((hl) => ({
        'Question': `Question ${hl.questionNumber}`,
        'Fastest Solver': hl.fastestPlayer ? hl.fastestPlayer.name : 'No correct answers',
        'Time Taken': hl.fastestPlayer ? `${hl.fastestPlayer.timeTaken}s` : 'N/A'
      }));

      const wb = XLSX.utils.book_new();

      const wsStandings = XLSX.utils.json_to_sheet(standingsData);
      const wsOverview = XLSX.utils.json_to_sheet(overviewData);
      const wsHighlights = XLSX.utils.json_to_sheet(highlightsData);

      // Auto-fit column widths
      wsStandings['!cols'] = [
        { wch: 8 },  // Rank
        { wch: 26 }, // Full Name
        { wch: 22 }, // Mobile Number
        { wch: 18 }, // Nickname
        { wch: 16 }, // Correct
        { wch: 16 }, // Wrong
        { wch: 16 }, // Unanswered
        { wch: 12 }, // Accuracy
        { wch: 18 }, // Final Score
      ];

      XLSX.utils.book_append_sheet(wb, wsStandings, 'Player Standings');
      XLSX.utils.book_append_sheet(wb, wsOverview, 'Match Overview');
      XLSX.utils.book_append_sheet(wb, wsHighlights, 'Question Highlights');

      const cleanTitle = (result.quizTitle || 'Battle_Report').replace(/[^a-zA-Z0-9_-]/g, '_');
      const prefix = result.organizationName ? result.organizationName.replace(/[^a-zA-Z0-9_-]/g, '_') : 'Gubbi';
      const fileName = `${prefix}_${cleanTitle}_${id ? id.slice(-6) : 'report'}.xlsx`;

      XLSX.writeFile(wb, fileName);
      toast.success('Excel (.xlsx) report exported successfully!', { id: 'export-excel' });
    } catch (err) {
      console.error('Excel Export error:', err);
      toast.error('Error generating Excel document', { id: 'export-excel' });
    }
  };

  // ── PDF Export ────────────────────────────────────────────────────────────
  const handleExportPDF = async () => {
    if (!result) {
      toast.error('No result data loaded yet');
      return;
    }

    try {
      toast.loading('Preparing PDF report...', { id: 'export-pdf' });

      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default || jsPDFModule;

      const autoTableModule = await import('jspdf-autotable');
      const autoTable = autoTableModule.default || autoTableModule.autoTable || autoTableModule;

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();
      const margin = 14;

      const runTable = (tableOptions) => {
        if (typeof autoTable === 'function') {
          autoTable(doc, tableOptions);
        } else if (typeof doc.autoTable === 'function') {
          doc.autoTable(tableOptions);
        } else if (autoTableModule && typeof autoTableModule.default === 'function') {
          autoTableModule.default(doc, tableOptions);
        } else {
          console.error('autoTable plugin method not found');
        }
      };

      // ── Brand Header ────────────────────────────────────────────
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(30, 41, 59);
      doc.text('Gubbi', margin, 20);

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
        const valLines = doc.splitTextToSize(String(val || ''), maxValWidth);
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
            p.fullName,
            p.mobileNumber || 'N/A',
            String(p.correct || 0),
            String(p.wrong || 0),
            String(p.unanswered || 0),
            `${p.totalScore || 0} pts`,
          ];
        })
        : [['-', 'No players recorded', 'N/A', '0', '0', '0', '0 pts']];

      runTable({
        startY: cursorY,
        head: [['Rank', 'Full Name', 'Phone / Mobile', 'Correct', 'Wrong', 'Not Answered', 'Final Score']],
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
        if (cursorY > doc.internal.pageSize.getHeight() - 40) {
          doc.addPage();
          cursorY = 20;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(30, 41, 59);
        doc.text('FASTEST CORRECT SOLVERS', margin, cursorY);
        cursorY += 4;

        runTable({
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
      const totalPages = typeof doc.getNumberOfPages === 'function'
        ? doc.getNumberOfPages()
        : (doc.internal ? doc.internal.getNumberOfPages() : 1);

      for (let pg = 1; pg <= totalPages; pg++) {
        doc.setPage(pg);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);

        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.5);
        doc.line(margin, doc.internal.pageSize.getHeight() - 15, pageW - margin, doc.internal.pageSize.getHeight() - 15);

        doc.text(
          `Gubbi  •  Generated ${new Date().toLocaleString()}  •  Page ${pg} of ${totalPages}`,
          pageW / 2,
          doc.internal.pageSize.getHeight() - 8,
          { align: 'center' }
        );
      }

      const cleanTitle = (result.quizTitle || 'Battle_Report').replace(/[^a-zA-Z0-9_-]/g, '_');
      const prefix = result.organizationName ? result.organizationName.replace(/[^a-zA-Z0-9_-]/g, '_') : 'Gubbi';
      const fileName = `${prefix}_${cleanTitle}_${id ? id.slice(-6) : 'report'}.pdf`;

      doc.save(fileName);
      toast.success('PDF report downloaded!', { id: 'export-pdf' });
    } catch (err) {
      console.error('PDF Export error:', err);
      toast.error('Error generating PDF report', { id: 'export-pdf' });
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

      const {
        Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        WidthType, AlignmentType, HeadingLevel, ShadingType
      } = await import('docx');

      const title = result.quizTitle || 'Gubbi Match';
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
                  text: 'Gubbi',
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
                  children: ['Rank', 'Full Name', 'Phone / Mobile Number', 'Correct', 'Wrong', 'Not Answered', 'Final Score'].map((headerText, i) =>
                    new TableCell({
                      children: [
                        new Paragraph({
                          alignment: i === 1 ? AlignmentType.LEFT : i === 6 ? AlignmentType.RIGHT : AlignmentType.CENTER,
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
                          children: [new Paragraph({ children: [new TextRun({ text: p.fullName, bold: true, size: 18 })] })],
                          shading: { fill: idx % 2 === 0 ? 'FFFFFF' : 'F8FAFC', type: ShadingType.CLEAR, color: 'auto' },
                        }),
                        new TableCell({
                          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: p.mobileNumber || 'N/A', size: 16 })] })],
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
                          columnSpan: 7,
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
                  text: 'Gubbi • Official Multiplayer Battle Report',
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
      const prefix = result.organizationName ? result.organizationName.replace(/[^a-zA-Z0-9_-]/g, '_') : 'Gubbi';
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

  return (
    <AnimatedPage>
      <div className={`min-h-screen flex flex-col font-['Inter',sans-serif] antialiased selection:bg-[#6320EE]/20 selection:text-[#6320EE] overflow-x-clip ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-[#FDFDFE] text-slate-800'}`}>
        {/* ─── APP SIDEBAR (Canonical Component) ─── */}
        <AppSidebar
          isOpen={isMobileNavOpen}
          onClose={() => setIsMobileNavOpen(false)}
          onOpenProfile={() => setActiveModal('profile')}
          onOpenUpgrade={() => setActiveModal('upgrade')}
          activeNav="reports"
        />

        {/* ─── MAIN CONTENT WRAPPER (Shifted by 230px on desktop) ─── */}
        <div className="flex-1 flex flex-col lg:pl-[230px] w-full min-w-0 transition-all">

          {/* TOP HEADER (Exact Figma CSS specifications, Fixed/Sticky on Scroll) */}
          <TopHeader
            searchQuery={headerSearch}
            onSearchChange={setHeaderSearch}
            onOpenMobileNav={() => setIsMobileNavOpen(true)}
            onOpenProfile={() => setActiveModal('profile')}
            onOpenUpgrade={() => setActiveModal('upgrade')}
            user={user}
          />

          {/* MAIN BODY CONTENT */}
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center min-h-[60vh]">
              <div className="text-center space-y-4">
                <Loader2 className="h-10 w-10 animate-spin mx-auto text-[#6320EE]" />
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>Compiling analytics report...</p>
              </div>
            </div>
          ) : error || !result ? (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
              <BarChart3 className="h-12 w-12 mb-4 text-[#6320EE]" />
              <h2 className={`font-outfit text-xl font-bold ${isDark ? 'text-white' : 'text-[#1E1B4B]'}`}>Report Not Found</h2>
              <p className={`text-sm mt-1 max-w-[280px] ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
                The requested battle logs could not be loaded. Please return to the dashboard.
              </p>
              <div className="flex items-center gap-3 mt-5">
                <button onClick={() => navigate('/reports')} className="px-4 py-2.5 text-xs font-bold rounded-xl bg-[#6320EE] hover:bg-[#5827e8] text-white transition-all shadow-sm cursor-pointer">
                  Back to Reports
                </button>
                <button onClick={() => navigate('/dashboard')} className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-[#475569] hover:bg-slate-200'}`}>
                  Go to Dashboard
                </button>
              </div>
            </div>
          ) : (
            <main className="flex-1 p-3.5 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-[1280px] w-full mx-auto text-left">
              {/* Main Top Card */}
              <div className={`rounded-2xl sm:rounded-[28px] border p-4 sm:p-6 lg:p-8 shadow-[0px_4px_24px_-2px_rgba(99,32,238,0.06),0px_2px_8px_-1px_rgba(0,0,0,0.03)] ${isDark ? 'border-slate-800 bg-slate-900/90' : 'border-[#F1F5F9] bg-white'}`}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => { if (window.history.state && window.history.state.idx > 0) { navigate(-1); } else { navigate('/reports'); } }} className={`rounded-xl p-2 transition cursor-pointer shrink-0 ${isDark ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-[#FAF5FF] text-[#6320EE] hover:bg-[#F3E8FF] border border-[#EDE9FE]'}`} aria-label="Back">
                        <ArrowLeft className="h-4 w-4" />
                      </button>
                      <span className={`rounded-full px-3 py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider whitespace-nowrap ${isDark ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20' : 'bg-[#FAF5FF] text-[#6320EE] border border-[#EDE9FE]'}`}>
                        {result.quizTitle ? 'Performance Report' : 'Battle Report'}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h1 className={`font-outfit text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight break-words ${isDark ? 'text-white' : 'text-[#1E1B4B]'}`}>{result.quizTitle || 'Quiz Match'}</h1>
                      <div className={`flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
                        <span className={`rounded-lg px-2.5 py-1 ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-[#FAF5FF] text-[#6320EE] border border-[#EDE9FE]'}`}>Category: <span className="font-bold">{result.quizCategory || result.quiz?.category || 'General'}</span></span>
                        <span className={`rounded-lg px-2.5 py-1 ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-[#F5F3FF] text-[#7C3AED] border border-[#EDE9FE]'}`}>Player: <span className="font-bold">{winnerName}</span></span>
                        <span className={`rounded-lg px-2.5 py-1 ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600 border border-slate-200/60'}`}>Date: <span className="font-bold">{result.playedAt ? new Date(result.playedAt).toLocaleDateString() : 'N/A'}</span></span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons: Exports (2x2 Grid on Mobile, Flex on Desktop) */}
                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full lg:w-auto pt-1 lg:pt-0">
                    <button onClick={handleExportExcel} className={`flex items-center justify-center gap-1.5 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-bold transition cursor-pointer hover:scale-105 active:scale-95 shadow-2xs ${isDark ? 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/60 border border-emerald-700/50' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'}`}>
                      <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="truncate">Excel (.xlsx)</span>
                    </button>
                    <button onClick={handleExportCSV} className={`flex items-center justify-center gap-1.5 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-bold transition cursor-pointer hover:scale-105 active:scale-95 shadow-2xs ${isDark ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-[#FAF5FF] text-[#6320EE] hover:bg-[#F3E8FF] border border-[#E9D5FF]'}`}>
                      <FileSpreadsheet className="h-4 w-4 text-[#6320EE] shrink-0" />
                      <span>CSV</span>
                    </button>
                    <button onClick={handleExportWord} className={`flex items-center justify-center gap-1.5 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-bold transition cursor-pointer hover:scale-105 active:scale-95 shadow-2xs ${isDark ? 'bg-purple-900/40 text-purple-200 hover:bg-purple-900/60 border border-purple-700/50' : 'bg-[#FAF5FF] text-[#6320EE] hover:bg-[#F3E8FF] border border-[#E9D5FF]'}`}>
                      <FileText className="h-4 w-4 text-[#6320EE] shrink-0" />
                      <span className="truncate">Word (.docx)</span>
                    </button>
                    <button onClick={handleExportPDF} className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#6320EE] to-[#7C3AED] hover:from-[#5827e8] hover:to-[#6d28d9] px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-bold text-white transition hover:opacity-95 shadow-md shadow-[#6320EE]/20 cursor-pointer hover:scale-105 active:scale-95">
                      <Download className="h-4 w-4 shrink-0" />
                      <span>Export PDF</span>
                    </button>
                  </div>
                </div>

                <div className="mt-4 sm:mt-6 grid gap-3 sm:gap-4 lg:grid-cols-[1.4fr_0.8fr]">
                  {/* Performance Snapshot */}
                  <div className={`rounded-xl sm:rounded-2xl border p-4 sm:p-6 ${isDark ? 'border-slate-800 bg-slate-950/70' : 'border-[#F3E8FF] bg-gradient-to-br from-[#FAF5FF]/80 via-white to-[#FAF5FF]/40'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-[10px] font-bold uppercase tracking-[0.25em] ${isDark ? 'text-purple-400' : 'text-[#7C3AED]'}`}>Quiz Summary</p>
                        <h2 className={`mt-0.5 sm:mt-1 text-lg sm:text-xl font-bold font-outfit ${isDark ? 'text-white' : 'text-[#1E1B4B]'}`}>Performance Snapshot</h2>
                      </div>
                      <div className={`rounded-full px-2.5 sm:px-3.5 py-1 text-xs font-bold ${isDark ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20' : 'bg-[#FAF5FF] text-[#6320EE] border border-[#EDE9FE]'}`}>
                        {accuracy}% accuracy
                      </div>
                    </div>

                    <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4">
                      <div>
                        <div className="mb-1.5 sm:mb-2 flex items-center justify-between text-xs sm:text-sm">
                          <span className={`font-medium ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>Completion</span>
                          <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-[#1E1B4B]'}`}>{completionPercentage}%</span>
                        </div>
                        <div className={`h-2.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-[#EDE9FE]'}`}>
                          <div className="h-2.5 rounded-full bg-gradient-to-r from-[#6320EE] via-[#7C3AED] to-[#A855F7]" style={{ width: `${completionPercentage}%` }} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                        <div className={`rounded-lg sm:rounded-xl border p-3 sm:p-3.5 shadow-2xs ${isDark ? 'border-slate-800 bg-slate-900' : 'border-[#F3E8FF] bg-white'}`}>
                          <p className={`text-[10px] uppercase font-bold tracking-[0.25em] ${isDark ? 'text-purple-400' : 'text-[#7C3AED]'}`}>Final Score</p>
                          <p className={`mt-1 text-lg sm:text-xl font-black ${isDark ? 'text-purple-300' : 'text-[#6320EE]'}`}>{playerSummaries[0]?.totalScore || 0} pts</p>
                        </div>
                        <div className={`rounded-lg sm:rounded-xl border p-3.5 shadow-2xs ${isDark ? 'border-slate-800 bg-slate-900' : 'border-[#F1F5F9] bg-white'}`}>
                          <p className={`text-[10px] uppercase font-bold tracking-[0.25em] ${isDark ? 'text-slate-500' : 'text-[#64748B]'}`}>Rank</p>
                          <p className={`mt-1 text-lg sm:text-xl font-black ${isDark ? 'text-white' : 'text-[#1E1B4B]'}`}>#{playerSummaries[0]?.rank || 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Facts */}
                  <div className={`rounded-xl sm:rounded-2xl border p-4 sm:p-6 ${isDark ? 'border-slate-800 bg-slate-950/70' : 'border-[#F1F5F9] bg-[#FAFAFC]'}`}>
                    <p className={`text-[10px] font-bold uppercase tracking-[0.25em] ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>Quick Facts</p>
                    <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3 text-xs sm:text-sm">
                      <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                        <span className={isDark ? 'text-slate-400' : 'text-[#64748B]'}>Quiz Date</span>
                        <span className={`font-bold ${isDark ? 'text-slate-100' : 'text-[#1E1B4B]'}`}>{result.playedAt ? new Date(result.playedAt).toLocaleDateString() : 'Pending'}</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                        <span className={isDark ? 'text-slate-400' : 'text-[#64748B]'}>Quiz Time</span>
                        <span className={`font-bold ${isDark ? 'text-slate-100' : 'text-[#1E1B4B]'}`}>{result.playedAt ? new Date(result.playedAt).toLocaleTimeString() : 'Pending'}</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                        <span className={isDark ? 'text-slate-400' : 'text-[#64748B]'}>Questions</span>
                        <span className={`font-bold ${isDark ? 'text-slate-100' : 'text-[#1E1B4B]'}`}>{totalQuestions}</span>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <span className={isDark ? 'text-slate-400' : 'text-[#64748B]'}>Players</span>
                        <span className={`font-bold ${isDark ? 'text-slate-100' : 'text-[#1E1B4B]'}`}>{totalPlayers}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4 Stat Metric Cards */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-2.5 sm:gap-4">
                {[
                  { label: 'Correct Answers', value: `${avgCorrect} / ${totalQuestions}`, icon: <CheckCircle className="h-4 sm:h-5 w-4 sm:w-5 text-emerald-500" />, accent: isDark ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300' : 'border-emerald-200 bg-emerald-50 text-emerald-700' },
                  { label: 'Incorrect Answers', value: playerSummaries.reduce((sum, player) => sum + player.wrong, 0), icon: <XCircle className="h-4 sm:h-5 w-4 sm:w-5 text-rose-500" />, accent: isDark ? 'border-rose-500/20 bg-rose-500/10 text-rose-300' : 'border-rose-200 bg-rose-50 text-rose-700' },
                  { label: 'Not Submitted', value: playerSummaries.reduce((sum, player) => sum + player.unanswered, 0), icon: <AlertCircle className="h-4 sm:h-5 w-4 sm:w-5 text-amber-500" />, accent: isDark ? 'border-amber-500/20 bg-amber-500/10 text-amber-300' : 'border-amber-200 bg-amber-50 text-amber-700' },
                  { label: 'Average Score', value: `${Math.round(playerSummaries.reduce((sum, player) => sum + player.totalScore, 0) / Math.max(totalPlayers, 1))} pts`, icon: <Trophy className="h-4 sm:h-5 w-4 sm:w-5 text-[#6320EE]" />, accent: isDark ? 'border-purple-500/20 bg-purple-500/10 text-purple-300' : 'border-[#EDE9FE] bg-[#FAF5FF] text-[#6320EE]' },
                ].map((card, idx) => (
                  <div key={idx} className={`rounded-xl sm:rounded-2xl border p-3.5 sm:p-5 shadow-xs ${isDark ? 'border-slate-800 bg-slate-900/90' : 'border-[#F1F5F9] bg-white'}`}>
                    <div className="flex items-center justify-between gap-1">
                      <div className={`rounded-lg sm:rounded-xl p-2 sm:p-2.5 border ${card.accent}`}>{card.icon}</div>
                      <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-right truncate ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>{card.label}</span>
                    </div>
                    <p className={`mt-3 sm:mt-5 text-lg sm:text-2xl font-black ${isDark ? 'text-white' : 'text-[#1E1B4B]'}`}>{card.value}</p>
                  </div>
                ))}
              </div>

              {/* Player Rankings Table & Mobile Cards */}
              <div className={`rounded-2xl sm:rounded-[28px] border p-4 sm:p-6 lg:p-8 shadow-[0px_4px_24px_-2px_rgba(99,32,238,0.06),0px_2px_8px_-1px_rgba(0,0,0,0.03)] ${isDark ? 'border-slate-800 bg-slate-900/90' : 'border-[#F1F5F9] bg-white'}`}>
                <div className="mb-4 sm:mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-2.5">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#FAF5FF] flex items-center justify-center">
                      <Trophy className="h-4 w-4 text-[#6320EE]" />
                    </div>
                    <h3 className={`text-xs sm:text-sm font-bold uppercase tracking-wider ${isDark ? 'text-slate-200' : 'text-[#1E1B4B]'}`}>Player Rankings</h3>
                  </div>
                  <span className={`text-[11px] sm:text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>Live score breakdown</span>
                </div>

                {/* Mobile Player Cards (< md) */}
                <div className="md:hidden space-y-2.5">
                  {playerSummaries.map((player) => (
                    <div
                      key={player.rank}
                      className={`rounded-2xl border p-3.5 space-y-2.5 shadow-2xs ${isDark
                          ? 'border-slate-800 bg-slate-950/70'
                          : 'border-[#F3E8FF] bg-[#FAF5FF]/30'
                        }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 flex items-center justify-center shrink-0 text-xs font-black shadow-2xs">
                            {player.rank === 1 ? (
                              <Crown className="h-4 w-4 text-yellow-500 drop-shadow-2xs" />
                            ) : player.rank === 2 ? (
                              <Medal className="h-4 w-4 text-slate-400" />
                            ) : player.rank === 3 ? (
                              <Medal className="h-4 w-4 text-amber-600" />
                            ) : (
                              `#${player.rank}`
                            )}
                          </span>
                          <div className="min-w-0">
                            <p className={`font-bold text-xs sm:text-sm truncate ${isDark ? 'text-white' : 'text-[#1E1B4B]'}`}>
                              {player.fullName}
                            </p>
                            {editingPlayerName === (player.name || player.fullName) ? (
                              <div className="flex items-center gap-1 mt-1">
                                <input
                                  type="tel"
                                  maxLength={10}
                                  value={phoneInput}
                                  onChange={(e) => setPhoneInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                                  placeholder="10-digit phone"
                                  className="w-28 px-1.5 py-0.5 text-[11px] font-mono rounded border border-purple-300 dark:border-purple-600 bg-white dark:bg-slate-800 focus:outline-none"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSavePhone(player);
                                    if (e.key === 'Escape') setEditingPlayerName(null);
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSavePhone(player)}
                                  disabled={isSavingPhone}
                                  className="p-1 text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingPlayerName(null)}
                                  disabled={isSavingPhone}
                                  className="p-1 text-slate-400"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : player.mobileNumber ? (
                              <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                                <span>{player.mobileNumber}</span>
                                <button
                                  type="button"
                                  onClick={() => startEditPhone(player)}
                                  className="text-slate-400 hover:text-[#6320EE] p-0.5"
                                  title="Edit phone"
                                >
                                  <Pencil className="w-2.5 h-2.5" />
                                </button>
                              </p>
                            ) : (
                              <div className="flex items-center gap-1 mt-0.5">
                                {player.nickname && player.nickname !== player.fullName ? (
                                  <span className="text-[10px] text-slate-400 truncate">
                                    aka {player.nickname}
                                  </span>
                                ) : (
                                  <span className="text-[10px] italic text-slate-400">No phone</span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => startEditPhone(player)}
                                  className="text-[10px] font-bold text-[#6320EE] dark:text-purple-400 hover:underline flex items-center gap-0.5 ml-1"
                                >
                                  <Pencil className="w-2.5 h-2.5" />
                                  <span>Add</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs sm:text-sm font-black text-[#6320EE] dark:text-purple-400 block">
                            {player.totalScore} pts
                          </span>
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block">
                            {player.percentage}% acc
                          </span>
                        </div>
                      </div>

                      {/* Mini score breakdown strip */}
                      <div className="grid grid-cols-3 gap-1.5 text-center pt-2 border-t border-slate-100 dark:border-slate-800 text-[10.5px] font-bold">
                        <div className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 py-1 rounded-md">
                          <span>{player.correct}</span> Correct
                        </div>
                        <div className="bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 py-1 rounded-md">
                          <span>{player.wrong}</span> Wrong
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 py-1 rounded-md">
                          <span>{player.unanswered}</span> Missed
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table (>= md) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className={`border-b text-xs font-bold uppercase tracking-[0.2em] ${isDark ? 'border-slate-800 text-slate-400' : 'border-[#F1F5F9] text-[#64748B]'}`}>
                        <th className="px-3.5 py-3">Rank</th>
                        <th className="px-3.5 py-3">Full Name</th>
                        <th className="px-3.5 py-3">Phone / Mobile</th>
                        <th className="px-3.5 py-3 text-center">Correct</th>
                        <th className="px-3.5 py-3 text-center">Incorrect</th>
                        <th className="px-3.5 py-3 text-center">Not Submitted</th>
                        <th className="px-3.5 py-3 text-center">Score</th>
                        <th className="px-3.5 py-3 text-center">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {playerSummaries.map((player) => (
                        <tr key={player.rank} className={`border-b transition hover:opacity-95 ${isDark ? 'border-slate-800 hover:bg-slate-800/60' : 'border-[#F8FAFC] hover:bg-[#FAF5FF]/60'}`}>
                          <td className={`px-3.5 py-3.5 font-bold ${isDark ? 'text-slate-200' : 'text-[#1E1B4B]'}`}>{player.rank === 1 ? <Crown className="inline h-4.5 w-4.5 text-yellow-500 drop-shadow-2xs" /> : player.rank === 2 ? <Medal className="inline h-4 w-4 text-slate-400" /> : player.rank === 3 ? <Medal className="inline h-4 w-4 text-amber-600" /> : `#${player.rank}`}</td>
                          <td className={`px-3.5 py-3.5 font-bold ${isDark ? 'text-white' : 'text-[#1E1B4B]'}`}>
                            <div>
                              <span>{player.fullName}</span>
                              {player.nickname && player.nickname !== player.fullName && (
                                <span className={`block text-xs font-normal ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
                                  aka {player.nickname}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className={`px-3.5 py-3.5 ${isDark ? 'text-slate-300' : 'text-[#475569]'}`}>
                            {editingPlayerName === (player.name || player.fullName) ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="tel"
                                  maxLength={10}
                                  value={phoneInput}
                                  onChange={(e) => setPhoneInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                                  placeholder="10-digit number"
                                  className="w-28 px-2 py-1 text-xs font-mono rounded border border-purple-300 dark:border-purple-600 bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-[#6320EE]"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSavePhone(player);
                                    if (e.key === 'Escape') setEditingPlayerName(null);
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSavePhone(player)}
                                  disabled={isSavingPhone}
                                  className="p-1 text-emerald-600 hover:text-emerald-700 disabled:opacity-50 cursor-pointer"
                                  title="Save phone number"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingPlayerName(null)}
                                  disabled={isSavingPhone}
                                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                                  title="Cancel"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 group/phone">
                                {player.mobileNumber ? (
                                  <span className="font-mono text-xs font-medium tracking-wide">{player.mobileNumber}</span>
                                ) : (
                                  <span className={`text-xs italic ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>Not provided</span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => startEditPhone(player)}
                                  className="opacity-0 group-hover/phone:opacity-100 transition-opacity p-1 text-slate-400 hover:text-[#6320EE] rounded cursor-pointer"
                                  title={player.mobileNumber ? "Edit Phone Number" : "Add Phone Number"}
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="px-3.5 py-3.5 text-center font-bold text-emerald-600 dark:text-emerald-400">{player.correct}</td>
                          <td className="px-3.5 py-3.5 text-center font-bold text-rose-600 dark:text-rose-400">{player.wrong}</td>
                          <td className="px-3.5 py-3.5 text-center font-bold text-amber-600 dark:text-amber-400">{player.unanswered}</td>
                          <td className="px-3.5 py-3.5 text-center font-black text-[#6320EE] dark:text-purple-400">{player.totalScore} pts</td>
                          <td className={`px-3.5 py-3.5 text-center font-black ${isDark ? 'text-slate-200' : 'text-[#1E1B4B]'}`}>{player.percentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Fastest Correct Solvers */}
              <div className={`rounded-2xl sm:rounded-[28px] border p-4 sm:p-6 lg:p-8 shadow-[0px_4px_24px_-2px_rgba(99,32,238,0.06),0px_2px_8px_-1px_rgba(0,0,0,0.03)] ${isDark ? 'border-slate-800 bg-slate-900/90' : 'border-[#F1F5F9] bg-white'}`}>
                <div className="mb-4 sm:mb-5 flex items-center gap-2 sm:gap-2.5">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#FAF5FF] flex items-center justify-center">
                    <FileSpreadsheet className="h-4 w-4 text-[#6320EE]" />
                  </div>
                  <h3 className={`text-xs sm:text-sm font-bold uppercase tracking-wider ${isDark ? 'text-slate-200' : 'text-[#1E1B4B]'}`}>Fastest Correct Solvers</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-4">
                  {questionHighlights.map((hl, idx) => (
                    <div key={idx} className={`rounded-xl sm:rounded-2xl border p-3 sm:p-4 transition-all shadow-2xs ${isDark ? 'border-slate-800 bg-slate-950/70 hover:border-slate-700' : 'border-[#F3E8FF] bg-[#FAF5FF]/60 hover:bg-[#FAF5FF] hover:border-[#DDD6FE]'}`}>
                      <p className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-purple-400' : 'text-[#7C3AED]'}`}>Question {hl.questionNumber}</p>
                      <p className={`mt-1 sm:mt-2 text-xs sm:text-sm font-bold truncate ${isDark ? 'text-white' : 'text-[#1E1B4B]'}`}>{hl.fastestPlayer ? hl.fastestPlayer.name : 'No correct answers'}</p>
                      {hl.fastestPlayer && <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm font-black text-[#6320EE] dark:text-purple-400">{hl.fastestPlayer.timeTaken}s</p>}
                    </div>
                  ))}
                </div>
              </div>
            </main>
          )}
        </div>

        {/* ─── MODALS ─── */}
        {/* Profile Settings Modal */}
        {activeModal === 'profile' && (
          <HostProfileModal
            isOpen={true}
            onClose={() => setActiveModal(null)}
            onUpdated={(updated) => setUser(updated)}
          />
        )}

        {/* Upgrade Plan Modal */}
        {activeModal === 'upgrade' && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/70 backdrop-blur-xs animate-fade-in">
            <div className="relative my-auto rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 bg-white text-slate-900 text-left">
              <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-purple-50 via-white to-purple-50">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-100 text-amber-600 rounded-xl shadow-xs">
                    <Crown className="h-5 w-5 fill-amber-500 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">Upgrade to Gubbi Pro</h3>
                    <p className="text-xs text-slate-500">Unlock unlimited multiplayer rooms, export reports, and custom trivia sets.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Pro Plan Card */}
                  <div className="p-5 rounded-2xl border-2 border-[#6C38FF] bg-purple-50/30 flex flex-col justify-between space-y-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full">
                        Educator Pro
                      </span>
                      <h4 className="text-2xl font-black text-slate-900 mt-2">
                        ₹499 <span className="text-xs font-normal text-slate-500">/ month</span>
                      </h4>
                      <p className="text-xs text-slate-600 mt-1">Built for classroom teachers, coaching institutes, and active event hosts.</p>

                      <ul className="mt-4 space-y-2 text-xs text-slate-700">
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Unlimited quiz creation</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Unlimited live multiplayer participants</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> PDF &amp; Excel performance export</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Priority email support</li>
                      </ul>
                    </div>

                    <a
                      href="mailto:info@fouriseindia.com?subject=Gubbi%20Pro%20Upgrade%20Inquiry"
                      className="w-full py-2.5 rounded-xl bg-[#6C38FF] hover:bg-[#5827e8] text-white text-xs font-bold text-center shadow-md transition-all block cursor-pointer"
                    >
                      Contact Sales &amp; Upgrade
                    </a>
                  </div>

                  {/* Free Plan Recap */}
                  <div className="p-5 rounded-2xl border border-slate-200 bg-white flex flex-col justify-between space-y-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                        Free Community
                      </span>
                      <h4 className="text-2xl font-black text-slate-900 mt-2">₹0 <span className="text-xs font-normal text-slate-500">/ forever</span></h4>
                      <p className="text-xs text-slate-500 mt-1">Perfect for casual trivia, weekend hangouts, and testing questions.</p>

                      <ul className="mt-4 space-y-2 text-xs text-slate-600">
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-slate-400 shrink-0" /> Up to 5 custom quizzes</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-slate-400 shrink-0" /> Up to 20 live players per room</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-slate-400 shrink-0" /> Basic web summaries</li>
                      </ul>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold text-center transition-all cursor-pointer"
                    >
                      Keep Current Plan
                    </button>
                  </div>
                </div>

                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-200 px-2.5 py-0.5 rounded-full">
                      Feature Overview
                    </span>
                    <div className="mt-3 overflow-x-auto text-xs">
                      <PlanComparisonTable />
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 text-center">
                    Need custom institutional pricing? Email <span className="font-semibold text-purple-600">info@fouriseindia.com</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AnimatedPage>
  );
}
