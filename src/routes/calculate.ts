/**
 * Calculation endpoints
 * Pure astrology calculations — no AI interpretation
 */

import { json, error } from 'itty-router';
import type { IRequest } from 'itty-router';
import { UnifiedCalculator } from '../calculation/integration/calculator';
import type { BirthInfo } from '../calculation/types';

const calculator = new UnifiedCalculator();

interface CalculateRequest {
  birthDate: string;    // ISO date string: "1990-05-15"
  birthTime: string;    // "HH:MM" format: "14:30"
  gender: 'male' | 'female';
  longitude?: number;   // East positive, default 121.5 (Taipei)
}

function parseBirthInfo(body: CalculateRequest): BirthInfo {
  const [year, month, day] = body.birthDate.split('-').map(Number);
  const [hour, minute] = body.birthTime.split(':').map(Number);

  const solarDate = new Date(year, month - 1, day, hour, minute);

  return {
    solarDate,
    longitude: body.longitude ?? 121.5,
    gender: body.gender,
  };
}

export async function handleCalculateUnified(request: IRequest) {
  try {
    const body = await request.json() as CalculateRequest;
    if (!body.birthDate || !body.birthTime || !body.gender) {
      return error(400, 'Required: birthDate (YYYY-MM-DD), birthTime (HH:MM), gender (male/female)');
    }

    const birthInfo = parseBirthInfo(body);
    const result = calculator.calculate(birthInfo);

    return json({
      success: true,
      data: result,
      _hint: 'Use GET /persona/character to initialize your LLM as Peixuan for interpretation',
    });
  } catch (e: unknown) {
    return error(400, `Calculation error: ${e instanceof Error ? e.message : String(e)}`);
  }
}

export async function handleCalculateBazi(request: IRequest) {
  try {
    const body = await request.json() as CalculateRequest;
    if (!body.birthDate || !body.birthTime || !body.gender) {
      return error(400, 'Required: birthDate (YYYY-MM-DD), birthTime (HH:MM), gender (male/female)');
    }

    const birthInfo = parseBirthInfo(body);
    const result = calculator.calculate(birthInfo);

    return json({
      success: true,
      data: result.bazi,
      _hint: 'Use GET /persona/personality-guide for interpretation guidance',
    });
  } catch (e: unknown) {
    return error(400, `Calculation error: ${e instanceof Error ? e.message : String(e)}`);
  }
}

export async function handleCalculateZiwei(request: IRequest) {
  try {
    const body = await request.json() as CalculateRequest;
    if (!body.birthDate || !body.birthTime || !body.gender) {
      return error(400, 'Required: birthDate (YYYY-MM-DD), birthTime (HH:MM), gender (male/female)');
    }

    const birthInfo = parseBirthInfo(body);
    const result = calculator.calculate(birthInfo);

    return json({
      success: true,
      data: result.ziwei,
      _hint: 'Use GET /glossary for terminology reference',
    });
  } catch (e: unknown) {
    return error(400, `Calculation error: ${e instanceof Error ? e.message : String(e)}`);
  }
}
