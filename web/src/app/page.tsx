"use client";

import { useState } from "react";
import { API_URL } from "@/config/api";

export default function Home() {
  const [text, setText] = useState("");
  const [spacedText, setSpacedText] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const url = `${API_URL}/submit-text`;
    console.log("Calling API at:", url);
    console.log("Environment:", process.env.NODE_ENV);
    console.log("BACKEND_URL:", process.env.BACKEND_URL);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (response.ok) {
        const data = await response.json();
        setSpacedText(data.text);
        setText(""); // Clear the input after successful submission
        console.log("Text sent successfully");
      } else {
        console.error("API error:", response.status, await response.text());
      }
    } catch (error) {
      console.error("Error sending text:", error);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-6 text-center">
          Text Spacer
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col gap-4">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter your text here"
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-700 placeholder-slate-400 bg-white shadow-sm"
            />
            <button
              type="submit"
              className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Space Text
            </button>
          </div>
        </form>

        {spacedText && (
          <div className="mt-8 p-6 bg-slate-100 rounded-lg border border-slate-200">
            <h2 className="text-sm font-medium text-slate-600 mb-3">
              Spaced Result:
            </h2>
            <p className="font-mono text-lg text-slate-800 break-all">
              {spacedText}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
