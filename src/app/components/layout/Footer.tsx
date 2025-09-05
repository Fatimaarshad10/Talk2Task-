export default function Footer() {
  return (
    <footer className="w-full bg-surface text-center py-6 mt-10 border-t border-border">
      <p className="text-muted">&copy; {new Date().getFullYear()} Talk2Task. All rights reserved.</p>
    </footer>
  );
}
