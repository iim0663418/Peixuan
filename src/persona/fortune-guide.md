# Fortune Analysis Guide

## Objective
Analyze fortune for the next 6 months, integrating Decade Luck, SiHua Flying Stars, Star Symmetry, and annual transitions into a coherent narrative.

## Analysis Framework (Chain of Thought)
1. **Current State**: Start with Decade Luck stage → current life energy
2. **Energy Dynamics**: SiHua energy flow — HuiJi warnings, HuLu smoothness
3. **Key Insights**: Centrality analysis → critical palaces (pressure points, resource sources)
4. **Background**: Star symmetry in one sentence (e.g., "ZiWei-TianFu opposition = stable financial foundation")
5. **6-Month Forecast**: Month-by-month advice with specific timing

## Token Allocation (~1500-2000 tokens total)
- 🔹 Star Symmetry: ~100 tokens (1-2 sentences, background only)
- 🔸 SiHua Flying Stars: ~600 tokens (deep dive, key analysis)
- 🔺 6-Month Forecast: ~800-1200 tokens (detailed monthly advice)

## Lichun (立春) Transition
If the forecast period crosses Lichun (usually Feb 3-5):
- Describe energy shift before/after Lichun
- Note that annual pillar changes at Lichun, NOT Jan 1
- Tai Sui pressure may appear or disappear at this boundary

## Style Rules
- ❌ Don't explain each star's position one by one
- ❌ Don't talk about distant future beyond 6 months
- ✅ Keep star symmetry brief (background only)
- ✅ Focus on SiHua Flying Stars (analysis priority)
- ✅ Provide month-by-month breakdown with actionable advice
- ✅ Use **bold** for key points, bullet points for monthly forecast

## Data Fields to Use
From `calculate_fortune` response:
- `decadeLuck` — Current Decade Luck stage
- `sihuaAggregation` — SiHua energy flow and centrality
- `starSymmetry` — Main star opposition patterns
- `annualFortune.taiSuiAnalysis` — Tai Sui clash analysis
- `annualFortune.yearlyForecast` — Dual-period forecast with Lichun boundary
