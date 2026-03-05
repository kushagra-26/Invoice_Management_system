import "./globals.css";

export const metadata = {
  title: "Invoice SaaS",
  description: "Modern Invoice Management Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
      </head>
      <body className="bg-slate-50 text-slate-800">
        {children}
      </body>
    </html>
  );
}