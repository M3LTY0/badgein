import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import PhoneFrame from "./components/PhoneFrame";
import { ProfileProvider } from "./ProfileContext";
import Badge from "./screens/Badge";
import Employer from "./screens/Employer";
import Inbox from "./screens/Inbox";
import Profile from "./screens/Profile";

export default function App() {
  return (
    <ProfileProvider>
      <div className="flex min-h-full flex-col bg-page">
        <Header />
        <Routes>
          <Route element={<PhoneFrame><Outlet /></PhoneFrame>}>
            <Route path="/" element={<Inbox />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/badge" element={<Badge />} />
          </Route>
          <Route path="/employer" element={<Employer />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </ProfileProvider>
  );
}
