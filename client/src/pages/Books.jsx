
const books = [
    {
        title: 'Ishmael',
        author: 'Daniel Quinn',
        note: 'Start with this one',
        description:
            "A book set up as a series of Socratic conversations between a sage and student. As the student learns and thinks more, he has his cultural perspectives and beliefs about today's dominant culture utterly obliterated by the Sage — who happens to be a literal gorilla. A must read for all people.",
    },
    {
        title: 'Braiding Sweetgrass',
        author: 'Robin Wall Kimmerer',
        description:
            'A Native American author and botanist explores the inseparable bond between human, animal, and nature. Beautifully displayed in the lifecycle of sweetgrass — nature needs us as much as we need her. Her insights on the origin stories of a people and how they affect behavior are as insightful as Ishmael, explored in a less academic, more personal way.',
    },
    {
        title: 'Domesticated',
        author: 'Richard C. Francis',
        description:
            'Tameness is the key trait of domestication, though there are more requirements for classification. This book is about how humans have domesticated dogs, cats, horses, cows — and even ourselves — as well as the biological consequences of it.',
    },
    {
        title: 'American Nations',
        author: 'Colin Woodard',
        description:
            "A chronological and anthropological look at the founding of the United States. Who settled where, and how that affects culture and even personality regionally. It's WAY more interesting than it sounds.",
    },
    {
        title: 'The Four Agreements',
        author: 'Don Miguel Ruiz',
        description:
            'A profound book of first world (Toltec) wisdom about conditioning — how we are all subject to it, and how we can change that conditioning when it no longer serves us.',
    },
    {
        title: 'The Alchemist',
        author: 'Paulo Coelho',
        description:
            'A short read of adventure and faith. A boy seeking his personal legend learns just how the universe works on an adventure chasing a recurring dream. It\'s all about listening to your heart and to the omens around you. "When a person is in search of their personal legend, the universe conspires to help."',
    },
    {
        title: 'The Wayfinders',
        author: 'Wade Davis',
        description:
            'Displays the incredible abilities of first peoples to navigate nearly impossible journeys using cultural knowledge — in lieu of GPS — for hundreds of years. Proving that what seems impossible, even with advanced technology, can be possible with skill and practice perfected over generations.',
    },
    {
        title: 'Rethinking Broken',
        author: 'Owl C. Medicine',
        description:
            "An unflinching look into childhood trauma and stress. This book pushes the thought that trauma didn't break you — it trained you. It offers deep philosophical and neurobiological insights that help people who feel stuck by their trauma to leverage it, creating a better world for those around them and a life worth living for survivors.",
    },
];

const Books = () => {
    return (
        <div className='min-h-screen bg-white'>

            {/* Hero image */}
            <div
                className='relative px-6 min-h-[33vh] flex items-center bg-brand-gold lg:bg-contain bg-center bg-no-repeat'
                style={{ backgroundImage: "url('/illustrations/book-hero.svg')" }}
            />

            {/* Hero text */}
            <div className='bg-brand-gold text-center px-4 pb-10'>
                <h1 className='text-3xl font-semibold text-white mb-4'>
                    Books &amp; <span className='font-bold'>Reading List</span>
                </h1>
                <p className='text-white/90 max-w-2xl mx-auto leading-relaxed'>
                    To decolonize a mind, that mind must be exposed to un-colonized cultures and concepts.
                    Here are the titles that have changed lives on our team.
                </p>
            </div>

            {/* Referral strip */}
            <div className='bg-brand-cream border-b border-gray-200'>
                <div className='max-w-5xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-6'>
                    <img 
                        src='images/book.png'
                        className='h-36 w-auto object-contain shrink-0'
                    />
                    <div>
                        <p className='text-xs font-bold uppercase tracking-widest text-brand-crimson mb-2'>
                            Owl's Book
                        </p>
                        <h2 className='text-2xl font-bold text-gray-900 leading-tight'>
                            Rethinking Broken
                        </h2>
                        <p className='text-gray-600 mt-2 max-w-md leading-relaxed'>
                            Trauma didn't break you — it trained you. Purchase the book and explore the
                            official companion website at rethinkingbroken.com.
                        </p>
                    </div>
                    
                    <a
                        href='https://www.rethinkingbroken.com/'
                        target='_blank'
                        rel='noopener noreferrer'
                        className='shrink-0 inline-block bg-brand-crimson text-white px-7 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity whitespace-nowrap'
                    >
                        Visit rethinkingbroken.com →
                    </a>
                </div>
            </div>

            {/* Intro */}
            <div className='max-w-3xl mx-auto px-6 pt-14 pb-10'>
                <h2 className='text-3xl font-bold text-gray-900 mb-6'>Decolonizing Minds</h2>
                <p className='text-lg text-gray-700 leading-relaxed'>
                    Since colonization killed almost everyone who kept these cultural secrets, we are lucky
                    to have any left. Our team has put together a book list for you — each selection chosen
                    for its ability to change lives.
                </p>
                <p className='text-lg text-gray-700 leading-relaxed mt-4' >
                    These titles present a lens for those of us raised in the dominant capitalistic culture
                    of the world to see ourselves and the earth in new ways — ways that foster healthy
                    relationships with each other and our planet.
                </p>
            </div>

            {/* Book list */}
            <div className='max-w-3xl mx-auto px-6 pb-24'>
                <h3 className='text-2xl font-bold text-gray-900 border-b border-gray-200 pb-4 mb-10'>
                    Book List
                </h3>
                <div className='space-y-10'>
                    {books.map((book, i) => (
                        <div key={i} className='border-l-4 border-brand-teal pl-6'>
                            <div className='flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2'>
                                <h4 className='text-xl font-bold text-gray-900'>{book.title}</h4>
                                <span className='text-gray-500 text-sm'>by {book.author}</span>
                                {book.note && (
                                    <span className='text-xs font-semibold text-brand-crimson bg-brand-blush px-2 py-0.5 rounded-full'>
                                        {book.note}
                                    </span>
                                )}
                            </div>
                            <p className='text-gray-700 leading-relaxed'>{book.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Books;
