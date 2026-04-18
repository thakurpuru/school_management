import Footer from "../components/Footer.jsx";
import PublicHeader from "../components/PublicHeader.jsx";

const HomePage = () => (
  <div id="home" className="min-h-screen">
    <PublicHeader />

    <section
      className="relative h-[90vh] flex items-center justify-center text-center text-white"
      style={{
        backgroundImage: "url('https://lh3.googleusercontent.com/p/AF1QipOm1PFj1DnpjoVsDdeHHObKEsEFfp0p7DxA6VN1=s1360-w1360-h1020-rw')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl px-6">
        <p className="text-sm uppercase tracking-[0.4em] text-accent-300">
          Welcome To Our Campus
        </p>

        <h2 className="mt-6 text-4xl md:text-6xl font-display leading-tight">
          A modern school with the warmth of tradition
        </h2>

        <p className="mt-6 text-lg text-white/90">
          Excellence, Discipline, and Character — shaping future leaders.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <a href="#about" className="btn-primary">
            Explore School
          </a>
          <a href="#gallery" className="btn-secondary">
            View Gallery
          </a>
        </div>
      </div>
    </section>

    <section id="leadership" className="mx-auto max-w-7xl px-6 py-12">
      <h3 className="text-3xl font-display text-center text-brand-900">
        Our Leadership
      </h3>

      <div className="mt-10 grid gap-8 md:grid-cols-2">

        {/* Chairman */}
        <div className="panel p-6 text-center">
          <img
            src="/chairman.jpg"
            className="mx-auto h-40 w-40 rounded-full object-cover"
          />
          <h4 className="mt-4 text-2xl font-display text-brand-900">
            Shri Santosh Jha
          </h4>
          <p className="text-sm text-accent-600">Chairman</p>
          <p className="mt-3 text-brand-700">
            Building strong values and academic excellence for future generations.
          </p>
        </div>

        {/* Principal */}
        <div className="panel p-6 text-center">
          <img
            src="/principal.jpg"
            className="mx-auto h-40 w-40 rounded-full object-cover"
          />
          <h4 className="mt-4 text-2xl font-display text-brand-900">
            Dr. Priya Sharma
          </h4>
          <p className="text-sm text-accent-600">Principal</p>
          <p className="mt-3 text-brand-700">
            Focused on student growth, discipline, and academic excellence.
          </p>
        </div>

      </div>
    </section>

    <section id="about" className="mx-auto max-w-7xl px-6 py-8">
      <div className="panel p-8 md:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent-600">
          About The School
        </p>
        <h3 className="mt-4 font-display text-3xl text-brand-900">
          Built for disciplined learning and transparent administration
        </h3>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <div className="rounded-3xl bg-brand-50 p-5">
            <h4 className="font-semibold text-brand-900">Student Care</h4>
            <p className="mt-2 text-sm leading-6 text-brand-700">
              Personal attention, academic guidance, and safe campus processes for
              every class.
            </p>
          </div>
          <div className="rounded-3xl bg-brand-50 p-5">
            <h4 className="font-semibold text-brand-900">Transparent Fees</h4>
            <p className="mt-2 text-sm leading-6 text-brand-700">
              Professional receipts, fee history, pending dues, and clean payment
              records.
            </p>
          </div>
          <div className="rounded-3xl bg-brand-50 p-5">
            <h4 className="font-semibold text-brand-900">Staff Management</h4>
            <p className="mt-2 text-sm leading-6 text-brand-700">
              Organized salary records, staff details, and school operations in one
              place.
            </p>
          </div>
        </div>
      </div>
    </section>
    <section id="gallery" className="mx-auto max-w-7xl px-6 py-12">
      <h3 className="text-3xl font-display text-center text-brand-900">
        School Gallery
      </h3>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {[
          "/g1.jpg",
          "/g2.jpg",
          "/logo.jpg",
          "/g4.jpg",
          "/g5.jpg",
          "/g6.jpg",
        ].map((img, index) => (
          <div key={index} className="overflow-hidden rounded-2xl shadow bg-white">
            <img
              src={img}
              alt="gallery"
              className={`h-64 w-full transition hover:scale-110 ${
                img === "/logo.jpg" ? "object-contain p-4" : "object-cover"
              }`}
            />
          </div>
        ))}
      </div>
    </section>
    <Footer />
  </div>
);

export default HomePage;
