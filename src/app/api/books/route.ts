// src/app/api/books/route.ts
import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

// GET /api/books - Return all books or filter by query parameters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const genre = searchParams.get('genre');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const limit = searchParams.get('limit');
    const page = searchParams.get('page');

    const booksCollection = await getCollection('books');
    
    // Build query filter
    const filter: Record<string, unknown> = {};
    
    if (genre && genre !== 'All') {
      filter.genre = { $in: [genre] };
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (featured === 'true') {
      filter.featured = true;
    }

    // Calculate pagination
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 0;
    const skip = (pageNum - 1) * limitNum;

    // Fetch books with filters
    let query = booksCollection.find(filter);
    
    if (limitNum > 0) {
      query = query.skip(skip).limit(limitNum);
    }
    
    const books = await query.toArray();
    const total = await booksCollection.countDocuments(filter);

    return NextResponse.json({
      books,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: limitNum > 0 ? Math.ceil(total / limitNum) : 1
      }
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json(
      { error: 'Failed to fetch books from database' },
      { status: 500 }
    );
  }
}

// Future implementation notes:
// - Connect to a database (e.g., PostgreSQL, MongoDB)
// - Add authentication middleware for admin operations
// - Implement pagination for large datasets
// - Add filtering and search query parameters
// - Include proper error handling and logging
// - Add rate limiting for API protection
// - Implement caching strategies for better performance

// Example future database integration:
// import { db } from '@/lib/database';
// 
// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const page = parseInt(searchParams.get('page') || '1');
//   const limit = parseInt(searchParams.get('limit') || '10');
//   const genre = searchParams.get('genre');
//   
//   try {
//     const books = await db.books.findMany({
//       where: genre ? { genre: { contains: genre } } : {},
//       skip: (page - 1) * limit,
//       take: limit,
//     });
//     
//     return NextResponse.json(books);
//   } catch (error) {
//     return NextResponse.json(
//       { error: 'Database connection failed' },
//       { status: 500 }
//     );
//   }
// }