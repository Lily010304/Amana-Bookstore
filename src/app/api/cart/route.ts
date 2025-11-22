// src/app/api/cart/route.ts
import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

// GET /api/cart - Get all cart items
export async function GET() {
  try {
    const cartCollection = await getCollection('cart');
    const booksCollection = await getCollection('books');
    
    // Get all cart items
    const cartItems = await cartCollection.find({}).toArray();
    
    // Populate book details for each cart item
    const populatedCart = await Promise.all(
      cartItems.map(async (item) => {
        const book = await booksCollection.findOne({ id: item.bookId });
        return {
          ...item,
          book
        };
      })
    );

    return NextResponse.json({
      cart: populatedCart,
      total: populatedCart.length
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart from database' },
      { status: 500 }
    );
  }
}

// POST /api/cart - Add item to cart
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bookId, quantity = 1 } = body;

    if (!bookId) {
      return NextResponse.json(
        { error: 'Book ID is required' },
        { status: 400 }
      );
    }

    const cartCollection = await getCollection('cart');
    const booksCollection = await getCollection('books');

    // Verify book exists
    const book = await booksCollection.findOne({ id: bookId });
    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    // Check if item already exists in cart
    const existingItem = await cartCollection.findOne({ bookId });

    if (existingItem) {
      // Update quantity if item already in cart
      const updatedQuantity = existingItem.quantity + quantity;
      await cartCollection.updateOne(
        { bookId },
        { $set: { quantity: updatedQuantity } }
      );

      return NextResponse.json({
        message: 'Cart item quantity updated',
        cartItem: { ...existingItem, quantity: updatedQuantity }
      });
    } else {
      // Add new item to cart
      const newCartItem = {
        id: `cart-${Date.now()}`,
        bookId,
        quantity,
        addedAt: new Date().toISOString()
      };

      await cartCollection.insertOne(newCartItem);

      return NextResponse.json({
        message: 'Item added to cart successfully',
        cartItem: newCartItem
      }, { status: 201 });
    }
  } catch (error) {
    console.error('Error adding item to cart:', error);
    return NextResponse.json(
      { error: 'Failed to add item to cart' },
      { status: 500 }
    );
  }
}

// PUT /api/cart - Update cart item quantity
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, bookId, quantity } = body;

    if ((!id && !bookId) || !quantity) {
      return NextResponse.json(
        { error: 'Cart item ID or bookId and quantity are required' },
        { status: 400 }
      );
    }

    if (quantity < 1) {
      return NextResponse.json(
        { error: 'Quantity must be at least 1' },
        { status: 400 }
      );
    }

    const cartCollection = await getCollection('cart');
    
    // Build filter
    const filter = id ? { id } : { bookId };
    
    const result = await cartCollection.updateOne(
      filter,
      { $set: { quantity } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Cart item updated successfully',
      quantity
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    return NextResponse.json(
      { error: 'Failed to update cart item' },
      { status: 500 }
    );
  }
}

// DELETE /api/cart - Remove item from cart or clear entire cart
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('id');
    const bookId = searchParams.get('bookId');
    const clearAll = searchParams.get('clearAll');

    const cartCollection = await getCollection('cart');

    if (clearAll === 'true') {
      // Clear entire cart
      await cartCollection.deleteMany({});
      return NextResponse.json({
        message: 'Cart cleared successfully'
      });
    }

    if (!itemId && !bookId) {
      return NextResponse.json(
        { error: 'Item ID or bookId is required' },
        { status: 400 }
      );
    }

    // Build filter
    const filter = itemId ? { id: itemId } : { bookId };
    
    const result = await cartCollection.deleteOne(filter);

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Item removed from cart successfully'
    });
  } catch (error) {
    console.error('Error removing cart item:', error);
    return NextResponse.json(
      { error: 'Failed to remove item from cart' },
      { status: 500 }
    );
  }
}

// Future implementation notes:
// - Session management for user carts (using NextAuth.js or similar)
// - Database integration patterns (Prisma, Drizzle, or raw SQL)
// - Cart persistence strategies:
//   * Guest carts: Store in localStorage/cookies with optional merge on login
//   * User carts: Store in database with user ID association
//   * Hybrid approach: localStorage for guests, database for authenticated users
// - Security considerations:
//   * Validate user ownership of cart items
//   * Sanitize input data
//   * Rate limiting to prevent abuse
// - Performance optimizations:
//   * Cache frequently accessed cart data
//   * Batch operations for multiple item updates
//   * Implement optimistic updates on the frontend

// Example future database integration:
// import { db } from '@/lib/database';
// import { getServerSession } from 'next-auth';
// 
// export async function GET() {
//   const session = await getServerSession();
//   if (!session?.user?.id) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }
//   
//   try {
//     const cartItems = await db.cartItem.findMany({
//       where: { userId: session.user.id },
//       include: { book: true }
//     });
//     
//     return NextResponse.json(cartItems);
//   } catch (error) {
//     return NextResponse.json(
//       { error: 'Failed to fetch cart items' },
//       { status: 500 }
//     );
//   }
// }