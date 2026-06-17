import os
import subprocess
from PIL import Image

def create_dirs():
    os.makedirs(r"d:\Antigravity\neuro-it\public\video\frames", exist_ok=True)
    os.makedirs(r"d:\Antigravity\neuro-it\public\video\frames-mobile", exist_ok=True)
    os.makedirs(r"d:\Antigravity\neuro-it\public\temp_desk_png", exist_ok=True)
    os.makedirs(r"d:\Antigravity\neuro-it\public\temp_mobile_png", exist_ok=True)

def extract_raw_frames():
    print("Extracting raw frames using FFmpeg...")
    # Extract desktop frames to temporary folder
    desk_video = r"d:\Antigravity\neuro-it\public\video\video-desk\desk.mov"
    subprocess.run([
        "ffmpeg", "-y", "-i", desk_video,
        "-vf", "fps=24", "-frames:v", "230",
        r"d:\Antigravity\neuro-it\public\temp_desk_png\f_%03d.png"
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print("Desktop frames extracted.")
    
    # Extract mobile frames to temporary folder
    mobile_video = r"d:\Antigravity\neuro-it\public\video\video-mobile\mobile.mov"
    subprocess.run([
        "ffmpeg", "-y", "-i", mobile_video,
        "-vf", "fps=24", "-frames:v", "230",
        r"d:\Antigravity\neuro-it\public\temp_mobile_png\f_%03d.png"
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print("Mobile frames extracted.")

def convert_and_optimize():
    print("Starting WebP conversion and optimization...")
    
    # Get resample filter dynamically for Pillow compatibility
    try:
        resample_filter = Image.Resampling.LANCZOS
    except AttributeError:
        resample_filter = Image.LANCZOS
        
    # Process Desktop
    print("Processing Desktop frames...")
    for i in range(1, 231):
        filename = f"f_{i:03d}.png"
        in_path = os.path.join(r"d:\Antigravity\neuro-it\public\temp_desk_png", filename)
        out_path = os.path.join(r"d:\Antigravity\neuro-it\public\video\frames", f"f_{i:03d}.webp")
        
        if not os.path.exists(in_path):
            continue
            
        img = Image.open(in_path).convert("RGB")
        
        # Resize to optimized desktop size
        img = img.resize((1200, 566), resample_filter)
        
        # Save as WebP
        img.save(out_path, "WEBP", quality=75)
        if i % 30 == 0 or i == 230:
            print(f"  Desktop: Processed {i}/230 frames")
            
    # Process Mobile
    print("Processing Mobile frames...")
    for i in range(1, 231):
        filename = f"f_{i:03d}.png"
        in_path = os.path.join(r"d:\Antigravity\neuro-it\public\temp_mobile_png", filename)
        out_path = os.path.join(r"d:\Antigravity\neuro-it\public\video\frames-mobile", f"f_{i:03d}.webp")
        
        if not os.path.exists(in_path):
            continue
            
        img = Image.open(in_path).convert("RGB")
        
        # Resize to optimized mobile size
        img = img.resize((640, 658), resample_filter)
        
        # Save as WebP
        img.save(out_path, "WEBP", quality=75)
        if i % 30 == 0 or i == 230:
            print(f"  Mobile: Processed {i}/230 frames")

def cleanup():
    print("Cleaning up temporary raw PNG files...")
    import shutil
    shutil.rmtree(r"d:\Antigravity\neuro-it\public\temp_desk_png", ignore_errors=True)
    shutil.rmtree(r"d:\Antigravity\neuro-it\public\temp_mobile_png", ignore_errors=True)
    print("Cleanup completed.")

if __name__ == "__main__":
    create_dirs()
    extract_raw_frames()
    convert_and_optimize()
    cleanup()
    print("ALL FRAMES SUCCESSFULLY GENERATED AND IMPORTED!")
