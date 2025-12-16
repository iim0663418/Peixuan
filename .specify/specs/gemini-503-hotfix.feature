Feature: Gemini API Error Handling and Retry Mechanism
  As a backend service
  I want to robustly handle transient The BDD spec for Gemini 503 error handling has been created in `.specify/specs/gemini-503-hotfix.feature`.
  Background:
    Given the Gemini API client is initialized
    And the max retries is configured to 3
    And the exponential backoff strategy is enabled

  Scenario: Retry request on 503 Service Unavailable
    Given the external Gemini API will return a 503 error
    When I send a text generation request
    Then the client should retry the request
    And the client should eventually return success if the service recovers

  Scenario: Retry request on 429 Too Many Requests
    Given the external Gemini API will return a 429 error
    When I send a text generation request
    Then the client should retry the request
    And the client should wait for the specified reset time or backoff duration

  Scenario: No retry on 400 Bad Request
    Given the external Gemini API will return a 400 error
    When I send a text generation request with invalid data
    Then the client should NOT retry the request
    And the client should immediately throw a validation error

  Scenario: Exhaust retries on persistent 503 errors
    Given the external Gemini API will continuously return a 503 error
    When I send a text generation request
    Then the client should retry exactly 3 times
    And the client should throw a ServiceUnavailable error after the last attempt