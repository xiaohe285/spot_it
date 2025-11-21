import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-gray-50 border-t border-gray-200 py-12 mt-auto">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent mb-4 block">
                            SpotTheDifference
                        </Link>
                        <p className="text-gray-500 max-w-sm">
                            Challenge your observation skills with our collection of spot the difference games. Fun for all ages!
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4">Games</h3>
                        <ul className="space-y-2">
                            <li><Link href="/games/adults" className="text-gray-500 hover:text-purple-600 transition-colors">For Adults</Link></li>
                            <li><Link href="/games/kids" className="text-gray-500 hover:text-purple-600 transition-colors">For Kids</Link></li>
                            <li><Link href="/games/themes" className="text-gray-500 hover:text-purple-600 transition-colors">Special Themes</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
                        <ul className="space-y-2">
                            <li><Link href="/privacy" className="text-gray-500 hover:text-purple-600 transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="text-gray-500 hover:text-purple-600 transition-colors">Terms of Service</Link></li>
                            <li><Link href="/contact" className="text-gray-500 hover:text-purple-600 transition-colors">Contact Us</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-200 text-center text-gray-400 text-sm">
                    © {new Date().getFullYear()} SpotTheDifference. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
