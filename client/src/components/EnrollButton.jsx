import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEnrollments } from '../store/enrollmentsSlice';

const EnrollButton = ({ course, className = '', variant = 'detail' }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { data: user } = useSelector((state) => state.user);
    const { items: enrollments } = useSelector((state) => state.enrollments);

    const enrolled = enrollments.some((e) => e.course.id === course.id);
    const isFree = course.price === 0;

    const base = `rounded-full px-6 py-3 text-sm font-medium text-white transition-colors ${className}`;

    if (enrolled) {
        return (
            <Link
                to={`/courses/${course.slug}/learn`}
                className={`${base} bg-brand-green hover:opacity-90`}
            >
                Go to course
            </Link>
        );
    }

    if (!user || !enrolled && variant === 'card') {
        return (
            <Link
                to={`/programs/${course.slug}`}
                className={`${base} bg-brand-crimson hover:bg-brand-coral`}
            >
                {enrolled ? 'Go to course' : 'Learn more'}
            </Link>
        );
    }

    if (!user) {
        return (
            <Link
                to='/login'
                className={`${base} bg-brand-crimson hover:bg-brand-coral`}
            >
                Login to enroll
            </Link>
        )
    }

    if (isFree) {
        const handleFreeEnroll = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/enrollments/free`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ courseId: course.id }),
                });
                if (res.ok) {
                    await dispatch(fetchEnrollments());
                    navigate('/dashboard');
                }
            } catch (err) {
                console.error('Free enrollment error', err)
            }
        };

        return (
            <button
                onClick={handleFreeEnroll}
                className={`${base} bg-brand-crimson hover:bg-brand-coral`}
            >
                Enroll now
            </button>
        );
    }

    const handleBuy = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/checkout/create-session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ courseId: course.id }),
            });
            const data = await res.json();
            if (data.url) window.location.href = data.url;
        } catch (err) {
            console.error('Checkout error', err);
        }
    };

    return (
        <button
            onClick={handleBuy}
            className={`${base} bg-brand-crimson hover:bg-brand-coral`}
        >
            Buy Now
        </button>
    );
};

export default EnrollButton;