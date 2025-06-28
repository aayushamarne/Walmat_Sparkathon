'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) return;

    const paidIds = JSON.parse(localStorage.getItem('paidItems') || '[]');
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const paidItems = cart.filter(item => paidIds.includes(item.variant_id));
    const updatedCart = cart.filter(item => !paidIds.includes(item.variant_id));

    // ✅ Save paid items to reorder
    const reorder = JSON.parse(localStorage.getItem('reorder') || '[]');
    localStorage.setItem('reorder', JSON.stringify([...reorder, ...paidItems]));

    // ✅ Update cart
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    localStorage.removeItem('paidItems');

    setTimeout(() => {
      router.replace('/');
    }, 3000);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-green-600">Payment Successful!</h1>
        <p className="mt-4 text-gray-600">Thanks for your order. Redirecting to home...</p>
      </div>
    </div>
  );
}
