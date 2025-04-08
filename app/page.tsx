"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Check from "@/components/check-call";
import Company from "@/components/company-call";
import Invoice from "@/components/invoice-call";
import FAQSection from "@/components/faq-section";

export default function Home() {
  const [activeTab, setActiveTab] = useState("checks");

  return (
    <div className="container mx-auto p-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-center text-blue-900">
          Check & Invoice Management
        </h1>
        <p className="text-gray-500 text-center">
          Link check images to invoices with ease
        </p>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="companies">Companies</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="checks">Checks</TabsTrigger>
          <TabsTrigger value="faq-section">FAQs</TabsTrigger>
        </TabsList>

        {activeTab === "companies" && <Company />}
        {activeTab === "invoices" && <Invoice />}
        {activeTab === "checks" && <Check />}
        {activeTab === "faq-section" && <FAQSection />}
      </Tabs>
    </div>
  );
}
