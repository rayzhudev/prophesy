import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { usePrivy } from "@privy-io/react-auth";
import { useState } from "react";

const Navigation = () => {
  const pathname = usePathname();
  const { login, authenticated, user, logout } = usePrivy();
  const [menuOpen, setMenuOpen] = useState(false);

  const tabs = [
    {
      name: "Home",
      path: "/",
      icon: (
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current">
          <path d="M21.591 7.146L12.52 1.157c-.316-.21-.724-.21-1.04 0l-9.071 5.99c-.26.173-.409.456-.409.757v13.183c0 .502.418.913.929.913h6.638c.511 0 .929-.41.929-.913v-7.075h3.008v7.075c0 .502.418.913.929.913h6.639c.51 0 .928-.41.928-.913V7.904c0-.301-.158-.584-.408-.758zM20 20l-4.5.01.011-7.097c0-.502-.418-.913-.928-.913H9.44c-.511 0-.929.41-.929.913L8.5 20H4V8.773l8.011-5.342L20 8.764z" />
        </svg>
      ),
    },
    {
      name: "Collection",
      path: "/collection",
      icon: (
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current">
          <path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z" />
        </svg>
      ),
    },
    {
      name: "Wallet",
      path: "/wallet",
      icon: (
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current">
          <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12z" />
          <path d="M4 7h16v2H4zm0 3h16v2H4zm0" opacity={0.9} />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex w-64 h-screen bg-white border-r border-gray-200 flex-col px-2">
        {/* Logo and Environment Indicator */}
        <div className="p-3 mb-4 flex items-center gap-2">
          <Image
            src="/sparks.svg"
            width={32}
            height={32}
            alt="Prophesy Logo"
            className="w-8 h-8"
          />
          {process.env.NODE_ENV === "production" ? (
            <div className="px-2 py-1 bg-yellow-500/10 text-yellow-600 text-xs font-bold rounded border border-yellow-500/20">
              ALPHA
            </div>
          ) : (
            <div className="px-2 py-1 bg-yellow-500/10 text-yellow-600 text-xs font-bold rounded border border-yellow-500/20">
              DEVELOPMENT
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <div className="space-y-1">
          {tabs.map((tab) => (
            <Link
              key={tab.path}
              href={tab.path}
              className={`flex items-center p-3 rounded-full transition-colors group ${
                pathname === tab.path
                  ? "font-bold"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <div
                className={
                  pathname === tab.path ? "text-gray-900" : "text-gray-700"
                }
              >
                {tab.icon}
              </div>
              <span className="ml-4 text-xl">{tab.name}</span>
            </Link>
          ))}
        </div>

        {/* Profile Section - Desktop */}
        <div className="mt-auto p-3 relative">
          {authenticated && user?.twitter ? (
            <>
              <div
                className="flex items-center gap-3 p-2 rounded-full hover:bg-gray-50 cursor-pointer"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 ring-2 ring-amber-500/20">
                  {user.twitter.profilePictureUrl && (
                    <Image
                      src={user.twitter.profilePictureUrl}
                      alt="Profile"
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {user.twitter.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    @{user.twitter.username}
                  </div>
                </div>
                <div className="text-gray-400">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                    <path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                  </svg>
                </div>
              </div>

              {/* Dropdown Menu */}
              {menuOpen && (
                <div className="absolute bottom-full left-3 right-3 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                  <button
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                      <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                    </svg>
                    Log out
                  </button>
                </div>
              )}
            </>
          ) : (
            <button
              onClick={login}
              className="w-full bg-gray-900 text-white px-6 py-3 rounded-full font-bold hover:bg-gray-800 transition shadow-lg shadow-gray-600/20 flex items-center justify-center"
            >
              Log In
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 pb-4 z-50">
        <div className="mx-4">
          <nav className="bg-white/95 backdrop-blur-md border border-gray-200 rounded-full shadow-lg">
            <div className="flex justify-around items-center h-14">
              {tabs.map((tab) => (
                <Link
                  key={tab.path}
                  href={tab.path}
                  className={`flex flex-col items-center justify-center p-2 flex-1 ${
                    pathname === tab.path
                      ? "text-gray-900"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <div
                    className={`w-6 h-6 ${
                      pathname === tab.path ? "text-amber-500" : ""
                    }`}
                  >
                    {tab.icon}
                  </div>
                  <span className="text-xs mt-0.5 font-medium">{tab.name}</span>
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile Login Button */}
      <div className="lg:hidden fixed bottom-24 right-6">
        {!authenticated ? (
          <button
            onClick={login}
            className="bg-gray-900 text-white px-6 py-3 rounded-full font-bold hover:bg-gray-800 transition shadow-lg shadow-gray-600/20 flex items-center space-x-2"
          >
            <span>Log In</span>
          </button>
        ) : (
          <div className="bg-white/95 backdrop-blur-md border border-gray-200 rounded-full shadow-lg p-2 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 ring-2 ring-amber-500/20">
              {user?.twitter?.profilePictureUrl && (
                <Image
                  src={user.twitter.profilePictureUrl}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Navigation;
