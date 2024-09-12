import sidebarUtil from "@utils/side-bar.util";
import { cn } from "@/lib/utils";

export type DefaultLayoutProps = {
  modal?: React.ReactNode;
  toast?: React.ReactNode;
  header: React.ReactNode;
  main: React.ReactNode;
  sidebar: React.ReactNode;
};

function DefaultLayout(props: DefaultLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden relative">
      {props.toast}
      {props.modal}

      <aside
        id={sidebarUtil.SIDEBAR_ID}
        className={cn(
          "absolute left-0 top-0 z-10 h-full w-full lg:w-auto",
          "duration-300 ease-linear",
          "lg:static lg:translate-x-0 -translate-x-full"
        )}
        onClick={sidebarUtil.close}
      >
        <div
          className="h-full w-72"
          onClick={(e) => e.stopPropagation()}
          children={props.sidebar}
        />
      </aside>
      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-hidden">
        <header className="">{props.header}</header>
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {props.main}
        </main>
      </div>
    </div>
  );
}

export default DefaultLayout;
