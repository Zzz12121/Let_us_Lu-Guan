import numpy as np
import cv2
from PIL import Image
import math
from tqdm import tqdm

def ease_in_out(t):
    """緩動函數：讓粒子起步慢、中間快、結尾慢，視覺更柔和自然"""
    return 0.5 - 0.5 * math.cos(math.pi * t)

def create_strong_grandpa_animation(target_path, source_path, output_path, resolution=150, video_size=900, duration_sec=4, fps=30):
    """
    進階版 Strong Grandpa：生成粒子飛行的過場動畫影片
    :param resolution: 內部運算解析度 (150代表 150x150 = 22,500 個粒子在飛)
    :param video_size: 輸出的影片尺寸 (900x900 高清畫質)
    :param duration_sec: 動畫長度 (秒)
    :param fps: 每秒幀數
    """
    print("🎬 [1/4] 讀取並分析圖片...")
    # 讀取圖片並統一尺寸
    target_img = Image.open(target_path).convert('RGB').resize((resolution, resolution))
    source_img = Image.open(source_path).convert('RGB').resize((resolution, resolution))
    
    # 取得原始像素與座標
    # target_pixels 和 source_pixels 形狀為 (N, 3)，N = resolution * resolution
    target_pixels = np.array(target_img).reshape(-1, 3)
    source_pixels = np.array(source_img).reshape(-1, 3)
    
    # 建立所有像素的 (X, Y) 座標網格
    Y, X = np.indices((resolution, resolution))
    positions = np.column_stack((X.ravel(), Y.ravel())) # 形狀為 (N, 2)
    
    print("🧠 [2/4] 計算亮度並規劃飛行軌跡...")
    # 計算亮度
    target_brightness = np.dot(target_pixels, [0.299, 0.587, 0.114])
    source_brightness = np.dot(source_pixels, [0.299, 0.587, 0.114])
    
    # 取得排序索引 (由暗到亮)
    target_sort_idx = np.argsort(target_brightness)
    source_sort_idx = np.argsort(source_brightness)
    
    # 配對：第 i 暗的來源像素，準備飛往第 i 暗的目標位置
    # 整理出每個粒子的：起點、終點、顏色
    start_pos = positions[source_sort_idx]
    end_pos = positions[target_sort_idx]
    colors = source_pixels[source_sort_idx]
    
    print("🎥 [3/4] 初始化影片渲染器...")
    total_frames = duration_sec * fps
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    video = cv2.VideoWriter(output_path, fourcc, fps, (video_size, video_size))
    
    # 計算每個內部像素在輸出影片中佔的大小
    scale = video_size // resolution 
    
    print("🚀 [4/4] 開始渲染粒子飛行影格...")
    for frame_idx in tqdm(range(total_frames)):
        # 計算時間進度 (0.0 ~ 1.0)
        t = frame_idx / (total_frames - 1)
        
        # 加入緩停頓：讓影片開頭停留0.5秒，結尾停留0.5秒
        if t < 0.1:
            progress = 0.0
        elif t > 0.9:
            progress = 1.0
        else:
            # 中間 80% 的時間進行移動，並套用緩動函數
            normalized_t = (t - 0.1) / 0.8
            progress = ease_in_out(normalized_t)
            
        # 計算這一幀所有粒子的當前位置 (向量化運算，超級快)
        current_pos = start_pos + (end_pos - start_pos) * progress
        
        # 將內部座標轉換為影片高畫質座標
        pos_scaled = np.clip(np.round(current_pos * scale).astype(int), 0, video_size - scale)
        
        # 建立全黑背景的畫布
        frame = np.zeros((video_size, video_size, 3), dtype=np.uint8)
        
        # 畫上像素色塊 (不用 for 迴圈逐格畫，使用 NumPy 快速填色技術)
        for y_offset in range(scale):
            for x_offset in range(scale):
                frame[pos_scaled[:, 1] + y_offset, pos_scaled[:, 0] + x_offset] = colors
                
        # 將 RGB 轉換為 OpenCV 需要的 BGR 格式
        frame_bgr = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
        video.write(frame_bgr)
        
    video.release()
    print(f"✨ 大功告成！超炫炮動畫已儲存至：{output_path}")

if __name__ == "__main__":
    # 執行設定
    TARGET = "target.jpg"         # 你的目標圖片
    SOURCE = "strong_grandpa.jpg" # 強壯阿公的圖片
    OUTPUT = "strong_grandpa_animated.mp4" # 輸出的影片檔名
    
    # 難度加倍設定：
    # resolution=150 代表有 22,500 個粒子在畫面上移動。
    # 如果你的電腦效能很好，可以挑戰 resolution=200 (40,000個粒子)。
    create_strong_grandpa_animation(
        TARGET, 
        SOURCE, 
        OUTPUT, 
        resolution=300,    # 精細度
        video_size=900,    # 影片畫質 (900x900)
        duration_sec=10,    # 影片總長 5 秒
        fps=60             # 流暢度 30 幀
    )