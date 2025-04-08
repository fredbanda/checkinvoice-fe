/* eslint-disable  @typescript-eslint/no-explicit-any */

"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Camera, Upload, Plus, X, Search, Link2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import apiRouter from "@/api/router";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import baseUrl from "@/api/baseUrl";

interface Check {
  id: number;
  number: string;
  company_id: number;
  created_at: string;
  image: string;
  checks?: Check[];
  check?: Check;
}

// Create a client
const queryClient = new QueryClient();

// Wrap the CheckContent component with QueryClientProvider
const Check = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <CheckContent />
    </QueryClientProvider>
  );
};

// The actual component content
const CheckContent = () => {
  const queryClient = useQueryClient();
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<number>(1);
  const [checkNumber, setCheckNumber] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [currentCheck, setCurrentCheck] = useState<Check | null>(null);
  const [selectedInvoices, setSelectedInvoices] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // Queries
  const { data: checksData, isLoading: checksLoading } = useQuery({
    queryKey: ["checks"],
    queryFn: apiRouter.check.getChecks,
  });

  const { data: companiesData, isLoading: companiesLoading } = useQuery({
    queryKey: ["companies"],
    queryFn: apiRouter.company.getCompanies,
  });

  const { data: invoicesData, isLoading: invoicesLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: apiRouter.invoice.getInvoices,
  });

  // Mutations
  // Camera handling functions
const handleCameraCapture = () => {
  if (canvasRef.current && videoRef.current) {
    const context = canvasRef.current.getContext('2d');
    if (context) {
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      const imageData = canvasRef.current.toDataURL('image/png');
      setCapturedImage(imageData);
      
      // Turn off the camera
      stopCamera();
    }
  }
};

// Helper function to stop camera
const stopCamera = () => {
  setCameraActive(false);
  if (videoRef.current?.srcObject) {
    const stream = videoRef.current.srcObject as MediaStream;
    stream.getTracks().forEach(track => track.stop());
    videoRef.current.srcObject = null;
  }
};

// Reset form function
const resetForm = () => {
  setSelectedCompany(0);
  setCheckNumber('');
  setCapturedImage(null);
  stopCamera();
};

// Use effect to ensure camera is stopped when dialog closes
// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
useEffect(() => {
  // Turn off camera when dialog closes
  if (!isAddDialogOpen) {
    stopCamera();
  }
}, [isAddDialogOpen]);

// Mutation for creating a check
const createCheckMutation = useMutation({
  mutationFn: async (formData: FormData) => {
    try {
      const response = await fetch(`${baseUrl}checks`, {
        method: "POST",
        body: formData,
      });
      
      // Store the response text first
      const responseText = await response.text();
      
      // Check if response is not ok
      if (!response.ok && response.status !== 201) {
        let errorMessage = "Failed to save check";
        
        // Try to parse as JSON if there's content
        if (responseText.trim()) {
          try {
            const errorData = JSON.parse(responseText);
            if (errorData?.errors && errorData.errors.length > 0) {
              errorMessage = errorData.errors.join(", ");
            }
          } catch (e) {
            console.log(e);
            
            errorMessage = responseText;
          }
        }
        throw new Error(errorMessage);
      }
      
      if (responseText.trim()) {
        try {
          return JSON.parse(responseText);
        } catch (e) {
          console.log(e);
          
          console.warn("Server returned success but invalid JSON:", responseText);
        }
      }
      
      // Default successful response if JSON parsing failed
      return { success: true, message: "Check saved successfully" };
    } catch (error) {
      console.error("Fetch error:", error);
      throw error;
    }
  },
  
  onSuccess: (data) => {
    queryClient.invalidateQueries({ queryKey: ["checks"] });
    toast.success("Check saved", {
      position: "top-right",
    });
    console.log(data);

    // Reset form and camera
    resetForm();
    window.location.reload();

  },
  
  onError: (error: Error) => {
    console.error("Error in mutation:", error);
    toast.error(error.message || "Error saving check. Please try again.", {
      position: "top-right",
    });
  },
});

  const linkInvoicesMutation = useMutation({
    mutationFn: async ({
      checkId,
      invoiceIds,
    }: {
      checkId: number;
      invoiceIds: number[];
    }) => {
      const response = await fetch(
        `${baseUrl}checks/${checkId}/link_invoices`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ invoice_ids: invoiceIds }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to link invoices");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checks"] });
      toast.success(
        "Invoices linked,Invoices have been successfully linked to the check.",
        {
          position: "top-right",
        }
      );
      setIsLinkDialogOpen(false);
      setSelectedInvoices([]);
    },
    onError: (error) => {
      console.error(error);
      toast.error("Error linking invoices. Please try again.", {
        position: "top-right",
      });
    },
  });

  // Camera handling
  useEffect(() => {
    if (cameraActive) {
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      });
    } else {
      const tracks = videoRef.current?.srcObject
        ? (videoRef.current.srcObject as MediaStream).getTracks()
        : [];
      for (const track of tracks) {
        track.stop();
      }
    }

    return () => {
      const tracks = videoRef.current?.srcObject
        ? (videoRef.current.srcObject as MediaStream).getTracks()
        : [];
      for (const track of tracks) {
        track.stop();
      }
    };
  }, [cameraActive]);

  // Helper functions
  function dataURLToFile(dataUrl: string, filename: string): File {
    const arr = dataUrl.split(",");
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setCapturedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCheck = async () => {
    if (!capturedImage) {
      toast.error("Missing image Please capture or upload a check image.", {
        position: "top-right",
      });
      return;
    }

    if (!checkNumber) {
      toast.message("Missing check number Please enter a check number.", {
        position: "top-right",
      });
      return;
    }

    const file = dataURLToFile(capturedImage, `${checkNumber}.png`);
    const formData = new FormData();
    formData.append("check[number]", checkNumber);
    formData.append("check[company_id]", selectedCompany.toString());
    formData.append("check[image]", file);

    createCheckMutation.mutate(formData);
  };

  const openLinkDialog = (check: any) => {
    setCurrentCheck(check);
    setSelectedInvoices(check.invoices?.map((inv: any) => inv.id) || []);
    setIsLinkDialogOpen(true);
  };

  const handleLinkInvoices = () => {
    if (!currentCheck) return;

    linkInvoicesMutation.mutate({
      checkId: currentCheck.id,
      invoiceIds: selectedInvoices,
    });
  };

  const toggleInvoiceSelection = (invoiceId: number) => {
    setSelectedInvoices((prev) =>
      prev.includes(invoiceId)
        ? prev.filter((id) => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Filter checks based on search query
  const filteredChecks = checksData?.filter(
    (check: any) =>
      check.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      companiesData
        ?.find((c: any) => c.id === check.company_id)
        ?.name.toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  // Filter invoices for linking dialog
  const filteredInvoices = invoicesData?.filter(
    (invoice: any) => !invoice.check_id || invoice.check_id === currentCheck?.id
  );

  return (
    <Tabs defaultValue="checks">
      <TabsContent value="checks" className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-semibold">Check Management</h2>
          <div className="flex w-full sm:w-auto gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search checks..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Check
            </Button>
          </div>
        </div>

        {checksLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filteredChecks?.length === 0 ? (
          <div className="text-center p-8 border rounded-lg bg-muted/50">
            <p className="text-muted-foreground">
              No checks found. Add your first check to get started.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredChecks?.map((check: any) => (
              <Card key={check.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex justify-between">
                    <span>CK#:{check.number}</span>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(check.created_at)}
                    </span>
                  </CardTitle>
                  <CardDescription>
                    {
                      companiesData?.find((c: any) => c.id === check.company_id)
                        ?.name
                    }
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <Dialog>
                    <DialogTitle className="sr-only">Check Image</DialogTitle>
                    <DialogTrigger asChild>
                      {check.image_url &&
                      check.image_url !== "/placeholder.svg" ? (
                        <div className="relative group cursor-pointer">
                          <img
                            src={check.image_url || "/placeholder.svg"}
                            alt={`Check ${check.number}`}
                            className="w-full h-32 object-cover rounded-md mb-2"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                            <Button variant="secondary" size="sm">
                              View Full Image
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-32 bg-muted rounded-md flex items-center justify-center mb-2">
                          <p className="text-muted-foreground text-sm">
                            No image available
                          </p>
                        </div>
                      )}
                    </DialogTrigger>

                    <DialogContent className="p-0">
                      <img
                        src={check.image_url}
                        alt={`Full picture of Check ${check.number}`}
                        className="w-full h-auto rounded-md"
                      />
                    </DialogContent>
                  </Dialog>

                  {check.invoices?.length > 0 && (
                    <div className="mt-2">
                      <Label className="text-xs text-muted-foreground">
                        Linked Invoices
                      </Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {check.invoices.map((invoice: any) => (
                          <Badge key={invoice.id} variant="secondary">
                            {invoice.number}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => openLinkDialog(check)}
                  >
                    <Link2 className="mr-2 h-4 w-4" />
                    {check.invoices?.length > 0
                      ? "Manage Invoices"
                      : "Link Invoices"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Add Check Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Check</DialogTitle>
              <DialogDescription>
                Capture a check image using your camera or upload from your
                device.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="company">Company</Label>
                <Select
                  value={selectedCompany.toString()}
                  onValueChange={(value) => setSelectedCompany(Number(value))}
                 
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" className="w-full" />
                  </SelectTrigger>
                  <SelectContent>
                    {companiesLoading ? (
                      <div className="p-2 text-center">Loading...</div>
                    ) : (
                      companiesData?.map((company: any) => (
                        <SelectItem
                          key={company.id}
                          value={company.id.toString()}
                        >
                          {company.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
             

              <div className="grid gap-2">
                <Label htmlFor="check-number">Check Number</Label>
                <Input
                  id="check-number"
                  value={checkNumber}
                  onChange={(e) => setCheckNumber(e.target.value)}
                  placeholder="Enter check number"
                />
              </div>

              <div className="mt-2">
                <Label>Capture Method</Label>
                <div className="flex gap-4 mt-2">
                  <Button
                    variant={cameraActive ? "default" : "outline"}
                    onClick={() => {
                      setCapturedImage(null);
                      setCameraActive(true);
                    }}
                    type="button"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Camera
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    type="button"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                </div>
              </div>

              {cameraActive && (
                <div className="relative border-2 border-dashed rounded-md p-4">
                  <video
                    ref={videoRef}
                    className="w-full rounded max-h-48"
                    playsInline
                    muted
                  />
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={200}
                    style={{ display: "none" }}
                  />
                  <div className="mt-2 flex justify-center">
                    <Button onClick={handleCameraCapture} type="button">
                      Capture
                    </Button>
                  </div>
                </div>
              )}

              {capturedImage && (
                <div className="mt-4">
                  <Label>Image Preview</Label>
                  <div className="mt-2 border rounded overflow-hidden relative group">
                    <img
                      src={capturedImage || "/placeholder.svg"}
                      alt="Captured Check"
                      className="w-full"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setCapturedImage(null)}
                      type="button"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={resetForm} type="button">
                Cancel
              </Button>
              <Button
                onClick={handleSaveCheck}
                disabled={createCheckMutation.isPending}
                type="button"
              >
                {createCheckMutation.isPending ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  "Save Check"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Link Invoices Dialog */}
        <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                Link Invoices to Check #{currentCheck?.number}
              </DialogTitle>
              <DialogDescription>
                Select invoices to link to this check.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="relative mb-4">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search invoices..." className="pl-8" />
              </div>

              <div className="border rounded-md max-h-[300px] overflow-y-auto">
                {invoicesLoading ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" />
                  </div>
                ) : filteredInvoices?.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No available invoices found
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredInvoices?.map((invoice: any) => (
                      <div
                        key={invoice.id}
                        className="p-3 flex items-center justify-between hover:bg-muted/50"
                      >
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id={`invoice-${invoice.id}`}
                            checked={selectedInvoices.includes(invoice.id)}
                            onCheckedChange={() =>
                              toggleInvoiceSelection(invoice.id)
                            }
                          />
                          <div>
                            <Label
                              htmlFor={`invoice-${invoice.id}`}
                              className="font-medium"
                            >
                              {invoice.number}
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              ${invoice.amount} - {formatDate(invoice.date)}
                            </p>
                          </div>
                        </div>
                        {invoice.check_id === currentCheck?.id && (
                          <Badge variant="outline" className="ml-auto">
                            Linked
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsLinkDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleLinkInvoices}
                disabled={linkInvoicesMutation.isPending}
              >
                {linkInvoicesMutation.isPending ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  "Save Links"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TabsContent>
    </Tabs>
  );
};

export default Check;
