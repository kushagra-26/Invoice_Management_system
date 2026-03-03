export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">

      {/* Header */}
      <header className="flex justify-between items-center px-8 py-5 bg-white border-b">
        <h1 className="text-2xl font-bold text-indigo-600">
          InvoicePro
        </h1>

        <div className="space-x-6 text-sm font-medium">
          <a href="#features" className="hover:text-indigo-600">Features</a>
          <a href="#pricing" className="hover:text-indigo-600">Pricing</a>
          <a href="/login">Login</a>
          <a
            href="/signup"
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg"
          >
            Get Started
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <h2 className="text-5xl font-bold mb-6 leading-tight">
          Smart Invoicing <br />
          For Modern Businesses
        </h2>

        <p className="text-lg text-slate-500 max-w-2xl mb-10">
          Create professional invoices, track payments, manage clients, 
          and grow your business — all in one place.
        </p>

        <div className="space-x-4">
          <a
            href="/signup"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl"
          >
            Start Free Trial
          </a>

          <a
            href="#features"
            className="border border-slate-300 px-8 py-3 rounded-xl"
          >
            Learn More
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white text-center px-8">
        <h3 className="text-3xl font-bold mb-12">
          Powerful Features
        </h3>

        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          <div>
            <h4 className="text-xl font-semibold mb-3">Invoice Creation</h4>
            <p className="text-slate-500">
              Generate professional invoices in seconds.
            </p>
          </div>

          <div>
            <h4 className="text-xl font-semibold mb-3">Payment Tracking</h4>
            <p className="text-slate-500">
              Track paid and unpaid invoices easily.
            </p>
          </div>

          <div>
            <h4 className="text-xl font-semibold mb-3">Client Management</h4>
            <p className="text-slate-500">
              Store and manage all your customers.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-slate-100 text-center px-8">
        <h3 className="text-3xl font-bold mb-12">
          Simple Pricing
        </h3>

        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow">
          <h4 className="text-xl font-semibold mb-4">Starter Plan</h4>
          <p className="text-4xl font-bold mb-4">$9/month</p>
          <ul className="text-slate-500 space-y-2 mb-6">
            <li>Unlimited invoices</li>
            <li>Basic analytics</li>
            <li>Email support</li>
          </ul>

          <a
            href="/signup"
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl"
          >
            Get Started
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-slate-500 border-t">
        © {new Date().getFullYear()} InvoicePro. All rights reserved.
      </footer>

    </div>
  );
}