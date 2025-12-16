Feature: Cloudflare Worker TypeScript Global Types Fix

  As a developer working on Cloudflare Workers
  I want standard Web API global types to be available in TypeScript
  So that I can write type-safe code without compilation errors

  Scenario: ReadableStream types are correctly available
    Given a Cloudflare Worker project configured for TypeScript
    When I use ReadableStream in my worker code
    Then the TypeScript compiler should recognize ReadableStream type definitions
    And the build process should succeed without type errors related to ReadableStream

  Scenario: AbortController types are correctly available
    Given a Cloudflare Worker project configured for TypeScript
    When I use AbortController in my worker code
    Then the TypeScript compiler should recognize AbortController type definitions
    And the build process should succeed without type errors related to AbortController

  Scenario: Common Web API types (fetch, console, setTimeout) are correctly available
    Given a Cloudflare Worker project configured for TypeScript
    When I use fetch, console, and setTimeout in my worker code
    Then the TypeScript compiler should recognize their type definitions
    And the build process should succeed without type errors related to these Web APIs

  Scenario: Build succeeds without any global type errors
    Given a Cloudflare Worker project configured for TypeScript
    When I run the TypeScript build process for the worker
    Then the build process should complete successfully
    And there should be no global type errors reported by the TypeScript compiler