import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import EnrollButton from '../components/EnrollButton';

const Program = () => {
    
    const { slug } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/courses/${slug}`);
                if (!res.ok) throw new Error('Course not found');
                const data = await res.json();
                setCourse(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false)
            }
        };
        fetchCourse();
    }, [slug]);

    if (loading) return <div className='p-12 text-sm text-gray-400'>Loading...</div>;
    if (error) return <div className='p-12 text-sm text-gray-500'>{error}</div>;

    const price = course.price === 0 ? 'Free' : `$${(course.price / 100).toFixed(2)}`;
    const totalLessons = course.modules.reduce((sum, mod) => sum + mod.lessons.length, 0);

    return (
        <div className='flex-1'>
            <div className='relative h-72 md:h-96 w-full overflow-hidden bg-brand-blush'>
                {course.thumbnail && (
                    <img 
                        src={course.thumbnail}
                        alt={course.title}
                        className='h-full w-full object-cover'
                    />
                )}
                <div className='absolute inset-0 bg-black/40 flex items-end'>
                    <div className='p-8 md:p-12'>
                        <h1 className='text-3xl md:text-4xl font-bold text-white mb-2'>
                            {course.title}
                        </h1>
                        <p className='text-white/80 text-sm'>
                            {course.modules.length} weeks · {totalLessons} lessons · {price}
                        </p>
                    </div>
                </div>
            </div>

            <div className='mx-auto max-w-3xl px-6 py-12'>
                <div className='flex flex-col md:flex-row md:items-start gap-10'>
                    <div className='flex-1'>
                        <h2 className='text-lg font-semibold text-gray-900 mb-3'>About this program</h2>
                        <p className='text-gray-600 leading-relaxed whitespace-pre-line mb-10'>
                            {course.longDescription || course.description}
                        </p>

                        <h2 className='text-lg font-semibold text-gray-900 mb-3'>Course outline</h2>
                        <div className='space-y-4'>
                            {course.modules.map((mod, modIndex) => (
                                <div key={mod.id || modIndex}>
                                    <h3 className='text-sm font-semibold text-gray-800 mb-2'>
                                        {mod.title}
                                    </h3>
                                    <ul className='space-y-1'>
                                        {mod.lessons.filter(l => !l.title.startsWith('Survey:')).map((lesson, lessonIndex) => (
                                            <li
                                                key={lesson.id || lessonIndex}
                                                className='text-sm text-gray-500 flex items-center gap-2'
                                            >
                                                <span className='text-brand-crimson'>·</span>
                                                {lesson.title}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className='md:sticky md:top-24 md:w-56 flex flex-col items-center gap-4 rounded-2xl bg-white shadow-sm p-6'>
                        <span className='text-2xl font-bold text-gray-900'>{price}</span>
                        <EnrollButton course={course} className='w-full text-center' />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Program;
