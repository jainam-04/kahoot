import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Send, X, Bot, User, Check, Plus, RefreshCw, 
  HelpCircle, Zap, CheckCircle2, ChevronRight, ChevronDown, Sliders,
  Layers, ArrowRight, Clock, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { generateAIQuiz } from '../services/quizService';
import { useTheme } from '../context/ThemeContext';

export default function AIQuizAssistantModal({
  isOpen,
  onClose,
  onAddQuestions,
  onReplaceQuiz
}) {
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';

  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isDiffOpen, setIsDiffOpen] = useState(false);
  const [isCountOpen, setIsCountOpen] = useState(false);

  const diffRef = useRef(null);
  const countRef = useRef(null);

  // Chat conversation state
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: "👋 Hi! I'm your AI Quiz Assistant. Tell me what quiz topic you need (e.g. '5 questions on Solar System' or '10 questions on JavaScript') and I'll generate the formatted question set for you!",
      result: null
    }
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('mobile-dialog-open');
      const timer = setTimeout(() => inputRef.current?.focus(), 150);
      return () => {
        clearTimeout(timer);
        document.body.classList.remove('mobile-dialog-open');
      };
    } else {
      document.body.classList.remove('mobile-dialog-open');
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Close custom dropdowns on click/touch outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (diffRef.current && !diffRef.current.contains(e.target)) {
        setIsDiffOpen(false);
      }
      if (countRef.current && !countRef.current.contains(e.target)) {
        setIsCountOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const difficultyOptions = [
    {
      value: 'easy',
      label: 'Easy',
      desc: 'Quick & casual questions',
      dotColor: 'bg-emerald-500',
    },
    {
      value: 'medium',
      label: 'Medium',
      desc: 'Balanced trivia challenge',
      dotColor: 'bg-amber-500',
    },
    {
      value: 'hard',
      label: 'Hard',
      desc: 'Deep & tricky mastery',
      dotColor: 'bg-rose-500',
    }
  ];

  const countOptions = [
    { value: 3, label: '3 Questions', desc: 'Fast Blitz' },
    { value: 5, label: '5 Questions', desc: 'Standard set (Recommended)' },
    { value: 8, label: '8 Questions', desc: 'Extended test' },
    { value: 10, label: '10 Questions', desc: 'Full challenge' },
    { value: 15, label: '15 Questions', desc: 'Comprehensive match' }
  ];

  const promptSuggestions = [
    { label: '🪐 Solar System & Planets', prompt: 'Quiz on the Solar System and planets' },
    { label: '💻 React & JavaScript', prompt: 'Quiz on modern React and JavaScript fundamentals' },
    { label: '🌍 World Geography', prompt: 'Quiz about world capitals and geography' },
    { label: '🧪 General Science', prompt: 'Quiz on physics, chemistry and human biology' },
    { label: '🏛️ World History Trivia', prompt: 'Quiz about major historical events and civilizations' },
    { label: '🎬 Movies & Pop Culture', prompt: 'Fun pop culture and blockbuster movie trivia quiz' },
  ];

  const handleSendPrompt = async (customPrompt = null, customCount = null, customDiff = null) => {
    const textToSend = (customPrompt || prompt).trim();
    if (!textToSend) {
      toast.error('Please type a topic or prompt for the AI');
      return;
    }

    const countToSend = customCount || questionCount;
    const diffToSend = customDiff || difficulty;

    const userMessageId = Date.now().toString();
    const newUserMessage = {
      id: userMessageId,
      sender: 'user',
      text: textToSend
    };

    setMessages(prev => [...prev, newUserMessage]);
    setPrompt('');
    setIsDiffOpen(false);
    setIsCountOpen(false);
    setIsLoading(true);

    try {
      const response = await generateAIQuiz({
        prompt: textToSend,
        count: countToSend,
        difficulty: diffToSend
      });

      if (response.success && response.questions?.length > 0) {
        // Default select all generated questions
        const allIdxs = response.questions.map((_, i) => i);
        setSelectedIndices(allIdxs);

        const aiMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: `✨ Generated ${response.questions.length} questions for "${response.title || textToSend}" (${response.difficulty || diffToSend} difficulty). You can review, cherry-pick, and add them directly to your quiz:`,
          result: response
        };
        setMessages(prev => [...prev, aiMessage]);
        toast.success(`Generated ${response.questions.length} quiz questions!`);
      } else {
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: `⚠️ ${response.message || 'Could not generate questions for that topic. Please try rephrasing or picking another subject.'}`,
          result: null
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('[AI GENERATION FAILED]', error);
      const errMsg = error.response?.data?.message || 'AI generation failed. Please try again.';
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: `❌ Error: ${errMsg}`,
          result: null
        }
      ]);
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSelectQuestion = (idx) => {
    setSelectedIndices(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const handleSelectAll = (totalCount) => {
    if (selectedIndices.length === totalCount) {
      setSelectedIndices([]);
    } else {
      setSelectedIndices(Array.from({ length: totalCount }, (_, i) => i));
    }
  };

  const handleApplySelected = (questions) => {
    const selectedQuestions = questions.filter((_, idx) => selectedIndices.includes(idx));
    if (selectedQuestions.length === 0) {
      toast.error('Please select at least one question to add');
      return;
    }
    onAddQuestions(selectedQuestions);
    toast.success(`Added ${selectedQuestions.length} questions to quiz!`);
    onClose();
  };

  const handleApplyAllAndReplace = (result) => {
    if (!result?.questions || result.questions.length === 0) return;
    onReplaceQuiz(result);
    toast.success(`Replaced quiz with ${result.questions.length} AI questions & title!`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`relative w-full sm:max-w-4xl h-[100dvh] sm:h-[90vh] sm:max-h-[850px] rounded-none sm:rounded-3xl border-0 sm:border overflow-hidden shadow-2xl flex flex-col my-auto ${
            isLight
              ? 'bg-white border-purple-200 text-gray-900'
              : 'bg-[#0e0e16] border-white/10 text-white'
          }`}
        >
          {/* Top Gradient Ribbon */}
          <div className="h-1 sm:h-1.5 w-full bg-gradient-to-r from-primary via-secondary to-accent shrink-0" />

          {/* Modal Header */}
          <div className={`p-3 sm:p-5 flex items-center justify-between border-b shrink-0 ${
            isLight ? 'bg-purple-50/60 border-purple-100' : 'bg-white/[0.03] border-white/10'
          }`}>
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-md shadow-primary/30 shrink-0">
                <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h3 className="font-outfit text-sm sm:text-lg font-black tracking-tight truncate">
                    AI Quiz Assistant
                  </h3>
                  <span className="hidden xs:inline-flex bg-primary/20 text-primary border border-primary/30 text-[9px] font-black uppercase px-2 py-0.5 rounded-full items-center gap-1 shrink-0">
                    <Sparkles className="h-2.5 w-2.5 animate-pulse" /> Live AI
                  </span>
                </div>
                <p className={`text-[11px] sm:text-xs truncate sm:whitespace-normal ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                  Type what quiz you want and let AI generate ready-to-use questions.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className={`p-1.5 sm:p-2 rounded-xl transition-colors cursor-pointer shrink-0 ml-2 ${
                isLight ? 'hover:bg-gray-200 text-gray-500 hover:text-gray-900' : 'hover:bg-white/10 text-gray-400 hover:text-white'
              }`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 sm:gap-3 text-left ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg sm:rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shrink-0 mt-0.5">
                    <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                )}

                <div className={`max-w-[88%] sm:max-w-[75%] space-y-2.5 sm:space-y-3 ${
                  msg.sender === 'user'
                    ? 'bg-primary text-white rounded-2xl rounded-tr-sm p-3 sm:p-4 shadow-md text-xs sm:text-sm font-medium'
                    : isLight
                      ? 'bg-gray-50 border border-gray-200 text-gray-800 rounded-2xl rounded-tl-sm p-3.5 sm:p-5 shadow-sm'
                      : 'glass-panel border-white/10 text-gray-200 rounded-2xl rounded-tl-sm p-3.5 sm:p-5 shadow-sm'
                }`}>
                  <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>

                  {/* Initial Starter Topics (only on welcome message) */}
                  {msg.id === 'welcome' && (
                    <div className="pt-2.5 space-y-2 border-t border-current/10">
                      <p className={`text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 ${
                        isLight ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        <Sparkles className="h-3 w-3 text-secondary" /> Or tap a starter topic:
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {promptSuggestions.map((sug, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleSendPrompt(sug.prompt, null, null)}
                            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all border cursor-pointer text-left hover:scale-[1.02] active:scale-[0.98] ${
                              isLight
                                ? 'bg-white border-gray-200 hover:border-secondary hover:text-secondary text-gray-800 shadow-sm'
                                : 'bg-white/5 border-white/10 hover:border-secondary hover:text-white text-gray-200'
                            }`}
                          >
                            {sug.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* If this AI message contains generated quiz results */}
                  {msg.result && msg.result.questions && (
                    <div className="space-y-3 pt-3 border-t border-current/10">
                      
                      {/* Controls Bar for this result */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <span className="font-extrabold uppercase text-[9px] sm:text-[10px] tracking-wider px-2 py-0.5 rounded-full bg-secondary/15 text-secondary border border-secondary/30">
                            {msg.result.category || 'General'}
                          </span>
                          <span className="font-bold text-[10px] sm:text-[11px] text-gray-400">
                            {msg.result.questions.length} Questions
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSelectAll(msg.result.questions.length)}
                          className="text-xs font-bold text-primary hover:underline cursor-pointer"
                        >
                          {selectedIndices.length === msg.result.questions.length ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>

                      {/* Questions List Preview */}
                      <div className="space-y-2.5 sm:space-y-3 max-h-[260px] sm:max-h-[320px] overflow-y-auto pr-1">
                        {msg.result.questions.map((q, qIdx) => {
                          const isSelected = selectedIndices.includes(qIdx);
                          return (
                            <div
                              key={qIdx}
                              onClick={() => handleToggleSelectQuestion(qIdx)}
                              className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border transition-all cursor-pointer select-none relative ${
                                isSelected
                                  ? 'border-secondary bg-secondary/10 shadow-sm'
                                  : isLight ? 'border-gray-200 bg-white hover:border-gray-300' : 'border-white/5 bg-white/5 hover:border-white/15'
                              }`}
                            >
                              <div className="flex items-start gap-2.5 sm:gap-3">
                                <div className={`h-4.5 w-4.5 sm:h-5 sm:w-5 rounded-md flex items-center justify-center mt-0.5 shrink-0 border transition-all ${
                                  isSelected 
                                    ? 'bg-secondary text-white border-secondary' 
                                    : isLight ? 'border-gray-300 bg-gray-100' : 'border-white/20 bg-white/5'
                                }`}>
                                  {isSelected && <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 stroke-[3]" />}
                                </div>

                                <div className="flex-1 min-w-0 space-y-2">
                                  <div className="flex justify-between items-start gap-2">
                                    <h4 className={`text-xs font-bold leading-snug break-words ${isLight ? 'text-gray-900' : 'text-white'}`}>
                                      <span className="text-secondary font-black mr-1.5">Q{qIdx + 1}.</span>
                                      {q.questionText}
                                    </h4>
                                    <span className="text-[10px] font-semibold text-gray-400 flex items-center gap-1 shrink-0">
                                      <Clock className="h-3 w-3" /> {q.timeLimit || 20}s
                                    </span>
                                  </div>

                                  {/* 4 Options Grid */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                                    {q.options.map((opt, optIdx) => {
                                      const isCorrect = optIdx === q.correctAnswer;
                                      return (
                                        <div
                                          key={optIdx}
                                          className={`px-2.5 py-1.5 rounded-xl text-[11px] flex items-center justify-between gap-1.5 border min-w-0 ${
                                            isCorrect
                                              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-extrabold'
                                              : isLight ? 'bg-gray-100/80 border-gray-200 text-gray-700' : 'bg-white/5 border-white/5 text-gray-300'
                                          }`}
                                        >
                                          <span className="truncate">{opt}</span>
                                          {isCorrect && (
                                            <span className="text-[9px] uppercase px-1 rounded bg-emerald-500 text-white font-black shrink-0">
                                              Correct
                                            </span>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Action CTA Buttons */}
                      <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => handleApplySelected(msg.result.questions)}
                          disabled={selectedIndices.length === 0}
                          className="w-full sm:w-auto btn-premium btn-secondary-gradient px-4 py-2.5 rounded-xl text-xs font-extrabold text-white flex items-center justify-center gap-2 shadow-secondary-glow cursor-pointer disabled:opacity-50"
                        >
                          <Plus className="h-4 w-4 shrink-0" />
                          <span>Add Selected ({selectedIndices.length}) to Quiz</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleApplyAllAndReplace(msg.result)}
                          className="w-full sm:w-auto btn-premium btn-primary-gradient px-4 py-2.5 rounded-xl text-xs font-extrabold text-white flex items-center justify-center gap-2 shadow-premium-glow cursor-pointer"
                        >
                          <Zap className="h-4 w-4 fill-current text-yellow-300 shrink-0" />
                          <span>Replace Entire Quiz</span>
                        </button>
                      </div>

                    </div>
                  )}

                </div>

                {msg.sender === 'user' && (
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg sm:rounded-xl bg-secondary/20 border border-secondary/30 flex items-center justify-center text-secondary shrink-0 mt-0.5">
                    <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                )}
              </div>
            ))}

            {/* AI Loading State Indicator */}
            {isLoading && (
              <div className="flex gap-2 sm:gap-3 items-center text-left">
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg sm:rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shrink-0 animate-pulse">
                  <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
                <div className={`p-3 sm:p-4 rounded-2xl rounded-tl-sm border flex items-center gap-2.5 sm:gap-3 ${
                  isLight ? 'bg-purple-50 border-purple-200 text-purple-900' : 'bg-primary/10 border-primary/20 text-primary-200'
                }`}>
                  <div className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin rounded-full border-2 border-primary border-t-transparent shrink-0" />
                  <span className="text-xs font-bold animate-pulse">
                    AI is generating your questions...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input & Parameters Bar */}
          <div className={`px-3 py-2 sm:px-5 sm:py-3 border-t shrink-0 space-y-2 ${
            isLight ? 'bg-white border-gray-200' : 'bg-[#101018] border-white/10'
          }`}>
            {/* Collapsible Ideas Drawer (when toggled via Ideas button) */}
            {showSuggestions && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar shrink-0">
                <span className="text-[10px] font-extrabold uppercase text-gray-400 shrink-0">Topics:</span>
                {promptSuggestions.map((sug, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      handleSendPrompt(sug.prompt, null, null);
                      setShowSuggestions(false);
                    }}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all border cursor-pointer shrink-0 ${
                      isLight
                        ? 'bg-white border-gray-200 hover:border-secondary hover:text-secondary text-gray-700 shadow-sm'
                        : 'bg-white/5 border-white/10 hover:border-secondary hover:text-white text-gray-300'
                    }`}
                  >
                    {sug.label}
                  </button>
                ))}
              </div>
            )}

            {/* Compact Single-Row Quick Parameters Bar */}
            <div className="flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                {/* Custom Question Count Dropdown Pill */}
                <div className="relative shrink-0" ref={countRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCountOpen(prev => !prev);
                      setIsDiffOpen(false);
                    }}
                    className={`px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer shadow-2xs ${
                      isLight
                        ? 'bg-gray-100 hover:bg-gray-200/80 border-gray-200 text-gray-800'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-200'
                    }`}
                    aria-label="Question Count"
                  >
                    <Layers className="h-3 w-3 text-secondary" />
                    <span>{questionCount} Qs</span>
                    <ChevronDown className={`h-3 w-3 transition-transform duration-150 ${isCountOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Popover Dropdown (Opens upwards above input) */}
                  {isCountOpen && (
                    <div className={`absolute bottom-full mb-2 left-0 z-50 w-52 rounded-2xl p-1.5 border shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 ${
                      isLight
                        ? 'bg-white/95 border-gray-200 text-gray-800 shadow-[0_12px_30px_rgba(0,0,0,0.14)]'
                        : 'bg-[#181826]/95 border-white/10 text-gray-200 shadow-[0_12px_30px_rgba(0,0,0,0.6)]'
                    }`}>
                      <div className="px-2.5 py-1 text-[9.5px] font-black uppercase tracking-wider text-gray-400">
                        Number of Questions
                      </div>
                      <div className="space-y-0.5 mt-0.5">
                        {countOptions.map(opt => {
                          const isSelected = questionCount === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                setQuestionCount(opt.value);
                                setIsCountOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-all cursor-pointer ${
                                isSelected
                                  ? isLight ? 'bg-purple-50 text-purple-900 font-bold' : 'bg-purple-900/30 text-purple-200 font-bold'
                                  : isLight ? 'hover:bg-gray-100/80 text-gray-700' : 'hover:bg-white/5 text-gray-300'
                              }`}
                            >
                              <div>
                                <div className="text-xs leading-none font-bold">{opt.label}</div>
                                <div className="text-[10px] text-gray-400 mt-1 leading-none">{opt.desc}</div>
                              </div>
                              {isSelected && (
                                <Check className="w-3.5 h-3.5 text-secondary shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Custom Difficulty Dropdown Pill */}
                <div className="relative shrink-0" ref={diffRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDiffOpen(prev => !prev);
                      setIsCountOpen(false);
                    }}
                    className={`px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer shadow-2xs ${
                      difficulty === 'easy'
                        ? isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100' : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                        : difficulty === 'medium'
                          ? isLight ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100' : 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30 hover:bg-yellow-500/25'
                          : isLight ? 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100' : 'bg-rose-500/15 text-rose-300 border-rose-500/30 hover:bg-rose-500/25'
                    }`}
                    aria-label="Difficulty"
                  >
                    <span className={`w-2 h-2 rounded-full ${
                      difficulty === 'easy' ? 'bg-emerald-500' : difficulty === 'medium' ? 'bg-amber-500' : 'bg-rose-500'
                    }`} />
                    <span className="capitalize">{difficulty}</span>
                    <ChevronDown className={`h-3 w-3 transition-transform duration-150 ${isDiffOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Popover Dropdown (Opens upwards above input) */}
                  {isDiffOpen && (
                    <div className={`absolute bottom-full mb-2 left-0 z-50 w-52 rounded-2xl p-1.5 border shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 ${
                      isLight
                        ? 'bg-white/95 border-gray-200 text-gray-800 shadow-[0_12px_30px_rgba(0,0,0,0.14)]'
                        : 'bg-[#181826]/95 border-white/10 text-gray-200 shadow-[0_12px_30px_rgba(0,0,0,0.6)]'
                    }`}>
                      <div className="px-2.5 py-1 text-[9.5px] font-black uppercase tracking-wider text-gray-400">
                        Quiz Difficulty
                      </div>
                      <div className="space-y-0.5 mt-0.5">
                        {difficultyOptions.map(opt => {
                          const isSelected = difficulty === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                setDifficulty(opt.value);
                                setIsDiffOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-all cursor-pointer ${
                                isSelected
                                  ? isLight ? 'bg-purple-50 text-purple-900 font-bold' : 'bg-purple-900/30 text-purple-200 font-bold'
                                  : isLight ? 'hover:bg-gray-100/80 text-gray-700' : 'hover:bg-white/5 text-gray-300'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full ${opt.dotColor}`} />
                                <div>
                                  <div className="text-xs leading-none font-bold">{opt.label}</div>
                                  <div className="text-[10px] text-gray-400 mt-1 leading-none">{opt.desc}</div>
                                </div>
                              </div>
                              {isSelected && (
                                <Check className="w-3.5 h-3.5 text-secondary shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Toggle Topic Ideas Button */}
              <button
                type="button"
                onClick={() => setShowSuggestions(prev => !prev)}
                className={`px-2 py-1 rounded-lg text-[11px] sm:text-xs font-bold flex items-center gap-1 border transition-all cursor-pointer shrink-0 ${
                  showSuggestions
                    ? 'bg-secondary/20 border-secondary/40 text-secondary'
                    : isLight ? 'bg-gray-100 border-gray-200 text-gray-600 hover:text-gray-900' : 'bg-white/5 border-white/10 text-gray-400 hover:text-gray-200'
                }`}
              >
                <Sparkles className="h-3 w-3 text-secondary" />
                <span>Ideas</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${showSuggestions ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Chat Input Field */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendPrompt();
              }}
              className="flex items-center gap-2 w-full min-w-0"
            >
              <div className="relative flex-1 min-w-0">
                <input
                  ref={inputRef}
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Type quiz topic (e.g. JavaScript basics)..."
                  disabled={isLoading}
                  className={`w-full rounded-xl sm:rounded-2xl border px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm transition-all focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/40 ${
                    isLight
                      ? 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                      : 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !prompt.trim()}
                className="btn-premium btn-primary-gradient px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-extrabold text-white flex items-center justify-center gap-1.5 sm:gap-2 shadow-premium-glow cursor-pointer disabled:opacity-50 hover:scale-105 active:scale-95 transition-all shrink-0 !w-auto"
                style={{ width: 'auto' }}
              >
                <span className="text-xs sm:text-sm font-bold">Generate</span>
                <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              </button>
            </form>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
