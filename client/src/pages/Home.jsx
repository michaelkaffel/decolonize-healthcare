import NewsletterSignup from '../components/NewsletterSignup';

const HERO_IMG = '/home-hero.png';
const ABOUT_IMG = '/home-about.png';

const Home = () => (
    <>
        <section>
            <img
                src={HERO_IMG}
                alt='Diverse group of people wearing masks'
                className='w-full h-[420px] md:h-[520px] object-cover'
            />
            <div className='bg-white text-center px-6 py-16'>
                <h1 className='font-display text-5xl md:text-7xl font-bold text-brand-gold uppercase tracking-wide leading-tight mb-6'>
                    Welcome to<br />Decolonize Healthcare
                </h1>
                <p className='text-brand-crimson font-semibold text-xl mb-2'>
                    Upgrate the way you think about health.
                </p>
                <p className='text-brand-crimson italic text-lg mb-14' >
                    Health starts at home.
                </p>

                <div className='max-w-2xl mx-auto'>
                    <h2 className='font-display text-3xl font-bold text-brand-gold uppercase mb-3'>
                        Stay Informed
                    </h2>
                    <p className='mb-3'>
                        Subscribe to receive our monthly newsletter featuring educational videos,
                        thought-provoking articles, and news about programs and pop-up clinic events.
                    </p>
                    <NewsletterSignup />
                </div>
            </div>
        </section>

        <section className='flex flex-col md:flex-row'>
            <div className='md:w-1/2 min-h-[400px]'>
                <img
                    src={ABOUT_IMG}
                    alt="Doctor listening to a child's heartbeat"
                    className='w-full h-full object-cover'
                />
            </div>
            <div className='md:w-1/2 bg-brand-gold flex items-center px-10 md:px-16 py-16'>
                <div className='text-white text-center'>
                    <p className='text-lg leading-relaxed mb-6'>
                        Decolonize Healthcare is your free online home to grow in your knowledge
                        of human biology, nutrition, movement, mental health and so much more.
                    </p>
                    <p className='text-lg leading-relaxed mb-10'>
                        Our goal is to help you be and feel more qualified to make informed
                        decisions for your health and life based on reliable modern sciences'
                        investigations into modern and ancient healing techniques.
                    </p>
                    <p className='text-brand-crimson'>
                        Contact us at{' '}
                        <a
                            href='mailto:decolonizehealthcare@gmail.com'
                            className='underline hover:opacity-80 transition'
                        >
                            decolonizehealthcare@gmail.com
                        </a>
                    </p>
                </div>
            </div>
        </section>
    </>
);

export default Home;