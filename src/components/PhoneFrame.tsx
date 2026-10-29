import type { ReactNode } from "react";

export default function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <main className="flex flex-1 items-start justify-center px-4 pb-10 pt-1">
      <div className="phone-scale min-h-[444px] w-[236px] rounded-[28px] border-[6px] border-phone-edge bg-phone shadow-2xl shadow-black/40">
        <div className="flex min-h-[432px] flex-col px-2.5 py-4">{children}</div>
      </div>
    </main>
  );
}
