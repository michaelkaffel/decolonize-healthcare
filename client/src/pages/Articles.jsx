import { Link } from 'react-router-dom';
import parseFrontMatter from 'front-matter';
import NewsletterSignup from '../components/NewsletterSignup';

const rawFiles = import.meta.glob('../../../content/articles/*.md', { query: '?raw', import: 'default', eager: true });

const articles = Object.values(rawFiles)
    .map(raw => parseFrontMatter(raw).attributes)
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

const fmt = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

const Placeholder = ({ title }) => (
    <div className='w-full h-48 bg-gradient-to-br from-brand-blush to-brand-cream flex items-center justify-center p-6'>
        <p className='font-display text-brand-crimson/30 text-center text-sm font-bold uppercase tracking-widest leading-relaxed'>
            {title}
        </p>
    </div>
);

const ArticleCard = ({ article, featured = false }) => (
    <Link
        to={`/articles/${article.slug}`}
        className={`group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex ${featured ? 'flex-col md:flex-row' : 'flex-col'}`}
    >
        <div className={`overflow-hidden flex-shrink-0 ${featured ? 'md:w-2/5 h-56 md:h-auto' : 'h-48'}`}>
            {article.coverImage
                ? <img src={article.coverImage} alt={article.title} className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500' />
                : <Placeholder title={article.title} />
            }
        </div>
        <div className='p-6 flex flex-col justify-between flex-1'>
            <div>
                {article.tags?.[0] && (
                    <span className='text-xs font-semibold uppercase tracking-widest text-brand-coral mb-3 block'>
                        {article.tags[0]}
                    </span>
                )}
                <h2 className={`font-display font-bold text-brand-crimson leading-snug mb-3 group-hover:text-brand-coral transition-colors ${featured ? 'text-2xl md:text-3xl' : 'text-xl'}`}>
                    {article.title}
                </h2>
                <p className='text-gray-500 text-sm leading-relaxed line-clamp-3'>
                    {article.excerpt}
                </p>
            </div>
            <div className='mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400'>
                <span>{article.author}</span>
                <span>{fmt(article.publishedAt)} · {article.readTime} min read</span>
            </div>
        </div>
    </Link>
);

const Articles = () => {

    const [featured, ...rest] = articles;

    return (
        <div className='bg-brand-cream2 min-h-screen'>
            <div className='mx-auto max-w-7xl px-6 py-16'>

                <div className="mb-12">
                    <h1 className='font-display text-4xl md:text-5xl font-bold text-brand-crimson mb-3'>
                        Articles
                    </h1>
                    <p className='text-gray-500 text-lg'>
                        Perspectives on health, healing, and the science behind both.
                    </p>
                </div>


                {featured && (
                    <div className='mb-10'>
                        <ArticleCard article={featured} featured />
                    </div>
                )}

                <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                    {rest.map(a => <ArticleCard key={a.slug} article={a} />)}
                </div>

                <NewsletterSignup className='mt-10' />
            </div>
        </div>
    )
};

export default Articles;
