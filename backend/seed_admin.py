import os
import sys
import argparse
import getpass
import uuid
from datetime import datetime

# Ensure backend directory is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import get_connection
from app.security import hash_password
from app.config import ADMIN_USERNAME, ADMIN_PASSWORD

def seed_admin(username=None, password=None, email=None, role="owner"):
    target_username = (username or ADMIN_USERNAME or "Amit_MS2026").strip()
    target_password = password or ADMIN_PASSWORD
    
    if not target_password:
        print(f"=== Creating Admin Account for: {target_username} ===")
        target_password = getpass.getpass("Enter Admin Password: ").strip()
        confirm = getpass.getpass("Confirm Admin Password: ").strip()
        if target_password != confirm:
            print("[-] Error: Passwords do not match.")
            sys.exit(1)
            
    if len(target_password) < 8:
        print("[-] Error: Password must be at least 8 characters long.")
        sys.exit(1)
        
    target_email = email or f"{target_username.lower()}@amitmobileshop.com"
    hashed = hash_password(target_password)
    now = datetime.now().isoformat()
    
    conn = get_connection()
    cursor = conn.cursor()
    
    # Check if admin already exists by username or single existing admin record
    cursor.execute("SELECT id FROM admin_users WHERE LOWER(username) = LOWER(?)", (target_username,))
    existing = cursor.fetchone()
    if not existing:
        cursor.execute("SELECT id FROM admin_users ORDER BY created_at ASC LIMIT 1")
        existing = cursor.fetchone()
    
    if existing:
        cursor.execute("""
        UPDATE admin_users
        SET username = ?, password_hash = ?, email = ?, role = ?, is_active = 1, token_version = COALESCE(token_version, 1) + 1, updated_at = ?
        WHERE id = ?
        """, (target_username, hashed, target_email, role, now, existing["id"]))
        cursor.execute("DELETE FROM admin_users WHERE id != ?", (existing["id"],))
        print(f"[+] Admin '{target_username}' updated successfully with new password! Existing sessions invalidated.")
    else:
        new_id = str(uuid.uuid4())
        cursor.execute("""
        INSERT INTO admin_users (id, username, email, password_hash, role, is_active, token_version, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 1, 1, ?, ?)
        """, (new_id, target_username, target_email, hashed, role, now, now))
        print(f"[+] Admin account '{target_username}' created successfully!")
        
    conn.commit()
    conn.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create or update shop admin account.")
    parser.add_argument("--username", "-u", default=None, help="Admin username")
    parser.add_argument("--password", "-p", default=None, help="Admin password (optional; otherwise prompts or uses ADMIN_PASSWORD env)")
    parser.add_argument("--email", "-e", default=None, help="Admin email")
    args = parser.parse_args()
    
    seed_admin(username=args.username, password=args.password, email=args.email)
