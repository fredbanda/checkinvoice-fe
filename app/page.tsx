"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Check from "@/components/check-call";
import Company from "@/components/company-call";
import Invoice from "@/components/invoice-call";

export default function Home() {
  const [activeTab, setActiveTab] = useState("checks");

  return (
    <div className="container mx-auto px-4 py-6">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-blue-800 mb-3">
          Check & Invoice Management
        </h1>
        <p className="text-lg text-gray-600">
          Link check images to invoices with ease
        </p>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex justify-center space-x-6 mb-6">
          <TabsTrigger 
            value="companies" 
            className="text-lg font-semibold text-gray-800 px-6 py-2 rounded-lg hover:bg-blue-100 transition-colors"
          >
            Companies
          </TabsTrigger>
          <TabsTrigger 
            value="invoices" 
            className="text-lg font-semibold text-gray-800 px-6 py-2 rounded-lg hover:bg-blue-100 transition-colors"
          >
            Invoices
          </TabsTrigger>
          <TabsTrigger 
            value="checks" 
            className="text-lg font-semibold text-gray-800 px-6 py-2 rounded-lg hover:bg-blue-100 transition-colors"
          >
            Checks
          </TabsTrigger>
        </TabsList>

        {activeTab === "companies" && <Company />}
        {activeTab === "invoices" && <Invoice />}
        {activeTab === "checks" && <Check />}
      </Tabs>
    </div>
  );
}


