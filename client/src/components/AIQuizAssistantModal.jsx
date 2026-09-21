import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Send, X, Bot, User, Check, Plus, RefreshCw, 
  HelpCircle, Zap, CheckCircle2, ChevronRight, Sliders,
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

  // Chat conversation state
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: "👋 Hi! I'm your AI Quiz Assistant. Tell me what quiz topic you need (e.g. 'I want an easy quiz on Solar System with 5 questions' or '10 medium questions on JavaScript') and I'll generate the complete question set for you!",
      result: null
    }
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const promptSuggestions = [
    { label: '🪐 Solar System & Planets', prompt: 'I want an easy quiz on the Solar System and planets with 5 questions', count: 5, diff: 'easy' },
    { label: '💻 React & JavaScript', prompt: 'Create 5 medium difficulty questions on modern React and JavaScript fundamentals', count: 5, diff: 'medium' },
    { label: '🌍 World Geography', prompt: 'Give me 5 easy quiz questions about world capitals and geography', count: 5, diff: 'easy' },
    { label: '🧪 General Science', prompt: 'Create 5 medium questions on physics, chemistry and human biology', count: 5, diff: 'medium' },
    { label: '🏛️ World History Trivia', prompt: '5 medium questions about major historical events and civilizations', count: 5, diff: 'medium' },
    { label: '🎬 Movies & Pop Culture', prompt: '5 fun pop culture and blockbuster movie trivia questions', count: 5, diff: 'easy' },
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`relative w-full max-w-4xl h-[90vh] max-h-[850px] rounded-3xl border overflow-hidden shadow-2xl flex flex-col my-auto ${
            isLight
              ? 'bg-white border-purple-200 text-gray-900'
              : 'bg-[#0e0e16] border-white/10 text-white'
          }`}
        >
          {/* Top Gradient Ribbon */}
          <div className="h-1.5 w-full bg-gradient-to-r from-primary via-secondary to-accent" />

          {/* Modal Header */}
          <div className={`p-4 sm:p-5 flex items-center justify-between border-b shrink-0 ${
            isLight ? 'bg-purple-50/60 border-purple-100' : 'bg-white/[0.03] border-white/10'
          }`}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-md shadow-primary/30 shrink-0">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-outfit text-base sm:text-lg font-black tracking-tight">
                    AI Quiz Generator & Chat Assistant
                  </h3>
                  <span className="bg-primary/20 text-primary border border-primary/30 text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="h-2.5 w-2.5 animate-pulse" /> Live AI
                  </span>
                </div>
                <p className={`text-xs ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                  Type what quiz you want, and let AI generate formatted questions ready to insert.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-full transition-colors cursor-pointer ${
                isLight ? 'hover:bg-gray-200 text-gray-500 hover:text-gray-900' : 'hover:bg-white/10 text-gray-400 hover:text-white'
              }`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 text-left ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="h-8 w-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shrink-0 mt-1">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[75%] space-y-3 ${
                  msg.sender === 'user'
                    ? 'bg-primary text-white rounded-2xl rounded-tr-sm p-3.5 sm:p-4 shadow-md text-xs sm:text-sm font-medium'
                    : isLight
                      ? 'bg-gray-50 border border-gray-200 text-gray-800 rounded-2xl rounded-tl-sm p-4 sm:p-5 shadow-sm'
                      : 'glass-panel border-white/10 text-gray-200 rounded-2xl rounded-tl-sm p-4 sm:p-5 shadow-sm'
                }`}>
                  <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                  {/* If this AI message contains generated quiz results */}
                  {msg.result && msg.result.questions && (
                    <div className="space-y-4 pt-3 border-t border-current/10">
                      
                      {/* Controls Bar for this result */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold uppercase text-[10px] tracking-wider px-2 py-0.5 rounded-full bg-secondary/15 text-secondary border border-secondary/30">
                            {msg.result.category || 'General'}
                          </span>
                          <span className="font-bold text-[11px] text-gray-400">
                            {msg.result.questions.length} Questions Generated
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
                      <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                        {msg.result.questions.map((q, qIdx) => {
                          const isSelected = selectedIndices.includes(qIdx);
                          return (
                            <div
                              key={qIdx}
                              onClick={() => handleToggleSelectQuestion(qIdx)}
                              className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none relative ${
                                isSelected
                                  ? 'border-secondary bg-secondary/10 shadow-sm'
                                  : isLight ? 'border-gray-200 bg-white hover:border-gray-300' : 'border-white/5 bg-white/5 hover:border-white/15'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`h-5 w-5 rounded-md flex items-center justify-center mt-0.5 shrink-0 border transition-all ${
                                  isSelected 
                                    ? 'bg-secondary text-white border-secondary' 
                                    : isLight ? 'border-gray-300 bg-gray-100' : 'border-white/20 bg-white/5'
                                }`}>
                                  {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                                </div>

                                <div className="flex-1 space-y-2">
                                  <div className="flex justify-between items-start gap-2">
                                    <h4 className={`text-xs font-bold leading-snug ${isLight ? 'text-gray-900' : 'text-white'}`}>
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
                                          className={`px-2.5 py-1.5 rounded-xl text-[11px] flex items-center justify-between gap-1.5 border ${
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
                      <div className="pt-2 flex flex-col sm:flex-row items-center gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => handleApplySelected(msg.result.questions)}
                          disabled={selectedIndices.length === 0}
                          className="w-full sm:w-auto btn-premium btn-secondary-gradient px-4 py-2.5 rounded-xl text-xs font-extrabold text-white flex items-center justify-center gap-2 shadow-secondary-glow cursor-pointer disabled:opacity-50"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Add Selected ({selectedIndices.length}) to Quiz</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleApplyAllAndReplace(msg.result)}
                          className="w-full sm:w-auto btn-premium btn-primary-gradient px-4 py-2.5 rounded-xl text-xs font-extrabold text-white flex items-center justify-center gap-2 shadow-premium-glow cursor-pointer"
                        >
                          <Zap className="h-4 w-4 fill-current text-yellow-300" />
                          <span>Replace Entire Quiz</span>
                        </button>
                      </div>

                    </div>
                  )}

                </div>

                {msg.sender === 'user' && (
                  <div className="h-8 w-8 rounded-xl bg-secondary/20 border border-secondary/30 flex items-center justify-center text-secondary shrink-0 mt-1">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {/* AI Loading State Indicator */}
            {isLoading && (
              <div className="flex gap-3 items-center text-left">
                <div className="h-8 w-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shrink-0 animate-pulse">
                  <Bot className="h-4 w-4" />
                </div>
                <div className={`p-4 rounded-2xl rounded-tl-sm border flex items-center gap-3 ${
                  isLight ? 'bg-purple-50 border-purple-200 text-purple-900' : 'bg-primary/10 border-primary/20 text-primary-200'
                }`}>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span className="text-xs font-bold animate-pulse">
                    AI is crafting and formatting your questions...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Starters Carousel/Chips */}
          <div className={`px-4 sm:px-6 py-2.5 border-t overflow-x-auto flex items-center gap-2 shrink-0 ${
            isLight ? 'bg-gray-50/90 border-gray-200' : 'bg-white/[0.02] border-white/5'
          }`}>
            <span className="text-[10px] uppercase font-black text-gray-400 flex items-center gap-1 shrink-0">
              <Sparkles className="h-3 w-3 text-secondary" /> Suggestions:
            </span>
            {promptSuggestions.map((sug, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendPrompt(sug.prompt, sug.count, sug.diff)}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                  isLight
                    ? 'bg-white border-gray-200 hover:border-secondary hover:text-secondary text-gray-700 shadow-sm'
                    : 'bg-white/5 border-white/10 hover:border-secondary hover:text-white text-gray-300'
                }`}
              >
                {sug.label}
              </button>
            ))}
          </div>

          {/* Input & Parameters Bar */}
          <div className={`p-4 sm:p-5 border-t shrink-0 space-y-3 ${
            isLight ? 'bg-white border-gray-200' : 'bg-[#101018] border-white/10'
          }`}>
            {/* Quick Filters (Count & Difficulty) */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase text-gray-400">Count:</span>
                {[3, 5, 8, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setQuestionCount(num)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                      questionCount === num
                        ? 'bg-primary text-white shadow-sm'
                        : isLight ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {num} Qs
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase text-gray-400">Difficulty:</span>
                {['easy', 'medium', 'hard'].map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-extrabold uppercase transition-all cursor-pointer ${
                      difficulty === diff
                        ? diff === 'easy' ? 'bg-emerald-500 text-white' : diff === 'medium' ? 'bg-yellow-500 text-black' : 'bg-red-500 text-white'
                        : isLight ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Input Field */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendPrompt();
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. I want an easy quiz on Solar System with 5 questions..."
                  disabled={isLoading}
                  className={`w-full rounded-2xl border px-4 py-3 text-xs sm:text-sm transition-all focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/40 ${
                    isLight
                      ? 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                      : 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !prompt.trim()}
                className="btn-premium btn-primary-gradient px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold text-white flex items-center justify-center gap-2 shadow-premium-glow cursor-pointer disabled:opacity-50 hover:scale-105 transition-all shrink-0"
              >
                <span>Generate</span>
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
