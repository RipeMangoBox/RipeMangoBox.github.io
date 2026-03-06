import subprocess
import os
import json
import re
from tqdm import tqdm

# --- 配置 ---
input_video = "../Demo.mp4"
output_dir = "Demo_clips"
final_video = "../Demo_Final.mp4"

# 数据结构: (帧区间列表, 文件名, 是否包含在精简版中)
# 注意: The Key Insight 包含了两个区间 [(1922, 2135), (2210, 2430)]
segments_data = [
    ([(1, 47)], "1_封面", True),
    ([(48, 1400)], "2_与Duolando的长序列对比", True),
    ([(1465, 1630), (1945, 2135)], "3_Background", True),
    ([(2210, 2430)], "4_The_Key_Insight", True), # 两段合并
    ([(2530, 3313)], "5_HFSQ_Method", True),
    ([(3360, 3841)], "6_HFSQ_Results_with_Different_Quantizer_Number", False), # 仅切片，不入精简版
    ([(3900, 4350)], "7_BLC_Method", True),
    ([(4380, 4400)], "8_平滑过渡", True),
    ([(4441, 4580)], "9_LDCFG_Method", True),
    ([(4615, 6874)], "10_LDCFG_Results", True),
    ([(6875, 8329)], "11_Comparison", True),
    ([(8450, 8954)], "12_HFSQ_Ablation_Results", True),
    ([(8960, 9369)], "13_PM_Ablation_Results", True),
    ([(9470, 9700)], "14_Conclusion", True),
]

def get_video_info(file):
    cmd = f'ffprobe -v error -select_streams v:0 -show_entries stream=avg_frame_rate,nb_frames -of json "{file}"'
    result = subprocess.check_output(cmd, shell=True).decode()
    data = json.loads(result)['streams'][0]
    fps_str = data['avg_frame_rate']
    num, den = map(int, fps_str.split('/'))
    return num / den

def build_filter(ranges, fps):
    """为一组帧区间构建 trim 滤镜字符串"""
    v_parts, a_parts, tags = [], [], []
    for i, (start, end) in enumerate(ranges):
        t_start = (start - 1) / fps
        t_end = end / fps
        v_parts.append(f"[0:v]trim=start={t_start}:end={t_end},setpts=PTS-STARTPTS[v{i}]")
        a_parts.append(f"[0:a]atrim=start={t_start}:end={t_end},asetpts=PTS-STARTPTS[a{i}]")
        tags.append(f"[v{i}][a{i}]")
    
    filter_str = ";".join(v_parts + a_parts)
    filter_str += f";{''.join(tags)}concat=n={len(ranges)}:v=1:a=1[v][a]"
    return filter_str

def run_ffmpeg_task(cmd, total_frames, desc):
    process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, universal_newlines=True, encoding='utf-8')
    with tqdm(total=total_frames, desc=desc, unit="f") as pbar:
        for line in process.stdout:
            match = re.search(r'frame=\s*(\d+)', line)
            if match:
                current_frame = int(match.group(1))
                pbar.n = min(current_frame, total_frames)
                pbar.refresh()
    process.wait()

# --- 执行开始 ---
fps = get_video_info(input_video)
if not os.path.exists(output_dir): os.makedirs(output_dir)

# --- 任务 1: Demo 切片 ---
print(f"视频帧率: {fps:.2f} | 开始执行任务一：精准切片...")
for ranges, name, _ in segments_data[::-1]: # 反向切片，先处理后面部分，避免 ffmpeg 输出覆盖前面日志
    out_path = os.path.join(output_dir, f"{name}.mp4")
    filter_complex = build_filter(ranges, fps)
    
    cmd = [
        "ffmpeg", "-y", "-i", input_video,
        "-filter_complex", filter_complex,
        "-map", "[v]", "-map", "[a]",
        "-c:v", "libx264", "-crf", "17", "-preset", "faster",
        "-c:a", "aac", "-b:a", "192k", out_path
    ]
    # 切片量大，这里直接调用 subprocess
    subprocess.run(cmd, capture_output=True)
    print(f"  ✓ 已完成: {name}")

# --- 任务 2: Demo 精简合并 ---
print("\n开始执行任务二：精简合并（移除不用部分）...")

# 只选择需要在精简版里出现的区间
keep_segments = [s for s in segments_data if s[2]]
all_ranges = []
for s in keep_segments:
    all_ranges.extend(s[0]) # 展开所有区间

# 构建总的 filter_complex
filter_parts = []
concat_tags = ""
total_target_frames = 0

for i, (start, end) in enumerate(all_ranges):
    t_start = (start - 1) / fps
    t_end = end / fps
    total_target_frames += (end - start + 1)
    
    filter_parts.append(f"[0:v]trim=start={t_start}:end={t_end},setpts=PTS-STARTPTS[v{i}]")
    filter_parts.append(f"[0:a]atrim=start={t_start}:end={t_end},asetpts=PTS-STARTPTS[a{i}]")
    concat_tags += f"[v{i}][a{i}]"

final_filter = ";".join(filter_parts) + f";{concat_tags}concat=n={len(all_ranges)}:v=1:a=1[v][a]"

full_cmd = [
    "ffmpeg", "-y", "-i", input_video,
    "-filter_complex", final_filter,
    "-map", "[v]", "-map", "[a]",
    "-c:v", "libx264", "-crf", "17", "-preset", "medium",
    "-c:a", "aac", "-b:a", "192k", final_video
]

run_ffmpeg_with_progress = run_ffmpeg_task(full_cmd, total_target_frames, "精简版合成总进度")

print(f"\n所有任务已完成！")
print(f"切片目录: {output_dir}")
print(f"精简版视频: {final_video}")