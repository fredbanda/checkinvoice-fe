"use client";

import type React from "react";
import { useState } from "react";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import apiRouter from "@/api/router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Invoice {
  id: number;
  number: string;
  company_id: number;
  amount?: number;
  date?: string;
  description?: string;
}

interface Company {
  id: number;
  name: string;
}

// Create a client
const queryClient = new QueryClient();

const Invoice = () => {
  const localQueryClient = useQueryClient();

  // State for invoice management
  const [selectedInvoices, setSelectedInvoices] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<string>("all");

  // State for invoice form
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [formData, setFormData] = useState<Partial<Invoice>>({
    number: "",
    company_id: 0,
    amount: 0,
    date: new Date().toISOString().split("T")[0],
    description: "",
  });

  // Fetch invoices and companies
  const { data: invoicesData = [], isLoading: invoicesLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: apiRouter.invoice.getInvoices,
  });

  const { data: companiesData = [], isLoading: companiesLoading } = useQuery({
    queryKey: ["companies"],
    queryFn: apiRouter.company.getCompanies,
  });
 console.log(companiesLoading)
  // Mutations for CRUD operations
  const createInvoiceMutation = useMutation({
    mutationFn: (data: Partial<Invoice>) => {
      return fetch("http://localhost:3000/api/v1/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ invoice: data }),
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to create invoice");
        return res.json();
      });
    },
    onSuccess: () => {
      localQueryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Success Invoice created successfully", {});
      handleCloseForm();
    },
    onError: (error) => {
      toast.error("ErrorFailed to create invoice", {
        position: "top-right",
      });
      console.log(error)
    },
  });

  const updateInvoiceMutation = useMutation({
    mutationFn: (data: Partial<Invoice>) => {
      return fetch(
        `http://localhost:3000/api/v1/invoices/${currentInvoice?.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ invoice: data }),
        }
      ).then((res) => {
        if (!res.ok) throw new Error("Failed to update invoice");
        return res.json();
      });
    },
    onSuccess: () => {
      localQueryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Success Invoice updated successfully", {
        position: "top-right",
      });
      handleCloseForm();
    },
    onError: (error) => {
      toast.error("Failed to update the invoice", {
        position: "top-right",
      });
      console.log(error)
    },
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: (id: number) => {
      return fetch(`http://localhost:3000/api/v1/invoices/${id}`, {
        method: "DELETE",
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to delete invoice");
        return res.json();
      });
    },
    onSuccess: () => {
      localQueryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice deleted successfully", {
        position: "top-right",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast.error("Error deleting invoice", {
        position: "top-right",
      });
      console.log(error)
    },
  });

  // Form handlers
  const handleOpenForm = (invoice?: Invoice) => {
    if (invoice) {
      setCurrentInvoice(invoice);
      setFormData({
        number: invoice.number,
        company_id: invoice.company_id,
        date: invoice.date,
        description: invoice.description,
      });
    } else {
      setCurrentInvoice(null);
      setFormData({
        number: "",
        company_id: companiesData.length > 0 ? companiesData[0].id : 0,
        amount: 0,
        date: new Date().toISOString().split("T")[0],
        description: "",
      });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setCurrentInvoice(null);
    setFormData({
      number: "",
      company_id: 0,
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      description: "",
    });
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentInvoice) {
      updateInvoiceMutation.mutate(formData);
    } else {
      createInvoiceMutation.mutate(formData);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, company_id: Number.parseInt(value) }));
  };

  const handleDeleteInvoice = (invoice: Invoice) => {
    setCurrentInvoice(invoice);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteInvoice = () => {
    if (currentInvoice) {
      deleteInvoiceMutation.mutate(currentInvoice.id);
    }
  };

  // Filter invoices based on search and company filter
  const filteredInvoices = invoicesData.filter((invoice: Invoice) => {
    const matchesSearch = invoice.number
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCompany =
      selectedCompany === "all" ||
      invoice.company_id.toString() === selectedCompany;
    return matchesSearch && matchesCompany;
  });

  // Toggle all invoices selection
  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedInvoices(
        filteredInvoices.map((invoice: Invoice) => invoice.id)
      );
    } else {
      setSelectedInvoices([]);
    }
  };

  // Check if all visible invoices are selected
  const areAllSelected =
    filteredInvoices.length > 0 &&
    filteredInvoices.every((invoice: Invoice) =>
      selectedInvoices.includes(invoice.id)
    );

  return (
    <QueryClientProvider client={queryClient}>
      <TabsContent value="invoices">
        <Tabs>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Invoice Management</h2>
            <Button onClick={() => handleOpenForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Invoice
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search invoices..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              value={selectedCompany}
              onValueChange={(value) => setSelectedCompany(value)}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="All Companies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {companiesData?.map((company: Company) => (
                  <SelectItem key={company.id} value={company.id.toString()}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                {/* Desktop Table */}
                <table className="hidden md:table w-full">
                  <thead className="bg-gray-50 text-xs font-medium text-gray-500 border-b">
                    <tr>
                      <th className="w-12 p-3 text-left">
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={areAllSelected}
                          onChange={toggleSelectAll}
                        />
                      </th>
                      <th className="p-3 text-left">Invoice ID</th>
                      <th className="p-3 text-left">Invoice Number</th>
                      <th className="p-3 text-left">Company</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoicesLoading ? (
                      <tr>
                        <td colSpan={5} className="p-3 text-center">
                          Loading invoices...
                        </td>
                      </tr>
                    ) : filteredInvoices.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-3 text-center">
                          No invoices found
                        </td>
                      </tr>
                    ) : (
                      filteredInvoices.map((invoice: Invoice) => (
                        <tr
                          key={invoice.id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="p-3">
                            <input
                              type="checkbox"
                              className="h-4 w-4"
                              checked={selectedInvoices.includes(invoice.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedInvoices([
                                    ...selectedInvoices,
                                    invoice.id,
                                  ]);
                                } else {
                                  setSelectedInvoices(
                                    selectedInvoices.filter(
                                      (id) => id !== invoice.id
                                    )
                                  );
                                }
                              }}
                            />
                          </td>
                          <td className="p-3 font-medium">{invoice.id}</td>
                          <td className="p-3 font-medium">{invoice.number}</td>
                          <td className="p-3">
                            {companiesData?.find(
                              (c: Company) => c.id === invoice.company_id
                            )?.name || "Unknown"}
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenForm(invoice)}
                              >
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteInvoice(invoice)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {/* Mobile View */}
                <div className="md:hidden flex flex-col gap-4 p-3">
                  {invoicesLoading ? (
                    <p className="text-center">Loading invoices...</p>
                  ) : filteredInvoices.length === 0 ? (
                    <p className="text-center">No invoices found</p>
                  ) : (
                    filteredInvoices.map((invoice: Invoice) => (
                      <div
                        key={invoice.id}
                        className="rounded-lg border p-4 shadow-sm flex flex-col gap-2 bg-white"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-sm">
                            #{invoice.number}
                          </h3>
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={selectedInvoices.includes(invoice.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedInvoices([
                                  ...selectedInvoices,
                                  invoice.id,
                                ]);
                              } else {
                                setSelectedInvoices(
                                  selectedInvoices.filter(
                                    (id) => id !== invoice.id
                                  )
                                );
                              }
                            }}
                          />
                        </div>
                        <div className="text-xs text-gray-500">
                          <div>
                            <span className="font-medium">ID:</span>{" "}
                            {invoice.id}
                          </div>
                          <div>
                            <span className="font-medium">Company:</span>{" "}
                            {companiesData?.find(
                              (c: Company) => c.id === invoice.company_id
                            )?.name || "Unknown"}
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenForm(invoice)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteInvoice(invoice)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Form Dialog */}
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {currentInvoice ? "Edit Invoice" : "Create New Invoice"}
                </DialogTitle>
                <DialogDescription>
                  Fill in the details for this invoice. Click save when you&apos;re
                  done.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmitForm}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="number" className="text-right">
                      Invoice #
                    </Label>
                    <Input
                      id="number"
                      name="number"
                      value={formData.number}
                      onChange={handleInputChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="company" className="text-right">
                      Company
                    </Label>
                    <Select
                      value={formData.company_id?.toString()}
                      onValueChange={handleSelectChange}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select company" />
                      </SelectTrigger>
                      <SelectContent>
                        {companiesData?.map((company: Company) => (
                          <SelectItem
                            key={company.id}
                            value={company.id.toString()}
                          >
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="date" className="text-right">
                      Date
                    </Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Input
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseForm}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      createInvoiceMutation.isPending ||
                      updateInvoiceMutation.isPending
                    }
                  >
                    {createInvoiceMutation.isPending ||
                    updateInvoiceMutation.isPending
                      ? "Saving..."
                      : "Save"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <AlertDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete invoice {currentInvoice?.number}.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDeleteInvoice}
                  className="bg-red-500 hover:bg-red-600"
                >
                  {deleteInvoiceMutation.isPending ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Tabs>
      </TabsContent>
    </QueryClientProvider>
  );
};

export default Invoice;
