import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const About = () => {
    return (
        <div className='min-h-screen bg-white'>
            <SEO
                title='About'
                path='/about'
                description="Decolonize Healthcare bridges ancient healing practices and modern science to help everyone make informed decisions about their own health — free, no credentials required."
            />
            {/* Hero background image */}
            <div
                className='relative px-6 min-h-[33vh] flex items-center bg-brand-gold lg:bg-contain bg-center bg-no-repeat'
                style={{ backgroundImage: "url('/illustrations/about-hero.svg')" }}
            />

            {/* Hero text */}
            <div className='bg-brand-gold text-center px-4 pb-10'>
                <h1 className='text-3xl font-semibold text-white mb-4'>
                    About <span className='font-bold'>Decolonize Healthcare</span>
                </h1>
                <p className='text-white/90 max-w-2xl mx-auto leading-relaxed'>
                    We help you take control of your own health — safely and effectively —
                    using ancient wisdom and modern science education.
                </p>
            </div>

            {/* Belief statement */}
            <section className='bg-white py-14 px-6'>
                <div className='max-w-2xl mx-auto text-center'>
                    <p className='text-lg text-gray-700 leading-relaxed italic'>
                        "The mixing and sharing of ideas, knowledge, and ways of knowing is
                        happening in a way never before possible."
                    </p>
                </div>
            </section>

            {/* Main content */}
            <section className='bg-brand-cream py-14 px-6'>
                <div className='max-w-3xl mx-auto space-y-12'>

                    {/* Vision */}
                    <div className='flex gap-6 items-start'>
                        <div className='mt-1 flex-shrink-0 w-10 h-10 rounded-full bg-brand-gold flex items-center justify-center'>
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7
                                        -1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className='text-xl font-bold text-gray-900 mb-2'>Our Vision</h2>
                            <p className='text-gray-700 leading-relaxed'>
                                Decolonize Healthcare holds a vision of patient-empowered natural healing through
                                ancient practices and modern scientific advancement. We believe every person has
                                the right to understand their own body and make informed decisions about their health.
                            </p>
                        </div>
                    </div>

                    {/* Mission */}
                    <div className='flex gap-6 items-start'>
                        <div className='mt-1 flex-shrink-0 w-10 h-10 rounded-full bg-brand-crimson flex items-center justify-center'>
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13
                                        C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477
                                        14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247
                                        18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <div>
                            <h2 className='text-xl font-bold text-gray-900 mb-2'>Our Mission</h2>
                            <p className='text-gray-700 leading-relaxed'>
                                Our primary mission is to provide zero-cost, health-related science and education
                                to the public — so that everyone is better equipped to make their own decisions
                                when considering health-related concerns. No credentials required. No paywalls.
                                Just the best resources, organized so you can actually use them.
                            </p>
                        </div>
                    </div>

                    {/* Background */}
                    <div className='flex gap-6 items-start'>
                        <div className='mt-1 flex-shrink-0 w-10 h-10 rounded-full bg-brand-teal flex items-center justify-center'>
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className='text-xl font-bold text-gray-900 mb-2'>Why "Decolonize"?</h2>
                            <p className='text-gray-700 leading-relaxed mb-3'>
                                Modern allopathic medicine took over America at the turn of the century — driven
                                by events like the Flexner Report and the rise of pharmaceutical drugs. In the
                                wake of that shift, many ancient healing practices and ways of knowing were
                                suppressed or lost entirely.
                            </p>
                            <p className='text-gray-700 leading-relaxed'>
                                Some of what was lost is gone forever. But many healing modalities that survived
                                are now being investigated by modern science — studied to better understand
                                their efficacy and mechanisms of action. We're here to bridge that gap.
                            </p>
                        </div>
                    </div>

                    {/* Goal */}
                    <div className='flex gap-6 items-start'>
                        <div className='mt-1 flex-shrink-0 w-10 h-10 rounded-full bg-brand-gold flex items-center justify-center'>
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className='text-xl font-bold text-gray-900 mb-2'>Our Goals</h2>
                            <p className='text-gray-700 leading-relaxed'>
                                To bring everyone access to alternative, non-pharmaceutical, safe, and effective
                                options for the things that ail us — rooted in evidence, informed by tradition,
                                and free from gatekeeping.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA strip */}
            <section className='bg-white py-16 px-6 text-center'>
                <h2 className='text-2xl font-bold text-gray-900 mb-3'>Ready to dig in?</h2>
                <p className='text-gray-600 mb-8 max-w-md mx-auto'>
                    Browse our free education resources or enroll in a program to go deeper.
                </p>
                <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                    <Link
                        to="/education"
                        className='inline-block bg-brand-gold text-white font-semibold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity'
                    >
                        Explore Education
                    </Link>
                    <Link
                        to="/programs"
                        className='inline-block bg-brand-crimson text-white font-semibold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity'
                    >
                        View Programs
                    </Link>
                </div>
            </section>
        </div>
    )
};

export default About;
