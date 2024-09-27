import React from "react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { RoutesPath } from "@constants";
import { useAuth0 } from "@auth0/auth0-react";

const HomePage = () => {
  const navigate = useNavigate();
  const {
    isAuthenticated: isAuth,
    user: me,
    loginWithRedirect,
    logout: auth0Logout,
  } = useAuth0();

  const login = () => loginWithRedirect();
  const logout = () => {
    auth0Logout({ logoutParams: { returnTo: window.location.origin } });
  };

  const [atTop, setAtTop] = React.useState(true);
  const [open, setOpen] = React.useState(false);

  const toStorage = () => navigate(RoutesPath.STORAGE);

  React.useEffect(() => {
    const handleScroll = () => setAtTop(window.scrollY <= 50);
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  let mesg = "With love from Vietnam!";
  if (isAuth && me) {
    const view = me?.name || me?.nickname || me?.email;
    if (view) mesg = `Wellcome back, ${view}!`;
  }

  return (
    <div className="w-full min-h-screen bg-white">
      <div
        className={cn(
          "fixed z-50 w-full px-8 py-4 transition-all duration-1000 rounded-full mt-4",
          atTop
            ? "max-w-2xl"
            : "bg-black bg-opacity-90 backdrop-blur-xl max-w-4xl",
          "inset-x-0 mx-auto ease-in-out transform"
        )}
      >
        <div className="flex flex-col w-full p-2 mx-auto md:items-center md:justify-between md:flex-row">
          <div className="flex flex-row items-center justify-between">
            <span
              className={cn(
                "font-bold tracking-tighter",
                atTop ? "text-black" : "text-white"
              )}
              children="✺ Nhat Minh"
            />
            <button
              className="md:hidden focus:outline-none"
              onClick={() => setOpen(!open)}
            ></button>
          </div>
          <nav
            className={cn(
              "flex-col flex-grow gap-8",
              open ? "flex" : "hidden",
              "pb-4 md:pb-0 md:flex md:flex-row lg:ml-auto justify-end"
            )}
          >
            <a className={atTop ? "text-black" : "text-white"} href="#_">
              About
            </a>
            <a className={atTop ? "text-black" : "text-white"} href="#_">
              Work
            </a>
            <a className={atTop ? "text-black" : "text-white"} href="#_">
              Blog
            </a>
          </nav>
        </div>
      </div>
      <div className="bg-white">
        <div className="px-8 py-24 mx-auto text-center md:px-12 lg:px-24 lg:pt-64 text-zinc-500">
          <p className="max-w-xl mx-auto text-4xl text-black font-medium">
            Good Day Friends!
          </p>
          <div className="grid grid-cols-1 gap-8 mx-auto gap-y-28 mt-24 sm:grid-cols-1 max-w-2xl">
            <a onClick={toStorage} className="cursor-pointer">
              <div>
                <img
                  className="duration-500 w-full rounded-3xl shadow hover:shadow-3xl hover:-translate-y-12"
                  src="https://cdn.prod.website-files.com/6502fd58f151227f8e82e9d2/65c60a738451a54dff2ce82b_Google%20Drive%20workspace.webp"
                  alt="Card 1"
                />
              </div>
            </a>
            <a href="/meet">
              <div>
                <img
                  className="duration-500 w-full rounded-3xl shadow hover:shadow-3xl hover:-translate-y-12"
                  src="https://www.zohowebstatic.com/sites/zweb/images/meeting/deskapp/hero-banner.webp"
                  alt="Card 2"
                />
              </div>
            </a>
          </div>
        </div>
      </div>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 sm:flex sm:justify-center sm:px-6 sm:pb-5 lg:px-8">
        <div className="pointer-events-auto m-auto flex w-full max-w-md divide-x divide-neutral-200 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="flex w-0 flex-1 items-center p-4">
            <div className="w-full">
              <p className="text-sm font-medium text-neutral-900">
                Welcome to my website!
              </p>
              <p className="mt-1 text-sm text-neutral-500">{mesg}</p>
              <p className="mt-2 text-xs text-orange-500 underline">
                <a href="">by © Nhat Minh</a>
              </p>
            </div>
          </div>
          <div className="flex">
            <div className="flex flex-col divide-y divide-neutral-200">
              {(() => {
                if (isAuth) return null;

                return (
                  <>
                    <div
                      className="flex h-0 flex-1 cursor-pointer"
                      onClick={login}
                    >
                      <a className="flex w-full items-center justify-center rounded-none rounded-tr-lg border border-transparent px-4 py-3 text-sm font-medium text-orange-600 hover:text-orange-500 focus:z-10 focus:outline-none focus:ring-2 focus:ring-orange-500">
                        Register
                      </a>
                    </div>
                    <div
                      className="flex h-0 flex-1 cursor-pointer"
                      onClick={login}
                    >
                      <a className="flex w-full items-center justify-center rounded-none rounded-br-lg border border-transparent px-4 py-3 text-sm font-medium text-neutral-700 hover:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500">
                        Log In
                      </a>
                    </div>
                  </>
                );
              })()}
              {(() => {
                if (!isAuth) return null;
                return (
                  <>
                    <div className="flex h-0 flex-1 cursor-pointer">
                      <a className="flex w-full items-center justify-center rounded-none rounded-tr-lg border border-transparent px-4 py-3 text-sm font-medium text-orange-600 hover:text-orange-500 focus:z-10 focus:outline-none focus:ring-2 focus:ring-orange-500">
                        Profile
                      </a>
                    </div>
                    <div
                      className="flex h-0 flex-1 cursor-pointer"
                      onClick={logout}
                    >
                      <a className="flex w-full items-center justify-center rounded-none rounded-br-lg border border-transparent px-4 py-3 text-sm font-medium text-neutral-700 hover:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500">
                        Log Out
                      </a>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
