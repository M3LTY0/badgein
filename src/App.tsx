import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AccountProvider } from "./AccountContext";
import Header from "./components/Header";
import PhoneFrame from "./components/PhoneFrame";
import { Home, RequireRole } from "./components/RouteGuards";
import { ConnectionsProvider } from "./ConnectionsContext";
import { ProfileProvider } from "./ProfileContext";
import Badge from "./screens/Badge";
import Employer from "./screens/Employer";
import Profile from "./screens/Profile";
import PublicProfile from "./screens/PublicProfile";
import Scan from "./screens/Scan";
import Welcome from "./screens/Welcome";

export default function App() {
  return (
    <AccountProvider>
      <ProfileProvider>
        <ConnectionsProvider>
          <div className="flex min-h-dvh flex-col bg-page">
            <Header />
            <Routes>
              <Route element={<PhoneFrame><Outlet /></PhoneFrame>}>
                <Route path="/" element={<Home />} />
                <Route path="/welcome" element={<Welcome />} />
                {/* Badge links must open for anyone, signed in or not. */}
                <Route path="/p" element={<PublicProfile />} />
                <Route element={<RequireRole role="attendee" />}>
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/badge" element={<Badge />} />
                  <Route path="/scan" element={<Scan />} />
                </Route>
              </Route>
              <Route element={<RequireRole role="employer" />}>
                <Route path="/employer" element={<Employer />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </ConnectionsProvider>
      </ProfileProvider>
    </AccountProvider>
  );
}
