"use client";

import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { trpc } from "../utils/trpc";
import Image from "next/image";
import type { Tweet } from "@prophesy/api/types";
import { TWEET_MAX_LENGTH } from "@prophesy/api/types";
import { convertPrivyUserToCreateUserInput } from "../types/privy";
import Navigation from "../components/Navigation";
import { useFollowerCount } from "../context/FollowerContext";

export default function Home() {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { followerCount } = useFollowerCount();
  const { login, authenticated, user, ready } = usePrivy();

  // Add textarea auto-expand functionality
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    if (newContent.length <= TWEET_MAX_LENGTH) {
      const textarea = e.target;
      setContent(newContent);

      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = "auto";
      // Set new height based on scrollHeight, with a max of 300px
      textarea.style.height = `${Math.min(textarea.scrollHeight, 300)}px`;
    }
  };

  // Create user in our database when they first log in
  const createUser = trpc.createUser.useMutation({
    onError: (error) => {
      console.error("Error creating user:", error);
      // Don't show this error to the user as it might be a duplicate user error
    },
  });

  useEffect(() => {
    const initUser = async () => {
      if (!ready) return; // Wait for Privy to be ready
      if (!authenticated) return; // Make sure user is authenticated
      if (!user) return; // Make sure we have user data

      if (process.env.NODE_ENV === "development") {
        console.log("=== Privy User Information ===");
        console.log("User ID:", user.id);
        console.log("Email:", user.email);
        console.log("Linked Accounts:", user.linkedAccounts);
        console.log("Full User Object:", JSON.stringify(user, null, 2));
      }

      // Find Twitter account from linkedAccounts
      const twitterAccount = user.linkedAccounts.find(
        (account) => account.type === "twitter_oauth"
      );
      const walletAccount = user.linkedAccounts.find(
        (account) => account.type === "wallet"
      );

      if (twitterAccount && walletAccount) {
        const createUserInput = convertPrivyUserToCreateUserInput(
          user.id,
          twitterAccount,
          walletAccount
        );

        if (createUserInput) {
          try {
            await createUser.mutateAsync(createUserInput);
          } catch (error) {
            console.error("Failed to create user:", error);
            // Ignore specific errors like duplicate user
          }
        }
      }
    };

    initUser();
  }, [ready, authenticated, user]);

  // Fetch tweets with pagination
  const {
    data: tweetData,
    fetchNextPage,
    hasNextPage,
  } = trpc.getTweets.useInfiniteQuery(
    {
      limit: 20,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const utils = trpc.useContext();

  const createTweet = trpc.createTweet.useMutation({
    onSuccess: () => {
      setContent("");
      // Invalidate and refetch tweets
      utils.getTweets.invalidate();
    },
    onError: (error) => {
      console.error("Tweet creation error:", error);
      setError(`Error creating tweet: ${error.message}`);
    },
  });

  const handleCreateTweet = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!content.trim()) {
      setError("Tweet content is required");
      return;
    }

    if (!user?.id) {
      setError("Please log in to manifest");
      return;
    }

    try {
      await createTweet.mutateAsync({
        content: content.trim(),
        userId: user.id,
      });
    } catch (error) {
      console.error("Tweet submission error:", error);
      if (error instanceof Error) {
        setError(`Tweet submission error: ${error.message}`);
      } else {
        setError("An unknown error occurred while creating the tweet");
      }
    }
  };

  // Flatten tweets from all pages
  const allTweets = tweetData?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div className="flex min-h-screen bg-white">
      <Navigation />
      <main className="flex-1 pb-24 lg:pb-8">
        {/* Main Content */}
        <div className="max-w-xl mx-auto border-x border-amber-500/20 bg-white">
          {/* Sticky Header */}
          <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-amber-500/30 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <Image
                  src="/sparks.svg"
                  width={48}
                  height={48}
                  alt="Prophesy Logo"
                />
                Prophesy
              </h2>
              {authenticated && followerCount !== null && (
                <div className="text-sm text-gray-500">
                  {followerCount.toLocaleString()} followers
                </div>
              )}
            </div>
            {error && (
              <div className="mt-2 p-2 bg-red-900/50 border border-red-700 rounded text-sm text-red-400">
                {error}
              </div>
            )}
          </header>

          {/* Tweet Composer - Only show when authenticated */}
          {
            <div className="border-b border-amber-500/20 p-4 text-gray-900">
              <form onSubmit={handleCreateTweet} className="space-y-0">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden bg-gray-200 ring-2 ring-amber-500/20">
                    {user?.twitter?.profilePictureUrl && (
                      <Image
                        src={user.twitter.profilePictureUrl}
                        alt="Profile"
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="relative">
                      <textarea
                        placeholder="~~✨ Manifest your vision ✨~~"
                        value={content}
                        onChange={handleTextareaChange}
                        maxLength={TWEET_MAX_LENGTH}
                        className="w-full bg-transparent text-xl placeholder-amber-500/40 italic placeholder:italic outline-none resize-none focus:ring-0 min-h-[72px] overflow-y-auto scrollbar-thin scrollbar-thumb-amber-200 scrollbar-track-transparent"
                        style={{ height: "72px", maxHeight: "300px" }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end items-center gap-4 mt-2">
                  <div className="text-sm text-gray-500">
                    {content.length}/{TWEET_MAX_LENGTH}
                  </div>
                  <button
                    type="submit"
                    disabled={!authenticated}
                    className={`px-6 py-2 rounded-full italic font-bold transition shadow-lg shadow-gray-600/20 border-2 ${
                      authenticated
                        ? "bg-gray-900 text-amber-300 hover:bg-gray-600 border-amber-300"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed border-gray-400"
                    }`}
                  >
                    Manifest
                  </button>
                </div>
              </form>
            </div>
          }

          {/* Tweet Feed */}
          <div className="divide-y divide-amber-500/20">
            {allTweets.map((tweet: Tweet) => (
              <article
                key={tweet.id}
                className="p-4 hover:bg-amber-50 transition cursor-pointer"
              >
                <div className="flex space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden bg-gray-200 ring-2 ring-amber-500/20">
                    {tweet.user?.twitter?.profilePictureUrl && (
                      <Image
                        src={tweet.user.twitter.profilePictureUrl}
                        alt="Profile"
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error("Image failed to load:", e);
                        }}
                        onLoad={() => {
                          console.log("Image loaded successfully");
                        }}
                      />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-gray-900">
                        {tweet.user?.twitter?.name || "Anonymous Prophet"}
                      </span>
                      <a
                        href={`https://twitter.com/${tweet.user?.twitter?.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-amber-500 transition-colors"
                      >
                        @{tweet.user?.twitter?.username}
                      </a>
                    </div>
                    <p className="mt-2 text-[15px] leading-normal text-gray-600 italic">
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

            {/* Load More Button */}
            {hasNextPage && (
              <div className="p-4 text-center">
                <button
                  onClick={() => fetchNextPage()}
                  className="text-amber-500 hover:text-amber-600 font-medium"
                >
                  Load More
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Privy Login Button - Fixed Bottom Right */}
        <div className="fixed bottom-6 right-6">
          {!authenticated && (
            <button
              onClick={login}
              className="bg-gray-600 text-white px-6 py-3 rounded-full font-bold hover:bg-gray-600 transition shadow-lg shadow-gray-600/20 flex items-center space-x-2"
            >
              <span>Log In</span>
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
