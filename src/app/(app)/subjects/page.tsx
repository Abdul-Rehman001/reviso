"use client";

import { useEffect, useState } from "react";
import { Plus, MoreVertical, Trash, Edit, BookOpen } from "lucide-react";
import { Subject } from "@/types";
import { useStudyStore } from "@/stores/useStudyStore";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubjectFormModal } from "@/components/subjects/SubjectFormModal";
import { SubjectDetailDrawer } from "@/components/subjects/SubjectDetailDrawer";
import { CustomDropdown } from "@/components/ui/custom-dropdown";
import { SubjectsSkeleton } from "@/components/ui/page-skeletons";

export default function SubjectsPage() {
  const { subjects, setSubjects } = useStudyStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/subjects");
        const json = await res.json();
        if (json.success) {
          setSubjects(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch subjects", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubjects();
  }, [setSubjects]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will delete all study logs for this subject too.")) return;
    try {
      const res = await fetch(`/api/subjects/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSubjects(subjects.filter((s) => s._id !== id));
        toast.success("Subject deleted successfully");
      } else {
        toast.error("Failed to delete subject");
      }
    } catch (err) {
      console.error("Delete failed", err);
      toast.error("An error occurred during deletion");
    }
  };

  const openEditModal = (subject: Subject) => {
    setEditingSubject(subject);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingSubject(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Subjects</h1>
          <p className="text-text-muted">Manage your study subjects and targets.</p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="h-4 w-4 mr-2" />
          Add Subject
        </Button>
      </div>

      {isLoading ? (
        <SubjectsSkeleton />
      ) : subjects.length === 0 ? (
        <div className="text-center py-16 px-4 border rounded-xl bg-surface border-dashed">
          <BookOpen className="h-12 w-12 text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-1">No subjects yet</h3>
          <p className="text-text-muted mb-4 max-w-md mx-auto">
            You haven&apos;t added any subjects to track yet. Create your first subject to start logging study hours.
          </p>
          <Button onClick={openAddModal}>Add Your First Subject</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <Card 
              key={subject._id as string} 
              className="overflow-hidden border-border hover:shadow-md transition-shadow group cursor-pointer"
              onClick={() => {
                setSelectedSubject(subject);
                setIsDrawerOpen(true);
              }}
            >
              <div className="h-2 w-full" style={{ backgroundColor: subject.color }} />
              <CardHeader className="pb-3 flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <span>{subject.emoji}</span>
                    {subject.name}
                  </CardTitle>
                </div>
                
                <CustomDropdown 
                  trigger={
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="-mr-2 -mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  }
                  items={[
                    {
                      label: "Edit",
                      icon: <Edit className="h-4 w-4" />,
                      onClick: () => openEditModal(subject)
                    },
                    {
                      label: "Delete",
                      icon: <Trash className="h-4 w-4" />,
                      variant: "destructive",
                      onClick: () => handleDelete(subject._id as string)
                    }
                  ]}
                />
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-sm text-text-muted">Total Studied</p>
                    <p className="text-2xl font-bold font-mono">{subject.totalHours || 0}<span className="text-sm font-normal text-text-muted ml-1">hrs</span></p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm text-text-muted">Weekly Target</p>
                    <p className="text-sm font-medium">{subject.targets.weeklyHours} hrs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <SubjectFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingSubject}
        onSave={(savedSubject) => {
          if (editingSubject) {
            setSubjects(subjects.map(s => s._id === savedSubject._id ? savedSubject : s));
          } else {
            setSubjects([savedSubject, ...subjects]);
          }
        }}
      />
      <SubjectDetailDrawer
        subject={selectedSubject}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
}
