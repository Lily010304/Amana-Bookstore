# API Testing Guide

## Prerequisites

1. **Make sure MongoDB data is imported:**
   ```powershell
   cd mongodb-data
   
   # Replace with your connection string
   mongoimport --uri "YOUR_MONGODB_CONNECTION_STRING" --db amana-bookstore --collection books --file books.json --jsonArray
   mongoimport --uri "YOUR_MONGODB_CONNECTION_STRING" --db amana-bookstore --collection reviews --file reviews.json --jsonArray
   mongoimport --uri "YOUR_MONGODB_CONNECTION_STRING" --db amana-bookstore --collection cart --file cart.json --jsonArray
   ```

2. **Verify your `.env.local` has the MongoDB URI:**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
   ```

3. **Start the development server:**
   ```powershell
   npm run dev
   ```

## Test API Endpoints

### 1. Test Books API

**Get all books:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/books" | ConvertTo-Json -Depth 3
```

**Get featured books:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/books?featured=true" | ConvertTo-Json -Depth 3
```

**Search books:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/books?search=physics" | ConvertTo-Json -Depth 3
```

**Get single book:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/books/1" | ConvertTo-Json -Depth 3
```

**Get with pagination:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/books?page=1&limit=5" | ConvertTo-Json -Depth 3
```

### 2. Test Reviews API

**Get all reviews:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/reviews" | ConvertTo-Json -Depth 3
```

**Get reviews for a specific book:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/reviews?bookId=1" | ConvertTo-Json -Depth 3
```

**Create a new review:**
```powershell
$reviewBody = @{
    bookId = "1"
    author = "Test User"
    rating = 5
    title = "Excellent Book!"
    comment = "This is a fantastic textbook for learning physics."
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/reviews" -Method Post -Body $reviewBody -ContentType "application/json" | ConvertTo-Json -Depth 3
```

### 3. Test Cart API

**Get cart:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/cart" | ConvertTo-Json -Depth 3
```

**Add item to cart:**
```powershell
$cartBody = @{
    bookId = "1"
    quantity = 2
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/cart" -Method Post -Body $cartBody -ContentType "application/json" | ConvertTo-Json -Depth 3
```

**Update cart item:**
```powershell
$updateBody = @{
    bookId = "1"
    quantity = 5
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/cart" -Method Put -Body $updateBody -ContentType "application/json" | ConvertTo-Json -Depth 3
```

**Remove item from cart:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/cart?bookId=1" -Method Delete | ConvertTo-Json -Depth 3
```

**Clear entire cart:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/cart?clearAll=true" -Method Delete | ConvertTo-Json -Depth 3
```

## Quick Test Script

Run all tests at once:

```powershell
# Test Books API
Write-Host "`n=== Testing Books API ===" -ForegroundColor Green
$books = Invoke-RestMethod -Uri "http://localhost:3000/api/books?limit=2"
Write-Host "Total books: $($books.pagination.total)"
Write-Host "First book: $($books.books[0].title)"

# Test Reviews API
Write-Host "`n=== Testing Reviews API ===" -ForegroundColor Green
$reviews = Invoke-RestMethod -Uri "http://localhost:3000/api/reviews?bookId=1&limit=2"
Write-Host "Total reviews for book 1: $($reviews.total)"

# Test Cart API - Add
Write-Host "`n=== Testing Cart API - Add Item ===" -ForegroundColor Green
$cartAdd = @{ bookId = "1"; quantity = 2 } | ConvertTo-Json
$addResult = Invoke-RestMethod -Uri "http://localhost:3000/api/cart" -Method Post -Body $cartAdd -ContentType "application/json"
Write-Host $addResult.message

# Test Cart API - Get
Write-Host "`n=== Testing Cart API - Get Cart ===" -ForegroundColor Green
$cart = Invoke-RestMethod -Uri "http://localhost:3000/api/cart"
Write-Host "Cart items: $($cart.total)"

Write-Host "`n=== All Tests Completed ===" -ForegroundColor Green
```

## Troubleshooting

**Error: "Failed to fetch from database"**
- Check if MongoDB URI is correctly set in `.env.local`
- Verify data was imported to MongoDB
- Check MongoDB Atlas network access (whitelist your IP)

**Error: "Book not found" or "Empty results"**
- Make sure you imported the JSON data to MongoDB
- Verify the database name is `amana-bookstore`
- Check collection names: `books`, `reviews`, `cart`

**Connection errors:**
- Restart the dev server: `npm run dev`
- Check if MongoDB Atlas cluster is running
- Verify your connection string is correct

## Using Browser/Postman

You can also test using:
- **Browser:** Visit `http://localhost:3000/api/books` directly
- **Postman:** Import the endpoints from `API_DOCUMENTATION.md`
- **Thunder Client** (VS Code extension)
- **REST Client** (VS Code extension)
