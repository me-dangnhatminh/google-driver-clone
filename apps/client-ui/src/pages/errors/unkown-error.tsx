import React from "react";

export function UnknownError() {
  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen">
      <div className="text-3xl font-bold">Something went wrong</div>
      <div className="text-xl">Please try again later</div>
      <button
        className="mt-4 px-4 py-2 text-white bg-black dark:bg-white dark:text-black rounded-md"
        onClick={() => {
          window.location.reload();
        }}
      >
        Reload
      </button>
    </div>
  );
}

export default UnknownError;
