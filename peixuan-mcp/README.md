# peixuan-mcp

MCP server for Chinese astrology calculations (BaZi 八字 + Zi Wei Dou Shu 紫微斗數).

## Setup

### Claude Desktop / Kiro

Add to your MCP config:

```json
{
  "mcpServers": {
    "peixuan": {
      "command": "npx",
      "args": ["-y", "peixuan-mcp"]
    }
  }
}
```

### Tools

| Tool | Description |
|------|-------------|
| `calculate_chart` | Complete chart (BaZi + Zi Wei) |
| `calculate_bazi` | BaZi Four Pillars only |
| `calculate_ziwei` | Zi Wei Dou Shu only |

All tools accept: `birthDate` (YYYY-MM-DD), `birthTime` (HH:MM), `gender` (male/female), `longitude` (optional).

### Resources

| URI | Description |
|-----|-------------|
| `peixuan://persona/character` | Peixuan persona for system prompt |
| `peixuan://persona/personality-guide` | Personality interpretation guide |
| `peixuan://persona/fortune-guide` | Fortune interpretation guide |
| `peixuan://reference/glossary` | Chinese astrology terminology |

## License

CC BY-NC-SA 4.0
