import "./globals.css";



export const metadata = {
  title: "Stystem zarządzania dla trenerów personalnych",
  description: "Pomagamy trenerom personalnym ułatwić zarządzanie podopiecznymi",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pl">
      <body>
        {children}
      </body>
    </html>
  );
}
