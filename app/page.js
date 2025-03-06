"use client";

import dynamic from "next/dynamic";
import MainLayout from "./components/Layout/MainLayout";

const ShogiBoardComponent = dynamic(
  () => import("./components/Shogi/ShogiBoardComponent"),
  { ssr: false }
);

export default function Home() {
  return (
    <MainLayout>
      <ShogiBoardComponent />
    </MainLayout>
  );
}
