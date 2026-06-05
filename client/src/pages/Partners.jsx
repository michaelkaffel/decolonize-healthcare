import SEO from '../components/SEO'

const partners = [
    {
        id: 'south-jersey-recovery',
        name: 'South Jersey Recovery Village',
        url: 'https://www.southjerseyrecovery.com/',
        contactUrl: 'https://www.therecoveryvillage.com/contact/',
        phone: '855-481-0416',
        intro:
            'The Recovery Village Cherry Hill at Cooper, like all Advanced Recovery Systems facilities, offers high-quality levels of client care and customer service. Beyond trusted, evidence-based treatment plans, they provide:',
        highlights: [
            {
                label: 'Expertise',
                body: 'A multidisciplinary staff of addiction specialists and healthcare professionals offering around-the-clock care, treating substance use disorders and co-occurring conditions simultaneously.',
            },
            {
                label: 'Quality & Accreditation',
                body: 'Facilities are licensed by state authorities and accredited by The Joint Commission — the gold standard in healthcare accreditation.',
            },
            {
                label: 'Nationwide Network',
                body: 'Locations in New Jersey, Ohio, Florida, Colorado, Washington, and Maryland mean a client is never far from a treatment facility.',
            },
            {
                label: 'Convenient Admissions',
                body: 'Instant insurance verification, same-day admissions, and other services that provide help when it\'s needed most.',
            },
            {
                label: 'Community Outreach',
                body: 'A dedicated team raises awareness through community events, educational functions, seminars, and more.',
            },
        ],
        support: [
            {
                label: '24/7 Real-Time Support',
                body: 'Phones and messaging services staffed around the clock by knowledgeable admissions representatives.',
            },
            {
                label: 'Drug Policies & Culture Assessments',
                body: 'The outreach team works with businesses to assess and create well-functioning policies that fit each workplace\'s culture.',
            },
            {
                label: 'Training & Compliance',
                body: 'Guidance and training for leadership on how to identify and manage substance-related issues in the workplace.',
            },
            {
                label: 'CE Events & Webinars',
                body: 'Resources to help partners stay up-to-date on best practices and cutting-edge breakthroughs in addiction medicine.',
            },
        ],
    },
];

const BulletList = ({ items }) => (
    <ul className='space-y-4 mt-4'>
        {items.map((item, i) => (
            <li key={i} className='flex gap-3'>
                <span className='mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-teal' />
                <p className='text-gray-700 leading-relaxed'>
                    <span className='font-semibold text-gray-900'>{item.label}: </span>
                    {item.body}
                </p>
            </li>
        ))}
    </ul>
);

const Partners = () => {
    return (
        <div className='min-h-screen bg-white'>
            <SEO 
                title='Partners'
                path='/partners'
                description='Decolonize Healthcare partners with organizations committed to accessible, compassionate, and evidence-based care — including addiction recovery and community health services.'
            />
            {/* Hero image */}
            <div 
                className='relative px-6 min-h-[33vh] flex items-center bg-brand-gold lg:bg-contain bg-center bg-no-repeat'
                style={{ backgroundImage: "url('/illustrations/partners-hero.svg')"}}
            />

            <div className='bg-brand-gold text-center px-4 pb-10'>
                <h1 className='text-3xl font-semibold text-white mb-4'>
                    Our <span className='font-bold'>Partners</span>
                </h1>
                <p className='text-white/90 max-w-2xl mx-auto leading-relaxed'>
                    Decolonize Healthcare is proud to work alongside organizations that share our
                    commitment to accessible, compassionate, and evidence-based care.
                </p>
            </div>

            {/* Partner cards */}
            <div className='max-w-3xl mx-auto px-6 py-16 space-y-20'>
                {partners.map((partner) => (
                    <div key={partner.id}>
                        {/* Partner header */}
                        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6'>
                            <h2 className='text-2xl font-bold text-gray-900'>
                                {partner.name}
                            </h2>
                            <a
                                href={partner.url}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='shrink-0 inline-block bg-brand-teal text-white px-6 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity text-sm whitespace-nowrap'
                            >
                                Visit Website →
                            </a>
                        </div>

                        {/* Intro blurb */}
                        <p className='text-gray-700 leading-relaxed'>{partner.intro}</p>

                        {/* Highlights */}
                        <BulletList items={partner.highlights} />

                        {/* Support section */}
                        <div className='mt-10 p-6 bg-brand-cream rounded-xl border border-gray-100'>
                            <h3 className='text-lg font-bold text-gray-900 mb-1'>
                                Partner Support &amp; Resources
                            </h3>
                            <p className='text-gray-600 text-sm mb-2'>
                                In addition to direct referral support, they offer their network of community
                                partners:
                            </p>
                            <BulletList items={partner.support} />
                        </div>

                        {/* Contact strip */}
                        <div className='mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 rounded-xl border-l-4 border-brand-teal bg-brand-blush'>
                            <div className='flex-1'>
                                <p className='text-xs font-bold uppercase tracking-widest text-brand-crimson mb-1'>
                                    Get in Touch
                                </p>
                                <p className='text-2xl font-bold text-gray-900'>
                                    {partner.phone}
                                </p>
                            </div>
                            <a
                                href={partner.contactUrl}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='shrink-0 inline-block bg-brand-crimson text-white px-6 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity text-sm whitespace-nowrap'
                            >
                                Contact Page →
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Partners;
