export default function AuthCodeErrorPage() {
  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold text-red-600">Authentication Error</h1>
      <p className="mt-2 text-gray-600">
        Something went wrong during login. Please try again.
      </p>
      <a
        href="/auth"
        className="mt-4 inline-block px-4 py-2 bg-accent text-white rounded-lg"
      >
        Back to Login
      </a>
    </div>
  );
}
