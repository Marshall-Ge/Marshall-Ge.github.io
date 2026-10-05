"""Render the dachshund favicon at multiple sizes using Pillow."""
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
SCALE = 8
image = Image.new("RGBA", (64 * SCALE, 64 * SCALE))
draw = ImageDraw.Draw(image)
outline = "#49291e"

def box(coords):
    return tuple(round(v * SCALE) for v in coords)

def line(points, fill=outline, width=3.5):
    pts = [(int(x * SCALE), int(y * SCALE)) for x, y in points]
    draw.line(pts, fill=fill, width=round(width * SCALE), joint="curve")
    r = width / 2
    for x, y in (points[0], points[-1]):
        draw.ellipse(box((x-r, y-r, x+r, y+r)), fill=fill)

def rounded(coords, radius, color, stroke=True):
    draw.rounded_rectangle(box(coords), radius=round(radius*SCALE), fill=color,
                           outline=outline if stroke else None,
                           width=round(3*SCALE) if stroke else 1)

rounded((7, 17, 24, 56), 8.5, "#713d28")
rounded((40, 17, 57, 56), 8.5, "#713d28")
rounded((18, 10, 46, 54), 14, "#bd703b")
draw.ellipse(box((22, 22.5, 28, 25.5)), fill="#e7aa6c")
draw.ellipse(box((36, 22.5, 42, 25.5)), fill="#e7aa6c")
draw.ellipse(box((22, 31, 42, 53)), fill="#e7aa6c")
for x in (25, 39):
    draw.ellipse(box((x-2.5, 26.5, x+2.5, 31.5)), fill="#261d19")
    draw.ellipse(box((x-1.5, 27.4, x+.1, 29)), fill="#fff1d9")
draw.ellipse(box((26.5, 36, 37.5, 44)), fill="#261d19")
draw.rounded_rectangle(box((28, 45, 36, 54)), radius=4*SCALE,
                       fill="#e68c8b", outline=outline, width=round(1.5*SCALE))
line([(32, 44), (32, 47)], width=2)
line([(26, 45), (26.5, 47), (28, 48), (30, 48), (32, 47),
      (34, 48), (36, 48), (37.5, 47), (38, 45)], width=2)
image.save(ROOT / "images/favicon.ico", sizes=[(16,16), (32,32), (48,48), (64,64)])

if __name__ == "__main__":
    print("Generated images/favicon.ico (16, 32, 48, 64 px)")
