"""
    Script to setup symbolic links and invoke nvm use
"""
#!/bin/python

import pathlib
import os
import subprocess

ROOT_DIRECTORY = pathlib.Path(__file__).parents[1].resolve()

def find(target):
    files = os.listdir(ROOT_DIRECTORY)
    for file in files:
        if file == target:
            return True
            break
        else:
            continue
    return False

def main():
    print("Locating nvmrc configuration file:")
    nvmrcExists = find(".nvmrc")

    # Something must be royally wrong 
    # for this to happen, so nuclear option
    if not nvmrcExists:
        print("FILE NOT FOUND")
        file = str(ROOT_DIRECTORY)+("/.nvmrc") 
        pathlib.Path(file).open('w')
        os.popen("node -v >> " + file)
        home = pathlib.Path("~")
        subprocess.run(['sh', '-c', str(home) + '/.nvm/nvm.sh', 'use'])
    else:
        print("FILE FOUND")

    eslintrcExists = find(".prettierrc.json")
    if not eslintrcExists:
        file = str(ROOT_DIRECTORY)+("/.prettierc.json") 
        pathlib.Path(file).open("w").write('{\n\t"semi": "true",\n\t"trailingComma": "all",\n\t"singleQuote": "true",\n\t"printWidth": 100,\n\t"tabWidth": 2,\n\t"proseWrap": "always",\n\t"bracketSameLine": "false",\n\t"jsxBracketSameLine": "false"\n}')
        
    services_path = str(ROOT_DIRECTORY) + "/services/"
    services_files = os.listdir(services_path)
    for service_dir in services_files:
        service_path = (services_path + service_dir)
        files = os.listdir(service_path)
        colisionCheck = list()
        for file in files:
            if file == ".prettierrc.json":
                colisionCheck.append('FOUND SYMLINK AT: '+service_path)
                break
        if len(colisionCheck) == 0:
            print("Linking prettierrc to " + service_dir)
            print("service_path " + service_path)
            os.popen("ln -sf "+ str(ROOT_DIRECTORY) +"/.prettierc.json "
                     + service_path + 
                     "/.prettierc.json")

    shared_path = str(ROOT_DIRECTORY) + "/shared/"
    shared_files = os.listdir(shared_path)
    for shared_dir in shared_files:
        shared_path = shared_path + shared_dir
        files = os.listdir(shared_path)
        colisionCheck = list()
        for file in files:
            if file == ".prettierrc.json":
                colisionCheck.append('FOUND SYMLINK AT: '+shared_path)
                break
        if len(colisionCheck) == 0:
            print("Linking prettierrc to " + shared_dir)
            print("shared_path " + shared_path)
            os.popen("ln -sf "+ str(ROOT_DIRECTORY) +"/.prettierc.json "
                     + shared_path + 
                     "/.prettierc.json")
    print("PROCESS RETURNED OK")
main()
