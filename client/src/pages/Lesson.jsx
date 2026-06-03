import { useState } from 'react';
import { Link } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL;

const SurveyQuestion = ({ question, value, onChange, submitted }) => {
    if (question.type === 'multiple_choice') {
        return (
            <div className='mb-6'>
                <p className='font-medium text-gray-800 mb-3' >{question.prompt}</p>
                <div className='space-y-2'>
                    {question.options.map((opt, i) => (
                        <label key={i} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors
                            ${submitted ? 'cursor-default opacity-70' : 'hover:border-brand-teal'}
                            ${value === opt ? 'border-brand-teal bg-teal-50' : 'border-gray-200'}`} >
                            <input
                                type='radio'
                                name={question.id}
                                value={opt}
                                checked={value === opt}
                                disabled={submitted}
                                onChange={() => onChange(question.id, opt)}
                                className='accent-brand-teal'
                            />
                            <span className='text-sm text-gray-700'>{opt}</span>
                        </label>
                    ))}
                </div>
            </div>
        );
    }

    // open_text
    return (
        <div className='mb-6'>
            <p className='font-medium text-gray-800 mb-3'>{question.prompt}</p>
            <textarea
                rows={4}
                disabled={submitted}
                value={value || ''}
                onChange={e => onChange(question.id, e.target.value)}
                placeholder='Your response...'
                className='w-full border border-gray-200 rounded-lg px-4 py-3 text-sm resize-none
                    focus:outline-none focus:border-brand-teal disabled:opacity-70 disabled:bg-gray-50'
            />
        </div>
    );
};

// Main lesson
const Lesson = ({ lesson, courseId, onComplete, onNext, onPrev, isLast }) => {

    
    const alreadyDone = !!lesson?.progress?.completedAt;
    const hasSurvey = (lesson?.survey?.questions?.length ?? 0) > 0;

    // Survey state
    
    const [answers, setAnswers] = useState({});
    const [surveySubmitted, setSurveySubmitted] = useState(alreadyDone && hasSurvey);
    const [surveyError, setSurveyError] = useState(null);

    // Complete state
    const [completing, setCompleting] = useState(false);
    const [completed, setCompleted] = useState(alreadyDone);
    const [completeError, setCompleteError] = useState(null);

    if (!lesson) return null;

    const setAnswer = (qId, val) => setAnswers(prev => ({ ...prev, [qId]: val }));


    // Submit survey
    const submitSurvey = async () => {
        const questions = lesson.survey.questions;
        const answersArr = questions.map(q => ({
            questionId: q.id,
            value: answers[q.id] || '',
        }));

        // Basic validation - every question needs a response
        const missing = answersArr.filter(a => !a.value.trim());
        if (missing.length) { setSurveyError('Please answer all questions before continuing'); return; }

        setSurveyError(null);
        setCompleting(true);
        try {
            const res = await fetch(
                `${API}/api/courses/${courseId}/lessons/${lesson.id}/survey`,
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ answers: answersArr }),
                }
            );
            if (!res.ok) throw new Error('Failed to submit survey');
            const data = await res.json();
            setSurveySubmitted(true)
            setCompleted(true)
            onComplete(lesson.id, { completedAt: data.submittedAt })
        } catch (e) {
            setSurveyError(e.message);
        } finally {
            setCompleting(false);
        }
    };

    // Mark complete (no-quiz, no-survey lesson)
    const markComplete = async () => {
        setCompleting(true);
        setCompleteError(null);
        try {
            const res = await fetch(
                `${API}/api/courses/${courseId}/lessons/${lesson.id}/complete`,
                { method: 'POST', credentials: 'include' }
            );
            if (!res.ok) throw new Error('Failed to mark complete');
            const data = await res.json();
            setCompleted(true);
            onComplete(lesson.id, { completedAt: data.completedAt });
        } catch (e) {
            setCompleteError(e.message);
        } finally {
            setCompleting(false);
        }
    };

    // Render

    return (
        <article className='max-w-2xl mx-auto px-6 py-10'>
            <h1 className='text-2xl font-bold text-gray-900 mb-6'>{lesson.title}</h1>

            {lesson.content && (
                <div
                    className='prose prose-gray max-w-none mb-10 text-gray-700 leading-relaxed
                        [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-gray-900 [&_h2]:mt-8 [&_h2]:mb-3
                        [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-gray-800 [&_h3]:mt-6 [&_h3]:mb-2
                        [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:pl-5 [&_ul]:list-disc [&_ol]:mb-4 [&_ol]:pl-5 [&_ol]:list-decimal
                        [&_li]:mb-1 [&_blockquote]:border-l-4 [&_blockquote]:border-brand-teal
                        [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600'
                    dangerouslySetInnerHTML={{ __html: lesson.content }}
                />
            )}

            {/* Survey block */}
            {hasSurvey && (
                <div className='bg-brand-blush rounded-2xl p-6 mb-8'>
                    <h2 className='text-lg font-semibold text-gray-800 mb-1'>Reflection</h2>
                    <p className='text-sm text-gray-500 mb-6'>
                        {surveySubmitted ? 'Thank you for reflecting.' : 'Take a moment to check in with yourself.'}
                    </p>

                    {lesson.survey.questions.map(q => (
                        <SurveyQuestion
                            key={q.id}
                            question={q}
                            value={answers[q.id]}
                            onChange={setAnswer}
                            submitted={surveySubmitted}
                        />
                    ))}

                    {surveyError && (
                        <p className='text-sm text-red-600 mb-4'>{surveyError}</p>
                    )}

                    {!surveySubmitted && (
                        <button
                            onClick={submitSurvey}
                            disabled={completing}
                            className='bg-brand-crimson text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity'
                        >
                            {completing ? 'Submitting...' : 'Submit reflection' }
                        </button>
                    )}

                    {surveySubmitted && (
                        <p className='text-sm text-brand-teal font-medium flex items-center gap-1.5'>
                            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Reflection submitted
                        </p>
                    )}
                </div>
            )}

            {/* Complete button (content-only lessons) */}
            {!hasSurvey && (
                <div className='mb-8'>
                    {completeError && <p className='text-sm text-red-600 mb-3'>{completeError}</p>}
                    {!completed ? (
                        <button
                            onClick={markComplete}
                            disabled={completing}
                            className='bg-brand-crimson text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity'
                        >
                            {completing ? 'Saving...' : 'Mark complete'}
                        </button>
                    ) : (
                        <span className='text-sm text-brand-teal font-medium flex items-center gap-1.5'>
                            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Lesson complete
                        </span>
                    )}
                </div>
            )}

            {/* Prev / Next navigation */}
            <div className={`flex items-center pt-6 border-t border-gray-200 ${onPrev ? 'justify-between' : 'justify-end '}`}>
                {onPrev && (
                    <button
                        onClick={onPrev}
                        className='flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors'
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Previous
                    </button>
                )}

                {onNext && (
                    <button
                        onClick={onNext}
                        className='flex items-center gap-1.5 text-sm font-medium px-5 py-2 rounded-lg bg-brand-gold text-gray-900
                            disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity'
                    >
                        {isLast ? 'Finish' : 'Next lesson'}
                        {!isLast && (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        )}
                    </button>
                )}

                {isLast && completed && (
                    <Link
                        to="/dashboard"
                        className='flex items-center gap-1.5 text-sm font-medium px-5 py-2 rounded-lg bg-brand-teal text-white hover:opacity-90 transition-opacity'
                    >
                        Back to Dashboard →
                    </Link>
                )}
            </div>
        </article>
    );
};

export default Lesson;
