const Footer = () => (
  <footer
    id="contact"
    className="mt-16 border-t border-brand-100 bg-brand-900 text-brand-50 px-6 py-12"
  >
    <div className="mx-auto max-w-7xl grid gap-10 md:grid-cols-4">

      {/* SCHOOL INFO */}
      <div>
        <h3 className="font-display text-2xl font-semibold">
          New Shining Star Public School
        </h3>
        <p className="mt-3 text-sm text-white/80">
          Ashapur - Bahera Rd, Ashapur, Darbhanga, Bihar - 847201
        </p>
      </div>

      {/* QUICK LINKS */}
      <div>
        <h4 className="text-lg font-semibold">Quick Links</h4>
        <ul className="mt-3 space-y-2 text-sm text-white/80">
          <li><a href="#home" className="hover:text-accent-400">Home</a></li>
          <li><a href="#about" className="hover:text-accent-400">About</a></li>
          <li><a href="#gallery" className="hover:text-accent-400">Gallery</a></li>
          <li><a href="#contact" className="hover:text-accent-400">Contact</a></li>
        </ul>
      </div>

      {/* CONTACT */}
      <div>
        <h4 className="text-lg font-semibold">Contact</h4>
        <p className="mt-3 text-sm text-white/80">📞 +91 73679 87022</p>
        <p className="text-sm text-white/80">📧 nssps7022@gmail.com</p>
      </div>

      {/* SOCIAL LINKS */}
      <div>
        <h4 className="text-lg font-semibold">Follow Us</h4>

        <div className="mt-4 flex gap-4">
          <a href="https://www.facebook.com/100083539384224/videos/n-s-s-p-sashapur/2011815695971626/" className="hover:scale-110 transition">
            <i className="fa-brands fa-facebook fa-2x" style={{color: "rgb(26, 97, 223)",}}></i>
            {/* <FontAwesomeIcon icon={byPrefixAndName.fab['facebook']} style={{color: "rgb(26, 97, 223)",}} /> */}
          </a>
          <a href="https://www.instagram.com/nssps_school/" className="hover:scale-110 transition">
            <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png" className="h-8 w-8" />
          </a>
          <a href="#" className="hover:scale-110 transition">
            <img src="https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/twitter-app-icon.png" className="h-8 w-8" />
          </a>
          <a href="https://www.youtube.com/@n.s.s.p.s.ashapurdarbhanga732" className="hover:scale-110 transition">
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFnwPrWc5l184PBpOdmaRVZsFdtEUvyNz32g&s" className="h-8 w-8" />
          </a>
        </div>
      </div>

    </div>

    {/* BOTTOM LINE */}
    <div className="mt-10 border-t border-white/20 pt-4 text-center text-sm text-white/70">
      © {new Date().getFullYear()} New Shining Star Public School. All rights reserved.
    </div>
  </footer>
);

export default Footer;