"use client";

import { useState } from "react";
import { trpc } from "../utils/trpc";

export default function Home() {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const isDev = process.env.NODE_ENV === "development";

  const { data: tweets, refetch: refetchTweets } = trpc.getTweets.useQuery(
    undefined,
    {
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      staleTime: 0,
    }
  );

  const createTweet = trpc.createTweet.useMutation({
    onSuccess: () => {
      refetchTweets();
      setContent("");
    },
    onError: (error) => {
      console.error("Tweet creation error:", error);
      const errorDetails = {
        message: error.message,
        shape: error.shape,
        data: error.data,
      };
      console.error(
        "Error creating tweet (structured):",
        JSON.stringify(errorDetails, null, 2)
      );
      setError(
        `Error creating tweet: ${
          error.message
        }\n\nFull error details:\n${JSON.stringify(errorDetails, null, 2)}`
      );
    },
  });

  const handleCreateTweet = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!content.trim()) {
      setError("Tweet content is required");
      return;
    }

    try {
      console.log("=== Tweet Form Debug ===");
      console.log("Content:", content);
      console.log("=== End Form Debug ===");

      // Call the mutation
      const result = await createTweet.mutateAsync({ content: content.trim() });
      console.log("Tweet created:", result);
    } catch (error) {
      console.error("Tweet submission error:", error);
      if (error instanceof Error) {
        setError(`Tweet submission error: ${error.message}`);
      } else {
        setError("An unknown error occurred while creating the tweet");
      }
    }
  };

  return (
    <main
      className={`min-h-screen ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      } text-white transition-colors duration-200`}
    >
      {/* Main Content */}
      <div
        className={`max-w-2xl mx-auto border-x border-amber-500/20 min-h-screen ${
          !isDarkMode && "bg-white text-gray-900"
        }`}
      >
        {/* Sticky Header */}
        <header
          className={`sticky top-0 z-10 ${
            isDarkMode ? "bg-gray-900/80" : "bg-white/80"
          } backdrop-blur-md border-b border-amber-500/30 p-4`}
        >
          <div className="flex items-center justify-between">
            <h2
              className={`text-xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Prophesy
            </h2>
            {isDev && (
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 transition-colors"
              >
                <span
                  className={`text-sm ${
                    isDarkMode ? "text-amber-400" : "text-amber-600"
                  }`}
                >
                  {isDarkMode ? "☀️ Light" : "🌙 Dark"}
                </span>
              </button>
            )}
          </div>
          {error && (
            <div className="mt-2 p-2 bg-red-900/50 border border-red-700 rounded text-sm text-red-400">
              {error}
            </div>
          )}
        </header>

        {/* Tweet Composer */}
        <div
          className={`border-b border-amber-500/20 p-4 ${
            !isDarkMode && "text-gray-900"
          }`}
        >
          <form onSubmit={handleCreateTweet} className="space-y-4">
            <div className="flex items-start space-x-4">
              <div
                className={`w-12 h-12 rounded-full ${
                  isDarkMode ? "bg-gray-600" : "bg-gray-200"
                } ring-2 ring-amber-500/20`}
              ></div>
              <div className="flex-1">
                <textarea
                  placeholder="~~✨ Manifest your vision ✨~~"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className={`w-full bg-transparent text-xl ${
                    isDarkMode
                      ? "placeholder-amber-500/40"
                      : "placeholder-amber-600/40"
                  } italic placeholder:italic outline-none resize-none focus:ring-0`}
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-amber-500 text-gray-900 px-6 py-2 rounded-full font-bold hover:bg-amber-400 transition shadow-lg shadow-amber-500/20"
              >
                Manifest
              </button>
            </div>
          </form>
        </div>

        {/* Tweet Feed */}
        <div className="divide-y divide-amber-500/20">
          {tweets?.map((tweet) => (
            <article
              key={tweet.id}
              className={`p-4 ${
                isDarkMode ? "hover:bg-gray-800/50" : "hover:bg-amber-50/50"
              } transition cursor-pointer`}
            >
              <div className="flex space-x-4">
                <div
                  className={`w-12 h-12 rounded-full ${
                    isDarkMode ? "bg-gray-600" : "bg-gray-200"
                  } flex-shrink-0 ring-2 ring-amber-500/20`}
                ></div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`font-bold ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Anonymous Prophet
                    </span>
                  </div>
                  <p
                    className={`mt-2 text-[15px] leading-normal ${
                      isDarkMode ? "text-gray-100" : "text-gray-600"
                    }`}
                  >
                    {tweet.content}
                  </p>
                  <div className="mt-3 flex items-center space-x-12">
                    <button className="group flex items-center space-x-2">
                      <div className="text-amber-500/40 hover:text-amber-400">
                        <svg
                          className="w-5 h-5 group-hover:bg-amber-500/10 rounded-full p-1"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M14.046 2.242l-4.148-.01h-.002c-4.374 0-7.8 3.427-7.8 7.802 0 4.098 3.186 7.206 7.465 7.37v3.828c0 .108.044.286.12.403.142.225.384.347.632.347.138 0 .277-.038.402-.118.264-.168 6.473-4.14 8.088-5.506 1.902-1.61 3.04-3.97 3.043-6.312v-.017c-.006-4.367-3.43-7.787-7.8-7.788zm3.787 12.972c-1.134.96-4.862 3.405-6.772 4.643V16.67c0-.414-.335-.75-.75-.75h-.396c-3.66 0-6.318-2.476-6.318-5.886 0-3.534 2.768-6.302 6.3-6.302l4.147.01h.002c3.532 0 6.3 2.766 6.302 6.296-.003 1.91-.942 3.844-2.514 5.176z" />
                        </svg>
                      </div>
                      <span className="text-gray-400">3</span>
                    </button>
                    <button className="group flex items-center space-x-2">
                      <div className="text-amber-500/40 hover:text-amber-400">
                        <svg
                          className="w-5 h-5 group-hover:bg-amber-500/10 rounded-full p-1"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M23.77 15.67c-.292-.293-.767-.293-1.06 0l-2.22 2.22V7.65c0-2.068-1.683-3.75-3.75-3.75h-5.85c-.414 0-.75.336-.75.75s.336.75.75.75h5.85c1.24 0 2.25 1.01 2.25 2.25v10.24l-2.22-2.22c-.293-.293-.768-.293-1.06 0s-.294.768 0 1.06l3.5 3.5c.145.147.337.22.53.22s.383-.072.53-.22l3.5-3.5c.294-.292.294-.767 0-1.06zm-10.66 3.28H7.26c-1.24 0-2.25-1.01-2.25-2.25V6.46l2.22 2.22c.148.147.34.22.532.22s.384-.073.53-.22c.293-.293.293-.768 0-1.06l-3.5-3.5c-.293-.294-.768-.294-1.06 0l-3.5 3.5c-.294.292-.294.767 0 1.06s.767.293 1.06 0l2.22-2.22V16.7c0 2.068 1.683 3.75 3.75 3.75h5.85c.414 0 .75-.336.75-.75s-.337-.75-.75-.75z" />
                        </svg>
                      </div>
                      <span className="text-gray-400">5</span>
                    </button>
                    <button className="group flex items-center space-x-2">
                      <div className="text-amber-500/40 hover:text-amber-400">
                        <div className="w-6 h-6 group-hover:bg-amber-500/10 rounded-full flex items-center justify-center">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 250 250"
                            className="opacity-40 group-hover:opacity-100 transition-opacity"
                            fill="currentColor"
                          >
                            <path d="M250 115.13L236.114 111.694C187.888 99.764 150.236 62.1075 138.306 13.8856L134.87 0H115.13L111.694 13.8856C99.764 62.1125 62.1075 99.764 13.8856 111.694L0 115.13V134.87L13.8856 138.305C62.1125 150.236 99.764 187.892 111.694 236.114L115.13 250H134.87L138.306 236.114C150.236 187.887 187.893 150.236 236.114 138.305L250 134.87V115.13ZM191.213 129.065C158.846 133.39 133.385 158.851 129.06 191.218L124.995 221.649L120.93 191.218C116.605 158.851 91.1437 133.39 58.7774 129.065L28.3462 125L58.7774 120.935C91.1437 116.61 116.605 91.1486 120.93 58.7823L124.995 28.3511L129.06 58.7823C133.385 91.1486 158.846 116.61 191.213 120.935L221.644 125L191.213 129.065Z" />
                          </svg>
                        </div>
                      </div>
                      <span className="text-gray-400">12</span>
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
