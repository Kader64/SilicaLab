import { QueryClientProvider } from "@tanstack/react-query";
import { lazy, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import "./index.css";

import {
  RedirectIfAuthenticated,
  RequireAuth,
} from "./components/auth/RouteGuards";
import { AuthProvider } from "./context/AuthContext";
import AdminLayout from "./layouts/AdminLayout";
import AppLayout from "./layouts/AppLayout";
import AuthLayout from "./layouts/AuthLayout";
import { queryClient } from "./lib/queryClient";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import NotFound from "./pages/NotFound";
import RouteError from "./pages/RouteError";
import Certificates from "./pages/student/Certificates";
import CourseDetails from "./pages/student/CourseDetails";
import Courses from "./pages/student/Courses";
import Exam from "./pages/student/Exam";
import ExamResult from "./pages/student/ExamResult";
import MyLearning from "./pages/student/MyLearning";
import Verify from "./pages/Verify";
import Welcome from "./pages/Welcome";

const Lesson = lazy(() => import("./pages/student/Lesson"));
const TeacherCourses = lazy(() => import("./pages/teacher/TeacherCourses"));
const CourseEditor = lazy(() => import("./pages/teacher/CourseEditor"));
const LessonEditor = lazy(() => import("./pages/teacher/LessonEditor"));
const ExamEditor = lazy(() => import("./pages/teacher/ExamEditor"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const Users = lazy(() => import("./pages/admin/Users"));
const AdminCourses = lazy(() => import("./pages/admin/AdminCourses"));
const AdminCertificates = lazy(() => import("./pages/admin/AdminCertificates"));
const Categories = lazy(() => import("./pages/admin/Categories"));
const AuditLog = lazy(() => import("./pages/admin/AuditLog"));

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route errorElement={<RouteError />}>
      <Route path="/" element={<Welcome />} />
      <Route path="/verify/:code?" element={<Verify />} />

      <Route element={<RedirectIfAuthenticated />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
      </Route>

      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetails />} />
          <Route path="/my-learning" element={<MyLearning />} />
          <Route path="/learn/:courseId" element={<Lesson />} />
          <Route path="/exam/:courseId" element={<Exam />} />
          <Route path="/exam/:courseId/result" element={<ExamResult />} />
          <Route path="/certificates" element={<Certificates />} />

          <Route element={<RequireAuth allowedRoles={["Teacher", "Admin"]} />}>
            <Route path="/teach/courses" element={<TeacherCourses />} />
            <Route path="/teach/courses/new" element={<CourseEditor />} />
            <Route path="/teach/courses/:id" element={<CourseEditor />} />
            <Route
              path="/teach/courses/:id/lessons/:lessonId"
              element={<LessonEditor />}
            />
            <Route path="/teach/courses/:id/exam" element={<ExamEditor />} />
          </Route>
        </Route>
      </Route>

      <Route element={<RequireAuth allowedRoles={["Admin"]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="courses" element={<AdminCourses />} />
          <Route path="certificates" element={<AdminCertificates />} />
          <Route path="categories" element={<Categories />} />
          <Route path="audit" element={<AuditLog />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Route>,
  ),
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
