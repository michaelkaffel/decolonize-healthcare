import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'
import { getAllArticlesBySlug, getAllArticles } from '../utils/markdown';
import ShareButtons from '../components/ShareButtons';
import RecentPosts from '../components/RecentPosts';
import NewsletterSignup from '../components/NewsletterSignup';
import formatDate from '../utils/formatDate';
import SEO from '../components/SEO';
import '../styles/article.css';

const ArticleDetail = () => {
    const { slug } = useParams();
    const article = getAllArticlesBySlug(slug);
    const AllArticles = getAllArticles();

    useEffect(() => { window.scrollTo(0,0); }, [slug]);

    if (!article) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <div className='text-center'>
                    <h1 className='text-2xl font-bold text-brand-crimson mb-3'>
                        Article not found
                    </h1>
                    <Link to="/articles" className='text-sm text-brand-crimson underline'>
                        ← Back to Articles
                    </Link>
                </div>
            </div>
        );
    }

    const { title, subtitle, excerpt, author, publishedAt, readTime, tags, body } = article;
    const recent = AllArticles.filter(a => a.slug !== slug).slice(0, 3);

    return (
        <div className='min-h-screen bg-white'>
            <SEO 
                title={title}
                description={subtitle || excerpt || undefined}
                path={`/articles/${slug}`}
                type='article'
            />
            <div className='max-w-3xl mx-auto px-6 pt-10'>
                <Link
                    to='/articles'
                    className='text-sm text-gray-400 hover:text-brand-crimson transition-colors'
                >
                    ← All Articles
                </Link>
            </div>

            <header className='max-w-3xl mx-auto px-6 pt-6 pb-8'>

                {tags?.length > 0 && (
                    <div className='flex flex-wrap gap-2 mb-5'>
                        {tags.map(t => (
                            <span
                                key={t}
                                className='text-xs font-medium text-brand-crimson bg-brand-crimson/10 px-3 py-1 rounded-full capitalize'
                            >
                                {t}
                            </span>
                        ))}
                    </div>
                )}

                <h1 className='text-3xl md:text-4xl font-bold text-brand-crimson leading-tight mb-4'>
                    {title}
                </h1>

                {subtitle && (
                    <h2 className='text-xl text-gray-500 font-normal leading-relaxed mb-5'>
                        {subtitle}
                    </h2>
                )}

                <div className='flex items-center gap-2 text-sm text-gray-500'>
                    <span className='font-medium text-gray-700'>{author || 'Owl C Medicine'}</span>
                    <span>·</span>
                    <span>{formatDate(publishedAt)}</span>
                    {readTime && (
                        <>
                            <span>·</span>
                            <span>{readTime} min read</span>
                        </>
                    )}
                </div>
            </header>

            <div className='max-w-3xl mx-auto px-6'>
                <hr className='border-gray-100 mb-8' />
            </div>

            <article className='article-body max-w-3xl mx-auto px-6 pb-10'>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
            </article>
            
            <div className='max-w-3xl mx-auto px-6 pb-10'>
                <ShareButtons title={title} />
            </div>

            <div className='max-w-3xl mx-auto px-6 pb-16'>
                <NewsletterSignup />
            </div>

            <RecentPosts articles={recent} />
        </div>
    )
};

export default ArticleDetail;