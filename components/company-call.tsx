/* eslint-disable  @typescript-eslint/no-explicit-any */

"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useQuery } from "@tanstack/react-query"
import apiRouter from "@/api/router"
import { CompanyModal } from "./company-modal"


interface Company {
  id: number
  name: string
}


const Company = () => {
   const [isLoading , setIsLoading] = useState(false);
   const [error , setError] = useState(false);
   const { data: invoicesData } = useQuery({
        queryKey: ["invoices"],
        queryFn: apiRouter.invoice.getInvoices,
      });
      
      const { data: companiesData } = useQuery({
        queryKey: ["companies"],
        queryFn: apiRouter.company.getCompanies,
      });

      const { data: checksData} = useQuery({
        queryKey: ["checks"],
        queryFn: apiRouter.check.getChecks,
      });

console.log(setIsLoading, setError);


  return (
    <Tabs value="companies">
      <TabsContent value="companies">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Company Management</h2>
          <CompanyModal />
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="p-4 text-center">Loading companies...</div>
              ) : error ? (
                <div className="p-4 text-center text-red-500">Error loading companies. Please try again.</div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 text-xs font-medium text-gray-500 border-b">
                    <tr>
                      <th className="p-3 text-left">Name</th>
                      <th className="p-3 text-left">Invoices</th>
                      <th className="p-3 text-left">Checks</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companiesData?.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-gray-500">
                          No companies found. Add your first company.
                        </td>
                      </tr>
                    ) : (
                      companiesData?.map((company: Company) => (
                        <tr key={company.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{company.name}</td>
                          <td className="p-3">{invoicesData?.filter((invoice: any) => invoice.company_id === company.id).length}</td>
                          <td className="p-3">{checksData?.filter((chk: any) => chk.company_id === company.id).length}</td>
                          <td className="p-3 text-right">
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

export default Company

