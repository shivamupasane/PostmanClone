import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCollectionSchema, type Collection, type Request } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Waypoints, Folder, MoreVertical, Plus } from "lucide-react";

export function Sidebar() {
  const [activeTab, setActiveTab] = useState<"collections" | "history">("collections");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(insertCollectionSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const { data: collections = [] } = useQuery<Collection[]>({
    queryKey: ["/api/collections"],
  });

  const createCollectionMutation = useMutation({
    mutationFn: async (data: typeof insertCollectionSchema._type) => {
      const response = await apiRequest("POST", "/api/collections", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/collections"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Collection created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create collection",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: typeof insertCollectionSchema._type) => {
    createCollectionMutation.mutate(data);
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
            <Waypoints className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-xl font-medium text-gray-800">API Tester</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          className={`flex-1 px-4 py-3 text-sm font-medium ${
            activeTab === "collections"
              ? "text-primary border-b-2 border-primary bg-orange-50"
              : "text-gray-600 hover:text-gray-800"
          }`}
          onClick={() => setActiveTab("collections")}
        >
          Collections
        </button>
        <button
          className={`flex-1 px-4 py-3 text-sm font-medium ${
            activeTab === "history"
              ? "text-primary border-b-2 border-primary bg-orange-50"
              : "text-gray-600 hover:text-gray-800"
          }`}
          onClick={() => setActiveTab("history")}
        >
          History
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "collections" && (
          <>
            {collections.map((collection) => (
              <CollectionItem key={collection.id} collection={collection} />
            ))}
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full mt-4 bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  New Collection
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Collection</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Collection name" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Input placeholder="Collection description" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={createCollectionMutation.isPending}>
                      {createCollectionMutation.isPending ? "Creating..." : "Create"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </>
        )}
        
        {activeTab === "history" && (
          <div className="text-center text-gray-500 mt-8">
            No history yet
          </div>
        )}
      </div>
    </div>
  );
}

function CollectionItem({ collection }: { collection: Collection }) {
  const { data: requests = [] } = useQuery<Request[]>({
    queryKey: ["/api/collections", collection.id, "requests"],
  });

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "method-get";
      case "POST":
        return "method-post";
      case "PUT":
        return "method-put";
      case "DELETE":
        return "method-delete";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Folder className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-800">{collection.name}</span>
        </div>
        <MoreVertical className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
      </div>
      <div className="ml-6 space-y-1">
        {requests.map((request) => (
          <div
            key={request.id}
            className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
          >
            <span className={`px-2 py-1 text-xs font-medium text-white rounded ${getMethodColor(request.method)}`}>
              {request.method === "DELETE" ? "DEL" : request.method}
            </span>
            <span className="text-sm text-gray-700 truncate">{request.name}</span>
          </div>
        ))}
        {requests.length === 0 && (
          <div className="text-xs text-gray-500 ml-2">No requests yet</div>
        )}
      </div>
    </div>
  );
}
