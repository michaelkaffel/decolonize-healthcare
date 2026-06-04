import { Link } from 'react-router-dom'

const categories = [
    {
        slug: 'childhood-adversity',
        image: '/images/education/childhood-adversity.jpg',
        title: 'Childhood Adversity',
        tagline: "America's greatest unaddressed public health threat",
        description: 'Learn how childhood stress and trauma in early life affects children and how deeply it influences us all as adults.'
    },
    {
        slug: 'neurobiology',
        image: '/images/education/neurobiology.jpg',
        title: 'Neurobiology',
        tagline: 'Dopamine, serotonin, nor-epinephrine, testosterone, oxytocin',
        description: "Want to understand how your brain works? Learn the nuts and bolts of how basic neurotransmitters work. Hint: it's not what you think."
    },
    {
        slug: 'anatomy-physiology',
        image: '/images/education/anatomy-physiology.jpg',
        title: 'Anatomy & Physiology',
        tagline: 'Muscles, nerves, and bones',
        description: 'Body aches and pains? Learn which muscles do what to fix and prevent muscle aches and strains. No permission required.'
    },
    {
        slug: 'mental-health',
        image: '/images/education/mental-health.jpg',
        title: 'Mental Health',
        tagline: 'Depression, anxiety, mindfullness',
        description: 'Get up to date on what science is telling us about mental health now. New technologies, plant medicine, and the interdependent nature of health.'
    },
    {
        slug: 'movement',
        image: '/images/education/movement.jpg',
        title: 'Movement',
        tagline: "Exercise's way cooler older brother",
        description: 'Forget gym memberships. Learn how much, how often, and what types of movement to add to your life to live better and longer.'
    },
    {
        slug: 'how-to-understand-a-scientific-article',
        image: '/images/education/scientific-article.jpg',
        title: 'How to Understand a Scientific Article',
        tagline: 'P value, sample size, RCT, and meta-analysis',
        description: 'Tired of fake news and clickbait science? Learn to research like a pro — read, break down, and critically interpret studies that matter.'
    },
    {
        slug: 'behavioral-biology',
        image: '/images/education/behavioral-biology.jpg',
        title: 'Behavioral Biology',
        tagline: 'How our biology affects our behavior at our best and worst',
        description: 'Understand how environment, genes, hormones, and neurotransmitters come together to shape the human animal. Featuring Dr. Sapolsky.'
    }
]

const CategoryCard = ({ slug, image, title, tagline, description }) => (
    <Link
        to={`/education/${slug}`}
        className='relative block w-full h-64 sm:h-[32rem] overflow-hidden group'
    >

        <img
            src={image}
            alt={title}
            className='absolute inset-0 w-full object-cover group-hover:scale-105 transition-transform duration-500'
        />


        <div className='absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors duration-300' />
        <div className='relative z-10 flex flex-col items-center justify-center h-full text-center px-6 sm:px-12'>
            <h3 className='text-2xl sm:text-3xl font-bold text-white uppercase underline underline-offset-8 decoration-1 mb-4'>
                {title}
            </h3>
            <p className='text-white/90 text-base sm:text-lg mb-4'>
                {tagline}
            </p>
            <p className='text-white/75 text-sm sm:text-base max-w-2xl'>{description}</p>
        </div>
    </Link>
);

const Education = () => (
    <div className='bg-brand-cream min-h-screen'>

        <div
            className='relative px-6 min-h-[33vh] flex items-center bg-brand-gold lg:bg-contain bg-center bg-no-repeat'
            style={{ backgroundImage: "url('/illustrations/online-learning.svg')" }}
        />

        <div className='bg-brand-gold text-center px-4 pb-10'>

            <h1 className='text-3xl font-semibold text-white mb-4'>
                Welcome to the <span className="font-bold">Education Center</span>Education Center
            </h1>
            <p className='text-white/90 mx-auto mx-w-[80%] leading-relaxed'>
                Your place for health education. No credentials required, no paywalls —
                just the best free resources on the internet, organized so you can actually use them.
            </p>

        </div>

        <div className='bg-white border-b border-gray-100'>
            <div className='max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center'>
                <p className='text-gray-700 leading-relaxed text-base sm:text-lg'>
                    Categorical thinking is great for remembering lots of information — but it can make it hard to
                    see the whole dynamic picture. Pick a bucket to learn from. Then pick another one.{' '}
                    <em>
                        A jack of all trades is a master of none, and is often better than a master of one.
                    </em>
                </p>
            </div>
        </div>

        <div className='flex flex-col'>
            {categories.map(cat => (
                <CategoryCard key={cat.slug} {...cat} />
            ))}
        </div>
    </div>
);

export default Education;
