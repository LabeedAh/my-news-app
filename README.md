Live News Feed Application

This is a single-page, responsive News Feed application built with Next.js (App Router) and React, styled using Tailwind CSS. It fetches real-time news headlines categorized by topic.

🚀 Getting Started

Prerequisites

You need to have Node.js installed on your machine.

Installation

Clone the repository:

git clone [YOUR_REPO_URL]
cd live-news-feed

Install dependencies:

npm install

Setup API Key:
The News API key is currently hardcoded in app/page.tsx for demonstration purposes. For production use, you must move this key to a secure environment variable named NEWS_API_KEY in a .env.local file.

Example .env.local:

NEWS_API_KEY="YOUR_API_KEY_HERE"

Run the application:

npm run dev

The application will be accessible at http://localhost:3000.

✨ Features

TypeScript for type safety.

Real-time Data fetched from News API.

Category Navigation with buttons (General, Technology, Sports, etc.).

Responsive Design using Tailwind CSS.
