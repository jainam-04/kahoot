import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, PlusCircle, FileText, ArrowRight, Play, Users, HelpCircle,
  X, Trophy, Clock, BarChart3, UserCheck, Pencil, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import AnimatedPage from '../components/AnimatedPage';
import { getMyQuizzes } from '../services/quizService';
import { getMyResults } from '../services/resultService';
import { createGame } from '../services/gameService';
import { useTheme } from '../context/ThemeContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';

  const [activeModal, setActiveModal] = useState(null); // 'sessions' | 'students' | null

  // Display Welcome Popup Toast when arriving directly from Sign In or Registration
  useEffect(() => {
    if (location.state?.welcomeMsg) {
      toast.success(location.state.welcomeMsg, { id: 'welcome-toast', duration: 4000 });
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Clear any lingering guest credentials so Host testing doesn't get bugged
  useEffect(() => {
    localStorage.removeItem('guest_playerName');
    localStorage.removeItem('guest_pin');
  }, []);

  const { 
    data: quizzesData,
    isLoading: isQuizzesLoading,
  } = useQuery({
    queryKey: ['my-quizzes'],
    queryFn: getMyQuizzes,
  });

  const {
    data: resultsData,
    isLoading: isResultsLoading
  } = useQuery({
    queryKey: ['my-results'],
    queryFn: getMyResults,
  });

  // Host Game Mutation
  const hostGameMutation = useMutation({
    mutationFn: createGame,
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Lobby initialized!');
        navigate(`/host/lobby/${data.game.pin}`);
      } else {
        toast.error(data.message || 'Failed to initialize game lobby');
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Error creating game session');
    }
  });

  // Calculate Metrics
  const totalQuizzes = quizzesData?.quizzes?.length || 0;
  const hostedSessions = resultsData?.results || [];
  const totalGamesHosted = hostedSessions.length;

  // Process Student Data Across Sessions
  const studentMap = {};
  hostedSessions.forEach(res => {
    (res.players || []).forEach(p => {
      const pName = p.name || p.username || 'Student';
      if (!studentMap[pName]) {
        studentMap[pName] = { name: pName, totalScore: 0, sessionsCount: 0, avatar: p.avatar };
      }
      studentMap[pName].totalScore += (p.score !== undefined ? p.score : (p.totalScore || 0));
      studentMap[pName].sessionsCount += 1;
    });
  });
  const studentList = Object.values(studentMap).sort((a, b) => b.totalScore - a.totalScore);
  const totalStudents = studentList.length || hostedSessions.reduce((sum, res) => sum + (res.players?.length || 0), 0);

  const handleHostGame = (quizId) => {
    toast.loading('Creating game lobby...', { id: 'host-game' });
    hostGameMutation.mutate(quizId, {
      onSettled: () => toast.dismiss('host-game')
    });
  };

  return (
    <AnimatedPage>
      <div className="flex flex-1 flex-col min-h-screen bg-background overflow-x-hidden">

        {/* MAIN DASHBOARD */}
        <div className="flex-1 p-4 sm:p-6 lg:p-10 space-y-6 sm:space-y-8 overflow-y-auto overflow-x-hidden">

          {/* Header */}
          <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6 ${isLight ? 'border-gray-200' : 'border-white/5'}`}>
            <div>
              <h1 className={`font-outfit text-3xl font-extrabold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                Dashboard Overview
              </h1>
              <p className={`text-sm mt-1 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                Manage your active quizzes and view participant logs.
              </p>
            </div>

            {/* Create Action button */}
            <Link
              to="/quiz/create"
              className="btn-premium btn-primary-gradient px-5 py-3 flex items-center justify-center gap-2 text-xs sm:text-sm font-bold shadow-premium-glow whitespace-nowrap w-full sm:w-auto rounded-xl"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Create New Quiz</span>
            </Link>
          </div>

          {/* METRIC CARDS GRID WITH SEPARATE DISTINCT ACTIONS */}
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3">
            {/* Total Quizzes Card */}
            <div 
              className={`rounded-2xl p-5 text-left flex justify-between items-start relative overflow-hidden group border transition-all shadow-sm ${
                isLight 
                  ? 'bg-white border-gray-200 text-gray-900' 
                  : 'glass-panel border-white/5 text-white'
              }`}
            >
              <div className="space-y-3">
                <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                  Total Quizzes
                </span>
                <div className={`font-outfit text-3xl font-extrabold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                  {totalQuizzes}
                </div>
                <p className={`text-[10px] font-medium ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>
                  Custom battle sets built
                </p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${
                isLight 
                  ? 'bg-primary/10 border-primary/20 text-primary' 
                  : 'bg-white/5 border-white/10'
              }`}>
                <FileText className="h-5 w-5 text-primary" />
              </div>
            </div>

            {/* Sessions Hosted Card -> Opens Sessions Hosted History Modal */}
            <div 
              onClick={() => setActiveModal('sessions')}
              className={`rounded-2xl p-5 text-left flex justify-between items-start relative overflow-hidden group border transition-all cursor-pointer shadow-sm hover:shadow-md hover:scale-[1.02] ${
                isLight 
                  ? 'bg-white border-gray-200 text-gray-900 hover:border-secondary/50' 
                  : 'glass-panel border-white/5 text-white hover:border-secondary/40'
              }`}
            >
              <div className="space-y-3">
                <span className={`text-xs font-bold uppercase tracking-wider group-hover:text-secondary transition-colors ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                  Sessions Hosted
                </span>
                <div className={`font-outfit text-3xl font-extrabold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                  {totalGamesHosted}
                </div>
                <p className={`text-[10px] font-medium ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>
                  Real-time games executed
                </p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${
                isLight 
                  ? 'bg-secondary/10 border-secondary/20 text-secondary' 
                  : 'bg-white/5 border-white/10 group-hover:bg-secondary/10 group-hover:border-secondary/30'
              }`}>
                <Play className="h-5 w-5 text-secondary" />
              </div>
            </div>

            {/* Total Students Card -> Opens Total Students Roster Modal */}
            <div 
              onClick={() => setActiveModal('students')}
              className={`rounded-2xl p-5 text-left flex justify-between items-start relative overflow-hidden group border transition-all cursor-pointer shadow-sm hover:shadow-md hover:scale-[1.02] ${
                isLight 
                  ? 'bg-white border-gray-200 text-gray-900 hover:border-accent/50' 
                  : 'glass-panel border-white/5 text-white hover:border-accent/40'
              }`}
            >
              <div className="space-y-3">
                <span className={`text-xs font-bold uppercase tracking-wider group-hover:text-accent transition-colors ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                  Total Students
                </span>
                <div className={`font-outfit text-3xl font-extrabold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                  {totalStudents}
                </div>
                <p className={`text-[10px] font-medium ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>
                  Active players connected
                </p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${
                isLight 
                  ? 'bg-accent/10 border-accent/20 text-accent' 
                  : 'bg-white/5 border-white/10 group-hover:bg-accent/10 group-hover:border-accent/30'
              }`}>
                <Users className="h-5 w-5 text-accent" />
              </div>
            </div>
          </div>

          {/* RECENT QUIZZES SECTION */}
          <div className="space-y-6 text-left">
            <div className="flex justify-between items-center">
              <h3 className={`font-outfit text-lg font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                Recent Quizzes
              </h3>
              <Link to="/quiz/my" className="text-xs font-semibold text-secondary hover:underline flex items-center gap-1">
                <span>View All</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {quizzesData?.quizzes?.length === 0 ? (
              <div className={`rounded-2xl p-10 text-center space-y-4 border ${isLight ? 'bg-white border-gray-200' : 'glass-panel border-white/5'}`}>
                <HelpCircle className="h-10 w-10 text-gray-400 mx-auto" />
                <h4 className={`font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>No Quizzes Found</h4>
                <p className={`text-xs max-w-[280px] mx-auto ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                  You haven't created any quizzes yet. Create your first multiplayer challenge!
                </p>
                <Link to="/quiz/create" className="inline-flex btn-premium btn-primary-gradient px-4 py-2.5 text-xs font-bold">
                  Create Quiz
                </Link>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {quizzesData?.quizzes?.slice(0, 6).map((quiz) => (
                  <div 
                    key={quiz._id}
                    onClick={() => navigate(`/quiz/edit/${quiz._id}`)}
                    className={`rounded-2xl p-5 sm:p-6 flex flex-col justify-between min-h-[220px] group border transition-all relative cursor-pointer hover:scale-[1.02] shadow-sm hover:shadow-xl select-none ${
                      isLight 
                        ? 'bg-white border-gray-200 hover:border-primary/50 text-gray-900' 
                        : 'glass-panel border-white/5 hover:border-primary/40 text-white'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <span className="text-[9px] font-bold text-secondary bg-secondary/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          {quiz.category || 'General'}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-semibold ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                            {quiz.questions?.length || 0} Questions
                          </span>
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-primary flex items-center gap-0.5">
                            <Pencil className="h-3 w-3" /> Edit
                          </span>
                        </div>
                      </div>
                      <h4 className={`font-bold mt-3 text-base sm:text-lg group-hover:text-primary transition-colors line-clamp-1 flex items-center justify-between gap-2 ${isLight ? 'text-gray-900' : 'text-white'}`}>
                        <span className="truncate">{quiz.title}</span>
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                      </h4>
                      <p className={`text-xs mt-1.5 line-clamp-2 leading-relaxed ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                        {quiz.description || 'Click to view & edit quiz questions.'}
                      </p>
                    </div>

                    <div className={`flex items-center gap-2 mt-5 pt-4 border-t ${isLight ? 'border-gray-100' : 'border-white/5'}`}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleHostGame(quiz._id);
                        }}
                        className="flex-1 btn-premium btn-primary-gradient py-2.5 px-3 flex items-center justify-center gap-1.5 text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-premium-glow cursor-pointer hover:scale-105 active:scale-95 transition-all"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>Launch Lobby</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/quiz/edit/${quiz._id}`);
                        }}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                          isLight 
                            ? 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200 hover:text-primary' 
                            : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/15 hover:text-white'
                        }`}
                        title="Edit Quiz Details & Questions"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* SESSIONS HOSTED MODAL */}
        {activeModal === 'sessions' && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/75 backdrop-blur-md animate-fade-in">
            <div className={`relative my-auto rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border transition-all ${
              isLight ? 'bg-white border-gray-200 text-gray-900 shadow-2xl' : 'bg-[#121216] border-white/10 text-white'
            }`}>
              <div className={`flex justify-between items-center px-6 py-4 border-b ${
                isLight ? 'border-gray-200 bg-gray-50/80' : 'border-white/10 bg-white/5'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary/10 rounded-xl text-secondary">
                    <Play className="h-5 w-5 fill-current" />
                  </div>
                  <div>
                    <h3 className={`font-outfit font-extrabold text-lg ${isLight ? 'text-gray-900' : 'text-white'}`}>
                      Hosted Sessions History
                    </h3>
                    <p className={`text-xs ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                      Total games executed: {totalGamesHosted}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveModal(null)}
                  className={`p-2 rounded-lg transition-colors ${
                    isLight ? 'text-gray-500 hover:text-gray-900 hover:bg-gray-200' : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4">
                {hostedSessions.length === 0 ? (
                  <div className="text-center py-10 space-y-3">
                    <Clock className={`h-10 w-10 mx-auto ${isLight ? 'text-gray-400' : 'text-gray-600'}`} />
                    <p className={`text-sm font-semibold ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                      No hosted sessions found yet.
                    </p>
                    <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>
                      Launch a battle lobby to start hosting quiz sessions!
                    </p>
                  </div>
                ) : (
                  hostedSessions.map((session, idx) => (
                    <div 
                      key={session._id || session.id || idx}
                      className={`p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border transition-all ${
                        isLight 
                          ? 'bg-gray-50/80 border-gray-200 hover:border-secondary/50 text-gray-900' 
                          : 'glass-panel border-white/5 hover:border-secondary/30 text-white'
                      }`}
                    >
                      <div className="space-y-1">
                        <h4 className={`font-bold text-base ${isLight ? 'text-gray-900' : 'text-white'}`}>
                          {session.quizTitle || session.quiz?.title || 'Quiz Session'}
                        </h4>
                        <div className={`flex items-center gap-3 text-xs ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-gray-400" />
                            {new Date(session.createdAt || Date.now()).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1 text-secondary font-semibold">
                            <Users className="h-3.5 w-3.5" />
                            {session.players?.length || 0} Players
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setActiveModal(null);
                          navigate(`/results/${session._id || session.id}`);
                        }}
                        className="btn-premium bg-secondary text-white hover:bg-secondary/80 px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 whitespace-nowrap self-end sm:self-center shadow-md cursor-pointer"
                      >
                        <BarChart3 className="h-4 w-4" />
                        <span>View Analytics</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TOTAL STUDENTS MODAL */}
        {activeModal === 'students' && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/75 backdrop-blur-md animate-fade-in">
            <div className={`relative my-auto rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border transition-all ${
              isLight ? 'bg-white border-gray-200 text-gray-900 shadow-2xl' : 'bg-[#121216] border-white/10 text-white'
            }`}>
              <div className={`flex justify-between items-center px-6 py-4 border-b ${
                isLight ? 'border-gray-200 bg-gray-50/80' : 'border-white/10 bg-white/5'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/10 rounded-xl text-accent">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className={`font-outfit font-extrabold text-lg ${isLight ? 'text-gray-900' : 'text-white'}`}>
                      Student Engagement Roster
                    </h3>
                    <p className={`text-xs ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                      Unique connected students: {studentList.length}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveModal(null)}
                  className={`p-2 rounded-lg transition-colors ${
                    isLight ? 'text-gray-500 hover:text-gray-900 hover:bg-gray-200' : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-3">
                {studentList.length === 0 ? (
                  <div className="text-center py-10 space-y-3">
                    <UserCheck className={`h-10 w-10 mx-auto ${isLight ? 'text-gray-400' : 'text-gray-600'}`} />
                    <p className={`text-sm font-semibold ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                      No student records found yet.
                    </p>
                    <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>
                      Host a quiz session and let students join via game pin!
                    </p>
                  </div>
                ) : (
                  studentList.map((st, idx) => (
                    <div 
                      key={idx}
                      className={`p-3.5 rounded-xl flex items-center justify-between gap-3 border transition-all ${
                        isLight 
                          ? 'bg-gray-50/80 border-gray-200 hover:border-accent/50 text-gray-900' 
                          : 'glass-panel border-white/5 hover:border-accent/30 text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                          idx === 0 ? 'bg-yellow-500/20 text-yellow-600 border border-yellow-500/40' :
                          idx === 1 ? (isLight ? 'bg-gray-200 text-gray-700 border border-gray-300' : 'bg-gray-300/20 text-gray-300 border border-gray-300/40') :
                          idx === 2 ? 'bg-amber-700/20 text-amber-600 border border-amber-700/40' :
                          (isLight ? 'bg-gray-100 text-gray-600 border border-gray-200' : 'bg-white/5 text-gray-400 border border-white/10')
                        }`}>
                          {idx === 0 ? <Trophy className="h-4 w-4 text-yellow-500" /> : `#${idx + 1}`}
                        </div>
                        <div>
                          <h4 className={`font-bold text-sm flex items-center gap-1.5 ${isLight ? 'text-gray-900' : 'text-white'}`}>
                            <span>{st.name}</span>
                            {idx === 0 && <span className="text-[9px] bg-yellow-500/20 text-yellow-600 px-2 py-0.5 rounded-full font-extrabold uppercase">Top Student</span>}
                          </h4>
                          <span className={`text-[10px] ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                            Participated in {st.sessionsCount} session{st.sessionsCount > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-black text-accent text-sm">{st.totalScore} pts</div>
                        <span className={`text-[9px] ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>Cumulative Score</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </AnimatedPage>
  );
}