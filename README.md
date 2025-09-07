# Book Review API (Express + JWT) with Axios Client Demo

A server-side online book review application integrated with a secure REST API that uses **JWT authentication**. Includes a Node.js client using **callbacks, Promises, and async/await** to fulfill Tasks 10–13.

> **Tech**: Node.js, Express, JSON Web Tokens, bcrypt, Axios, CORS, dotenv

---

## Quick Start

```bash
git clone <your-fork-or-repo-url>.git
cd book-review-api-jwt
cp .env.example .env   # and set JWT_SECRET (and PORT if needed)

npm install
npm run start          # starts API at http://localhost:3000
# in another terminal
npm run client         # runs client/demo.js to showcase Tasks 10–13 and protected routes
```

> You can set `BASE_URL` env var for the client (defaults to `http://localhost:3000`).

---

## Endpoints (Mapping to Tasks)

### Public (General Users)

- **Task 1**: `GET /books` – Get the book list
- **Task 2**: `GET /books/isbn/:isbn` – Get book by ISBN
- **Task 3**: `GET /books/author/:author` – Get all books by Author (substring match, case-insensitive)
- **Task 4**: `GET /books/title/:title` – Get all books by Title (substring match, case-insensitive)
- **Task 5**: `GET /books/:isbn/reviews` – Get reviews for a book

### Auth

- **Task 6**: `POST /register` – Register new user
  - Body: `{ "username": "alice", "password": "Secret123!" }`
- **Task 7**: `POST /login` – Login as a registered user
  - Body: `{ "username": "alice", "password": "Secret123!" }`
  - Returns: `{ "token": "<JWT>" }`

### Protected (Registered Users)

- **Task 8**: `POST /books/:isbn/review` – Add/Modify a book review
  - Header: `Authorization: Bearer <JWT>`
  - Body: `{ "review": "Text..." }`
- **Task 9**: `DELETE /books/:isbn/review` – Delete your review for that book
  - Header: `Authorization: Bearer <JWT>`

> Reviews are stored per-user under each book as `{ [username]: "review text" }`.
> Data is persisted back to `data/books.json` as a simple demo. For production, use a database.

---

## Client (Axios) – Tasks 10–13

- **Task 10** – *Get all books using an async callback function*  
  `getAllBooksCb(cb)` calls the callback with `(err, data)` after `await axios.get(...)`.

- **Task 11** – *Search by ISBN using Promises*  
  `searchByIsbnPromise(isbn)` returns a Promise via `axios.get(...).then(...)`.

- **Task 12** – *Search by Author using async/await*  
  `searchByAuthor(author)` returns results using `await axios.get(...)`.

- **Task 13** – *Search by Title using async/await*  
  `searchByTitle(title)` returns results using `await axios.get(...)`.

Run the demo:
```bash
npm run client
```

---

## Example cURL

```bash
# Register
curl -X POST http://localhost:3000/register -H "Content-Type: application/json" -d '{"username":"alice","password":"Secret123!"}'

# Login
TOKEN=$(curl -s -X POST http://localhost:3000/login -H "Content-Type: application/json" -d '{"username":"alice","password":"Secret123!"}' | jq -r .token)

# Add/Modify review
curl -X POST http://localhost:3000/books/9780134685991/review -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"review":"Great insights!"}'

# Delete review
curl -X DELETE http://localhost:3000/books/9780134685991/review -H "Authorization: Bearer $TOKEN"
```

---

## Project Structure

```
book-review-api-jwt/
├─ src/
│  └─ server.js
├─ client/
│  └─ demo.js
├─ data/
│  └─ books.json
├─ .env.example
├─ package.json
├─ README.md
└─ LICENSE
```

---

## Notes for Grading

- Tasks 1–9: Implemented in `src/server.js`.
- Tasks 10–13: Implemented/tested by `client/demo.js` (Axios: callback, Promise, async/await).
- **Task 14**: Submit the GitHub repo link containing this project.

---

## Security & Session Notes

- JWTs are issued with 1-hour expiry to emulate session-level authentication.
- In production, consider HTTPS, refresh tokens, secure cookie storage, logout/blacklist, and a database for users/reviews.

---

## License

MIT
