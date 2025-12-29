#!/usr/bin/env python3
"""
Script to setup symbolic links and invoke nvm use
"""

import pathlib
import subprocess
import sys
from typing import Optional

ROOT_DIRECTORY = pathlib.Path(__file__).parents[1].resolve()

PRETTIER_CONFIG = """{
\t"semi": true,
\t"trailingComma": "all",
\t"singleQuote": true,
\t"printWidth": 100,
\t"tabWidth": 2,
\t"proseWrap": "always",
\t"bracketSameLine": false,
\t"jsxBracketSameLine": false
}"""


def ensure_nvmrc() -> None:
    """Ensure .nvmrc file exists and invoke nvm use."""
    nvmrc_path = ROOT_DIRECTORY / ".nvmrc"
    
    if not nvmrc_path.exists():
        print("⚠️  .nvmrc not found, creating...")
        try:
            # Get current node version and write to .nvmrc
            result = subprocess.run(
                ["node", "-v"], 
                capture_output=True, 
                text=True, 
                check=True
            )
            nvmrc_path.write_text(result.stdout.strip())
            print(f"✓ Created .nvmrc with version: {result.stdout.strip()}")
        except subprocess.CalledProcessError as e:
            print(f"✗ Error getting node version: {e}", file=sys.stderr)
            return
        except FileNotFoundError:
            print("✗ Node.js not found. Please install Node.js first.", file=sys.stderr)
            return
    else:
        print("✓ .nvmrc found")

    # Invoke nvm use
    try:
        nvm_path = pathlib.Path.home() / ".nvm" / "nvm.sh"
        if nvm_path.exists():
            subprocess.run(
                ["bash", "-c", f"source {nvm_path} && nvm use"],
                check=True,
                shell=False
            )
            print("✓ nvm use executed")
    except subprocess.CalledProcessError as e:
        print(f"⚠️  Could not run nvm use: {e}", file=sys.stderr)


def ensure_prettier_config() -> Optional[pathlib.Path]:
    """Ensure .prettierrc.json exists in root directory."""
    prettier_path = ROOT_DIRECTORY / ".prettierrc.json"
    
    if not prettier_path.exists():
        print("⚠️  .prettierrc.json not found, creating...")
        prettier_path.write_text(PRETTIER_CONFIG)
        print("✓ Created .prettierrc.json")
    else:
        print("✓ .prettierrc.json found")
    
    return prettier_path


def link_prettier_to_directory(source: pathlib.Path, target_dir: pathlib.Path) -> None:
    """Create symlink for prettier config in target directory."""
    target_link = target_dir / ".prettierrc.json"
    
    if target_link.exists() or target_link.is_symlink():
        print(f"  ↷ Symlink already exists: {target_dir.name}")
        return
    
    try:
        target_link.symlink_to(source)
        print(f"  ✓ Linked .prettierrc.json to {target_dir.name}")
    except OSError as e:
        print(f"  ✗ Failed to create symlink in {target_dir.name}: {e}", file=sys.stderr)


def link_prettier_configs(prettier_source: pathlib.Path) -> None:
    """Link prettier config to all service and shared directories."""
    
    # Link to services
    services_dir = ROOT_DIRECTORY / "services"
    if services_dir.exists() and services_dir.is_dir():
        print("\nLinking to services:")
        for service_dir in services_dir.iterdir():
            if service_dir.is_dir():
                link_prettier_to_directory(prettier_source, service_dir)
    
    # Link to shared
    shared_dir = ROOT_DIRECTORY / "shared"
    if shared_dir.exists() and shared_dir.is_dir():
        print("\nLinking to shared:")
        for shared_subdir in shared_dir.iterdir():
            if shared_subdir.is_dir():
                link_prettier_to_directory(prettier_source, shared_subdir)


def main() -> int:
    """Main execution function."""
    print(f"Root directory: {ROOT_DIRECTORY}\n")
    
    try:
        # Setup .nvmrc
        ensure_nvmrc()
        
        # Setup prettier config
        prettier_path = ensure_prettier_config()
        if prettier_path:
            link_prettier_configs(prettier_path)
        
        print("\n✓ Setup completed successfully")
        return 0
        
    except Exception as e:
        print(f"\n✗ Setup failed: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
