import { useLayoutEffect, type ReactNode } from "react";

/**
 * Laptops and desktops: a phone mockup (bezel, fixed size, zoomed up to suit the window).
 * Real phones (under 640px wide): no mockup. The screen fills the whole display and the UI scales with it (see index.css).
 */
export default function PhoneFrame({ children }: { children: ReactNode }) {
  // Switches on the phone scaling in index.css while a phone screen is showing. Layout effect = no flash of tiny text.
  useLayoutEffect(() => {
    document.documentElement.classList.add("phone-ui");
    return () => document.documentElement.classList.remove("phone-ui");
  }, []);

  return (
    <main className="flex flex-1 items-start justify-center px-4 pb-10 pt-1 max-sm:items-stretch max-sm:p-0">
      <div className="phone-scale flex min-h-[444px] w-[236px] flex-col rounded-[28px] border-[6px] border-phone-edge bg-phone shadow-2xl shadow-black/40 max-sm:min-h-0 max-sm:w-full max-sm:rounded-none max-sm:border-0 max-sm:shadow-none">
        <div className="flex min-h-[432px] flex-1 flex-col px-2.5 py-4 max-sm:min-h-0 max-sm:pb-[max(1rem,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
    </main>
  );
}
