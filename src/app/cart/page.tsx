// src/app/cart/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CartItem from '../components/CartItem';
import { Book } from '../types';

export default function CartPage() {
  const [cartItems, setCartItems] = useState<{ book: Book; quantity: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch cart data from localStorage and populate with book details from API
  useEffect(() => {
    const fetchCartData = async () => {
      const storedCart = localStorage.getItem('cart');
      if (!storedCart) {
        setIsLoading(false);
        return;
      }

      try {
        const cart = JSON.parse(storedCart);
        
        // Fetch book details for each cart item
        const itemsWithBooks = await Promise.all(
          cart.map(async (item: { bookId: string; quantity: number }) => {
            try {
              const response = await fetch(`/api/books/${item.bookId}`);
              if (response.ok) {
                const book = await response.json();
                return { book, quantity: item.quantity };
              }
              return null;
            } catch (err) {
              console.error(`Error fetching book ${item.bookId}:`, err);
              return null;
            }
          })
        );

        // Filter out any null values (books that failed to load)
        const validItems = itemsWithBooks.filter((item): item is { book: Book; quantity: number } => item !== null);
        setCartItems(validItems);
      } catch (error) {
        console.error('Failed to parse cart from localStorage', error);
        setCartItems([]);
      }
      
      setIsLoading(false);
    };

    fetchCartData();
  }, []);

  const updateQuantity = async (bookId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      // Update via API
      await fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookId,
          quantity: newQuantity
        })
      });

      // Update local state
      const updatedItems = cartItems.map(item => 
        item.book.id === bookId ? { ...item, quantity: newQuantity } : item
      );
      setCartItems(updatedItems);

      // Update localStorage
      const cartForStorage = updatedItems.map(item => ({
        id: `${item.book.id}-${Date.now()}`,
        bookId: item.book.id,
        quantity: item.quantity,
        addedAt: new Date().toISOString()
      }));
      localStorage.setItem('cart', JSON.stringify(cartForStorage));
      
      // Notify navbar
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (err) {
      console.error('Error updating quantity:', err);
      alert('Failed to update quantity. Please try again.');
    }
  };

  const removeItem = async (bookId: string) => {
    try {
      // Remove via API
      await fetch(`/api/cart?bookId=${bookId}`, {
        method: 'DELETE'
      });

      // Update local state
      const updatedItems = cartItems.filter(item => item.book.id !== bookId);
      setCartItems(updatedItems);

      // Update localStorage
      const cartForStorage = updatedItems.map(item => ({
        id: `${item.book.id}-${Date.now()}`,
        bookId: item.book.id,
        quantity: item.quantity,
        addedAt: new Date().toISOString()
      }));
      localStorage.setItem('cart', JSON.stringify(cartForStorage));
      
      // Notify navbar
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (err) {
      console.error('Error removing item:', err);
      alert('Failed to remove item. Please try again.');
    }
  };

  const clearCart = async () => {
    try {
      // Clear via API
      await fetch('/api/cart?clearAll=true', {
        method: 'DELETE'
      });

      // Update local state and storage
      setCartItems([]);
      localStorage.removeItem('cart');
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (err) {
      console.error('Error clearing cart:', err);
      alert('Failed to clear cart. Please try again.');
    }
  };

  const totalPrice = cartItems.reduce((total, item) => total + (item.book.price * item.quantity), 0);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Shopping Cart</h1>
      
      {cartItems.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <h2 className="text-xl text-gray-600 mb-4">Your cart is empty</h2>
          <Link href="/" className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition-colors cursor-pointer">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md">
            {cartItems.map((item) => (
              <CartItem
                key={item.book.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeItem}
              />
            ))}
          </div>
          
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center text-xl font-bold mb-4 text-gray-800">
              <span>Total: ${totalPrice.toFixed(2)}</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/" className="flex-1 bg-gray-500 text-white text-center py-3 rounded-md hover:bg-gray-600 transition-colors cursor-pointer">
                Continue Shopping
              </Link>
              <button 
                onClick={clearCart}
                className="flex-1 bg-red-500 text-white py-3 rounded-md hover:bg-red-600 transition-colors cursor-pointer"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}