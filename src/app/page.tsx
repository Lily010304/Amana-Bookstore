// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import BookGrid from './components/BookGrid';
import { Book } from './types';

export default function HomePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch books from API
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch('/api/books');
        if (!response.ok) {
          throw new Error('Failed to fetch books');
        }
        const data = await response.json();
        setBooks(data.books || data); // Handle both formats
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching books:', err);
        setError('Failed to load books. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, []);

  // Cart handler that adds items via API
  const handleAddToCart = async (bookId: string) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookId,
          quantity: 1
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add to cart');
      }

      const result = await response.json();
      console.log(result.message);

      // Also update localStorage for navbar counter
      const storedCart = localStorage.getItem('cart');
      const cart = storedCart ? JSON.parse(storedCart) : [];
      const existingItemIndex = cart.findIndex((item: { bookId: string }) => item.bookId === bookId);

      if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += 1;
      } else {
        cart.push({
          id: `${bookId}-${Date.now()}`,
          bookId,
          quantity: 1,
          addedAt: new Date().toISOString()
        });
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new CustomEvent('cartUpdated'));

    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Failed to add item to cart. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading books...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20 bg-red-50 rounded-lg">
          <p className="text-red-600 text-xl">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <section className="text-center bg-gradient-to-r from-pink-100/70 to-purple-100/70 backdrop-blur-sm p-8 rounded-2xl mb-12 shadow-xl shadow-purple-200/40 border border-white/50">
        <h1 className="text-6xl font-extrabold bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent mb-4 leading-tight drop-shadow-lg">Welcome to the Amana Bookstore!</h1>
        <p className="text-xl text-purple-700/80 leading-relaxed">
          Your one-stop shop for the best books. Discover new worlds and adventures.
        </p>
      </section>

      {/* Book Grid */}
      <BookGrid books={books} onAddToCart={handleAddToCart} />
    </div>
  );
}
