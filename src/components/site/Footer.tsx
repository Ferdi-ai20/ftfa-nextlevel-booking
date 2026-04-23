const Footer = () => {
  return (
    <footer id="contact" className="relative bg-background pt-20 pb-10">
      <div className="container">
        <div className="grid md:grid-cols-12 gap-10 pb-16 border-b border-border">
          <div className="md:col-span-5">
            <div className="display-font text-6xl md:text-8xl uppercase">FTFA</div>
            <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mt-2">
              Ferdi Tarhan Football Academy
            </div>
            <p className="mt-6 text-muted-foreground max-w-sm">
              Elite football training. Based in the Netherlands. Built for players ready to reach BVO level.
            </p>
          </div>

          <div className="md:col-span-3">
            <div className="text-[11px] uppercase tracking-[0.25em] text-primary mb-4">Location</div>
            <div className="text-foreground">Netherlands</div>
            <div className="text-muted-foreground text-sm mt-1">Training locations across NL</div>
            <div className="text-[11px] uppercase tracking-[0.25em] text-primary mt-8 mb-4">Connect</div>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-primary transition-colors">Instagram @ftfa</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">TikTok @ftfa</a></li>
              <li><a href="mailto:info@ftfa.nl" className="hover:text-primary transition-colors">info@ftfa.nl</a></li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <div className="text-[11px] uppercase tracking-[0.25em] text-primary mb-4">Direct Contact</div>
            <a
              href="https://wa.me/31621275348"
              target="_blank"
              rel="noreferrer"
              className="group flex items-center justify-between border border-border p-5 hover:border-primary transition-colors"
            >
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">WhatsApp</div>
                <div className="display-font text-2xl uppercase mt-1">Message Us</div>
                <div className="text-xs text-muted-foreground mt-1">+31 6 21275348</div>
              </div>
              <span className="text-2xl text-primary transition-transform group-hover:translate-x-1">→</span>
            </a>
            <a href="#booking" className="group flex items-center justify-between border border-border p-5 mt-2 hover:border-primary transition-colors">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Online</div>
                <div className="display-font text-2xl uppercase mt-1">Book Training</div>
              </div>
              <span className="text-2xl text-primary transition-transform group-hover:translate-x-1">→</span>
            </a>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center pt-8 gap-4 text-xs uppercase tracking-widest text-muted-foreground">
          <div>© {new Date().getFullYear()} FTFA — All rights reserved</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
