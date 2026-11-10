import type { Metadata } from 'next';
import MyOrdersClient from './MyOrdersClient';

export const metadata: Metadata = {
  title: 'My Orders', description: 'Your Premium membership and payment history.',
  robots: { index: false, follow: false },
};
export default function MyOrdersPage() { return <MyOrdersClient />; }
