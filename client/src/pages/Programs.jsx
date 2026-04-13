import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourses } from '../store/coursesSlice';

const Programs = () => {
    const dispatch = useDispatch();
    const { items: courses, status } = useSelector((state) => state.courses);
    const { data: user } = useSelector((state) => state.user);
    const { items: enrollments } = useSelector((state) => state.enrollments);

    useEffect(() => {
        if (status === 'idle') dispatch(fetchCourses());
    }, [dispatch, status]);

    const enrolledCourseIds = new Set(enrollments.map((e) => e.course.id));
    const loading = status === 'loading';

    return (
        <div className='flex-1'>
            <div
                className='relative px-6 min-h-[33vh] flex items-center bg-brand-gold lg:bg-contain bg-center bg-no-repeat'
                style={{ backgroundImage: "url('/illustrations/programs-hero.svg')" }}
            >
            </div>
            <div className='mx-auto text-center z-10 bg-brand-gold p-4'>
                <h1 className='text-3xl font-semibold text-white mb-4'>
                    Join a <span className='font-bold'>program</span> that interests you
                </h1>
                <p className='text-white mx-auto max-w-[80%] leading-relaxed'>
                    Join in on tons of ways to help you live a better life. Prescription free!
                    These programs are easily applicable variations of scientifically proven
                    methods to increase mental, physical and social health without the need for
                    oversight from a doctor.
                </p>
            </div>
            <div className='mx-auto max-w-4xl px-6 py-12'>
                {loading && (
                    <div className='text-sm text-gray-400'>Loading programmes...</div>
                )}

                {!loading && courses.length === 0 && (
                    <div className='text-sm text-gray-500'>No programmes available yet. Check back soon.</div>
                )}

                {!loading && courses.length > 0 && (
                    <div className='grid gap-6 sm:grid-cols-2'>
                        {courses.map((course) => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                enrolled={enrolledCourseIds.has(course.id)}
                                user={user}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};


const CourseCard = ({ course, enrolled, user }) => {
    const price = `$${(course.price / 100).toFixed(2)}`;

    return (
        <div className='flex flex-col rounded-2xl bg-white shadow-sm overflow-hidden'>
            {course.thumbnail && (
                <img
                    src={course.thumbnail}
                    alt={course.title}
                    className='h-40 w-full object-cover'
                />
            )}
            <div className='flex flex-1 flex-col p-6'>
                <h2 className='mb-1 text-base font-semibold text-gray-900'>
                    {course.title}
                </h2>
                <p className='mb-4 text-sm text-gray-500 line-clamp-3'>
                    {course.description}
                </p>
                <div className='mt-auto flex items-center justify-between gap-4'>
                    <span className='text-lg font-semibold text-gray-900'>{price}</span>

                    {enrolled ? (
                        <Link
                            to={`/courses/${course.slug}/learn`}
                            className='rounded-full bg-brand-green px-5 py-2 text-sm font-medium text-white transition-colors hover:opacity-90'
                        >
                            Go to course
                        </Link>
                    ) : user ? (
                        <BuyButton courseId={course.id} slug={course.slug} />
                    ) : (
                        <Link
                            to='/register'
                            className='rounded-full bg-brand-crimson px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-coral'
                        >
                            Enroll now
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

const BuyButton = ({ courseId, slug }) => {
    const handleBuy = async () => {
        try {
            const res = await fetch('/api/checkout/create-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ courseId }),
            });
            const data = await res.json();
            if (data.url) window.location.href = data.url;
        } catch {
            console.error('Checkout error');
        }
    };

    return (
        <button
            onClick={handleBuy}
            className='rounded-full bg-brand-crimson px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-coral'
        >
            Enroll now
        </button>
    )
}

export default Programs;
