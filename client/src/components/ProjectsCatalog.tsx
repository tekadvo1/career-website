import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  ArrowRight,
  Bookmark,
  Archive,
  RotateCcw,
  Trash2,
  FolderKanban,
  Plus,
  AlertCircle,
} from "lucide-react";
import Sidebar from "./Sidebar";
import ProjectOnboardingWizard from "./ProjectOnboardingWizard";
import { apiFetch } from "../utils/apiFetch";
import { getToken } from "../utils/auth";
import {
  object,
  parseProjects,
  projectProgress,
} from "./projects/projectModel.ts";
import type { Project } from "./projects/projectModel.ts";

const tabs = [
  { id: "explore", label: "Explore" },
  { id: "active", label: "In progress" },
  { id: "saved", label: "Saved" },
  { id: "completed", label: "Completed" },
  { id: "undo", label: "Archived" },
];
export default function ProjectsCatalog() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = object(location.state);
  const savedAnalysis = object(sessionStorage.getItem("lastRoleAnalysis"));
  const role = String(state.role ?? savedAnalysis.role ?? "Software Engineer");
  const [tab, setTab] = useState("explore");
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState("All levels");
  const [suggestions, setSuggestions] = useState<Project[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [selected, setSelected] = useState<Project | null>(
    () =>
      parseProjects(state.setupAiProject ? [state.setupAiProject] : [])[0] ??
      null,
  );
  const [retry, setRetry] = useState(0);
  const loadOwned = useCallback(
    async (signal?: AbortSignal) => {
      const res = await apiFetch(
        `/api/role/my-projects?role=${encodeURIComponent(role)}`,
        { signal },
      );
      const data = object(await res.json());
      if (!res.ok || !data.success)
        throw new Error("Could not load your saved projects.");
      return parseProjects(data.projects, true);
    },
    [role],
  );
  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError("");
      setProjects([]);
      setSuggestions([]);
      const results = await Promise.allSettled([
        loadOwned(controller.signal),
        (async () => {
          const res = await apiFetch("/api/role/projects", {
            method: "POST",
            signal: controller.signal,
            body: JSON.stringify({ role }),
          });
          const data = object(await res.json());
          if (!res.ok || !data.success)
            throw new Error("Could not load project suggestions.");
          return parseProjects(data.data);
        })(),
      ]);
      if (controller.signal.aborted) return;
      if (results[0].status === "fulfilled") setProjects(results[0].value);
      if (results[1].status === "fulfilled") setSuggestions(results[1].value);
      const failures = results.filter((result) => result.status === "rejected");
      if (failures.length)
        setError(
          failures
            .map((result) =>
              result.status === "rejected" && result.reason instanceof Error
                ? result.reason.message
                : "",
            )
            .join(" "),
        );
      setLoading(false);
    };
    void load();
    return () => controller.abort();
  }, [role, retry, loadOwned]);
  useEffect(() => {
    const controller = new AbortController();
    const stream = new EventSource(
      `/api/realtime/stream?token=${encodeURIComponent(getToken() ?? "")}`,
    );
    const refresh = () => {
      void loadOwned(controller.signal)
        .then((rows) => {
          if (!controller.signal.aborted) setProjects(rows);
        })
        .catch(() => {
          /* Initial fetch and explicit retry remain available. */
        });
    };
    stream.addEventListener("project_update", refresh);
    return () => {
      controller.abort();
      stream.close();
    };
  }, [loadOwned]);
  const mutate = async (
    project: Project,
    action: "save" | "undo" | "active" | "delete",
  ) => {
    if (busy) return;
    if (
      action === "delete" &&
      !window.confirm(
        `Permanently delete “${project.title}” and its saved progress?`,
      )
    )
      return;
    setBusy(project.id);
    setNotice("");
    try {
      const res =
        action === "save"
          ? await apiFetch("/api/role/start-project", {
              method: "POST",
              body: JSON.stringify({ project, role, status: "saved" }),
            })
          : await apiFetch(
              `/api/role/project/${encodeURIComponent(project.id)}`,
              {
                method: action === "delete" ? "DELETE" : "PUT",
                body: JSON.stringify({ status: action }),
              },
            );
      if (!res.ok)
        throw new Error("The change could not be saved. Please try again.");
      setProjects(await loadOwned());
      setNotice(
        action === "save"
          ? "Project saved."
          : action === "delete"
            ? "Project deleted."
            : action === "undo"
              ? "Project archived. Progress preserved."
              : "Project restored.",
      );
    } catch (err) {
      setNotice(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setBusy(null);
    }
  };
  const open = (project: Project) => {
    if (project.status === "active" || project.status === "completed")
      navigate(
        `/project-workspace?projectId=${encodeURIComponent(project.id)}`,
      );
    else setSelected(project);
  };
  const list = (
    tab === "explore"
      ? suggestions
      : projects.filter((project) => project.status === tab)
  ).filter(
    (project) =>
      `${project.title} ${project.description} ${project.tags.join(" ")}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()) &&
      (difficulty === "All levels" || project.difficulty === difficulty),
  );
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar activePage="projects" />
      <main className="min-w-0 flex-1 px-4 py-8 pt-20 md:px-8 md:pt-10 lg:px-12 [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-emerald-700 [&_button:focus-visible]:outline-offset-4">
        <div className="mx-auto max-w-6xl">
          <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-emerald-700">
                Learn by building
              </p>
              <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
              <p className="mt-2 text-sm text-slate-600">
                Put your skills into practice.{" "}
                <span className="font-medium">{role}</span>
              </p>
            </div>
            <button
              onClick={() => navigate("/project-structure")}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold hover:border-emerald-400"
            >
              <Plus className="h-4 w-4" />
              Create a project
            </button>
          </header>
          <nav
            aria-label="Project categories"
            className="mt-8 flex gap-5 overflow-x-auto border-b border-slate-200"
          >
            {tabs.map((item) => (
              <button
                key={item.id}
                aria-current={tab === item.id ? "page" : undefined}
                onClick={() => setTab(item.id)}
                className={`shrink-0 border-b-2 py-4 text-sm font-semibold transition-colors ${tab === item.id ? "border-emerald-600 text-emerald-700" : "border-transparent text-slate-500 hover:text-slate-900"}`}
              >
                {item.label}
                {item.id !== "explore" && (
                  <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs">
                    {
                      projects.filter((project) => project.status === item.id)
                        .length
                    }
                  </span>
                )}
              </button>
            ))}
          </nav>
          <div className="my-6 flex flex-col gap-3 sm:flex-row">
            <label className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3">
              <Search className="h-4 w-4 text-slate-400" />
              <span className="sr-only">Search projects</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search projects or skills…"
                className="w-full min-w-0 text-sm outline-none"
              />
            </label>
            <label>
              <span className="sr-only">Difficulty</span>
              <select
                value={difficulty}
                onChange={(event) => setDifficulty(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
              >
                {["All levels", "Beginner", "Intermediate", "Advanced"].map(
                  (level) => (
                    <option key={level}>{level}</option>
                  ),
                )}
              </select>
            </label>
          </div>
          {error && (
            <div
              role="alert"
              className="mb-5 flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700"
            >
              <AlertCircle className="h-5 w-5 shrink-0" />
              {error}
              <button
                onClick={() => setRetry((value) => value + 1)}
                className="ml-auto font-semibold underline"
              >
                Retry
              </button>
            </div>
          )}
          {notice && (
            <p
              role="status"
              className="mb-5 rounded-xl border border-slate-200 bg-white p-4 text-sm"
            >
              {notice}
            </p>
          )}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {tab === "explore"
                ? "Find your next build"
                : tabs.find((item) => item.id === tab)?.label}
            </h2>
            <span className="text-sm text-slate-500">
              {loading ? "Loading…" : `${list.length} projects`}
            </span>
          </div>
          {loading ? (
            <div
              role="status"
              className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500"
            >
              Loading your projects…
            </div>
          ) : !list.length ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <FolderKanban className="mx-auto mb-3 h-7 w-7 text-emerald-600" />
              <h3 className="font-semibold">
                {query || difficulty !== "All levels"
                  ? "No matching projects"
                  : "No projects here yet"}
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                {tab === "explore"
                  ? "Try another filter or refresh your suggestions."
                  : "Explore ideas and choose something you’d like to build."}
              </p>
              <button
                onClick={() => {
                  setQuery("");
                  setDifficulty("All levels");
                  setTab("explore");
                }}
                className="mt-4 text-sm font-semibold text-emerald-700"
              >
                {query || difficulty !== "All levels"
                  ? "Clear filters"
                  : "Explore projects"}
              </button>
            </div>
          ) : (
            <div
              className={
                tab === "active"
                  ? "flex flex-col gap-4"
                  : "grid gap-5 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
              }
            >
              {list.map((project) => {
                const progress = projectProgress(project);
                const active = project.status === "active";
                return (
                  <article
                    key={project.id}
                    className={`rounded-2xl border border-slate-200 bg-white p-6 transition-colors hover:border-emerald-200 ${active ? "grid items-center gap-6 lg:grid-cols-[minmax(0,1fr)_260px]" : "flex flex-col"}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="mb-4 flex items-center justify-between">
                        <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">
                          {project.difficulty}
                        </span>
                        <FolderKanban className="h-5 w-5 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-bold tracking-tight">
                        {project.title}
                      </h3>
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                        {project.description}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {project.tags.slice(0, 3).map((tag: string) => (
                          <span
                            key={tag}
                            className="rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div
                      className={
                        active ? "" : "mt-6 border-t border-slate-100 pt-4"
                      }
                    >
                      {active && (
                        <div className="mb-4">
                          <p className="mb-2 text-xs text-slate-600">
                            {progress.total
                              ? `${progress.done} of ${progress.total} tasks completed`
                              : "Open your workspace to review your plan"}
                          </p>
                          {progress.total > 0 && (
                            <progress
                              aria-label={`${project.title} progress`}
                              max={progress.total}
                              value={progress.done}
                              className="h-1.5 w-full accent-emerald-600"
                            />
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        {project.status !== "undo" && (
                          <button
                            onClick={() => open(project)}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold ${active ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"}`}
                          >
                            {active
                              ? "Continue project"
                              : project.status === "completed"
                                ? "Review project"
                                : "View project"}
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        )}
                        {!project.status && (
                          <button
                            disabled={!!busy}
                            onClick={() => void mutate(project, "save")}
                            aria-label={`Save ${project.title}`}
                            className="rounded-lg border border-slate-200 p-2.5 hover:bg-slate-50 disabled:opacity-40"
                          >
                            <Bookmark className="h-4 w-4" />
                          </button>
                        )}
                        {project.status && project.status !== "undo" && (
                          <button
                            disabled={!!busy}
                            onClick={() => void mutate(project, "undo")}
                            aria-label={`Archive ${project.title}`}
                            className="rounded-lg p-2.5 text-slate-500 hover:bg-slate-100"
                          >
                            <Archive className="h-4 w-4" />
                          </button>
                        )}
                        {project.status === "undo" && (
                          <>
                            <button
                              disabled={!!busy}
                              onClick={() => void mutate(project, "active")}
                              className="flex flex-1 items-center gap-2 text-sm font-semibold text-emerald-700"
                            >
                              <RotateCcw className="h-4 w-4" />
                              Restore project
                            </button>
                            <button
                              disabled={!!busy}
                              onClick={() => void mutate(project, "delete")}
                              aria-label={`Delete ${project.title}`}
                              className="rounded-lg p-2 text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
        {selected && (
          <ProjectOnboardingWizard
            project={selected}
            role={role}
            onClose={() => setSelected(null)}
          />
        )}
      </main>
    </div>
  );
}
