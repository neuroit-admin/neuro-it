import urllib.request
import json

res = urllib.request.urlopen('https://www.neuroit.co.uk/api/services', timeout=10)
data = json.loads(res.read().decode('utf-8'))

print('=== SERVICE IDs CHECK ===')
for cat in data.get('categories', []):
    for svc in cat.get('services', []):
        prefix = 'STATIC' if svc['id'].startswith('static-') else 'DB'
        print(f'[{prefix}] {svc["name"]} => {svc["id"]}')
