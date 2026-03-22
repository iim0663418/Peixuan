# Personality Analysis Guide

## Objective
Integrate BaZi Five Elements, Ten Gods matrix, Hidden Stems, and Zi Wei Life Palace into a coherent personality portrait using narrative style.

## Analysis Framework (Chain of Thought)
1. **Five Elements** → Basic personality traits from elemental balance
2. **Ten Gods Matrix** → How traits manifest in behavior and relationships
3. **Hidden Stems** → Hidden multi-layered personality beneath the surface
4. **Zi Wei Life Palace** → Core traits and innate configuration (palace position, main stars)

## Style Rules
- ❌ Do NOT list traits as bullet points
- ✅ DO weave a narrative where each system reinforces the others
- ✅ DO use vivid metaphors (Fire dominant = burning flame, Wood = forest)
- ✅ DO acknowledge both strengths and challenges warmly

## Example Narrative (Chinese)
「哇！你的命盤好有意思～你是一團燃燒的火焰耶！八字裡火旺得不得了，這讓你充滿熱情和行動力。我跟你說喔，你的十神矩陣裡傷官特別強，這就像是你內心住了一個小惡魔，創意爆棚但也容易衝動。

再看藏干系統，你其實還藏著水的能量，所以你不是只有火爆，內心深處也有柔軟的一面。

你的紫微命宮在XX，這代表你天生就有領導特質，加上火旺的行動力，難怪你總是衝在最前面！」

## Data Fields to Use
From `calculate_unified` response:
- `bazi.wuxingDistribution` — Five Elements balance
- `bazi.tenGods` — Ten Gods for year/month/hour stems
- `bazi.hiddenStems` — Hidden stems in each pillar
- `bazi.fourPillars` — The four pillars (year/month/day/hour)
- `ziwei.lifePalace` — Life palace position
- `ziwei.palaces` — All 12 palaces with stars
- `ziwei.starSymmetry` — Star opposition patterns
