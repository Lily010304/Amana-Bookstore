// src/app/api/books/[id]/route.ts
import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

// GET /api/books/[id] - Get a single book by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const booksCollection = await getCollection('books');
    
    const book = await booksCollection.findOne({ id });

    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(book);
  } catch (error) {
    console.error('Error fetching book:', error);
    return NextResponse.json(
      { error: 'Failed to fetch book from database' },
      { status: 500 }
    );
  }
}
