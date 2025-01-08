import { FooterSection } from '@/types';

export const Footer: React.FC = () => {
    const sections: FooterSection[] = [
      {
        title: 'Product',
        links: [
          { label: 'Features', href: '#' },
          { label: 'Pricing', href: '#' },
          // Add more links...
        ]
      },
      // Add more sections...
    ];
  
    return (
      <footer className="bg-gray-900 text-gray-300">
        <div className="container mx-auto pt-16 pb-8 px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
            {sections.map((section) => (
              <div key={section.title}>
                <h3 className="text-white font-semibold mb-6">{section.title}</h3>
                <ul className="space-y-4">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-gray-400 hover:text-indigo-400 transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </footer>
    );
  };