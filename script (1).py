import shutil, os, uuid

project_name = "Cybor-Virtual-Mouse"
zip_name = f"{project_name}-{uuid.uuid4().hex[:8]}.zip"
shutil.make_archive(zip_name.replace('.zip', ''), 'zip', project_name)
print(f"Created zip: {zip_name}")

zip_path = zip_name