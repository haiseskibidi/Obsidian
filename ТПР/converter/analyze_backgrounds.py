import os
from PIL import Image

base_dir = "D:/Me/ТПР/converter/backgrounds"
out_dir = "C:/Users/akopa/.gemini/antigravity-cli/brain/552e780a-2fcd-460a-9c7a-e683d6b923e6/scratch"
os.makedirs(out_dir, exist_ok=True)

for name in os.listdir(base_dir):
    if name.endswith(".png"):
        img_path = os.path.join(base_dir, name)
        img = Image.open(img_path)
        w, h = img.size
        cropped = img.crop((w//2 - 150, h//2 - 150, w//2 + 150, h//2 + 150))
        cropped.save(os.path.join(out_dir, f"crop_{name}"))
        print(f"Saved crop_{name}")
