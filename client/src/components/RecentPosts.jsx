import { Link } from 'react-router-dom'
import formatDate from '../utils/formatDate';

const RecentPosts = ({ articles }) => {
    if (!articles?.length) return null;

    return (
        <div className='border-t border-gray-100 bg-gray-50 py-14'>
            <div className='max-w-3xl mx-auto px-6'>
                <div className='flex items-center justify-between mb-8'>
                    <h2 className='text-xl font-bold text-brand-forest'>
                        Recent Posts
                    </h2>
                    <Link
                        to='/articles'
                        className='text-sm text0brand-crimson hover:underline'
                    >
                        See all
                    </Link>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-3 gap-6'>
                    {articles.map(a => (
                        <Link
                            key={a.slug}
                            to={`/articles/${a.slug}`}
                            className='group flex flex-col bg-whote rounded-xl overflow-hidden hover:shadow-md transition-shadow'
                        >
                            <div className='h-36 bg-gray-100 overflow-hidden shrink-0'>
                                {a.coverImage ? (
                                    <img 
                                        src={a.coverImage}
                                        alt={a.title}
                                        className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
                                    />
                                ) : (
                                    <div className='w-full h-full flex items-center justify-center'>
                                        <span className='text-2xl opacity-10 text-brand-forest'>✦</span>
                                    </div>
                                )}
                            </div>

                            <div className='p-4 flex flex-col gap-1'>
                                <p className='text-xs text-gray-400'>{formatDate(a.publishedAt)}</p>
                                <h3 className='text-sm font-semibold text-brand-forest leading-snug line-clamp-2 group-hover:opacity-75 transition-opacity'>
                                    {a.title}
                                </h3>
                                {a.excerpt && (
                                    <p className='text-xs text-gray-500 line-clamp-2 mt-0.5'>{a.excerpt}</p>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RecentPosts;