// src/components/ui/HUD.jsx

import Navbar from "../navigation/Navbar";

export default function HUD() {
  return (
    <div className="fixed inset-0 z-10 m-5 border-[0.5px] border-white/25 flex flex-col justify-between text-neutral-100">
      <div className="flex justify-between p-5">
        <div className="font-sansation">Nea.Design</div>
        <div className="top-5 right-5">
          <Navbar />
        </div>
      </div>
      <div className="flex justify-between p-5">
        <div className="font-sansation">sound on</div>
        <div className="font-sansation">Manila, Philippines</div>
      </div>
    </div>
  );
}
