"""Generate original printable SpotDiffs PDF products.

The artwork is deliberately built from vector primitives so every puzzle is
sharp when printed and all source material is owned by this project.
"""

from __future__ import annotations

import math
import random
from dataclasses import dataclass
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import letter
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from pypdf import PdfReader, PdfWriter


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "private" / "printables"
PAGE_WIDTH, PAGE_HEIGHT = letter


@dataclass(frozen=True)
class ProductSpec:
    slug: str
    title: str
    subtitle: str
    puzzle_count: int
    differences: int
    difficulty: str
    accent: str
    themes: tuple[str, ...]


PRODUCTS = (
    ProductSpec(
        slug="free-printable-starter-pack",
        title="Free Printable Starter Pack",
        subtitle="Three screen-free puzzles for home, travel, or class",
        puzzle_count=3,
        differences=5,
        difficulty="Easy",
        accent="#F97316",
        themes=("Sunny Park", "Ocean Friends", "School Day"),
    ),
    ProductSpec(
        slug="preschool-animal-adventures",
        title="Preschool Animal Adventures",
        subtitle="Twelve friendly visual puzzles for ages 3-6",
        puzzle_count=12,
        differences=5,
        difficulty="Easy",
        accent="#10B981",
        themes=("Farm", "Jungle", "Ocean", "Forest"),
    ),
    ProductSpec(
        slug="classroom-seasons-bundle",
        title="Classroom Seasons Bundle",
        subtitle="Twenty ready-to-print seasonal brain breaks",
        puzzle_count=20,
        differences=7,
        difficulty="Easy to Medium",
        accent="#8B5CF6",
        themes=("Spring", "Summer", "Autumn", "Winter", "School"),
    ),
    ProductSpec(
        slug="adult-hard-visual-challenge",
        title="Adult Hard Visual Challenge",
        subtitle="Thirty dense puzzles for adults and teens",
        puzzle_count=30,
        differences=10,
        difficulty="Hard",
        accent="#2563EB",
        themes=("Geometric", "City", "Workshop", "Garden"),
    ),
)


PALETTE = (
    "#F97316",
    "#FACC15",
    "#22C55E",
    "#14B8A6",
    "#3B82F6",
    "#8B5CF6",
    "#EC4899",
    "#64748B",
)


def draw_star(pdf: canvas.Canvas, x: float, y: float, radius: float, fill: str) -> None:
    points: list[tuple[float, float]] = []
    for index in range(10):
        angle = math.pi / 2 + index * math.pi / 5
        current_radius = radius if index % 2 == 0 else radius * 0.45
        points.append(
            (x + math.cos(angle) * current_radius, y + math.sin(angle) * current_radius)
        )

    path = pdf.beginPath()
    path.moveTo(*points[0])
    for point in points[1:]:
        path.lineTo(*point)
    path.close()
    pdf.setFillColor(HexColor(fill))
    pdf.setStrokeColor(HexColor("#334155"))
    pdf.setLineWidth(0.8)
    pdf.drawPath(path, fill=1, stroke=1)


def draw_item(
    pdf: canvas.Canvas,
    x: float,
    y: float,
    size: float,
    shape: int,
    fill: str,
) -> None:
    pdf.setStrokeColor(HexColor("#334155"))
    pdf.setLineWidth(0.8)
    pdf.setFillColor(HexColor(fill))

    if shape == 0:
        pdf.circle(x, y, size * 0.42, fill=1, stroke=1)
    elif shape == 1:
        pdf.roundRect(
            x - size * 0.4,
            y - size * 0.4,
            size * 0.8,
            size * 0.8,
            size * 0.14,
            fill=1,
            stroke=1,
        )
    elif shape == 2:
        path = pdf.beginPath()
        path.moveTo(x, y + size * 0.46)
        path.lineTo(x - size * 0.45, y - size * 0.38)
        path.lineTo(x + size * 0.45, y - size * 0.38)
        path.close()
        pdf.drawPath(path, fill=1, stroke=1)
    elif shape == 3:
        draw_star(pdf, x, y, size * 0.47, fill)
    elif shape == 4:
        pdf.ellipse(
            x - size * 0.47,
            y - size * 0.3,
            x + size * 0.47,
            y + size * 0.3,
            fill=1,
            stroke=1,
        )
    else:
        pdf.setLineWidth(size * 0.22)
        pdf.setLineCap(1)
        pdf.setStrokeColor(HexColor(fill))
        pdf.line(x - size * 0.3, y - size * 0.3, x + size * 0.3, y + size * 0.3)
        pdf.line(x - size * 0.3, y + size * 0.3, x + size * 0.3, y - size * 0.3)
        pdf.setLineCap(0)


def scene_layout(spec: ProductSpec) -> tuple[int, int]:
    if spec.differences >= 10:
        return (7, 5)
    if spec.differences >= 7:
        return (6, 4)
    return (5, 4)


def puzzle_data(spec: ProductSpec, puzzle_index: int) -> tuple[list[dict], set[int]]:
    rng = random.Random(f"{spec.slug}:{puzzle_index}")
    cols, rows = scene_layout(spec)
    items: list[dict] = []
    for _ in range(cols * rows):
        items.append(
            {
                "shape": rng.randrange(6),
                "color": rng.randrange(len(PALETTE)),
                "size": rng.uniform(0.72, 1.0),
                "rotation": rng.randrange(4),
            }
        )
    changed = set(rng.sample(range(len(items)), spec.differences))
    return items, changed


def draw_scene(
    pdf: canvas.Canvas,
    spec: ProductSpec,
    puzzle_index: int,
    x: float,
    y: float,
    width: float,
    height: float,
    changed_version: bool,
    show_answers: bool,
) -> None:
    items, changed = puzzle_data(spec, puzzle_index)
    cols, rows = scene_layout(spec)
    padding = 18
    cell_w = (width - padding * 2) / cols
    cell_h = (height - padding * 2) / rows
    base_size = min(cell_w, cell_h) * 0.66

    pdf.setFillColor(HexColor("#FFFDF8"))
    pdf.setStrokeColor(HexColor("#CBD5E1"))
    pdf.setLineWidth(1.2)
    pdf.roundRect(x, y, width, height, 12, fill=1, stroke=1)

    for row in range(rows):
        for col in range(cols):
            item_index = row * cols + col
            item = items[item_index]
            cx = x + padding + cell_w * (col + 0.5)
            cy = y + height - padding - cell_h * (row + 0.5)

            shape = item["shape"]
            color_index = item["color"]
            if changed_version and item_index in changed:
                if item_index % 3 == 0:
                    shape = (shape + 1) % 6
                elif item_index % 3 == 1:
                    color_index = (color_index + 2) % len(PALETTE)
                else:
                    shape = (shape + 3) % 6
                    color_index = (color_index + 1) % len(PALETTE)

            pdf.saveState()
            pdf.translate(cx, cy)
            pdf.rotate(item["rotation"] * 90)
            draw_item(
                pdf,
                0,
                0,
                base_size * item["size"],
                shape,
                PALETTE[color_index],
            )
            pdf.restoreState()

            if changed_version and show_answers and item_index in changed:
                pdf.setStrokeColor(HexColor("#DC2626"))
                pdf.setLineWidth(2.4)
                pdf.setFillColor(colors.transparent)
                pdf.circle(cx, cy, base_size * 0.62, fill=0, stroke=1)


def draw_header(pdf: canvas.Canvas, spec: ProductSpec, label: str) -> None:
    pdf.setFillColor(HexColor(spec.accent))
    pdf.rect(0, PAGE_HEIGHT - 58, PAGE_WIDTH, 58, fill=1, stroke=0)
    pdf.setFillColor(colors.white)
    pdf.setFont("Helvetica-Bold", 17)
    pdf.drawString(38, PAGE_HEIGHT - 36, spec.title)
    pdf.setFont("Helvetica-Bold", 9)
    pdf.drawRightString(PAGE_WIDTH - 38, PAGE_HEIGHT - 34, label.upper())


def draw_footer(pdf: canvas.Canvas, page_number: int) -> None:
    pdf.setFillColor(HexColor("#64748B"))
    pdf.setFont("Helvetica", 8)
    pdf.drawString(38, 22, "SpotDiffs.com - Personal and classroom use")
    pdf.drawRightString(PAGE_WIDTH - 38, 22, f"Page {page_number}")


def draw_cover(pdf: canvas.Canvas, spec: ProductSpec) -> None:
    accent = HexColor(spec.accent)
    pdf.setFillColor(HexColor("#FFFDF8"))
    pdf.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, fill=1, stroke=0)
    pdf.setFillColor(accent)
    pdf.roundRect(42, PAGE_HEIGHT - 230, PAGE_WIDTH - 84, 148, 28, fill=1, stroke=0)
    pdf.setFillColor(colors.white)
    pdf.setFont("Helvetica-Bold", 28)
    title_lines = spec.title.split()
    midpoint = max(1, len(title_lines) // 2)
    pdf.drawCentredString(PAGE_WIDTH / 2, PAGE_HEIGHT - 142, " ".join(title_lines[:midpoint]))
    pdf.drawCentredString(PAGE_WIDTH / 2, PAGE_HEIGHT - 178, " ".join(title_lines[midpoint:]))
    pdf.setFont("Helvetica", 12)
    pdf.drawCentredString(PAGE_WIDTH / 2, PAGE_HEIGHT - 208, spec.subtitle)

    pdf.setFillColor(HexColor("#0F172A"))
    pdf.setFont("Helvetica-Bold", 18)
    pdf.drawCentredString(PAGE_WIDTH / 2, PAGE_HEIGHT - 302, "PRINT • PLAY • CHECK")
    pdf.setFont("Helvetica", 12)
    details = (
        f"{spec.puzzle_count} puzzles",
        f"{spec.differences} differences per puzzle",
        f"{spec.puzzle_count} complete answer keys",
        f"Difficulty: {spec.difficulty}",
        "US Letter • A4-friendly with Fit to Page",
    )
    for index, detail in enumerate(details):
        y = PAGE_HEIGHT - 350 - index * 34
        pdf.setFillColor(accent)
        pdf.circle(138, y + 3, 5, fill=1, stroke=0)
        pdf.setFillColor(HexColor("#334155"))
        pdf.drawString(158, y, detail)

    pdf.setStrokeColor(HexColor("#CBD5E1"))
    pdf.line(92, 220, PAGE_WIDTH - 92, 220)
    pdf.setFont("Helvetica-Bold", 11)
    pdf.setFillColor(HexColor("#0F172A"))
    pdf.drawCentredString(PAGE_WIDTH / 2, 190, "HOW TO USE")
    pdf.setFont("Helvetica", 10)
    pdf.setFillColor(HexColor("#475569"))
    pdf.drawCentredString(
        PAGE_WIDTH / 2,
        168,
        "Print at Actual Size or Fit to Page. Circle every change in the second picture.",
    )
    pdf.drawCentredString(
        PAGE_WIDTH / 2,
        150,
        "Answer pages follow the puzzle pages. No physical product will be shipped.",
    )
    pdf.setFont("Helvetica-Bold", 13)
    pdf.setFillColor(accent)
    pdf.drawCentredString(PAGE_WIDTH / 2, 84, "SPOTDIFFS.COM")
    draw_footer(pdf, 1)


def draw_puzzle_page(pdf: canvas.Canvas, spec: ProductSpec, puzzle_index: int, page_number: int) -> None:
    theme = spec.themes[puzzle_index % len(spec.themes)]
    draw_header(pdf, spec, f"Puzzle {puzzle_index + 1}")
    pdf.setFillColor(HexColor("#0F172A"))
    pdf.setFont("Helvetica-Bold", 15)
    pdf.drawString(38, PAGE_HEIGHT - 92, f"{theme} Challenge")
    pdf.setFillColor(HexColor("#475569"))
    pdf.setFont("Helvetica", 10)
    pdf.drawString(
        38,
        PAGE_HEIGHT - 110,
        f"Find and circle {spec.differences} differences in the second picture.",
    )
    draw_scene(pdf, spec, puzzle_index, 38, 388, PAGE_WIDTH - 76, 265, False, False)
    draw_scene(pdf, spec, puzzle_index, 38, 92, PAGE_WIDTH - 76, 265, True, False)
    draw_footer(pdf, page_number)


def draw_answer_page(pdf: canvas.Canvas, spec: ProductSpec, puzzle_index: int, page_number: int) -> None:
    theme = spec.themes[puzzle_index % len(spec.themes)]
    draw_header(pdf, spec, f"Answer {puzzle_index + 1}")
    pdf.setFillColor(HexColor("#0F172A"))
    pdf.setFont("Helvetica-Bold", 15)
    pdf.drawString(38, PAGE_HEIGHT - 92, f"{theme} Answer Key")
    pdf.setFillColor(HexColor("#475569"))
    pdf.setFont("Helvetica", 10)
    pdf.drawString(38, PAGE_HEIGHT - 110, "The differences are circled in red.")
    draw_scene(pdf, spec, puzzle_index, 38, 388, PAGE_WIDTH - 76, 265, False, False)
    draw_scene(pdf, spec, puzzle_index, 38, 92, PAGE_WIDTH - 76, 265, True, True)
    draw_footer(pdf, page_number)


def generate_product(spec: ProductSpec) -> Path:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    output_path = OUTPUT_DIR / f"{spec.slug}.pdf"
    pdf = canvas.Canvas(str(output_path), pagesize=letter, pageCompression=1)
    pdf.setTitle(spec.title)
    pdf.setAuthor("SpotDiffs")
    pdf.setSubject("Printable spot the difference puzzles with answer keys")
    pdf.setCreator("SpotDiffs.com")

    draw_cover(pdf, spec)
    pdf.showPage()
    page_number = 2
    for puzzle_index in range(spec.puzzle_count):
        draw_puzzle_page(pdf, spec, puzzle_index, page_number)
        pdf.showPage()
        page_number += 1
    for puzzle_index in range(spec.puzzle_count):
        draw_answer_page(pdf, spec, puzzle_index, page_number)
        if puzzle_index != spec.puzzle_count - 1:
            pdf.showPage()
        page_number += 1
    pdf.save()
    return output_path


def write_pdf_subset(
    source_path: Path,
    output_path: Path,
    page_indexes: tuple[int, ...],
    title: str,
) -> Path:
    reader = PdfReader(source_path)
    writer = PdfWriter()
    for page_index in page_indexes:
        writer.add_page(reader.pages[page_index])
    writer.add_metadata(
        {
            "/Title": title,
            "/Author": "SpotDiffs",
            "/Subject": "Printable spot the difference PDF",
            "/Creator": "SpotDiffs.com",
        }
    )
    with output_path.open("wb") as output:
        writer.write(output)
    return output_path


def generate_download_files(spec: ProductSpec, combined_path: Path) -> tuple[Path, Path]:
    puzzle_path = OUTPUT_DIR / f"{spec.slug}-puzzles.pdf"
    answer_path = OUTPUT_DIR / f"{spec.slug}-answer-keys.pdf"
    puzzle_pages = tuple(range(0, spec.puzzle_count + 1))
    answer_pages = (0, *range(spec.puzzle_count + 1, spec.puzzle_count * 2 + 1))
    return (
        write_pdf_subset(
            combined_path,
            puzzle_path,
            puzzle_pages,
            f"{spec.title} - Puzzle Pack",
        ),
        write_pdf_subset(
            combined_path,
            answer_path,
            answer_pages,
            f"{spec.title} - Answer Keys",
        ),
    )


def main() -> None:
    for product in PRODUCTS:
        output_path = generate_product(product)
        print(output_path)
        for download_path in generate_download_files(product, output_path):
            print(download_path)


if __name__ == "__main__":
    main()
