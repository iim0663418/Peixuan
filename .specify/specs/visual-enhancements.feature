Feature: Phase 1 Visual Enhancements for Narrative Immersion
  As a user seeking guidance
  I want the AI analysis to feel like a natural conversation with visual depth
  So that I can better digest the information and feel the emotional resonance of the reading

  Background:
    Given the application is in the "Unified AI Analysis" view
    And the CSS variable system is fully loaded
    And the custom Markdown renderer is active

  Scenario: Punctuation-aware Typewriter Pacing
    Given the AI is streaming a response
    When the typewriter effect encounters a punctuation mark
    Then the typing speed should adjust dynamically
    And commas "，" or "," should trigger a short pause (approx. 200ms)
    And periods "。" or "." should trigger a medium pause (approx. 400ms)
    And paragraph breaks should trigger a significant pause (approx. 800ms)
    But regular characters should maintain the base typing speed

  Scenario: Semantic Keyword Highlighting
    Given the AI response contains astrological terminology
    When the Markdown is parsed and rendered
    Then positive terms (e.g., "吉", "祿", "權") should be wrapped in a "highlight-positive" style
    And negative/warning terms (e.g., "忌", "沖", "煞") should be wrapped in a "highlight-caution" style
    And technical terms (e.g., "命宮", "太歲") should be wrapped in a "highlight-neutral" style
    And these styles should utilize the existing design token colors (e.g., --color-accent, --color-text-secondary)

  Scenario: Micro-interaction Hover Effects
    Given the analysis text is fully rendered
    When the user hovers over a highlighted keyword or star brightness element
    Then the element should subtly scale up (scale 1.05)
    And a soft glow shadow should appear matching the semantic color
    And the transition should be smooth (0.3s ease-out)
    And the interaction should respect "prefers-reduced-motion" settings
