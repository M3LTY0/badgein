import { Link, useNavigate } from "react-router-dom";
import Scanner from "../components/Scanner";
import { useConnections } from "../ConnectionsContext";

/** Scan another attendee's (or an employer's) badge from the phone. A good scan saves it and opens the profile. */
export default function Scan() {
  const navigate = useNavigate();
  const { add } = useConnections();

  return (
    <div className="flex flex-1 flex-col">
      <Link to="/badge" className="self-start text-[9.5px] text-slate-300 hover:text-white">‹ My badge</Link>
      <h2 className="mt-2.5 text-[14px] font-extrabold">Scan a badge</h2>
      <p className="mb-3 mt-1 text-[9px] text-slate-300">Point your camera at a badgeIn QR code.</p>
      <Scanner
        onProfile={(shared, encoded) => {
          add(shared);
          navigate(`/p#d=${encoded}`, { replace: true });
        }}
      />
    </div>
  );
}
