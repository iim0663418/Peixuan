// yearlyInteractionUtils.ts

import {
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
  STEM_TO_ELEMENT,
  type HeavenlyStem,
  type EarthlyBranch,
  type BaziResult,
} from '../types/baziTypes';

// 地支關係介面
export interface BranchRelation {
  isClashing: boolean; // 沖
  isPunishing: boolean; // 刑
  isCombining: boolean; // 合
  isHarming: boolean; // 害
  relationDescription: string; // 關係描述文字
}

// 流年互動結果介面
export interface YearlyInteractionResult {
  yearStemInteractions: {
    pillarName: string;
    pillarStem: HeavenlyStem;
    relationType: string;
    description: string;
  }[];
  yearBranchInteractions: {
    pillarName: string;
    pillarBranch: EarthlyBranch;
    relations: BranchRelation;
  }[];
  significantInteractions: string[]; // 重要互動的文字描述
}

// 流年與四柱的對應名稱
type PillarName = 'yearPillar' | 'monthPillar' | 'dayPillar' | 'hourPillar';
const PILLAR_NAMES: Record<PillarName, string> = {
  yearPillar: '年柱',
  monthPillar: '月柱',
  dayPillar: '日柱',
  hourPillar: '時柱',
};

export class YearlyInteractionAnalyzer {
  // 天干五合
  private static HEAVENLY_STEM_COMBINATIONS: Record<
    HeavenlyStem,
    HeavenlyStem | null
  > = {
    甲: '己',
    乙: '庚',
    丙: '辛',
    丁: '壬',
    戊: '癸',
    己: '甲',
    庚: '乙',
    辛: '丙',
    壬: '丁',
    癸: '戊',
  };

  // 天干相沖
  private static HEAVENLY_STEM_CLASHES: Record<
    HeavenlyStem,
    HeavenlyStem | null
  > = {
    甲: '庚',
    乙: '辛',
    丙: '壬',
    丁: '癸',
    戊: null,
    己: null, // 戊己土無沖
    庚: '甲',
    辛: '乙',
    壬: '丙',
    癸: '丁',
  };

  // 地支六合
  private static EARTHLY_BRANCH_COMBINATIONS: Record<
    EarthlyBranch,
    EarthlyBranch
  > = {
    子: '丑',
    丑: '子',
    寅: '亥',
    亥: '寅',
    卯: '戌',
    戌: '卯',
    辰: '酉',
    酉: '辰',
    巳: '申',
    申: '巳',
    午: '未',
    未: '午',
  };

  // 地支六沖
  private static EARTHLY_BRANCH_CLASHES: Record<EarthlyBranch, EarthlyBranch> =
    {
      子: '午',
      午: '子',
      丑: '未',
      未: '丑',
      寅: '申',
      申: '寅',
      卯: '酉',
      酉: '卯',
      辰: '戌',
      戌: '辰',
      巳: '亥',
      亥: '巳',
    };

  // 地支相刑 (兩兩)
  // 寅巳申三刑: 寅刑巳, 巳刑申, 申刑寅
  // 丑未戌三刑: 丑刑戌, 戌刑未, 未刑丑
  // 子卯相刑
  private static EARTHLY_BRANCH_PUNISHMENTS: Record<
    EarthlyBranch,
    EarthlyBranch[]
  > = {
    子: ['卯'],
    卯: ['子'],
    寅: ['巳', '申'],
    巳: ['寅', '申'],
    申: ['寅', '巳'],
    丑: ['戌', '未'],
    未: ['丑', '戌'],
    戌: ['丑', '未'],
    辰: [],
    午: [],
    酉: [],
    亥: [], // 辰午酉亥自刑，此處不處理兩兩相刑
  };

  // 地支六害 (相穿)
  private static EARTHLY_BRANCH_HARMS: Record<EarthlyBranch, EarthlyBranch> = {
    子: '未',
    未: '子',
    丑: '午',
    午: '丑',
    寅: '巳',
    巳: '寅',
    卯: '辰',
    辰: '卯',
    申: '亥',
    亥: '申',
    酉: '戌',
    戌: '酉',
  };

  /**
   * 檢查兩個地支之間的關係：沖、刑、合、害
   */
  public static checkBranchRelations(
    branch1: EarthlyBranch,
    branch2: EarthlyBranch,
  ): BranchRelation {
    const relations: BranchRelation = {
      isClashing: false,
      isPunishing: false,
      isCombining: false,
      isHarming: false,
      relationDescription: '',
    };
    const descriptions: string[] = [];

    if (this.EARTHLY_BRANCH_CLASHES[branch1] === branch2) {
      relations.isClashing = true;
      descriptions.push(`${branch1}${branch2}相沖`);
    }
    if (this.EARTHLY_BRANCH_PUNISHMENTS[branch1]?.includes(branch2)) {
      relations.isPunishing = true;
      descriptions.push(`${branch1}${branch2}相刑`);
    }
    if (this.EARTHLY_BRANCH_COMBINATIONS[branch1] === branch2) {
      relations.isCombining = true;
      descriptions.push(`${branch1}${branch2}相合`);
    }
    if (this.EARTHLY_BRANCH_HARMS[branch1] === branch2) {
      relations.isHarming = true;
      descriptions.push(`${branch1}${branch2}相害`);
    }

    relations.relationDescription = descriptions.join('，');
    return relations;
  }

  /**
   * 分析流年與八字的互動
   */
  public static analyzeYearlyInteraction(
    bazi: BaziResult,
    yearlyFate: { stem: HeavenlyStem; branch: EarthlyBranch },
  ): YearlyInteractionResult {
    const result: YearlyInteractionResult = {
      yearStemInteractions: [],
      yearBranchInteractions: [],
      significantInteractions: [],
    };

    const pillars: PillarName[] = [
      'yearPillar',
      'monthPillar',
      'dayPillar',
      'hourPillar',
    ];

    // 分析天干互動
    for (const pillarName of pillars) {
      const pillar = bazi[pillarName];
      let relationType = '';
      let description = '';

      if (this.HEAVENLY_STEM_COMBINATIONS[yearlyFate.stem] === pillar.stem) {
        relationType = '合';
        description = `流年天干${yearlyFate.stem}與${PILLAR_NAMES[pillarName]}天干${pillar.stem}相合`;
      } else if (this.HEAVENLY_STEM_CLASHES[yearlyFate.stem] === pillar.stem) {
        relationType = '沖';
        description = `流年天干${yearlyFate.stem}與${PILLAR_NAMES[pillarName]}天干${pillar.stem}相沖`;
      }
      // 可以擴展其他天干關係，如生剋

      if (relationType) {
        result.yearStemInteractions.push({
          pillarName: PILLAR_NAMES[pillarName],
          pillarStem: pillar.stem,
          relationType,
          description,
        });
        result.significantInteractions.push(description);
      }
    }

    // 分析地支互動
    for (const pillarName of pillars) {
      const pillar = bazi[pillarName];
      const branchRelations = this.checkBranchRelations(
        yearlyFate.branch,
        pillar.branch,
      );
      if (
        branchRelations.isClashing ||
        branchRelations.isPunishing ||
        branchRelations.isCombining ||
        branchRelations.isHarming
      ) {
        result.yearBranchInteractions.push({
          pillarName: PILLAR_NAMES[pillarName],
          pillarBranch: pillar.branch,
          relations: branchRelations,
        });
        if (branchRelations.relationDescription) {
          result.significantInteractions.push(
            `流年地支${yearlyFate.branch}與${PILLAR_NAMES[pillarName]}地支${pillar.branch}：${branchRelations.relationDescription}`,
          );
        }
      }
    }
    return result;
  }

  /**
   * 獲取互動重點 (此方法暫時返回所有分析結果，可根據需求進一步篩選)
   */
  public static getInteractionHighlights(
    interactions: YearlyInteractionResult,
  ): string[] {
    return interactions.significantInteractions;
  }
}

// 示例用法 (可刪除或註釋掉)
/*
const sampleBazi: BaziResult = {
  yearPillar: { stem: '甲', branch: '子', stemElement: '木', branchElement: '水' },
  monthPillar: { stem: '丙', branch: '寅', stemElement: '火', branchElement: '木' },
  dayPillar: { stem: '戊', branch: '辰', stemElement: '土', branchElement: '土' },
  hourPillar: { stem: '庚', branch: '申', stemElement: '金', branchElement: '金' },
};

const sampleYearlyFate = { stem: '辛', branch: '巳' as EarthlyBranch };

const interactionResult = YearlyInteractionAnalyzer.analyzeYearlyInteraction(sampleBazi, sampleYearlyFate);
console.log('流年天干互動:', interactionResult.yearStemInteractions);
console.log('流年地支互動:', interactionResult.yearBranchInteractions);
console.log('重要互動提示:', YearlyInteractionAnalyzer.getInteractionHighlights(interactionResult));

// 測試地支關係
console.log(YearlyInteractionAnalyzer.checkBranchRelations('子', '午')); // 沖
console.log(YearlyInteractionAnalyzer.checkBranchRelations('寅', '巳')); // 刑、害
console.log(YearlyInteractionAnalyzer.checkBranchRelations('子', '丑')); // 合
console.log(YearlyInteractionAnalyzer.checkBranchRelations('卯', '辰')); // 害
*/
