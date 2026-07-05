import { Routes, Route } from "react-router-dom";
import Home from "@/pages/index";
import Library from "@/pages/library";
import Practice from "@/pages/practice";
import VocalCoach from "@/pages/vocal-coach";
import NotFound from "@/pages/not-found";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/library" element={<Library />} />
      <Route path="/practice" element={<Practice />} />
      <Route path="/vocal-coach" element={<VocalCoach />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
