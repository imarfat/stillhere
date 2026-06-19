from PIL import Image

path = r"d:\stillherenew2\public\hero-line-art.png"

img = Image.open(path).convert("RGBA")
pixels = img.load()
w, h = img.size

for y in range(h):
    for x in range(w):
        r, g, b, _a = pixels[x, y]
        mx = max(r, g, b)
        mn = min(r, g, b)
        warmth = r - b
        neutral = (mx - mn) < 12

        if mx < 48 and neutral:
            pixels[x, y] = (r, g, b, 0)
            continue

        if warmth >= 12 and mx >= 50:
            pixels[x, y] = (r, g, b, 255)
            continue

        if warmth > 6 and mx >= 35:
            alpha = int(min(255, max(0, (mx - 28) * 4 + warmth * 2)))
            pixels[x, y] = (r, g, b, alpha)
            continue

        pixels[x, y] = (r, g, b, 0)

img.save(path, "PNG")
print(f"Saved {path} as RGBA {img.size}")

alphas = [p[3] for p in img.getdata()]
print(f"transparent: {sum(1 for a in alphas if a == 0)}")
print(f"opaque: {sum(1 for a in alphas if a == 255)}")
print(f"partial: {sum(1 for a in alphas if 0 < a < 255)}")
