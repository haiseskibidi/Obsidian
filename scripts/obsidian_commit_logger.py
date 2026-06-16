import os
import datetime
import subprocess

OBSIDIAN_VAULT_PATH = r"D:\Me\Ежедневник"
HEADER = "## 💻 Лог разработки"

def main():
    repo_path = os.getcwd()
    project_name = os.path.basename(repo_path)
    
    try:
        result = subprocess.run(['git', 'log', '-1', '--pretty=format:%h|%s'], capture_output=True, text=True, check=True)
        commit_hash, commit_msg = result.stdout.strip().split('|', 1)
    except Exception as e:
        return

    now = datetime.datetime.now()
    date_str = now.strftime("%Y-%m-%d")
    time_str = now.strftime("%H:%M")
    
    daily_note_path = os.path.join(OBSIDIAN_VAULT_PATH, f"{date_str}.md")
    
    obsidian_msg = os.environ.get('OBSIDIAN_MSG')
    tick = chr(96)
    
    if obsidian_msg:
        log_entry = f"- [{time_str}] 📁 **{project_name}**: {tick}{commit_hash}{tick} {commit_msg} — {obsidian_msg}\n"
    else:
        log_entry = f"- [{time_str}] 📁 **{project_name}**: {tick}{commit_hash}{tick} {commit_msg}\n"
    
    if not os.path.exists(daily_note_path):
        with open(daily_note_path, 'w', encoding='utf-8') as f:
            f.write(f"{HEADER}\n{log_entry}")
        return

    with open(daily_note_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    header_idx = -1
    for i, line in enumerate(lines):
        if line.strip().startswith("## 💻"):
            header_idx = i
            break
            
    if header_idx != -1:
        insert_idx = header_idx + 1
        while insert_idx < len(lines) and (lines[insert_idx].strip() == '' or lines[insert_idx].strip().startswith('-') or lines[insert_idx].strip().startswith('*')):
            insert_idx += 1
        
        lines.insert(insert_idx, log_entry)
        with open(daily_note_path, 'w', encoding='utf-8') as f:
            f.writelines(lines)
    else:
        with open(daily_note_path, 'a', encoding='utf-8') as f:
            f.write(f"\n{HEADER}\n{log_entry}")

if __name__ == '__main__':
    main()
