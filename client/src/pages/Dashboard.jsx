import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEnrollments } from '../store/enrollmentsSlice';
import { fetchProgress } from '../store/progressSlice';



const Dashboard = () => {
    const dispatch = useDispatch();
    const { name } = useSelector((state) => state.user);
    const { items: enrollments, status: enrollmentsStatus } = useSelector((state) => state.enrollments);
    const { byCourse } = useSelector((state) => state.progress);

    useEffect(() => {
        dispatch(fetchEnrollments());
    }, [dispatch]);

    useEffect(() => {
        for (const enrollment of enrollments) {
            dispatch(fetchProgress(enrollment.course._id))
        }
    }, [enrollments, dispatch]);

    const firstName = name?.split(' ')[0] ?? 'there';
    const loading = enrollmentsStatus === 'loading';

    return (
        <div className='flex-1'>
            <div className='mx-auto max-w-4xl px-6 py-12'>
                <div className='mb-10'>
                    <h1 className='text-3xl font-semibold text-gray-900'>
                        Welcome {firstName}
                    </h1>
                    <p className='mt-1 text-sm text-gray-500'>Here's what you're working on.</p>
                </div>

                {loading && (
                    <div className='text-sm text-gray-400'>Loading your courses...</div>
                )}

                {!loading && enrollments.length === 0 && (
                    <div className='flex flex-col items-center justify-center rounded-2xl bg-white px-8 py-16 shadow-sm text-center'>
                        <p className='mb-2 text-lg font-medium text-gray-800'>No courses yet</p>
                        <p className='mb-6 text-sm text-gray-500'>
                            Browse our programmes and start learning today.
                        </p>
                        <Link
                            to='/programs'
                            className='rounded-full bg-brand-crimson px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-coral'
                        >
                            Browse courses
                        </Link>
                    </div>
                )}

                {!loading && enrollments.length > 0 && (
                    <div className='grid gap-6 sm:grid-cols-2'>
                        {enrollments.map((enrollment) => {
                            const course = enrollment.course;
                            const progress = byCourse[course._id];
                            return (
                                <CourseCard
                                    key={enrollment._id}
                                    course={course}
                                    progress={progress}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

const CourseCard = ({ course, progress }) => {
    const completed = progress?.completed ?? 0;
    const total = progress?.total ?? 0;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

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
                <h2 className='mb-1 text-base font-semibold text-gray-900'>{course.title}</h2>
                <p className='mb-4 text-sm text-gray-500 line-clamp-2'>{course.description}</p>

                <div className='mt-auto'>
                    <div className='mb-1 flex justify-between text-xs text-gray-400'>
                        <span>{completed} of {total} lessons complete</span>
                        <span>{percent}%</span>
                    </div>
                    <div className='mb-4 h-1.5 w-full rounded-full bg-gray-100'>
                        <div
                            className='h-1.5 rounded-full bg-brand-coral transition-all'
                            style={{ width: `${percent}%` }}
                        />
                    </div>

                    <Link
                        to={`/courses/${course.slug}/learn`}
                        className='block w-full rounded-full bg-brand-crimson py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-brand-coral'
                    >
                        {percent === 0 ? 'Start course' : percent === 100 ? 'Review course' : 'Continue'}
                    </Link>

                </div>
            </div>
        </div>
    );
};

export default Dashboard;
