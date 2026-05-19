import fm from 'front-matter';

const rawModules = import.meta.glob(
    '../../../content/articles/*.md',
    { query: '?raw', import: 'default', eager: true }
);

export const getAllArticles = () => {
    return Object.values(rawModules)
        .map(raw => fm(raw).attributes)
        .filter(d => d.slug && d.publishedAt)
        .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
};

export const getAllArticlesBySlug = (slug) => {
    for (const raw of Object.values(rawModules)) {
        const { attributes, body } = fm(raw);
        if (attributes.slug === slug) return { ...attributes, body }
    }
    return null;
};