import { Layout } from './components/Layout';
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/clerk-react";

function App() {
  return (
    <>
      <SignedOut>
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-discord-dark text-white space-y-4">
          <h1 className="text-4xl font-bold mb-8 text-discord-brand">Welcome to Discord Clone</h1>
          <div className="space-x-4">
            <SignInButton mode="modal">
              <button className="bg-discord-brand hover:bg-discord-brand-hover text-white px-6 py-3 rounded shadow transition-all font-medium">
                Login
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded shadow transition-all font-medium">
                Sign Up
              </button>
            </SignUpButton>
          </div>
        </div>
      </SignedOut>
      <SignedIn>
        <Layout />
      </SignedIn>
    </>
  );
}

export default App;
