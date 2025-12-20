Feature: Daily Question UX Optimization
  As a user seeking daily astrological guidance
  I want a seamless, high-value interaction with Peixuan
  So that I can receive personalized insights without confusion or accidental waste of my daily quota

  Rule: Simplicity and "Don't Make Me Think"

  Scenario: User accesses the Daily Question interface
    Given I am on the "Daily Question" view
    And I have not asked a question today
    Then I should see "Quick Prompt" chips including "How is my luck today?" and "Major decisions?"
    And clicking a chip should populate the input field automatically

  Scenario: User attempts to use the feature without a Bazi chart
    Given I have not set up my birth data
    When I navigate to the "Daily Question" view
    Then I should not be redirected to the full Unified View
    But I should see a "Quick Setup" modal within the current view
    And the modal should ask only for essential birth data (Date, Time, Location)

  Rule: Transparency and Feedback

  Scenario: System processes a user query
    Given I have submitted a question
    When the system is in the "REASONING" state
    Then the status indicator should display "Peixuan is carefully considering..."
    When the system transitions to "FETCHING_DATA"
    Then the status indicator should display "Retrieving your chart data..."

  Rule: Strategic Friction and Daily Limit Protection

  Scenario: User attempts to submit a query
    Given I have 1 daily question remaining
    When I type a question and press enter
    Then I should see a confirmation prompt: "This is your only question for today. Continue?"
    And the question count should not decrease until I confirm

  Scenario: User submits a low-quality query (Optional Safeguard)
    Given I enter a query with less than 3 characters (e.g., "Hi")
    When I attempt to submit
    Then the system should block the submission
    And Peixuan should gently prompt: "Please ask a specific question to get the most out of your daily reading."

  Rule: Immersive Error Handling

  Scenario: User exceeds daily limit
    Given I have already asked my question for today
    When I attempt to ask another question
    Then I should not see a generic system alert
    But Peixuan should reply in the chat interface: "I've focused all my energy on your previous reading. Let's talk again tomorrow!"
