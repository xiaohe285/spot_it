import Link from 'next/link';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav className={`flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 ${className}`}>
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-2">
          {item.href ? (
            <Link 
              href={item.href} 
              className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 dark:text-white font-medium">
              {item.label}
            </span>
          )}
          {index < items.length - 1 && (
            <span className="text-gray-400 dark:text-gray-500">›</span>
          )}
        </span>
      ))}
    </nav>
  );
}