import os

def search_files(directory):
    for root, dirs, files in os.walk(directory):
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        if '.next' in dirs:
            dirs.remove('.next')
        for file in files:
            if file.endswith(('.ts', '.tsx', '.js', '.jsx')):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                        if 'NEXT_PUBLIC_PHONE_NUMBER' in content or 'NEXT_PUBLIC_WHATSAPP_NUMBER' in content:
                            print(f"Found in: {filepath}")
                except Exception:
                    pass

search_files('D:\\Antigravity\\neuro-it')
