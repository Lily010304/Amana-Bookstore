# MongoDB Data Conversion Guide

This guide explains how to convert the local TypeScript data into JSON files for MongoDB import.

## 📋 Overview

The Amana Bookstore currently uses local TypeScript files for data storage:
- `src/app/data/books.ts` - 45 books
- `src/app/data/reviews.ts` - 60+ reviews
- `src/app/data/cart.ts` - Empty cart template

These need to be converted to JSON format for MongoDB import.

## 🚀 Quick Start

### Step 1: Generate JSON Files

Run the conversion script:

```powershell
npm run convert-to-json
```

Or manually:

```powershell
npx tsx scripts/convertToJSON.ts
```

This will create a `mongodb-data` folder with:
- `books.json` - All book data
- `reviews.json` - All review data
- `cart.json` - Empty cart collection
- `import-summary.json` - Import instructions and metadata

### Step 2: Set Up MongoDB

You have two options:

#### Option A: MongoDB Atlas (Cloud - Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (free M0 tier available)
4. Create a database user and password
5. Whitelist your IP address (or use 0.0.0.0/0 for development)
6. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)

#### Option B: Local MongoDB

1. Install MongoDB Community Edition from [mongodb.com/download](https://www.mongodb.com/try/download/community)
2. Start MongoDB service:
   ```powershell
   mongod
   ```

### Step 3: Import Data to MongoDB

Navigate to the mongodb-data folder:

```powershell
cd mongodb-data
```

#### For MongoDB Atlas:

Replace `YOUR_CONNECTION_STRING` with your actual connection string:

```powershell
mongoimport --uri "YOUR_CONNECTION_STRING" --db amana-bookstore --collection books --file books.json --jsonArray

mongoimport --uri "YOUR_CONNECTION_STRING" --db amana-bookstore --collection reviews --file reviews.json --jsonArray

mongoimport --uri "YOUR_CONNECTION_STRING" --db amana-bookstore --collection cart --file cart.json --jsonArray
```

#### For Local MongoDB:

```powershell
mongoimport --db amana-bookstore --collection books --file books.json --jsonArray

mongoimport --db amana-bookstore --collection reviews --file reviews.json --jsonArray

mongoimport --db amana-bookstore --collection cart --file cart.json --jsonArray
```

### Step 4: Verify Import

Connect to your MongoDB database and verify:

```javascript
// In MongoDB shell or Compass
use amana-bookstore

// Check counts
db.books.countDocuments()      // Should return 45
db.reviews.countDocuments()    // Should return 60
db.cart.countDocuments()       // Should return 0
```

## 📊 Data Structure

### Books Collection

Each book document contains:
```json
{
  "id": "string",
  "title": "string",
  "author": "string",
  "description": "string",
  "price": "number",
  "image": "string",
  "isbn": "string",
  "genre": ["string"],
  "tags": ["string"],
  "datePublished": "string (ISO date)",
  "pages": "number",
  "language": "string",
  "publisher": "string",
  "rating": "number",
  "reviewCount": "number",
  "inStock": "boolean",
  "featured": "boolean"
}
```

### Reviews Collection

Each review document contains:
```json
{
  "id": "string",
  "bookId": "string (references book id)",
  "author": "string",
  "rating": "number",
  "title": "string",
  "comment": "string",
  "timestamp": "string (ISO date)",
  "verified": "boolean"
}
```

### Cart Collection

Each cart item document contains:
```json
{
  "id": "string",
  "bookId": "string (references book id)",
  "quantity": "number",
  "addedAt": "string (ISO date)"
}
```

## 🔧 Troubleshooting

### "mongoimport command not found"

Install MongoDB Database Tools:
- Download from [mongodb.com/try/download/database-tools](https://www.mongodb.com/try/download/database-tools)
- Or use Homebrew: `brew install mongodb-database-tools`
- Or use Chocolatey: `choco install mongodb-database-tools`

### "tsx command not found"

Install tsx globally or use npx:
```powershell
npm install -g tsx
```

Or add to package.json scripts (already included).

### Import Errors

- Make sure you're in the `mongodb-data` directory when running mongoimport
- Verify your MongoDB connection string is correct
- Check that your IP is whitelisted in MongoDB Atlas
- Ensure the database user has write permissions

## 📝 Notes

- The `--jsonArray` flag tells mongoimport that the file contains an array of JSON documents
- MongoDB will automatically create the database and collections if they don't exist
- You can customize the database name by changing `amana-bookstore` to your preferred name
- The `id` field in the JSON will be imported as-is. MongoDB will also create an `_id` field automatically

## 🔄 Re-importing Data

If you need to re-import (replace existing data):

```powershell
# Drop existing collection and import
mongoimport --uri "YOUR_CONNECTION_STRING" --db amana-bookstore --collection books --file books.json --jsonArray --drop
```

The `--drop` flag removes the existing collection before importing.

## 🎯 Next Steps

After importing data to MongoDB:

1. Install MongoDB Node.js driver or Mongoose:
   ```powershell
   npm install mongodb
   # or
   npm install mongoose
   ```

2. Update your Next.js API routes to fetch from MongoDB instead of local files

3. Set up environment variables for MongoDB connection string:
   ```env
   MONGODB_URI=your_connection_string_here
   ```

4. Test your connection and queries

Happy coding! 🚀
