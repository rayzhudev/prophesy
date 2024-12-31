import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const Navigation = () => {
  const pathname = usePathname();

  const tabs = [
    {
      name: "",
      path: "/",
      icon: (
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current">
          <path d="M21.591 7.146L12.52 1.157c-.316-.21-.724-.21-1.04 0l-9.071 5.99c-.26.173-.409.456-.409.757v13.183c0 .502.418.913.929.913h6.638c.511 0 .929-.41.929-.913v-7.075h3.008v7.075c0 .502.418.913.929.913h6.639c.51 0 .928-.41.928-.913V7.904c0-.301-.158-.584-.408-.758zM20 20l-4.5.01.011-7.097c0-.502-.418-.913-.928-.913H9.44c-.511 0-.929.41-.929.913L8.5 20H4V8.773l8.011-5.342L20 8.764z" />
        </svg>
      ),
    },
    {
      name: "",
      path: "/collection",
      icon: (
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current">
          <path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z" />
        </svg>
      ),
    },
    {
      name: "",
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
    </>
  );
};

export default Navigation;
