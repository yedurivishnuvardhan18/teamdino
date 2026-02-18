import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, Pencil } from "lucide-react";

interface Subject {
  id: string;
  name: string;
}

interface UploadResourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: Subject[];
  onResourceUploaded: () => void;
}

export default function UploadResourceDialog({
  open,
  onOpenChange,
  subjects,
  onResourceUploaded,
}: UploadResourceDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"pdf" | "youtube" | "link">("pdf");
  const [url, setUrl] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [category, setCategory] = useState<"Syllabus" | "Unit 1" | "Unit 2" | "Unit 3" | "Unit 4" | "Unit 5" | "Previous Papers" | "All Units Resources" | "Additional Resources">("Syllabus");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditingFilename, setIsEditingFilename] = useState(false);
  const [editedFilename, setEditedFilename] = useState("");

  const handleFileUpload = async (file: File) => {
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      return;
    }

    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Not authenticated");
      setIsLoading(false);
      return;
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError, data } = await supabase.storage
      .from("resources")
      .upload(fileName, file);

    setIsLoading(false);

    if (uploadError) {
      toast.error("Failed to upload file");
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("resources")
      .getPublicUrl(fileName);

    setUrl(publicUrl);
    setUploadedFile(file);
    const fileNameWithoutExt = file.name.replace(/\.pdf$/i, "");
    setEditedFilename(fileNameWithoutExt);
    if (!title) {
      setTitle(fileNameWithoutExt);
    }
    toast.success("File uploaded successfully!");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Not authenticated");
      return;
    }

    const { error } = await supabase.from("resources").insert({
      title,
      type,
      url,
      subject_id: subjectId,
      created_by: user.id,
      category,
    });

    setIsLoading(false);

    if (error) {
      toast.error("Failed to upload resource");
    } else {
      toast.success("Resource uploaded successfully!");
      setTitle("");
      setUrl("");
      setSubjectId("");
      setCategory("Syllabus");
      setUploadedFile(null);
      setEditedFilename("");
      setIsEditingFilename(false);
      onOpenChange(false);
      onResourceUploaded();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Upload Resource</DialogTitle>
          <DialogDescription>
            Add a new resource for students to access. All fields are required.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-2">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Select value={subjectId} onValueChange={setSubjectId} required>
              <SelectTrigger id="subject">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Lecture Notes Chapter 5"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Resource Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as "pdf" | "youtube" | "link")} required>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="youtube">YouTube Video</SelectItem>
                <SelectItem value="link">External Link</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {type === "pdf" && (
            <div className="space-y-2">
              <Label>Upload PDF File</Label>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
                }`}
              >
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag and drop a PDF file here, or click to browse
                </p>
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                  className="hidden"
                  id="file-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById("file-upload")?.click()}
                >
                  Browse Files
                </Button>
                {uploadedFile && (
                  <div className="mt-3 p-3 bg-primary/10 rounded-lg border border-primary/30">
                    <div className="flex items-center gap-3">
                      {isEditingFilename ? (
                        <Input
                          value={editedFilename}
                          onChange={(e) => setEditedFilename(e.target.value)}
                          onBlur={() => {
                            setIsEditingFilename(false);
                            if (editedFilename.trim()) {
                              setTitle(editedFilename);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              setIsEditingFilename(false);
                              if (editedFilename.trim()) {
                                setTitle(editedFilename);
                              }
                            }
                          }}
                          className="flex-1"
                          autoFocus
                        />
                      ) : (
                        <p className="text-sm font-medium flex-1 text-primary">
                          ✓ {editedFilename}.pdf
                        </p>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditingFilename(!isEditingFilename)}
                        className="shrink-0"
                        title="Rename file"
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Rename
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Or enter a URL manually below
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="url">{type === "pdf" ? "URL (optional if file uploaded)" : "URL"}</Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={
                type === "pdf"
                  ? "https://example.com/file.pdf"
                  : type === "youtube"
                  ? "https://youtube.com/watch?v=..."
                  : "https://example.com"
              }
              required={type !== "pdf" || !uploadedFile}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as typeof category)} required>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Syllabus">Syllabus</SelectItem>
                <SelectItem value="Unit 1">Unit 1</SelectItem>
                <SelectItem value="Unit 2">Unit 2</SelectItem>
                <SelectItem value="Unit 3">Unit 3</SelectItem>
                <SelectItem value="Unit 4">Unit 4</SelectItem>
                <SelectItem value="Unit 5">Unit 5</SelectItem>
                <SelectItem value="Previous Papers">Previous Papers</SelectItem>
                <SelectItem value="All Units Resources">All Units Resources</SelectItem>
                <SelectItem value="Additional Resources">Additional Resources</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !title || !url || !subjectId}>
              {isLoading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
