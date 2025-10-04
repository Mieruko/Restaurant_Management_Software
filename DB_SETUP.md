MySQL setup for Restaurant_Management_Software

1) Create database and tables
- Start your MySQL server.
- From command line (PowerShell) run:

mysql -u root -p < db/mysql_schema.sql

This will create the `quanlynhahang` database and `menus`, `orders`, `order_items` tables and insert some sample menu rows.

2) Configure environment variables
- Create a `.env` file at project root with content (adjust to your MySQL credentials):

DB_NAME=quanlynhahang
DB_USER=root
DB_PASS=your_mysql_password
DB_HOST=127.0.0.1
USE_DB=true

3) Run the app
- Install dependencies:

npm install

- Start in dev:

npm run dev

With `USE_DB=true` the app will persist orders to MySQL. If `USE_DB` is not set or false, the app uses in-memory arrays (default, safe for tests).

Notes
- The minimal schema provided is intentionally small. In production you should add migrations, indexes, and constraints as needed.
- If you want I can add a simple script to seed tables data and a small migration runner.
