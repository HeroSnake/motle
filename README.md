# Motle

Motle is a fun word-guessing game built with Svelte and Vite. The game uses a pool of 2,000 French words to challenge players' vocabulary and problem-solving skills.
Features

    Interactive Gameplay: Guess the correct word in a limited number of attempts.
    Dynamic UI: Responsive and intuitive interface built with Svelte.
    Efficient Development: Powered by Vite for fast development and builds.
    French Word Bank: Features a diverse selection of 2,000 French words.

## Getting Started

Follow these steps to get the project up and running on your local machine.
Prerequisites

Ensure you have the following installed:

    Node.js (v14 or later)
    npm or Yarn

## Installation

    Clone the repository:

git clone https://github.com/your-username/motle.git
cd motle

Install dependencies:

npm install
# or
yarn install

Start the development server:

npm run dev
### or
yarn dev

Open the app in your browser:

    http://localhost:5173

### Building for Production

To create an optimized production build:

npm run build
### or
yarn build

The output will be in the dist directory. You can serve it using any static file server.
Project Structure

motle/
├── public/         # Static assets
├── src/
│   ├── assets/     # Images, fonts, and other assets
│   ├── components/ # Svelte components
│   ├── routes/     # Application routes
│   ├── store/      # State management
│   ├── App.svelte  # Root component
│   ├── main.js     # Entry point
├── .gitignore
├── package.json
├── README.md
└── vite.config.js  # Vite configuration

### Customization

    Word List: The French word bank is stored in src/assets/words.json. You can replace or expand this list as needed.
    Styling: Modify src/assets/styles.css for custom themes or styles.

This project is licensed under my License.
