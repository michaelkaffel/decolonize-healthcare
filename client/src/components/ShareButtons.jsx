import { useState } from 'react';

const Icons = {
    Facebook: () => (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
    ),
    X: () => (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    ),
    LinkedIn: () => (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
            <circle cx="4" cy="4" r="2" />
        </svg>
    ),
    Link: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
    ),
};

const ShareButtons = ({ title }) => {
    const [copied, setCopied] = useState(false);
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const encoded = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title || '');

    const buttons = [
        {
            label: 'Facebook',
            Icon: Icons.Facebook,
            href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
        },
        {
            label: 'X',
            Icon: Icons.X,
            href: `https://twitter.com/intent/tweet?url=${encoded}&text=${encodedTitle}`,
        },
        {
            label: 'LinkedIn',
            Icon: Icons.LinkedIn,
            href: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`,
        },
    ];

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            const el = document.createElement('input');
            el.value = url;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }

    return (
        <div className='flex items-center gap-3 py-6 border-t border-b border-gray-100'>
            <span className='text-sm font-medium text-gray-500 mr-1'>Share</span>

                {buttons.map(({label, Icon, href }) => (
                    <a
                        key={label}
                        href={href}
                        target='_blank'
                        rel='noopener noreferrer'
                        aria-label={`Share on ${label}`}
                        className='flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 text-gray-500 hover:text-brand-crimson hover:border-brand-crimson transition-colors'
                    >
                        <Icon />
                    </a>
                ))}

                <button
                    onClick={handleCopy}
                    aria-label='Copy link'
                    className='flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 text-gray-500 hover:text-brand-crimson hover:border-brand-crimson transition-colors'
                >
                    <Icons.Link />
                </button>
            
                {copied && (
                    <span className='text-xs text-brand-gold font-medium animate-pulse'>
                        Copied!
                    </span>
                )}
        </div>
    )
};

export default ShareButtons