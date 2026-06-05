import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Decolonize Healthcare';
const DEFAULT_DESC = 'Education and resources for decolonizing healthcare — articles, courses, and community.';
const BASE_URL = 'https://decolonizehealthcare.com';

const SEO = ({ title, description, image, path, type = 'website' }) => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    const desc = description || DEFAULT_DESC;
    const canonical = path ? `${BASE_URL}${path}` : BASE_URL;
    const ogImage = image || `${BASE_URL}/images/og-default.jpg`;

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name='description' content={desc} />
            <link rel="canonical" href={canonical} />

            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={desc} />
            <meta property="og:type" content={type} />
            <meta property="og:url" content={canonical} />
            <meta property="og:image" content={ogImage} />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={desc} />
            <meta name="twitter:image" content={ogImage} />
        </Helmet>
    );
};

export default SEO;