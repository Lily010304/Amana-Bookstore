# API Documentation - Amana Bookstore

## Base URL
```
http://localhost:3000/api
```

## Endpoints

### 📚 Books API

#### Get All Books
```http
GET /api/books
```

**Query Parameters:**
- `genre` (optional) - Filter by genre (e.g., "Physics", "Computer Science")
- `search` (optional) - Search in title, author, or description
- `featured` (optional) - Set to "true" to get only featured books
- `page` (optional) - Page number for pagination (default: 1)
- `limit` (optional) - Number of items per page (default: all)

**Example Requests:**
```bash
# Get all books
GET /api/books

# Get featured books only
GET /api/books?featured=true

# Search for books
GET /api/books?search=physics

# Filter by genre
GET /api/books?genre=Computer Science

# Paginated results
GET /api/books?page=1&limit=10
```

**Response:**
```json
{
  "books": [
    {
      "id": "1",
      "title": "Fundamentals of Classical Mechanics",
      "author": "Dr. Ahmad Al-Kindi",
      "price": 89.99,
      "genre": ["Physics", "Textbook"],
      "rating": 4.8,
      "inStock": true,
      "featured": true
      // ... other fields
    }
  ],
  "pagination": {
    "total": 46,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

#### Get Single Book
```http
GET /api/books/:id
```

**Example:**
```bash
GET /api/books/1
```

**Response:**
```json
{
  "id": "1",
  "title": "Fundamentals of Classical Mechanics",
  "author": "Dr. Ahmad Al-Kindi",
  "description": "A comprehensive introduction...",
  "price": 89.99,
  "image": "/images/book1.jpg",
  "isbn": "978-0123456789",
  "genre": ["Physics", "Textbook"],
  "tags": ["Mechanics", "Physics", "University"],
  "datePublished": "2022-01-15",
  "pages": 654,
  "language": "English",
  "publisher": "Al-Biruni Academic Press",
  "rating": 4.8,
  "reviewCount": 23,
  "inStock": true,
  "featured": true
}
```

---

### ⭐ Reviews API

#### Get Reviews
```http
GET /api/reviews
```

**Query Parameters:**
- `bookId` (optional) - Filter reviews by book ID
- `limit` (optional) - Limit number of reviews returned

**Example Requests:**
```bash
# Get all reviews
GET /api/reviews

# Get reviews for a specific book
GET /api/reviews?bookId=1

# Get latest 5 reviews
GET /api/reviews?limit=5
```

**Response:**
```json
{
  "reviews": [
    {
      "id": "review-1",
      "bookId": "1",
      "author": "Dr. Yasmin Al-Baghdadi",
      "rating": 5,
      "title": "Excellent foundation for physics students",
      "comment": "Dr. Al-Kindi has created...",
      "timestamp": "2024-01-15T10:30:00Z",
      "verified": true
    }
  ],
  "total": 60
}
```

#### Create Review
```http
POST /api/reviews
```

**Request Body:**
```json
{
  "bookId": "1",
  "author": "John Doe",
  "rating": 5,
  "title": "Great book!",
  "comment": "This book is amazing..."
}
```

**Response:**
```json
{
  "id": "review-1732281234567",
  "bookId": "1",
  "author": "John Doe",
  "rating": 5,
  "title": "Great book!",
  "comment": "This book is amazing...",
  "timestamp": "2025-11-22T15:00:00.000Z",
  "verified": false
}
```

---

### 🛒 Cart API

#### Get Cart
```http
GET /api/cart
```

**Response:**
```json
{
  "cart": [
    {
      "id": "cart-1732281234567",
      "bookId": "1",
      "quantity": 2,
      "addedAt": "2025-11-22T15:00:00.000Z",
      "book": {
        "id": "1",
        "title": "Fundamentals of Classical Mechanics",
        "price": 89.99
        // ... other book fields
      }
    }
  ],
  "total": 1
}
```

#### Add to Cart
```http
POST /api/cart
```

**Request Body:**
```json
{
  "bookId": "1",
  "quantity": 1
}
```

**Response:**
```json
{
  "message": "Item added to cart successfully",
  "cartItem": {
    "id": "cart-1732281234567",
    "bookId": "1",
    "quantity": 1,
    "addedAt": "2025-11-22T15:00:00.000Z"
  }
}
```

#### Update Cart Item
```http
PUT /api/cart
```

**Request Body:**
```json
{
  "bookId": "1",
  "quantity": 3
}
```

**Response:**
```json
{
  "message": "Cart item updated successfully",
  "quantity": 3
}
```

#### Remove from Cart
```http
DELETE /api/cart?bookId=1
```

**Query Parameters:**
- `id` (optional) - Cart item ID
- `bookId` (optional) - Book ID to remove
- `clearAll` (optional) - Set to "true" to clear entire cart

**Example Requests:**
```bash
# Remove specific item by bookId
DELETE /api/cart?bookId=1

# Remove specific item by cart item id
DELETE /api/cart?id=cart-1732281234567

# Clear entire cart
DELETE /api/cart?clearAll=true
```

**Response:**
```json
{
  "message": "Item removed from cart successfully"
}
```

---

## Testing the APIs

### Using cURL

```bash
# Get all books
curl http://localhost:3000/api/books

# Get book by ID
curl http://localhost:3000/api/books/1

# Add to cart
curl -X POST http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -d '{"bookId":"1","quantity":2}'

# Create review
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -d '{"bookId":"1","author":"Test User","rating":5,"title":"Great!","comment":"Excellent book"}'
```

### Using PowerShell

```powershell
# Get all books
Invoke-RestMethod -Uri "http://localhost:3000/api/books"

# Get featured books
Invoke-RestMethod -Uri "http://localhost:3000/api/books?featured=true"

# Add to cart
$body = @{
    bookId = "1"
    quantity = 2
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/cart" -Method Post -Body $body -ContentType "application/json"
```

---

## Error Responses

All endpoints return appropriate HTTP status codes:

- `200 OK` - Success
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request parameters
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

**Error Response Format:**
```json
{
  "error": "Error message description"
}
```

---

## Notes

- All dates are in ISO 8601 format
- The API uses MongoDB for data persistence
- Cart operations are session-independent (no authentication required in current version)
- Reviews automatically update book ratings and review counts
- All endpoints support CORS for local development
