import React from 'react';

function App() {
  return (
    // HAPUS 'font-poppins' dari sini
    <div className="min-h-screen bg-primary-dark text-text-light">
      <header className="py-6 bg-secondary-dark shadow-lg">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gacha-red text-center">Gacha Dulu, Cuan Kemudian!</h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl text-center mb-6 text-text-light">Welcome to the Gacha Frontend</h2>
      </main>
    </div>
  );
}

export default App;