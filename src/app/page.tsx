// src/app/page.tsx
'use client';

import { useState } from 'react';
import BookGrid from './components/BookGrid';
import { books } from './data/books';
import { CartItem } from './types';

export default function HomePage() {
  // Cart handler that actually adds items to localStorage
  const handleAddToCart = (bookId: string) => {
    // Find the book by ID
    const book = books.find(b => b.id === bookId);
    if (!book) {
      console.error('Book not found:', bookId);
      return;
    }

    // Create cart item
    const cartItem = {
      id: `${book.id}-${Date.now()}`,
      bookId: book.id,
      quantity: 1,
      addedAt: new Date().toISOString(),
    };

    // Get existing cart from localStorage
    const storedCart = localStorage.getItem('cart');
    const cart = storedCart ? JSON.parse(storedCart) : [];

    // Check if book already exists in cart
    const existingItemIndex = cart.findIndex((item: any) => item.bookId === book.id);

    if (existingItemIndex > -1) {
      // Update quantity if item already exists
      cart[existingItemIndex].quantity += 1;
    } else {
      // Add new item to cart
      cart.push(cartItem);
    }

    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Dispatch custom event to notify Navbar
    window.dispatchEvent(new CustomEvent('cartUpdated'));

    console.log(`Added book "${book.title}" to cart`);
  };

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
