import { useState, useEffect } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { List, LayoutGrid, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ResourceCard from "./ResourceCard";
import { UserRole } from "@/hooks/useUserRole";

interface Resource {
  id: string;
  title: string;
  type: "pdf" | "youtube" | "link";
  url: string;
  created_at: string;
  created_by: string | null;
  category: string;
  unit_number: number | null;
}

interface SubjectDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjectId: string;
  subjectName: string;
  userRole: UserRole | null;
  userId: string | null;
}

export default function SubjectDrawer({
  open,
  onOpenChange,
  subjectId,
  subjectName,
  userRole,
  userId,
}: SubjectDrawerProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("Syllabus");
  const [viewMode, setViewMode] = useState<"list" | "expanded">("list");

  useEffect(() => {
    if (open && subjectId) {
      loadResources();
    }
  }, [open, subjectId]);

  const loadResources = async () => {
    const { data, error } = await supabase
      .from("resources")
      .select("id, title, type, url, created_at, created_by, category, unit_number")
      .eq("subject_id", subjectId)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load resources");
      return;
    }

    setResources(data || []);
  };

  const getResourcesByCategory = (category: string) => {
    return resources.filter((r) => r.category === category);
  };

  const getCategoryLabel = (category: string) => {
    if (category === "Previous Papers") return "Previous Year Questions";
    return category;
  };

  const selectedResources = getResourcesByCategory(selectedCategory);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {/* <DrawerContent className="h-[90vh] max-h-[90vh]"> */}
      <DrawerContent
        className="h-[90vh] max-h-[90vh] overflow-hidden"
        style={{ touchAction: "manipulation" }}
        onTouchMove={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
      >
        {/* <DrawerHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-0"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
          </Button>
          <DrawerTitle className="text-xl sm:text-2xl">{subjectName}</DrawerTitle>
        </DrawerHeader> */}

        <DrawerHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 -top-3 sm:-top-4"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
          </Button>

          <DrawerTitle className="text-xl sm:text-2xl text-center mt-1 sm:mt-2">{subjectName}</DrawerTitle>
        </DrawerHeader>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Left Panel - Navigation */}
          {/* <div className="w-full md:w-64 border-r border-border p-3 sm:p-4 overflow-y-auto touch-pan-y overscroll-contain"> */}
          <div
            className="w-full md:w-64 border-r border-border p-3 sm:p-4 overflow-auto touch-pan-y touch-pan-x overscroll-contain"
            style={{ touchAction: "pan-x pan-y pinch-zoom" }}
          >
            <nav className="space-y-1">
              <button
                onClick={() => setSelectedCategory("Syllabus")}
                className={`w-full text-left px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                  selectedCategory === "Syllabus" ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                }`}
              >
                Syllabus
                <Badge variant="secondary" className="ml-2 text-xs">
                  {getResourcesByCategory("Syllabus").length}
                </Badge>
              </button>

              <Accordion type="single" collapsible defaultValue="units">
                <AccordionItem value="units" className="border-0">
                  <AccordionTrigger className="px-3 sm:px-4 py-2 hover:bg-accent rounded-lg hover:no-underline text-sm sm:text-base">
                    Units
                  </AccordionTrigger>
                  <AccordionContent className="pb-0">
                    <div className="space-y-1 pl-2 sm:pl-4">
                      {[1, 2, 3, 4, 5].map((unitNum) => {
                        const category = `Unit ${unitNum}`;
                        const count = getResourcesByCategory(category).length;
                        return (
                          <button
                            key={unitNum}
                            onClick={() => setSelectedCategory(category)}
                            className={`w-full text-left px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                              selectedCategory === category ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                            }`}
                          >
                            Unit {unitNum}
                            <Badge variant="secondary" className="ml-2 text-xs">
                              {count}
                            </Badge>
                          </button>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <button
                onClick={() => setSelectedCategory("Previous Papers")}
                className={`w-full text-left px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                  selectedCategory === "Previous Papers" ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                }`}
              >
                PYQs
                <Badge variant="secondary" className="ml-2 text-xs">
                  {getResourcesByCategory("Previous Papers").length}
                </Badge>
              </button>

              <button
                onClick={() => setSelectedCategory("All Units Resources")}
                className={`w-full text-left px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                  selectedCategory === "All Units Resources" ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                }`}
              >
                All Units Resources
                <Badge variant="secondary" className="ml-2 text-xs">
                  {getResourcesByCategory("All Units Resources").length}
                </Badge>
              </button>

              <button
                onClick={() => setSelectedCategory("Additional Resources")}
                className={`w-full text-left px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                  selectedCategory === "Additional Resources" ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                }`}
              >
                Additional Resources
                <Badge variant="secondary" className="ml-2 text-xs">
                  {getResourcesByCategory("Additional Resources").length}
                </Badge>
              </button>
            </nav>
          </div>

          {/* Right Panel - Resources */}
          {/* <div className="flex-1 p-3 sm:p-6 overflow-y-auto touch-pan-y overscroll-contain">
           */}

          <div
            className="flex-1 p-3 sm:p-6 overflow-auto touch-pan-y touch-pan-x overscroll-contain"
            style={{ touchAction: "pan-x pan-y pinch-zoom" }}
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6 flex-wrap gap-2">
              <h3 className="text-lg sm:text-xl font-semibold">{getCategoryLabel(selectedCategory)}</h3>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "expanded" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("expanded")}
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {selectedResources.length === 0 ? (
              <div className="text-center py-8 sm:py-12 text-sm sm:text-base text-muted-foreground">
                No resources available in this section yet
              </div>
            ) : (
              <div
                className={
                  viewMode === "list" ? "space-y-3 sm:space-y-4" : "grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4"
                }
              >
                {selectedResources.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    viewMode={viewMode}
                    userRole={userRole}
                    userId={userId}
                    onUpdate={loadResources}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
