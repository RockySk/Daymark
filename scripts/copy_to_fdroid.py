import os
import shutil

src = r"C:\Users\Sourabh K\Documents\Date Count\Count-Date-"
dst = r"C:\Users\Sourabh K\Documents\Date Count\Count_Date_Fdroid_Build"

exclude_dirs = {
    "node_modules", ".git", "dist", "extracted_apk", ".gradle", "build", ".system_generated"
}
exclude_files = {
    "daymark-release.jks", "keystore.properties", "note.md",
    "app-release.apks", "app-release.zip"
}

def copy_clean():
    os.makedirs(dst, exist_ok=True)
    count_files = 0
    count_dirs = 0
    for root, dirs, files in os.walk(src):
        # Filter directories in-place
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        rel_path = os.path.relpath(root, src)
        if rel_path == ".":
            target_dir = dst
        else:
            target_dir = os.path.join(dst, rel_path)
            os.makedirs(target_dir, exist_ok=True)
            count_dirs += 1

        for f in files:
            lower = f.lower()
            if f in exclude_files or lower.endswith(".apk") or lower.endswith(".aab"):
                continue
            src_file = os.path.join(root, f)
            dst_file = os.path.join(target_dir, f)
            shutil.copy2(src_file, dst_file)
            count_files += 1

    print(f"DONE: Copied {count_files} files across {count_dirs} directories.")

if __name__ == "__main__":
    copy_clean()
