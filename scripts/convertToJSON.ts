// scripts/convertToJSON.ts
// This script converts the TypeScript data files to JSON format for MongoDB import

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { books } from '../src/app/data/books';
import { reviews } from '../src/app/data/reviews';
import { initialCart } from '../src/app/data/cart';

// Create output directory if it doesn't exist
const outputDir = join(process.cwd(), 'mongodb-data');
try {
  mkdirSync(outputDir, { recursive: true });
  console.log(`✅ Created directory: ${outputDir}`);
} catch (error) {
  console.log(`📁 Directory already exists: ${outputDir}`);
}

// Convert books to JSON
const booksJSON = JSON.stringify(books, null, 2);
writeFileSync(join(outputDir, 'books.json'), booksJSON);
console.log(`✅ Created books.json with ${books.length} books`);

// Convert reviews to JSON
const reviewsJSON = JSON.stringify(reviews, null, 2);
writeFileSync(join(outputDir, 'reviews.json'), reviewsJSON);
console.log(`✅ Created reviews.json with ${reviews.length} reviews`);

// Convert cart to JSON (empty initially)
const cartJSON = JSON.stringify(initialCart, null, 2);
writeFileSync(join(outputDir, 'cart.json'), cartJSON);
console.log(`✅ Created cart.json`);

// Create a summary file
const summary = {
  generatedAt: new Date().toISOString(),
  collections: {
    books: {
      count: books.length,
      file: 'books.json'
    },
    reviews: {
      count: reviews.length,
      file: 'reviews.json'
    },
    cart: {
      count: initialCart.length,
      file: 'cart.json'
    }
  },
  instructions: {
    mongoImport: [
      'To import these files into MongoDB, use the following commands:',
      '',
      'mongoimport --db amana-bookstore --collection books --file books.json --jsonArray',
      'mongoimport --db amana-bookstore --collection reviews --file reviews.json --jsonArray',
      'mongoimport --db amana-bookstore --collection cart --file cart.json --jsonArray',
      '',
      'Or if using MongoDB Atlas or a remote connection:',
      'mongoimport --uri "your-mongodb-connection-string" --collection books --file books.json --jsonArray',
      'mongoimport --uri "your-mongodb-connection-string" --collection reviews --file reviews.json --jsonArray',
      'mongoimport --uri "your-mongodb-connection-string" --collection cart --file cart.json --jsonArray'
    ]
  }
};

const summaryJSON = JSON.stringify(summary, null, 2);
writeFileSync(join(outputDir, 'import-summary.json'), summaryJSON);
console.log(`✅ Created import-summary.json with import instructions`);

console.log('\n🎉 All JSON files created successfully!');
console.log(`📂 Location: ${outputDir}`);
console.log('\n📖 Next steps:');
console.log('1. Review the generated JSON files in the mongodb-data folder');
console.log('2. Set up your MongoDB database');
console.log('3. Use mongoimport commands from import-summary.json to load the data');
