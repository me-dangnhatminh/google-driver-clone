import { Loader } from "lucide-react";

export const SpinnerScreen = () => {
  return (
    <section className="w-screen h-screen flex justify-center items-center">
      <Loader className="animate-spin text-muted-foreground w-4 h-4 m-auto" />
    </section>
  );
};

export const Spinner = () => (
  <section className="w-full h-full flex justify-center items-center">
    <Loader className="animate-spin text-muted-foreground w-4 h-4 m-auto" />
  </section>
);
