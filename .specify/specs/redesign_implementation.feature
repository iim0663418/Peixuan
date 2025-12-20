I will create the Gherkin feature file at `.specify/specs/redesign_v2.feature` detailing the redesign requirements and user scenarios.

I will use `run_shell_command` to create the feature file since `write_file` is not available.

Feature: Luminous Guide Redesign (v2.0)
  In order to shift from a "Tool" to a "Companion"
  As a product team
  We want to implement a narrative-driven, simplified user experience ("The Oracle, Not The Spreadsheet")

  Background:
    Given the application is loaded
    And the user is on the main landing page

  # Phase 1: The Great Simplification
  Rule: Zero Friction Onboarding
    Scenario: Default Simplified Input View
      Then the "Name" input should be visible
      And the "Birth Date/Time" picker should be visible
      And the "City Search" input should be visible
      But the "Latitude" input should be hidden
      And the "Longitude" input should be hidden
      And the "Timezone" selector should be hidden
      And the "Solar Time Correction" toggle should be hidden

    Scenario: Reveal Advanced Coordinate Inputs
      When I click the "Manual Coordinate Entry" link
      Then the "Latitude" input should become visible
      And the "Longitude" input should become visible
      And the "Timezone" selector should become visible

    Scenario: Ambiguous Location Fallback (Geocoding Failure)
      Given I have entered "London" in the City Search
      When I submit the form
      And the geocoding service returns multiple results (e.g., "London, UK", "London, Ontario")
      Then a modal "Did you mean?" should appear
      And I should see a list containing "London, UK" and "London, Ontario"
      When I select "London, UK"
      Then the form should automatically submit with the coordinates for "London, UK"

  # Phase 1 & 2: The Luminous Dashboard & Narrative Shift
  Rule: Dashboard Hierarchy and Progressive Disclosure
    Scenario: Mobile-First Hierarchy
      When the results load
      Then the "Narrative Summary" (Zone 1) should be at the top
      And the "Weather Report" stars (Zone 2) should be below the summary
      And the "Daily Question" panel (Zone 3) should be below the stars
      And the "Deep Dive" charts (Zone 4) should be collapsed by default

    Scenario: Tab Reorganization
      Then I should see the "Life Path" tab
      And I should see the "Daily Insight" tab
      But I should not see the "Developer" tab

    Scenario: Narrative Summary Display (Phase 2)
      When the analysis is complete
      Then the "NarrativeSummary" component should display a natural language insight
      And the text should use a serif font for the "Oracle Voice"

  # Phase 3: Conversational Interaction
  Rule: Daily Question Experience
    Scenario: Pre-Input Quota Visualization
      Given I am on the "Daily Insight" section
      Then I should see text "Daily Insight Quota: 1/1"
      And I should see suggested question chips like "Is today good for signing contracts?"

    Scenario: Semantic Loading States
      When I submit a daily question
      Then the loading indicator should display "Calculating Star Positions..."
      And after 2 seconds it should display "Consulting the Oracle..."
      And after 4 seconds it should display "Formulating Answer..."

  # Special Requirement: Hidden Developer Tools
  Rule: Developer Mode Access
    Scenario: Toggle Developer Tab
      Given the "Developer" tab is hidden
      When I press "Control+Shift+D"
      Then the "Developer" tab should become visible
      And I should be able to navigate to technical details
