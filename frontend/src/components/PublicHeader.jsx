import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";

const PublicHeader = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">

        {/* LEFT: LOGO + NAME */}
        <div className="flex items-center gap-2 max-w-[70%]">
          <img
            src="/school-logo.PNG"
            alt="logo"
            className="h-8 w-8 object-contain"
          />

          <h1 className="font-display text-sm sm:text-xl md:text-2xl font-semibold text-brand-900 leading-tight whitespace-nowrap">
            New Shining Star Public School
          </h1>
        </div>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex gap-8 text-sm font-medium text-brand-700">
          <a href="#home" className="hover:text-accent-600">Home</a>
          <a href="#about" className="hover:text-accent-600">About</a>
          <a href="#gallery" className="hover:text-accent-600">Gallery</a>
          <a href="#contact" className="hover:text-accent-600">Contact</a>
        </nav>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-3">

          {/* ADMIN (ONLY DESKTOP) */}
          <a 
            href="/admin" 
            className="!hidden lg:!block btn-primary text-sm px-4 py-2"
            >
              Admin
          </a>

          {/* MOBILE TOGGLE */}
          <button
            onClick={() => setIsOpen(true)}
            className="md:hidden text-2xl"
          >
            <FaBars />
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <div
        className={`fixed top-0 right-0 h-full w-[75%] max-w-sm bg-white shadow-lg z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* CLOSE BUTTON */}
        <div className="flex justify-end p-4 border-b">
          <button onClick={() => setIsOpen(false)}>
            <FaTimes size={22} />
          </button>
        </div>

        {/* MENU ITEMS */}
        <div className="flex flex-col gap-6 px-6 py-6 text-lg font-medium text-brand-800">
          <a href="#home" onClick={() => setIsOpen(false)}>Home</a>
          <a href="#about" onClick={() => setIsOpen(false)}>About</a>
          <a href="#gallery" onClick={() => setIsOpen(false)}>Gallery</a>
          <a href="#contact" onClick={() => setIsOpen(false)}>Contact</a>

          {/* ADMIN IN MOBILE MENU */}
          <a
            href="/admin"
            className="btn-primary text-center mt-4"
            onClick={() => setIsOpen(false)}
          >
            Admin Login
          </a>
        </div>
      </div>

      {/* OVERLAY */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </header>
  );
};

export default PublicHeader;