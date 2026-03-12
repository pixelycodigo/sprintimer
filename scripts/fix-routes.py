#!/usr/bin/env python3
import os
import re

services_dir = 'apps/web/src/services'

for filename in os.listdir(services_dir):
    if not filename.endswith('.ts'):
        continue
    
    filepath = os.path.join(services_dir, filename)
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Reemplazar rutas con slash inicial - maneja tipos genéricos
    # api.get<{...}>('/admin → api.get<{...}>('admin
    content = re.sub(r"\.get<[^>]*>\('\/", lambda m: m.group(0).replace("('/", "('"), content)
    content = re.sub(r"\.post<[^>]*>\('\/", lambda m: m.group(0).replace("('/", "('"), content)
    content = re.sub(r"\.put<[^>]*>\('\/", lambda m: m.group(0).replace("('/", "('"), content)
    content = re.sub(r"\.delete<[^>]*>\('\/", lambda m: m.group(0).replace("('/", "('"), content)
    content = re.sub(r"\.patch<[^>]*>\('\/", lambda m: m.group(0).replace("('/", "('"), content)
    
    # También para template strings
    content = re.sub(r"\.get<[^>]*>\(`\/", lambda m: m.group(0).replace("(`/", "(`"), content)
    content = re.sub(r"\.post<[^>]*>\(`\/", lambda m: m.group(0).replace("(`/", "(`"), content)
    content = re.sub(r"\.put<[^>]*>\(`\/", lambda m: m.group(0).replace("(`/", "(`"), content)
    content = re.sub(r"\.delete<[^>]*>\(`\/", lambda m: m.group(0).replace("(`/", "(`"), content)
    content = re.sub(r"\.patch<[^>]*>\(`\/", lambda m: m.group(0).replace("(`/", "(`"), content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f'✅ {filename} actualizado')

print('\n🎉 Todos los servicios actualizados')
