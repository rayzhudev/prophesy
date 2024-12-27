"use client";

import { useState } from "react";
import { API_URL, getApiUrl } from "@/config/api";

export default function Home() {
  const [text, setText] = useState("");
  const [spacedText, setSpacedText] = useState("");
  const [testUrl, setTestUrl] = useState(API_URL);
  const [testResponse, setTestResponse] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const url = getApiUrl("/submit-text");
    console.log("Calling API at:", url);
    console.log("Environment:", process.env.NODE_ENV);
    console.log(
      "NEXT_PUBLIC_BACKEND_URL:",
      process.env.NEXT_PUBLIC_BACKEND_URL
    );
    console.log("API_URL:", API_URL);
    console.log("Railway Private Domain:", process.env.RAILWAY_PRIVATE_DOMAIN);
    console.log("Railway Port:", process.env.PORT);

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

  const testApiConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestResponse("Testing...");

    try {
      console.log("Testing URL:", testUrl);
      const response = await fetch(testUrl, {
        method: "GET",
      });

      const text = await response.text();
      setTestResponse(
        `Status: ${response.status}\nHeaders: ${JSON.stringify(
          Object.fromEntries(response.headers.entries()),
          null,
          2
        )}\nBody: ${text}`
      );
    } catch (error) {
      setTestResponse(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
      console.error("Test error:", error);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
      {/* API Tester */}
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4">API Tester</h2>
        <form onSubmit={testApiConnection} className="space-y-4">
          <input
            type="text"
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            placeholder="Enter API URL to test"
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-700 placeholder-slate-400 bg-white shadow-sm"
          />
          <button
            type="submit"
            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Test Connection
          </button>
          {testResponse && (
            <pre className="mt-4 p-4 bg-slate-100 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap">
              {testResponse}
            </pre>
          )}
        </form>
      </div>

      {/* Text Spacer */}
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
