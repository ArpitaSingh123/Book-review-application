// Axios client demonstrating Tasks 10-13 using callbacks, promises, and async/await
import axios from 'axios';

console.log('Client script started');
console.log('BASE_URL:', process.env.BASE_URL || 'http://localhost:3000');
console.log('About to call getAllBooksCb...');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Task 10: Get all books – Using async callback function
export async function getAllBooksCb(cb) {
  try {
  console.log('Fetching books from:', `${BASE_URL}/books`);
    const res = await axios.get(`${BASE_URL}/books`);
  console.log('Books fetched, calling callback...');
    cb(null, res.data);
  } catch (err) {
  console.error('Error fetching books:', err.message);
  cb(err);
  }
}

// Task 11: Search by ISBN – Using Promises (then/catch)
export function searchByIsbnPromise(isbn) {
  return axios.get(`${BASE_URL}/books/isbn/${encodeURIComponent(isbn)}`)
              .then(res => res.data);
}

// Task 12: Search by Author – Using async/await
export async function searchByAuthor(author) {
  const res = await axios.get(`${BASE_URL}/books/author/${encodeURIComponent(author)}`);
  return res.data;
}

// Task 13: Search by Title – Using async/await
export async function searchByTitle(title) {

  const res = await axios.get(`${BASE_URL}/books/title/${encodeURIComponent(title)}`);
  return res.data;
}

// Small runner so `npm run client` shows sample output
async function runDemo() {
  console.log('== Task 10: Get all books (callback) ==');
  let callbackCalled = false;
  await new Promise((resolve) => {
    // Set a timeout in case callback is never called
    const timeout = setTimeout(() => {
      if (!callbackCalled) {
        console.error('ERROR: Callback was never called after 5 seconds!');
        resolve();
      }
    }, 5000);
    getAllBooksCb((err, data) => {
      callbackCalled = true;
      clearTimeout(timeout);
      console.log('Callback entered!');
      if (err) {
        console.error('Error in callback:', err);
      } else {
        console.log('Books:', JSON.stringify(data, null, 2));
      }
      resolve();
    });
  });
  console.log('Finished Task 10');

  // Task 11: Search by ISBN using Promises
  console.log('\n== Task 11: Search by ISBN (Promise) ==');
  searchByIsbnPromise('3333')
    .then(book => {
      console.log('Book found:', JSON.stringify(book, null, 2));
    })
    .catch(err => {
      console.error('Error searching by ISBN:', err.message);
    });

  console.log('\n== Task 11: Search by ISBN (Promise) ==');
  try {
    const byIsbn = await searchByIsbnPromise('9780134685991');
    console.log(byIsbn);
  } catch (e) {
    console.error('Error:', e.message);
  }

  console.log('\n== Task 12: Search by Author (async/await) ==');
  try {
    const byAuthor = await searchByAuthor('Addy Osmani');
    console.log(byAuthor);
  } catch (e) {
    console.error('Error:', e.message);
  }

  console.log('\n== Task 13: Search by Title (async/await) ==');
  try {
    const byTitle = await searchByTitle('Design Patterns');
    console.log(byTitle);
  } catch (e) {
    console.error('Error:', e.message);
  }

  // Bonus: quick auth + protected route example
  console.log('\n== Bonus: Register, Login, Add/Delete Review (Protected) ==');
  try {
    const username = 'demoUser';
    const password = 'demoPass123!';

    // Register (ignore if already exists)
    try {
      await axios.post(`${BASE_URL}/register`, { username, password });
      console.log('Registered user:', username);
    } catch (e) {
      console.log('Register skipped (maybe already exists):', e.response?.data || e.message);
    }

    // Login
    const loginRes = await axios.post(`${BASE_URL}/login`, { username, password });
    const token = loginRes.data.token;
    console.log('Logged in. JWT:', token ? '(received)' : '(missing)');

    const auth = { headers: { Authorization: `Bearer ${token}` } };
    const isbn = '9780134685991';

    // Add/Modify review
    const addReview = await axios.post(`${BASE_URL}/books/${isbn}/review`, { review: 'Fantastic book for Java best practices.' }, auth);
    console.log('After add/modify:', addReview.data.reviews);

    // Delete review
    const delReview = await axios.delete(`${BASE_URL}/books/${isbn}/review`, auth);
    console.log('After delete:', delReview.data.reviews);
  } catch (e) {
    console.error('Auth demo error:', e.response?.data || e.message);
  }
}


// Always run the demo, regardless of module type
(async () => {
  try {
    await runDemo();
  } catch (e) {
    console.error('Fatal error in runDemo:', e.message);
  } finally {
    // Keep process alive for a short time to ensure all logs flush
    setTimeout(() => process.exit(0), 2000);
  }
})();
