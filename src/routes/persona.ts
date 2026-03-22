/**
 * Persona resource endpoints
 * Returns persona definitions for LLM initialization
 */

import { json } from 'itty-router';
import characterMd from '../persona/character.md';
import personalityGuideMd from '../persona/personality-guide.md';
import fortuneGuideMd from '../persona/fortune-guide.md';
import glossaryMd from '../persona/glossary.md';

export function handleGetPersona() {
  return json({
    name: 'Peixuan (佩璇)',
    description: 'Chinese astrology consultant persona — paste into your system prompt',
    content: characterMd,
    usage: 'Add this to your LLM system prompt to role-play as Peixuan',
  });
}

export function handleGetGuide(type: 'personality' | 'fortune') {
  return () => {
    const content = type === 'personality' ? personalityGuideMd : fortuneGuideMd;
    return json({
      type,
      description: `${type} analysis guide for LLM interpretation`,
      content,
    });
  };
}

export function handleGetGlossary() {
  return json({
    description: 'Chinese astrology terminology reference',
    content: glossaryMd,
  });
}
