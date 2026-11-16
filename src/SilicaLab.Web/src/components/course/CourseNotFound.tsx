import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import EmptyState from "../ui/EmptyState";

export default function CourseNotFound({ backTo = "/courses", backLabel = "Browse courses" }: { backTo?: string; backLabel?: string }) {
  return (
    <EmptyState
      icon={BookOpen}
      title="Course not found"
      description="It may have been removed or you may not have access to it."
      action={
        <Link to={backTo} className="btn btn-primary">
          {backLabel}
        </Link>
      }
    />
  );
}
