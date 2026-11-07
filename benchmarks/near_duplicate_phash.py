"""Automatic near-duplicate keys from image content (reviewer request, SOFTX-D-26-01381 R1.4).

Computes a 64-bit perceptual hash (DCT pHash, `imagehash` package) for the eight bundled Cooper Hewitt
photographs and for five re-encoded copies of each (JPEG quality 50, 50 % downscale, 90 % centre crop,
+20 % brightness, 3-degree rotation), groups images whose hashes differ by at most T bits, and reports
which groups form. The groups are what a curator would write into duplicate_group_id / phash before the
split validator runs. Optional research script: requires Python 3 with Pillow and imagehash; the
application itself still has no dependencies.

Run: python benchmarks/near_duplicate_phash.py [--json out.json]
"""
import itertools, json, sys
from pathlib import Path
from PIL import Image, ImageEnhance
import imagehash

SRC = Path(__file__).resolve().parent.parent / "src" / "data" / "public_dataset_sources" / "chndm_hemp_textile_jp"
THRESHOLDS = [6, 10, 14, 18]

def variants(img):
    w, h = img.size
    out = {}
    import io
    buf = io.BytesIO(); img.save(buf, "JPEG", quality=50); buf.seek(0); out["jpeg50"] = Image.open(buf).convert("RGB")
    out["half"] = img.resize((max(1, w // 2), max(1, h // 2)))
    out["crop90"] = img.crop((int(w * .05), int(h * .05), int(w * .95), int(h * .95)))
    out["bright"] = ImageEnhance.Brightness(img).enhance(1.2)
    out["rot3"] = img.rotate(3, expand=False, fillcolor=(255, 255, 255))
    return out

def groups(items, t):
    parent = list(range(len(items)))
    def find(i):
        while parent[i] != i:
            parent[i] = parent[parent[i]]; i = parent[i]
        return i
    for i, j in itertools.combinations(range(len(items)), 2):
        if items[i]["hash"] - items[j]["hash"] <= t:
            parent[find(i)] = find(j)
    g = {}
    for i in range(len(items)):
        g.setdefault(find(i), []).append(i)
    return list(g.values())

items = []
for f in sorted(SRC.glob("*.jpg")):
    img = Image.open(f).convert("RGB")
    obj = "2001-2-1" if "2001-2-1" in f.name else f.name.split("_")[1]
    items.append({"image": f.stem, "copy": "original", "object": obj, "hash": imagehash.phash(img)})
    for name, v in variants(img).items():
        items.append({"image": f.stem, "copy": name, "object": obj, "hash": imagehash.phash(v)})

originals = [i for i in items if i["copy"] == "original"]
pair = {}
for a, b in itertools.combinations(originals, 2):
    pair[f"{a['image']}~{b['image']}"] = int(a["hash"] - b["hash"])
copy_dist = [int(i["hash"] - next(o for o in originals if o["image"] == i["image"])["hash"]) for i in items if i["copy"] != "original"]

report = {"images": len(originals), "copies": len(items) - len(originals), "copy_to_source_bits": {"max": int(max(copy_dist)), "mean": round(sum(copy_dist) / len(copy_dist), 1)},
          "same_object_view_bits": {k: v for k, v in pair.items() if "2001-2-1" in k.split("~")[0] and "2001-2-1" in k.split("~")[1]},
          "different_object_min_bits": min(v for k, v in pair.items() if not ("2001-2-1" in k.split("~")[0] and "2001-2-1" in k.split("~")[1])),
          "thresholds": []}
for t in THRESHOLDS:
    gs = groups(items, t)
    copies_with_source = sum(1 for i, it in enumerate(items) if it["copy"] != "original" and any(i in g and any(items[j]["image"] == it["image"] and items[j]["copy"] == "original" for j in g) for g in gs))
    view_groups = [sorted({items[j]["image"] for j in g}) for g in gs]
    mixed_objects = sum(1 for g in gs if len({items[j]["object"] for j in g}) > 1)
    report["thresholds"].append({"T": t, "copies_grouped_with_source": f"{copies_with_source}/{len(items) - len(originals)}",
        "groups": len(gs), "groups_spanning_objects": mixed_objects,
        "views_of_2001-2-1_grouped_together": [v for v in view_groups if len(v) > 1 and all("2001-2-1" in x for x in v)]})
print(json.dumps(report, indent=2, default=str))
if "--json" in sys.argv:
    Path(sys.argv[sys.argv.index("--json") + 1]).write_text(json.dumps(report, indent=2, default=str))
