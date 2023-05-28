"use client";

import Navbar from "@/components/layout/Navbar";
import "../globals.css";
import { Inter } from "next/font/google";
import { useRouter } from "next/navigation";
import { Provider } from "react-redux";
import { store } from "@/store";

const inter = Inter({ subsets: ["latin"] });

// export const metadata = {
//   title: "Create Next App",
//   description: "Generated by create next app",
// };

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <Navbar />
      {children}
    </Provider>
  );
}
