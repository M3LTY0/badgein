import { Navigate, Outlet } from "react-router-dom";
import { homeFor, useAccount, type Role } from "../AccountContext";
import Inbox from "../screens/Inbox";

/** Only lets the given role through. No account goes to sign-up, the other role goes to its own home. */
export function RequireRole({ role }: { role: Role }) {
  const { account } = useAccount();
  if (!account) return <Navigate to="/welcome" replace />;
  if (account.role !== role) return <Navigate to={homeFor(account.role)} replace />;
  return <Outlet />;
}

/** "/" is the landing page for signed-out visitors, and sends everyone else to their home screen. */
export function Home() {
  const { account } = useAccount();
  return account ? <Navigate to={homeFor(account.role)} replace /> : <Inbox />;
}
