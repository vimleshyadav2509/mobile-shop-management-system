
import os
import sys

# Ensure UTF-8 output on Windows console
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

def get_summary():
    out = []
    out.append("=" * 60)
    out.append("PROJECT CONTEXT & PROGRESS REPORT FOR CHATGPT")
    out.append("=" * 60)
    
    # 1. Readme
    if os.path.exists("README.md"):
        out.append("\n--- [1. PROJECT OVERVIEW] ---")
        with open("README.md", "r", encoding="utf-8", errors="ignore") as f:
            lines = f.readlines()
            out.append("".join(lines[:45]).strip())
            
    # 2. Tech Stack & Dependencies
    out.append("\n--- [2. TECH STACK & DEPENDENCIES] ---")
    if os.path.exists("backend/requirements.txt"):
        out.append("\n[Backend - requirements.txt]:")
        with open("backend/requirements.txt", "r", encoding="utf-8", errors="ignore") as f:
            out.append(f.read().strip())
    if os.path.exists("frontend/package.json"):
        out.append("\n[Frontend - package.json dependencies]:")
        with open("frontend/package.json", "r", encoding="utf-8", errors="ignore") as f:
            out.append(f.read().strip())

    # 3. File Tree (Clean)
    out.append("\n--- [3. CURRENT REPOSITORY STRUCTURE] ---")
    ignored_dirs = {"node_modules", "dist", ".git", "__pycache__", ".venv", "venv", ".gemini", "dist - Copy"}
    tree_lines = []
    for root, dirs, files in os.walk("."):
        dirs[:] = [d for d in dirs if d not in ignored_dirs]
        level = root.replace(".", "", 1).count(os.sep)
        indent = " " * 4 * level
        folder = os.path.basename(root)
        if folder:
            tree_lines.append(f"{indent}{folder}/")
        subindent = " " * 4 * (level + 1)
        for f in sorted(files):
            if not f.endswith(".pyc") and f != "ams_store.db" and f != "package-lock.json":
                tree_lines.append(f"{subindent}{f}")
    out.append("\n".join(tree_lines[:150]))

    # 4. Backend Endpoints and Models
    out.append("\n--- [4. BACKEND API ROUTES & DATA MODELS] ---")
    routes_dir = os.path.join("backend", "app", "routes")
    if os.path.exists(routes_dir):
        for r_file in sorted(os.listdir(routes_dir)):
            if r_file.endswith(".py") and not r_file.startswith("__"):
                out.append(f"\nRoute File: backend/app/routes/{r_file}")
                with open(os.path.join(routes_dir, r_file), "r", encoding="utf-8", errors="ignore") as f:
                    for line in f:
                        if "@router." in line or line.startswith("def ") or line.startswith("async def "):
                            out.append(f"  {line.strip()}")

    # 5. Frontend Pages & Components
    out.append("\n--- [5. FRONTEND COMPONENTS & ARCHITECTURE] ---")
    fe_comp_dir = os.path.join("frontend", "src", "components")
    if os.path.exists(fe_comp_dir):
        for root, dirs, files in os.walk(fe_comp_dir):
            for file in sorted(files):
                if file.endswith((".jsx", ".js")):
                    rel = os.path.relpath(os.path.join(root, file), "frontend/src")
                    out.append(f"  - frontend/src/{rel.replace(os.sep, '/')}")

    out.append("\n" + "=" * 60)
    out.append("PROMPT FOR CHATGPT:")
    out.append("I am developing the Amit Mobile Shop web application described above.")
    out.append("Review the current project architecture, implemented features, and backend/frontend structure.")
    out.append("Please provide a prioritized roadmap of the NEXT STEPS to complete this project, including:")
    out.append("1. Missing critical features or improvements (auth, payment gateway, admin portal, notifications, etc.)")
    out.append("2. Database, API, and state management enhancements")
    out.append("3. Production readiness, security, and deployment checklist")
    out.append("=" * 60)

    result = "\n".join(out)
    return result

if __name__ == "__main__":
    summary = get_summary()
    print(summary)
    with open("chatgpt_project_summary.txt", "w", encoding="utf-8") as f:
        f.write(summary)
    print("\n>>> Also saved full summary to chatgpt_project_summary.txt for easy copying! <<<")
