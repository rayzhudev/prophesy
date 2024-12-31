"use client";

import Navigation from "../../components/Navigation";

export default function Collection() {
  return (
    <div className="flex min-h-screen">
      <Navigation />
      <main className="flex-1 p-8 lg:p-8 pb-24 lg:pb-8">
        <div className="max-w-xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">My Collection</h1>
          {/* Collection content will go here */}
        </div>
      </main>
    </div>
  );
}
