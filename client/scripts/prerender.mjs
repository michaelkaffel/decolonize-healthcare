import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDir = path.resolve(__dirname, '..');
const distDir = path.resolve(clientDir, 'dist');
const serverDir = path.resolve(clientDir, 'dist-server');
const contentDir = path.resolve(clientDir, '..', 'content', 'articles');

// ENV
// On Vercel, MONGODB_URI is injected directly. Locally, load from server/.env.
const envFile = path.resolve(__dirname, '../../server/.env');
if (fs.existsSync(envFile)) {
    const { default: dotenv } = await import('dotenv');
    dotenv.config({ path: envFile });
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error('MONGODB_URI  is required for prerendering');

// Route discovery

async function getCourseSlugs() {
    const { default: mongoose } = await import('mongoose');
    const schema = new mongoose.Schema({ slug: String, published: Boolean });
    const Course = mongoose.model('Course', schema);
    await mongoose.connect(MONGODB_URI);
    try {
        const courses = await Course.find({ published: true }, 'slug').lean()
        return courses.map(c => c.slug);
    } finally {
        await mongoose.disconnect();
    }
}

function getArticleSlugs() {
    if (!fs.existsSync(contentDir)) return [];
    return fs.readdirSync(contentDir)
        .filter(f => f.endsWith('.md'))
        .map(f => f.replace(/\.md$/, ''));
}

// Static routes

const STATIC_ROUTES = [
    '/',
    '/about',
    '/articles',
    '/programs',
    '/education',
    '/education/childhood-adversity',
    '/education/neurobiology',
    '/education/anatomy-physiology',
    '/education/mental-health',
    '/education/movement',
    '/education/how-to-understand-a-scientific-article',
    '/education/behavioral-biology',
    '/books',
    '/partners',
    '/login',
    '/register',
];

// Main

async function prerender() {
    console.log('\n🚀 Starting prerender...\n');

    const [courseSlugs, articleSlugs] = await Promise.all([
        getCourseSlugs(),
        Promise.resolve(getArticleSlugs())
    ]);

    const routes = [
        ...STATIC_ROUTES,
        ...articleSlugs.map(s => `/articles/${s}`),
        ...courseSlugs.map(s => `/programs/${s}`),
    ];

    console.log(`📋 ${routes.length} routes to render\n`)

    // Load render function from SSR build
    const { render } = await import(path.resolve(serverDir, 'entry-server.js'));

    // HTML template from client build
    const template = fs.readFileSync(path.resolve(distDir, 'index.html'), 'utf-8');

    let ok = 0, fail = 0

    for (const route of routes) {
        try {
            const { html: appHtml, helmet } = render(route);

            // Build helmet tag string
            const helmetTags = [
                helmet?.title?.toString(),
                helmet?.meta?.toString(),
                helmet?.link?.toString(),
            ].filter(s => s && s.trim()).join('\n    ');

            const html = template
                .replace('<!--ssr-outlet-->', appHtml)
                .replace('</head>', `    ${helmetTags}\n  </head>`);

            // Write to dist
            const outPath = route === '/'
                ? path.resolve(distDir, 'index.html')
                : path.resolve(distDir, route.slice(1), 'index.html')

            fs.mkdirSync(path.dirname(outPath), { recursive: true });
            fs.writeFileSync(outPath, html);
            console.log(`  ✅  ${route}`);
            ok++;
        } catch(err) {
            console.error(`  ❌  ${route}: ${err.message}`);
            fail++;
        }
    }

    console.log(`\n✨ Prerender complete — ${ok} succeeded, ${fail} failed\n`);
    if (fail > 0) process.exit(1);
}

prerender().catch(err => {
    console.error('\n💥 Prerender failed:', err);
    process.exit(1);
})

