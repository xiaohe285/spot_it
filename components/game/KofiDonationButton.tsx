export default function KofiDonationButton() {
    return (
        <a
            href="https://ko-fi.com/S6B22A3NR2"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-500"
        >
            {/* Use Ko-fi's original hosted donation badge. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                height={36}
                style={{ border: 0, height: 36 }}
                src="https://storage.ko-fi.com/cdn/kofi6.png?v=6"
                alt="Buy Me a Coffee at ko-fi.com"
            />
        </a>
    );
}
