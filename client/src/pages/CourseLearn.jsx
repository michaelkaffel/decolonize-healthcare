import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Lesson from './Lesson';

const API = import.meta.env.VITE_API_URL;

const LessonRow = ({ lesson, active, onClick }) => {
    const done = !!lesson.progress?.completedAt;
    return (
        <button
            onClick={() => onClick(lesson)}
            className={`w-full text-left px-4 py-2.5 flex items-start gap-3 transition-colors
                ${active ? 'bg-brand-crimson text-white' : 'hover:bg-brand-blush text-gray-700'}`}
        >
            <span className={`mt-1 flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center
                ${done
                    ? active ? 'border-white bg-white' : 'border-brand-crimson bg-brand-crimson'
                    : active ? 'border-white' : 'border-gray-300'}`}>
                {done && (
                    <svg className={`w-2.5 h-2.5 ${active ? 'text-brand-crimson' : 'text-white'}`} viewBox="0 0 10 10" fill="currentColor">
                        <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )}
            </span>
            <span className='text-sm leading-snug'>{lesson.title}</span>
        </button>
    );
};



const CourseLearn = () => {
    const { slug, lessonId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [courseData, setCourseData] = useState(null);
    const [activeLessonId, setActiveLessonId] = useState(lessonId || null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [expandedModules, setExpandedModules] = useState(new Set());

    // Auto-expand whichever day contains the active lesson
    useEffect(() => {
        if (!courseData) return;
        const activeModIdx = courseData.modules.findIndex(m =>
            m.lessons.some(l => l.id === activeLessonId)
        );
        if (activeModIdx !== -1) {
            setExpandedModules(prev => new Set([...prev, activeModIdx]));
        }
    }, [courseData, activeLessonId]);

    const toggleModule = (mi) => {
        setExpandedModules(prev => {
            const next = new Set(prev);
            next.has(mi) ? next.delete(mi) : next.add(mi);
            return next;
        });
    };

    // Flatten lessons for east lookup
    const allLessons = courseData
        ? courseData.modules.flatMap(m => m.lessons)
        : [];

    const activeLesson = courseData ?
        (allLessons.find(l => l.id === activeLessonId) || allLessons[0] || null)
        : null;

    // Fetch full lesson list
    const loadCourse = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            //First get courseId from slug via public endpoint
            const slugRes = await fetch(`${API}/api/courses/${slug}`);
            if (!slugRes.ok) throw new Error('Course not found');
            const slugData = await slugRes.json();
            const courseId = slugData.id;

            // Then fetch gated lesson content
            const lessonsRes = await fetch(`${API}/api/courses/${courseId}/lessons`, {
                credentials: 'include',
            });
            if (lessonsRes.status === 401) { navigate('/login'); return; }
            if (lessonsRes.status === 403) { navigate('/dashboard'); return; }
            if (!lessonsRes.ok) throw new Error('Failed to load course');

            const data = await lessonsRes.json();
            setCourseData({ courseId, ...data });

            // Set initial lesson
            if (!activeLessonId) {
                const firstIncomplete = data.modules
                    .flatMap(m => m.lessons)
                    .find(l => !l.progress?.completedAt);
                const target = firstIncomplete || data.modules[0]?.lessons[0];
                if (target) setActiveLessonId(target.id);
            }
        } catch (e) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }, [slug, navigate]);

    useEffect(() => { loadCourse(); }, [loadCourse]);

    // Sync URL when lesson changes
    useEffect(() => {
        if (!activeLessonId || !courseData) return;
        const target = `/courses/${slug}/learn/${activeLessonId}`;
        if (location.pathname !== target) navigate(target, { replace: true });
    }, [activeLessonId, slug]);

    // Keep activeLessonId in sync if user navigates via browser back/forward
    useEffect(() => {
        if (lessonId && lessonId !== activeLessonId) setActiveLessonId(lessonId);
    }, [lessonId]);

    // Called by Lesson after completion/survey so sidebar updates
    const handleLessonComplete = useCallback((lessonId, patch) => {
        setCourseData(prev => ({
            ...prev,
            modules: prev.modules.map(m => ({
                ...m,
                lessons: m.lessons.map(l =>
                    l.id === lessonId ? { ...l, progress: { ...l.progress, ...patch } } : l
                ),
            })),
        }));

    }, []);

    const goToLesson = (lesson) => {
        setActiveLessonId(lesson.id);
        setSidebarOpen(false);
    };

    const goNext = () => {
        const idx = allLessons.findIndex(l => l.id === activeLessonId);
        if (idx < allLessons.length - 1) setActiveLessonId(allLessons[idx + 1].id);
    };

    const goPrev = () => {
        const idx = allLessons.findIndex(l => l.id === activeLessonId);
        if (idx > 0) setActiveLessonId(allLessons[idx - 1].id);
    };


    // Derived progress counts
    const completedCount = allLessons.filter(l => l.progress?.completedAt).length;
    const totalCount = allLessons.length;
    const pct = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

    // Render
    if (loading) return (
        <div className="min-h-screen bg-brand-cream flex items-center justify-center">
            <p className="text-gray-500 animate-pulse">Loading course…</p>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-brand-cream flex items-center justify-center">
            <p className="text-red-600">{error}</p>
        </div>
    );

    const activeIdx = allLessons.findIndex(l => l.id === activeLessonId);

    return (
        <div className='h-screen overflow-hidden bg-brand-cream flex flex-col'>
            <header className='sticky top-0 z-30 bg-white border-b border-gray-200 flex items-center px-4 gap-4 h-14'>
                {/* Mobile sidebar toggle */}
                <button
                    className='lg:hidden p-1.5 rounded text-gray-600 hover:bg-gray-100'
                    onClick={() => setSidebarOpen(o => !o)}
                    aria-label='Toggle lesson list'
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                <span className='font-semibold text-gray-800 truncate flex-1'>
                    {courseData?.course?.title}
                </span>

                {/* Progress pill */}
                <span className='hidden sm:flex items-center gap-2 text-sm text-gray-500 flex-shrink-0'>
                    <span className='w-24 h-2 bg-gray-200 rounded-full overflow-hidden'>
                        <span className="h-full bg-brand-teal block rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </span>
                    {completedCount}/{totalCount}
                </span>

                <Link to='/dashboard' className='text-sm text-brand-crimson hover:underline flex-shrink-0' >← Dashboard</Link>
            </header>

            <div className='flex flex-1 overflow-hidden'>
                {/* Sidebar overlay (mobile) */}
                {sidebarOpen && (
                    <div
                        className='fixed inset-0 z-20 bg-black/40 lg:hidden'
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside
                    className={`
                        fixed lg:static z-20 top-14 bottom-0 left-0
                            w-72 bg-white border-r border-gray-200
                            overflow-y-auto flex-shrink-0
                            transform transition-transform duration-200
                            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                        `}>
                    {courseData?.modules.map((mod, mi) => {
                        const weekNum = Math.ceil((mi + 1) / 7);
                        const prevWeekNum = mi > 0 ? Math.ceil(mi / 7) : 0;
                        const showWeekHeader = weekNum !== prevWeekNum;
                        const isExpanded = expandedModules.has(mi);
                        const doneLessons = mod.lessons.filter(l => !!l.progress?.completedAt).length;
                        const totalLessons = mod.lessons.length;
                        const allDone = doneLessons === totalLessons;

                        return (
                            <div key={mod.id} className='border-b border-gray-100 last:border-0'>
                                {showWeekHeader && (
                                    <div className='px-4 py-3 bg-gray-50'>
                                        <p className='text-xs font-semibold uppercase tracking-wider text-gray-400'>
                                            Week {weekNum}
                                        </p>

                                    </div>
                                )}
                                <button
                                    onClick={() => toggleModule(mi)}
                                    className='w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors'
                                >
                                    <div className='flex items-center gap-2.5'>
                                        {allDone ? (
                                            <span className='flex-shrink-0 w-4 h-4 rounded-full bg-brand-crimson border-2 border-brand-crimson flex items-center justify-center'>
                                                <svg className='w-2.5 h-2.5 text-white' viewBox="0 0 10 10" fill="currentColor">
                                                    <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </span>
                                        ) : doneLessons > 0 ? (
                                            <span className='flex-shrink-0 text-xs text-gray-400 tabular-nums'>
                                                {doneLessons}/{totalLessons}
                                            </span>
                                        ) : (
                                            <span className='flex-shrink-0 w-4 h-4 rounded-full border-2 border-gray-300' />
                                        )}
                                        <p className='text-sm font-medium text-gray-700 mt-0.5'>{mod.title}</p>
                                    </div>
                                    
                                    <svg
                                        className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {isExpanded && mod.lessons.map(lesson => (
                                    <LessonRow
                                        key={lesson.id}
                                        lesson={lesson}
                                        active={lesson.id === activeLessonId}
                                        onClick={goToLesson}
                                    />
                                ))}
                            </div>
                        );
                    })}
                </aside>

                {/* Main lesson area */}
                <main className='flex-1 overflow-y-auto'>
                    {activeLesson && courseData && activeLesson.id ? (
                        <Lesson
                            key={activeLesson.id}
                            lesson={activeLesson}
                            courseId={courseData.courseId}
                            onComplete={handleLessonComplete}
                            onNext={activeIdx < allLessons.length - 1 ? goNext : null}
                            onPrev={activeIdx > 0 ? goPrev : null}
                            isLast={activeIdx === allLessons.length - 1}
                        />
                    ) : (
                        <div className='flex items-center justify-center h-full text-gray-400 p-12'>
                            Select a lesson to begin.
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default CourseLearn;
