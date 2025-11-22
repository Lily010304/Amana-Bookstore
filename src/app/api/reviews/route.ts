// src/app/api/reviews/route.ts
import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

// GET /api/reviews - Get all reviews or filter by bookId
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');
    const limit = searchParams.get('limit');
    
    const reviewsCollection = await getCollection('reviews');
    
    // Build query filter
    const filter: Record<string, unknown> = {};
    if (bookId) {
      filter.bookId = bookId;
    }

    // Fetch reviews with optional limit
    let query = reviewsCollection.find(filter).sort({ timestamp: -1 });
    
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    
    const reviews = await query.toArray();
    const total = await reviewsCollection.countDocuments(filter);

    return NextResponse.json({
      reviews,
      total
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews from database' },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Create a new review
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bookId, author, rating, title, comment } = body;

    // Validate required fields
    if (!bookId || !author || !rating || !title || !comment) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    const reviewsCollection = await getCollection('reviews');
    const booksCollection = await getCollection('books');

    // Verify book exists
    const book = await booksCollection.findOne({ id: bookId });
    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    // Create new review
    const newReview = {
      id: `review-${Date.now()}`,
      bookId,
      author,
      rating,
      title,
      comment,
      timestamp: new Date().toISOString(),
      verified: false
    };

    await reviewsCollection.insertOne(newReview);

    // Update book's review count and average rating
    const allReviews = await reviewsCollection.find({ bookId }).toArray();
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    
    await booksCollection.updateOne(
      { id: bookId },
      { 
        $set: { 
          rating: parseFloat(avgRating.toFixed(1)),
          reviewCount: allReviews.length
        }
      }
    );

    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}
