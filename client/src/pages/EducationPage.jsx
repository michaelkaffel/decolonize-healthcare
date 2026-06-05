import { useParams, Navigate, Link } from 'react-router-dom';
import SEO from '../components/SEO';

const PageHero = ({ title, tagline, image }) => (
    <div className='relative w-full h-64 sm:h-80 overflow-hidden'>
        <img
            src={image}
            alt={title}
            className='absolute inset-0 w-full h-full object-cover'
        />
        <div className='absolute inset-0 bg-black/50' />
        <div className='relative z-10 flex flex-col items-center justify-center h-full text-center px-6 sm:px-12'>
            <h1 className='text-2xl sm:text-4xl font-bold text-white uppercase underline underline-offset-8 decoration-1 mb-3'>
                {title}
            </h1>
            {tagline && <p className='text-white/90 text-base sm:text-lg'>{tagline}</p>}
        </div>
    </div>
);

const Intro = ({ children }) => (
    <div className='max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10'>
        <div className='text-gray-700 leading-relaxed text-base sm:text-lg space-y-4'>{children}</div>
    </div>
);

const Resource = ({ emoji, title, description, url }) => (
    <div className='bg-white rounded-xl border border-gray-100 shadow-sm p-6'>
        <div className='flex gap-4'>
            <div>
                <h3 className='font-bold text-gray-900 mb-2'>{title}</h3>
                {description && <p className='text-sm text-gray-600 leading-relaxed mb-3'>{description}</p>}
                <a
                    href={url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center gap-1 text-sm font-medium text-brand-crimson hover:underline'
                >
                    Visit resource
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                </a>
            </div>
        </div>
    </div>
);

const YouTubeEmbed = ({ id, title }) => (
    <div className='rounded-xl overflow-hidden shadow-md aspect-video'>
        <iframe
            className='w-full h-full'
            src={`https://www.youtube.com/embed/${id}`}
            title={title}
            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
            allowFullScreen
        />
    </div>
);

const SectionLabel = ({ children }) => (
    <h2 className='text-lg font-bold text-gray-900 border-l-4 border-brand-crimson pl-3 mb-4'>{children}</h2>
);

const BackLink = () => (
    <div className='max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-12'>
        <Link
            to='/education'
            className='inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-crimson transition-colors'
        >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            All topics
        </Link>
    </div>
);

const ChildhoodAdversity = () => (
    <>
        <PageHero
            title='Childhood Adversity'
            tagline="America's greatest unaddressed public health threat"
            image='/images/education/childhood-adversity.jpg'
        />
        <Intro>
            <p>
                Decolonizing health means understanding what stress and safety actually do to a developing body.
                This isn't just about trauma—it's about how everyday conditions like housing instability, racism, or underfunded schools shape nervous systems in real time. These resources cut through the noise and show how childhood experiences literally build or break the brain's architecture. This is core public health knowledge that should've never been kept behind paywalls.
            </p>
        </Intro>

        <div className='max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 space-y-4'>
            <SectionLabel>Free Resources</SectionLabel>
            <Resource
                emoji='🏛️'
                title="Harvard's Center on the Developing Child"
                description="One of the clearest, most accessible breakdowns of how early adversity affects lifelong mental and physical health. Great videos, short explainers, and research summaries — especially helpful for understanding toxic stress, resilience, and the science of early development without getting buried in academic speak."
                url='https://developingchild.harvard.edu'
            />
            <Resource
                emoji="📘"
                title="ACEs Too High / ACEs Connection"
                description="A community-driven site that translates the science of Adverse Childhood Experiences (ACEs) into stories, solutions, and policy action. It covers everything from the original ACEs study to current work in schools, prisons, and health systems."
                url="https://acestoohigh.com"
            />
            <Resource
                emoji="🎓"
                title="CDC – ACEs and Toxic Stress"
                description="The U.S. public health baseline. It explains how early adversity increases the risk of everything from heart disease to substance use — and what systems can actually do to prevent it. Includes simple infographics and data you can share or use in your own work."
                url="https://www.cdc.gov/violenceprevention/aces/index.html"
            />
            <Resource
                emoji="🧬"
                title="National Scientific Council on the Developing Child – Working Papers"
                description="If you want depth without fluff, these papers are written by top developmental scientists and translate core neurobiology, stress physiology, and brain development into plain English. Free to download and grounded in community relevance, not just clinical theory."
                url="https://developingchild.harvard.edu/resources/category/reports/working-papers/"
            />
            <Resource
                emoji="🧠"
                title="Jack Shonkoff on Early Stress (Videos)"
                description="Dr. Shonkoff is one of the clearest voices in early childhood development science. His short videos explain exactly how stress shapes brain circuits — and what kinds of support can buffer or reverse that impact."
                url="https://developingchild.harvard.edu/resources/video/"
            />
        </div>

        <div className='max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-3'>
            <SectionLabel>Introduction to ACEs</SectionLabel>
            <p className='text-sm text-gray-600 mb-4'>
                A wonderful introduction to what ACEs are and why they are the biggest unaddressed public
                health threat facing America today.
            </p>
            <YouTubeEmbed id="95ovIJ3dsNk" title="Adverse Childhood Experiences Study Introduction" />
        </div>
    </>
)

const Neurobiology = () => (
    <>
        <PageHero
            title="Neurobiology"
            tagline="Dopamine, serotonin, nor-epinephrine, testosterone, oxytocin"
            image="/images/education/neurobiology.jpg"
        />
        <Intro>
            <p>
                You don't need a PhD or student loans to understand how your brain works. And knowing how the
                body we live in works is quite a useful thing to know. Here are some of the best free resources
                on the internet to explore neurobiology from a practical, systems-level perspective — no fluff,
                no gatekeeping.
            </p>
        </Intro>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-4">
            <SectionLabel>Free Resources</SectionLabel>
            <Resource
                emoji="🧠"
                title="MIT OpenCourseWare – Neuroscience Lectures"
                description="Real college-level neuroscience, no enrollment required. MIT offers full lecture videos, notes, and assignments from actual brain and cognitive science courses. If you want to understand neurons, networks, and brain behavior from the ground up — this is the gold standard."
                url="https://ocw.mit.edu"
            />
            <Resource
                emoji="📘"
                title="Neuroscience Textbook – Free Online Version"
                description="The real deal nerdy stuff: Neuroscience (Purves et al.), a foundational textbook hosted for free by the NIH. Covers everything from cellular signaling to perception and memory. Clear enough for non-scientists, deep enough for practitioners."
                url="https://www.ncbi.nlm.nih.gov/books/NBK11154/"
            />
            <Resource
                emoji="🎓"
                title="Khan Academy – Nervous System Basics"
                description="Short, simple videos that explain the biology of neurons, synapses, and brain systems in plain language. Great for filling in gaps or building a basic understanding before diving deeper."
                url="https://www.khanacademy.org/science/biology/human-biology"
            />
            <Resource
                emoji="🧬"
                title="Coursera – Medical Neuroscience & Fundamentals Series"
                description="High-quality neuroscience courses from top universities like Duke and Harvard. You can audit them for free. Some are introductory, others dive into anatomy, disease, and brain function in detail — at your own pace."
                url="https://www.coursera.org"
            />
            <Resource
                emoji="🕸️"
                title="BrainFacts.org – Interactive, Accessible Learning"
                description="Created by the Society for Neuroscience, this site breaks down complex brain science with animations, articles, and myth-busting tools. Great for visual learners and anyone curious about how neuroscience connects to daily life."
                url="https://www.brainfacts.org"
            />
        </div>
    </>
);

const AnatomyPhysiology = () => (
    <>
        <PageHero
            title="Anatomy & Physiology"
            tagline="Muscles, nerves, and bones"
            image="/images/education/anatomy-physiology.jpg"
        />
        <Intro>
            <p>
                Decolonizing health means decentralizing knowledge. You don't need permission to learn how your
                body works. These open-access resources exist outside institutional gatekeeping — clear,
                thorough, and made to be shared. Whether you're reclaiming your own health literacy or
                supporting others, this is where practical, biological knowledge becomes public domain.
            </p>
        </Intro>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 space-y-4">
            <SectionLabel>Free Resources</SectionLabel>
            <Resource
                emoji="🧠"
                title="MIT OpenCourseWare – Human Anatomy & Physiology"
                description="World-class education made public. MIT's free course materials cover the structure and function of all major systems — with real lecture videos, study guides, and lab assignments. The kind of access most people are priced out of, now open to anyone."
                url="https://ocw.mit.edu"
            />
            <Resource
                emoji="📘"
                title="OpenStax Anatomy & Physiology – Free College Textbook"
                description="Used in universities across the U.S., but free online through OpenStax. Breaks down every major system of the human body, from cellular mechanics to integrated organ function — with diagrams, glossary terms, and review tools. No paywalls, no catch."
                url="https://openstax.org/books/anatomy-and-physiology/pages/1-introduction"
            />
            <Resource
                emoji="🎓"
                title="Khan Academy – Human Anatomy & Physiology"
                description="Simple, visual, and easy to digest. Khan Academy is one of the most accessible places to build your foundation in anatomy and physiology — from skeletal structure to hormonal regulation — without needing any background or credentials."
                url="https://www.khanacademy.org/science/health-and-medicine/human-anatomy-and-physiology"
            />
            <Resource
                emoji="🧬"
                title="Coursera – University-Level A&P (Free to Audit)"
                description="Top-tier universities like Duke and Michigan offer their A&P courses to the public through Coursera. When you audit the course it's completely free — including video lectures, interactive modules, and self-paced learning."
                url="https://www.coursera.org"
            />
            <Resource
                emoji="🖼️"
                title="Visible Body – 3D Anatomy Models"
                description="While the full toolkit is paid, Visible Body offers free web-based 3D models you can explore without an account. Rotate muscles, organs, and bones in real time. Powerful for visual learning and body literacy."
                url="https://www.visiblebody.com/learn"
            />
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-3">
            <SectionLabel>Owl's Personal Favorite</SectionLabel>
            <p className="text-sm text-gray-600 mb-4">
                If you're interested in learning passively while you chill or speed-clean, this CrashCourse
                A&P playlist on YouTube is the one. Highly recommended.
            </p>
            <YouTubeEmbed id="pVkUCrgQCCc" title="CrashCourse Anatomy & Physiology Playlist" />
        </div>
    </>
);

const MentalHealth = () => (
    <>
        <PageHero
            title="Mental Health"
            tagline="Depression, anxiety, mindfulness"
            image="/images/education/mental-health.jpg"
        />
        <Intro>
            <p>
                Get up to date on what science is telling us about mental health now. Learn about new
                technologies, plant medicine, and the interdependent nature of health.
            </p>
            <p>
                Below is a link to 10 of the best, newest evidence-based interventions for mental health.
                Since COVID-19 we have all struggled to keep our heads above water. But solutions exist. They
                may not be exactly what we want but they are real and waiting for us to utilize them when
                we can.
            </p>
            <p>
                The struggle with mental health is it ebbs and flows like the tide. If today isn't the day,
                come back tomorrow and see what there is to learn.
            </p>
        </Intro>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-4">
            <SectionLabel>Featured Resource</SectionLabel>
            <Resource
                emoji="💡"
                title="Top 10 Innovations Tackling Mental Ill-Health (World Economic Forum)"
                description="A curated look at the most promising new evidence-based approaches to mental health — from digital therapeutics to community-based care models. A great starting point for understanding where the field is actually headed."
                url="https://www.weforum.org/agenda/2021/09/these-are-the-top-10-innovations-tackling-mental-ill-health/"
            />
        </div>
    </>
);

const Movement = () => (
    <>
        <PageHero
            title="Movement"
            tagline="Exercise's way cooler older brother"
            image="/images/education/movement.jpg"
        />
        <Intro>
            <p>
                Forget gym memberships. Learn how much, how often, and what types of movement to add to your
                life to live better and longer. Along with lots of tips and tricks to add movement into your
                everyday life.
            </p>
            <p>
                Linked below is the incomparable Katy Bowman's introduction to movement. She is a practical
                genius at explaining and demonstrating exactly what modern humans are missing when it comes to
                movement and health.
            </p>
        </Intro>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-4">
            <SectionLabel>Featured Video</SectionLabel>
            <YouTubeEmbed id="eeN8efGa6C0" title="Nutritious Movement – Katy Bowman" />
            <div className="pt-2">
                <Resource
                    emoji="🏃"
                    title="Nutritious Movement – Katy Bowman's Site"
                    description="Katy Bowman's full resource library — books, podcasts, exercises, and practical guides for integrating real movement into your daily life. Not a workout routine. A completely different way of thinking about the body."
                    url="https://www.nutritiousmovement.com"
                />
            </div>
        </div>
    </>
);

const ScientificArticle = () => (
    <>
        <PageHero
            title="How to Understand a Scientific Article"
            tagline="P value, sample size, RCT, and meta-analysis"
            image="/images/education/scientific-article.jpg"
        />
        <Intro>
            <p>
                The golden era of the information age has quickly devolved into the disinformation age. Data
                doesn't lie, but it must be interpreted to have real-world value. This is why many people are
                finding themselves wanting to interpret scientific data themselves — and that's a wonderful
                desire, as well as a very tall order.
            </p>
            <p>
                These videos act as a brief introduction to the fundamentals you need to know to start doing
                your own research. You'll learn what order to read the sections in and how to extract key
                points to become a quality researcher. Watch them all to have the best foundation for your
                own analysis.
            </p>
        </Intro>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-8">
            <div className="space-y-3">
                <SectionLabel>How to Read a Scientific Paper</SectionLabel>
                <YouTubeEmbed id="t2K6mJkSWoA" title="How to Read a Scientific Paper" />
            </div>

            <div className="space-y-3">
                <SectionLabel>Why Skepticism Matters</SectionLabel>
                <p className="text-sm text-gray-600">
                    Now you know how to read through an article and understand the meaning and outcomes — but
                    that doesn't mean it was "good" science. There's a lot more to data interpretation than
                    most people realize.
                </p>
                <YouTubeEmbed id="GUpd2HJHUt8" title="Why Skepticism is Important in Science" />
            </div>

            <div className="space-y-3">
                <SectionLabel>The Complications of Good Science</SectionLabel>
                <p className="text-sm text-gray-600">
                    The final video explains some of the biggest complications scientists and researchers face
                    in interpretation and publication. It shows just how hard it is to create "good science."
                </p>
                <YouTubeEmbed id="42QuXLucH3Q" title="The Complications of Scientific Publication" />
            </div>

            <div className="bg-brand-blush rounded-xl p-6 text-sm text-gray-700 leading-relaxed">
                <p className="font-semibold text-brand-crimson mb-2">A final note</p>
                <p>
                    No matter what you hear or read, keep a skeptical ear on the subject — especially if you
                    find yourself wanting to agree immediately. Science is truly practiced like an art. It takes
                    humans with interests and experiences to interpret any data. So before jumping to
                    conclusions, remember to remain both open-minded and skeptical.
                </p>
                <p className="mt-3 italic text-gray-500">
                    "To have an open mind is a good thing — so long as it's not so open your brain falls out."
                </p>
            </div>
        </div>
    </>
);

const BehavioralBiology = () => (
    <>
        <PageHero
            title="Behavioral Biology"
            tagline="How our biology affects our behavior at our best and worst"
            image="/images/education/behavioral-biology.jpg"
        />
        <Intro>
            <p>
                This entire category was created with one teacher in mind: Dr. Robert Sapolsky. He is a
                behavioral biologist and primatologist with decades of experience studying and teaching at
                Stanford — often considered one of the greatest lecturers in Stanford's history.
            </p>
            <p>
                If you want to know how environment, genes, hormones, and neurotransmitters all come together
                to affect the human animal, look no further. He has written wonderful books that are
                powerhouses of information, presented so perfectly you'll have no idea how much you've learned
                until you accidentally bring up neurotransmitter functions at the dinner table.
            </p>
        </Intro>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-8">
            <div className="space-y-3">
                <SectionLabel>Stanford Lectures — Free, In Order, from One of the World's Best</SectionLabel>
                <p className="text-sm text-gray-600">
                    Live lecture recordings from Stanford. Free lectures, in order, from one of the greatest
                    lecturers in the world, from one of the best schools in the world, teaching one of the
                    coolest and most useful subjects in the world: human behavior. That's tens of thousands
                    of dollars saved on tuition. Enjoy, you lucky duck.
                </p>
                <YouTubeEmbed id="NNnIGh9g6fA" title="Dr. Sapolsky Stanford Behavioral Biology Lectures" />
                <a
                    href="https://www.youtube.com/watch?v=NNnIGh9g6fA&list=PLD7E21BF91F3F9683"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium text-brand-crimson hover:underline"
                >
                    View full playlist on YouTube
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                </a>
            </div>

            <div className="space-y-3">
                <SectionLabel>Nature vs. Nurture</SectionLabel>
                <p className="text-sm text-gray-600">
                    Many concepts that must be considered in the nature vs. nurture conversation. Simply put:
                    you can't separate the two. Turns out even people who commit the most severe acts carry
                    genes that, were they not severely harmed themselves, would have expressed very differently.
                </p>
                <YouTubeEmbed id="o-brqskIoBw" title="Dr. Sapolsky – Nature vs. Nurture" />
            </div>

            <div className="pt-2">
                <Resource
                    emoji="📚"
                    title="Behave — Dr. Sapolsky's Book"
                    description="Sapolsky's masterwork exploring the biology of humanity's best and worst moments. One of the most comprehensive, readable, and important books written on human behavior. Highly recommended."
                    url="https://www.goodreads.com/book/show/31170723-behave"
                />
            </div>
        </div>
    </>
);

// ─── Page map + router ────────────────────────────────────────────────────────

const pages = {
    'childhood-adversity': ChildhoodAdversity,
    'neurobiology': Neurobiology,
    'anatomy-physiology': AnatomyPhysiology,
    'mental-health': MentalHealth,
    'movement': Movement,
    'how-to-understand-a-scientific-article': ScientificArticle,
    'behavioral-biology': BehavioralBiology,
};

const meta = {
    'childhood-adversity': {
        title: 'Childhood Adversity',
        description: "Learn how childhood stress and trauma affects development and shapes us as adults. America's greatest unaddressed public health threat.",
    },
    'neurobiology': {
        title: 'Neurobiology',
        description: 'Understand how your brain actually works — dopamine, serotonin, norepinephrine, and more. Free resources, no credentials required.',
    },
    'anatomy-physiology': {
        title: 'Anatomy & Physiology',
        description: 'Learn how your body works — muscles, nerves, and bones. Free open-access resources for anyone reclaiming their own health literacy.',
    },
    'mental-health': {
        title: 'Mental Health',
        description: 'Get up to date on what science is telling us about mental health now — new technologies, plant medicine, and the interdependent nature of health.',
    },
    'movement': {
        title: 'Movement',
        description: "Forget gym memberships. Learn how much, how often, and what types of movement to add to your life to live better and longer.",
    },
    'how-to-understand-a-scientific-article': {
        title: 'How to Understand a Scientific Article',
        description: 'Tired of fake news and clickbait science? Learn to read, break down, and critically interpret scientific studies like a pro.',
    },
    'behavioral-biology': {
        title: 'Behavioral Biology',
        description: 'Understand how environment, genes, hormones, and neurotransmitters shape human behavior. Featuring Dr. Robert Sapolsky of Stanford.',
    },
};

const EducationPage = () => {
    const { slug } = useParams();
    const Page = pages[slug];

    if (!Page) return <Navigate to="/education" replace />;

    const { title, description } = meta[slug];

    return (
        <div className="bg-brand-cream min-h-screen">
            <SEO 
                title={title}
                description={description}
                path={`/education/${slug}`}
            />
            <Page />
            <BackLink />
        </div>
    );
};

export default EducationPage;
