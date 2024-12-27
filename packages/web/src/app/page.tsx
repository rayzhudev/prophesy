"use client";

import { useState } from "react";
import { trpc } from "../utils/trpc";

export default function Home() {
  const [userForm, setUserForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [tweetForm, setTweetForm] = useState({
    content: "",
    userId: "",
  });

  const { data: users, refetch: refetchUsers } = trpc.getUsers.useQuery();
  const createUser = trpc.createUser.useMutation({
    onSuccess: () => {
      refetchUsers();
      setUserForm({ username: "", email: "", password: "" });
    },
    onError: (error) => {
      console.error("Error creating user:", error);
      alert("Failed to create user: " + error.message);
    },
  });
  const createTweet = trpc.createTweet.useMutation({
    onSuccess: () => {
      refetchUsers();
      setTweetForm({ content: "", userId: "" });
    },
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log("Creating user:", userForm);
      await createUser.mutate(userForm);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Twitter Clone</h1>

      {/* Create User Form */}
      <div className="mb-8 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Create User</h2>
        <form onSubmit={handleCreateUser} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={userForm.username}
            onChange={(e) =>
              setUserForm({ ...userForm, username: e.target.value })
            }
            className="w-full p-2 border rounded"
          />
          <input
            type="email"
            placeholder="Email"
            value={userForm.email}
            onChange={(e) =>
              setUserForm({ ...userForm, email: e.target.value })
            }
            className="w-full p-2 border rounded"
          />
          <input
            type="password"
            placeholder="Password"
            value={userForm.password}
            onChange={(e) =>
              setUserForm({ ...userForm, password: e.target.value })
            }
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Create User
          </button>
        </form>
      </div>

      {/* Create Tweet Form */}
      <div className="mb-8 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Create Tweet</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createTweet.mutate(tweetForm);
          }}
          className="space-y-4"
        >
          <select
            value={tweetForm.userId}
            onChange={(e) =>
              setTweetForm({ ...tweetForm, userId: e.target.value })
            }
            className="w-full p-2 border rounded"
          >
            <option value="">Select User</option>
            {users?.map((user) => (
              <option key={user.id} value={user.id}>
                {user.username}
              </option>
            ))}
          </select>
          <textarea
            placeholder="Tweet content"
            value={tweetForm.content}
            onChange={(e) =>
              setTweetForm({ ...tweetForm, content: e.target.value })
            }
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Create Tweet
          </button>
        </form>
      </div>

      {/* Display Users and their Tweets */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Users and Tweets</h2>
        {users?.map((user) => (
          <div key={user.id} className="p-4 border rounded-lg">
            <h3 className="font-semibold">
              {user.username} ({user.email})
            </h3>
            <div className="mt-2 space-y-2">
              {user.tweets.map((tweet) => (
                <div key={tweet.id} className="p-2 bg-gray-50 rounded">
                  {tweet.content}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
