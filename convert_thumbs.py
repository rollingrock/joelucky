from PIL import Image
import os

input_folder = "."
output_folder = "thumbs"
os.makedirs(output_folder, exist_ok=True)

size = (320, 240)  # thumbnail size

for filename in os.listdir(input_folder):
    if filename.lower().endswith((".jpg", ".jpeg", ".png")):
        img_path = os.path.join(input_folder, filename)
        img = Image.open(img_path)
        img.thumbnail(size)
        img.save(os.path.join(output_folder, filename))
