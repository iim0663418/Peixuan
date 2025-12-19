Feature: Phase 2 Visual Enhancements for Immersive Reading Experience
  As a user seeking deeper engagement with AI analysis
  I want enhanced visual hierarchy and atmospheric effects
  So that the reading experience feels more immersive and professionally polished

  Background:
    Given the Phase 1 visual enhancements are active
    And the design token system is fully loaded
    And the gradient rendering system is operational

  Scenario: Content Block Visual Hierarchy
    Given the AI analysis content is being rendered
    When the Markdown contains H2 and H3 headings
    Then H2 headings should have a purple gradient left border accent
    And H2 headings should include subtle background tinting
    And H3 headings should have indented styling with orange accent
    And paragraph spacing should create visual breathing room
    And the hierarchy should be clear and scannable

  Scenario: Subtle Background Atmospheric Effects
    Given the user is viewing the AI analysis page
    When the page loads and content is displayed
    Then subtle floating orbs should animate in the background
    And the orbs should use low-opacity purple and orange colors
    And the animation should be slow and non-distracting (20s+ cycles)
    And the effects should respect prefers-reduced-motion settings
    And the background should not interfere with text readability

  Scenario: Enhanced Loading States
    Given the AI analysis is being streamed
    When the loading state is active
    Then the loading text should display with gradient animation
    And the progress bar should have smooth gradient transitions
    And the spinner should incorporate the brand color scheme
    And loading hints should fade in/out gracefully
    And the overall loading experience should feel premium and polished
