export default function ContactPage() {
  return (
    <section className="py-16 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-accent mb-6">Contact Us</h2>
      <p className="text-muted mb-6">We’d love to hear from you. Reach out for inquiries or feedback.</p>
      <form className="space-y-4">
        <input
          type="text"
          placeholder="Your Name"
          className="w-full border border-border p-3 rounded-lg bg-surface text-foreground"
        />
        <input
          type="email"
          placeholder="Your Email"
          className="w-full border border-border p-3 rounded-lg bg-surface text-foreground"
        />
        <textarea
          placeholder="Your Message"
          className="w-full border border-border p-3 rounded-lg bg-surface text-foreground"
          rows={4}
        />
        <button
          type="submit"
          className="px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition"
        >
          Send Message
        </button>
      </form>
    </section>
  );
}
