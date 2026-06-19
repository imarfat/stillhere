"""Trace hero-line-art.png to SVG paths for stroke-draw animation."""
from pathlib import Path

import numpy as np
from PIL import Image
import potrace

ROOT = Path(__file__).resolve().parents[1]
PNG = ROOT / "public" / "hero-line-art.png"
SVG = ROOT / "public" / "hero-line-art.svg"


def curve_to_d(curve) -> str:
    parts = [f"M {curve.start_point.x:.2f} {curve.start_point.y:.2f}"]
    for segment in curve:
        if segment.is_corner:
            parts.append(
                f"L {segment.c.x:.2f} {segment.c.y:.2f} "
                f"L {segment.end_point.x:.2f} {segment.end_point.y:.2f}"
            )
        else:
            parts.append(
                f"C {segment.c1.x:.2f} {segment.c1.y:.2f} "
                f"{segment.c2.x:.2f} {segment.c2.y:.2f} "
                f"{segment.end_point.x:.2f} {segment.end_point.y:.2f}"
            )
    return " ".join(parts)


def is_border_path(d: str) -> bool:
    return d.startswith("M 0.00 288.00") and "L 1024.00 576.00" in d


def main() -> None:
    img = Image.open(PNG).convert("RGBA")
    w, h = img.size
    alpha = np.array(img.split()[3])
    # White strokes on black for potrace (blacklevel=0.5)
    data = np.where(alpha > 30, 255, 0).astype(np.uint8)

    curves = potrace.Bitmap(data).trace(
        turdsize=0,
        alphamax=0.8,
        opttolerance=0.12,
    )
    path_ds: list[str] = []
    for curve in curves:
        d = curve_to_d(curve)
        if not is_border_path(d):
            path_ds.append(d)

    lines = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" fill="none">',
    ]
    for d in path_ds:
        lines.append(
            '  <path class="hero-line-art-path" '
            'stroke="currentColor" stroke-width="1.5" '
            'stroke-linecap="round" stroke-linejoin="round" '
            f'd="{d}"/>'
        )
    lines.append("</svg>")
    SVG.write_text("\n".join(lines), encoding="utf-8")

    json_path = ROOT / "src" / "data" / "hero-line-art-paths.json"
    json_path.parent.mkdir(parents=True, exist_ok=True)
    import json

    json_path.write_text(json.dumps(path_ds, separators=(",", ":")), encoding="utf-8")
    print(f"Wrote {SVG} ({len(path_ds)} paths, {w}x{h})")
    print(f"Wrote {json_path}")


if __name__ == "__main__":
    main()
