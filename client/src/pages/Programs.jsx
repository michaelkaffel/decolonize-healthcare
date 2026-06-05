import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourses } from '../store/coursesSlice';
import EnrollButton from '../components/EnrollButton';

const SkeletonCard = () => (
    <div className='flex flex-col rounded-2xl bg-white shadow-sm overflow-hidden animate-pulse'>
        <div className='h-40 w-full bg-gray-200' />
        <div className='flex flex-1 flex-col p-6'>
            <div className='h-4 bg-gray-200 rounded w-3/4 mb-2' />
            <div className='h-3 bg-gray-100 rounded w-full mb-1' />
            <div className='h-3 bg-gray-100 rounded w-full mb-1' />
            <div className='h-3 bg-gray-100 rounded w-2/3 mb-4' />
            <div className='mt-auto flex items-center justify-between gap-4'>
                <div className='h-5 bg-gray-200 rounded w-12' />
                <div className='h-9 bg-gray-200 rounded-lg w-28' />
            </div>
        </div>
    </div>
);

const Programs = () => {
    const dispatch = useDispatch();
    const { items: courses, status } = useSelector((state) => state.courses);
    const loading = status === 'loading' || status === 'idle';

    useEffect(() => {
        if (status === 'idle') dispatch(fetchCourses());
    }, [dispatch, status]);

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
                    <div className='grid gap-6 sm:grid-cols-2'>
                        {Array.from({ length: 4 }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
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
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};


const CourseCard = ({ course }) => {

    const price = course.price === 0 ? 'Free' : `$${(course.price / 100).toFixed(2)}`;

    return (
        <div className='flex flex-col rounded-2xl bg-white shadow-sm overflow-hidden'>
            {course.thumbnail && (
                <Link to={`/programs/${course.slug}`}>
                    <img
                        src={course.thumbnail}
                        alt={course.title}
                        className='h-40 w-full object-cover'
                    />
                </Link>
            )}
            <div className='flex flex-1 flex-col p-6'>
                <Link to={`/programs/${course.slug}`}>
                    <h2 className='mb-1 text-base font-semibold text-gray-900'>
                        {course.title}
                    </h2>
                </Link>
                <p className='mb-4 text-sm text-gray-500 line-clamp-3'>
                    {course.description}
                </p>
                <div className='mt-auto flex items-center justify-between gap-4'>
                    <span className='text-lg font-semibold text-gray-900'>{price}</span>
                    <EnrollButton course={course} variant='card' />
                </div>
            </div>
        </div>
    );
};

export default Programs;
