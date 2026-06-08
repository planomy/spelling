#!/usr/bin/env python3
"""Remove checkerboard backgrounds from icon PNGs via edge flood-fill."""

from collections import deque
from pathlib import Path

from PIL import Image

ICONS_DIR = Path(__file__).resolve().parent.parent / "public" / "icons"


def is_neutral_light(r: int, g: int, b: int) -> bool:
    if abs(r - g) > 18 or abs(g - b) > 18 or abs(r - b) > 18:
        return False
    return (r + g + b) / 3 >= 165


def colors_match(a: tuple[int, int, int], b: tuple[int, int, int], tol: int = 40) -> bool:
    return abs(a[0] - b[0]) + abs(a[1] - b[1]) + abs(a[2] - b[2]) <= tol


def remove_background(path: Path) -> None:
    img = Image.open(path).convert("RGBA")
    w, h = img.size
    px = img.load()
    visited = [[False] * w for _ in range(h)]
    queue: deque[tuple[int, int]] = deque()

    def try_seed(x: int, y: int) -> None:
        if visited[y][x]:
            return
        r, g, b, _ = px[x, y]
        if is_neutral_light(r, g, b):
            visited[y][x] = True
            queue.append((x, y))

    for x in range(w):
        try_seed(x, 0)
        try_seed(x, h - 1)
    for y in range(h):
        try_seed(0, y)
        try_seed(w - 1, y)

    while queue:
        x, y = queue.popleft()
        r, g, b, _ = px[x, y]
        px[x, y] = (r, g, b, 0)
        current = (r, g, b)

        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if nx < 0 or ny < 0 or nx >= w or ny >= h or visited[ny][nx]:
                continue
            nr, ng, nb, _ = px[nx, ny]
            neighbor = (nr, ng, nb)
            if is_neutral_light(nr, ng, nb) and colors_match(current, neighbor):
                visited[ny][nx] = True
                queue.append((nx, ny))

    img.save(path, "PNG")
    print(f"Processed {path.name}")


if __name__ == "__main__":
    for icon in sorted(ICONS_DIR.glob("*.png")):
        remove_background(icon)
