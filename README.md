# Football Results

A web application developed with Next.js that allows users to register football match results and automatically generate league standings based on team performance.

## Features

* Register football match results.
* Store match information including teams, scores, and match date.
* Automatically update league standings after each registered result.
* View team statistics:

  * Points
  * Wins
  * Draws
  * Losses
  * Goal Difference
* Sample Premier League teams included.
* Data persistence through API routes and JSON files.

## Technologies Used

* Next.js
* React
* TypeScript
* Node.js
* ESLint

## Project Structure

```text
football-results/
├── app/
├── data/
│   ├── teams.json
│   └── matches.json
├── public/
├── package.json
└── README.md
```

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open your browser and navigate to:

```text
http://localhost:3000
```

## Available Scripts

```bash
npm run dev
```

Starts the development server.

```bash
npm run build
```

Creates a production build.

```bash
npm run start
```

Runs the production server.

```bash
npm run lint
```

Runs ESLint for code quality checks.

## Future Improvements

* User authentication.
* Multiple leagues support.
* Match editing and deletion.
* Database integration.
* Team logos and advanced statistics.

## Author

Jair Magaña

## License

This project was developed for educational and learning purposes.
