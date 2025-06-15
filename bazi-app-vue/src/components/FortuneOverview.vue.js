import { computed } from 'vue';
const props = defineProps();
const emit = defineEmits();
// 星曜亮度等級映射
const brightnessLevels = {
    '廟': 5,
    '旺': 4,
    '得地': 3,
    '利益': 2,
    '平和': 1,
    '不得地': 0,
    '落陷': -1
};
// 格局類型映射
const patternTypes = {
    auspicious: ['紫府夾命格', '左右夾命格', '文昌文曲格', '財蔭夾印格', '殺破狼格', '機月同梁格'],
    inauspicious: ['日月反背格', '火鈴夾命格', '羊陀夾命格', '空劫夾命格']
};
// 分析個人天賦與特質
const personalTalents = computed(() => {
    const talents = [];
    if (!props.chartData?.palaces)
        return talents;
    // 遍歷所有宮位，識別天賦特質
    props.chartData.palaces.forEach(palace => {
        let score = 0;
        let keyStars = [];
        let talentType = '';
        // 檢查主星配置
        const mainStars = palace.stars.filter(star => star.type === 'main');
        const brightStars = mainStars.filter(star => star.brightness && brightnessLevels[star.brightness] >= 4);
        // 紫微斗數14主星天賦分析
        const leadershipStars = ['紫微', '天府']; // 領導型
        const intellectualStars = ['天機', '天梁']; // 智謀型
        const executiveStars = ['武曲', '破軍', '七殺']; // 執行型
        const creativityStars = ['貪狼', '廉貞']; // 創新型
        const communicationStars = ['太陽', '巨門']; // 溝通型
        const harmonyStars = ['太陰', '天同', '天相']; // 和諧型
        const foundSpecialStars = mainStars.filter(star => [leadershipStars, intellectualStars, executiveStars, creativityStars, communicationStars, harmonyStars]
            .flat().includes(star.name));
        if (foundSpecialStars.length > 0) {
            // 根據星曜類型和亮度調整分數
            foundSpecialStars.forEach(star => {
                let starScore = 3;
                if (star.brightness && brightnessLevels[star.brightness] >= 4) {
                    starScore = 5; // 廟旺星增加分數
                }
                else if (star.brightness && brightnessLevels[star.brightness] <= 1) {
                    starScore = 1; // 失陷星減少分數
                }
                score += starScore;
            });
            keyStars.push(...foundSpecialStars.map(star => star.name));
        }
        // 檢查吉星輔助
        const auspiciousStars = palace.stars.filter(star => star.attribute === '吉');
        if (auspiciousStars.length > 0) {
            score += auspiciousStars.length;
            keyStars.push(...auspiciousStars.map(star => star.name));
        }
        // 檢查四化祿權
        const transformedStars = palace.stars.filter(star => star.transformations?.some(t => ['祿', '權'].includes(t)));
        if (transformedStars.length > 0) {
            score += transformedStars.length * 2;
        }
        // 檢查能量流動
        const energyFlow = props.transformationFlows?.[palace.index];
        if (energyFlow && energyFlow.energyScore > 2) {
            score += Math.floor(energyFlow.energyScore / 2);
        }
        // 如果分數足夠高，加入天賦列表
        if (score >= 4 && keyStars.length > 0) {
            const level = Math.min(5, Math.ceil(score / 3));
            talents.push({
                palaceName: palace.name,
                palaceZhi: palace.zhi,
                palaceIndex: palace.index,
                coreTalent: getCoreTalent(palace.name, keyStars),
                description: getTalentDescription(palace.name, keyStars),
                keyStars: keyStars.slice(0, 3), // 限制顯示3個關鍵星曜
                level
            });
        }
    });
    // 按等級排序，取前3個
    return talents.sort((a, b) => b.level - a.level).slice(0, 3);
});
// 分析潛能發掘與發展建議
const potentialDevelopment = computed(() => {
    const potentials = [];
    if (!props.chartData?.palaces)
        return potentials;
    // 遍歷所有宮位，識別潛能發展空間
    props.chartData.palaces.forEach(palace => {
        let score = 0;
        let potentialTypes = [];
        const mainStars = palace.stars.filter(star => star.type === 'main');
        const auxiliaryStars = palace.stars.filter(star => star.type === 'auxiliary');
        // 檢查空宮發展潛力 - 根據宮位重要性調整
        if (mainStars.length === 0) {
            const importantPalaces = ['命宮', '財帛宮', '官祿宮', '夫妻宮'];
            const palaceScore = importantPalaces.includes(palace.name) ? 4 : 3;
            score += palaceScore;
            potentialTypes.push('空宮發展');
        }
        // 檢查可改善的星曜配置
        const improvableStars = mainStars.filter(star => star.brightness && brightnessLevels[star.brightness] <= 2 && brightnessLevels[star.brightness] >= 0);
        if (improvableStars.length > 0) {
            // 根據星曜等級給予不同分數
            improvableStars.forEach(star => {
                if (['紫微', '天府', '太陽', '武曲'].includes(star.name)) {
                    score += 3; // 重要主星
                }
                else {
                    score += 2; // 一般主星
                }
            });
            potentialTypes.push('星曜提升');
        }
        // 檢查吉星輔助潛力
        const beneficStars = [...auxiliaryStars, ...palace.stars].filter(star => ['左輔', '右弼', '文昌', '文曲', '天魁', '天鉞', '祿存', '化祿', '化權', '化科'].includes(star.name));
        if (beneficStars.length >= 2) {
            score += Math.min(beneficStars.length, 4); // 最多4分
            potentialTypes.push('吉星輔助');
        }
        // 檢查格局形成潛力
        const formatPatternPotential = checkPatternPotential(palace, props.chartData.palaces);
        if (formatPatternPotential.score > 0) {
            score += formatPatternPotential.score;
            potentialTypes.push(formatPatternPotential.type);
        }
        // 檢查四化發展機會
        const transformationOpportunity = palace.stars.some(star => star.transformations?.some(t => ['祿', '權', '科'].includes(t)));
        if (transformationOpportunity) {
            score += 3; // 四化是重要的發展機會
            potentialTypes.push('四化機會');
        }
        // 檢查三方四正能量協調
        const energyFlow = props.transformationFlows?.[palace.index];
        const multiLayerEnergy = props.multiLayerEnergies?.[palace.index];
        if (energyFlow || multiLayerEnergy) {
            const energyScore = energyFlow?.energyScore || 0;
            const totalEnergy = multiLayerEnergy?.totalEnergy || 0;
            // 能量適中時表示有發展空間
            if (Math.abs(energyScore) <= 3 && Math.abs(totalEnergy) <= 5) {
                score += 2;
                potentialTypes.push('能量協調');
            }
        }
        // 如果有發展潛力，加入潛能列表
        if (score >= 2 && potentialTypes.length > 0) {
            const level = Math.min(5, Math.ceil(score / 2));
            potentials.push({
                palaceName: palace.name,
                palaceZhi: palace.zhi,
                palaceIndex: palace.index,
                corePotential: getCorePotential(palace.name, potentialTypes),
                description: getPotentialDescription(palace.name, potentialTypes),
                developmentMethod: getDevelopmentMethod(palace.name, potentialTypes),
                level
            });
        }
    });
    // 按等級排序，取前3個
    return potentials.sort((a, b) => b.level - a.level).slice(0, 3);
});
// 檢查格局形成潛力的輔助函數
const checkPatternPotential = (palace, allPalaces) => {
    let score = 0;
    let type = '';
    const mainStarNames = palace.stars
        .filter(star => star.type === 'main')
        .map(star => star.name);
    // 檢查是否有形成吉格的潛力
    if (mainStarNames.includes('紫微') || mainStarNames.includes('天府')) {
        // 紫府夾命格潛力
        score += 2;
        type = '格局形成';
    }
    if (mainStarNames.includes('武曲') && mainStarNames.includes('破軍')) {
        // 武破格潛力
        score += 2;
        type = '格局形成';
    }
    if (mainStarNames.includes('天機') && mainStarNames.includes('天梁')) {
        // 機梁格潛力
        score += 2;
        type = '格局形成';
    }
    // 檢查殺破狼格潛力
    const kbwStars = ['七殺', '破軍', '貪狼'];
    if (kbwStars.some(star => mainStarNames.includes(star))) {
        score += 1;
        type = '變動格局';
    }
    return { score, type };
};
// 命盤核心洞察分析
const keyFocus = computed(() => {
    const focus = {
        summary: '',
        energyDistribution: {}
    };
    if (!props.chartData?.palaces)
        return focus;
    // 分析命盤結構特徵
    const analysisResults = analyzeChartStructure();
    // 計算能量分佈（包含基礎星曜能量和四化能量）
    props.chartData.palaces.forEach(palace => {
        let totalEnergy = 0;
        // 基礎星曜能量
        const mainStars = palace.stars.filter(star => star.type === 'main');
        mainStars.forEach(star => {
            if (star.brightness && brightnessLevels[star.brightness] >= 4) {
                totalEnergy += 3; // 廟旺星
            }
            else if (star.brightness && brightnessLevels[star.brightness] <= 1) {
                totalEnergy -= 2; // 失陷星
            }
            else {
                totalEnergy += 1; // 一般星
            }
        });
        // 四化能量
        const energyFlow = props.transformationFlows?.[palace.index];
        if (energyFlow) {
            totalEnergy += energyFlow.energyScore;
        }
        // 多層次能量
        const multiLayerEnergy = props.multiLayerEnergies?.[palace.index];
        if (multiLayerEnergy) {
            totalEnergy += Math.floor(multiLayerEnergy.totalEnergy / 2);
        }
        focus.energyDistribution[palace.name] = totalEnergy;
    });
    // 生成核心洞察摘要
    const coreInsights = generateCoreInsights(analysisResults, focus.energyDistribution);
    focus.summary = coreInsights;
    return focus;
});
// 分析命盤結構特徵
const analyzeChartStructure = () => {
    if (!props.chartData?.palaces)
        return { patterns: [], starTypes: [], energyBalance: 'unknown' };
    const results = {
        patterns: [],
        starTypes: [],
        energyBalance: 'balanced'
    };
    // 檢查命盤格局
    const allMainStars = props.chartData.palaces
        .flatMap(palace => palace.stars.filter(star => star.type === 'main'))
        .map(star => star.name);
    // 檢查殺破狼格局
    if (['七殺', '破軍', '貪狼'].every(star => allMainStars.includes(star))) {
        results.patterns.push('殺破狼格局');
    }
    // 檢查機月同梁格局
    if (['天機', '太陰', '天同', '天梁'].some(star => allMainStars.includes(star))) {
        results.patterns.push('機月同梁格局');
    }
    // 檢查紫微格局
    if (allMainStars.includes('紫微')) {
        results.patterns.push('紫微格局');
    }
    // 分析星曜類型傾向
    const leadershipCount = allMainStars.filter(star => ['紫微', '天府'].includes(star)).length;
    const intellectualCount = allMainStars.filter(star => ['天機', '天梁'].includes(star)).length;
    const executiveCount = allMainStars.filter(star => ['武曲', '破軍', '七殺'].includes(star)).length;
    if (leadershipCount >= 1)
        results.starTypes.push('領導型');
    if (intellectualCount >= 1)
        results.starTypes.push('智謀型');
    if (executiveCount >= 1)
        results.starTypes.push('執行型');
    return results;
};
// 生成核心洞察
const generateCoreInsights = (analysis, energyDist) => {
    const insights = [];
    // 格局洞察
    if (analysis.patterns.length > 0) {
        const primaryPattern = analysis.patterns[0];
        if (primaryPattern === '殺破狼格局') {
            insights.push('您的命盤呈現殺破狼格局，具有強烈的開創和變革特質，適合在變動中求發展。');
        }
        else if (primaryPattern === '機月同梁格局') {
            insights.push('您的命盤偏向機月同梁格局，具備穩健的智慧和服務特質，適合從事教育或輔導工作。');
        }
        else if (primaryPattern === '紫微格局') {
            insights.push('您的命盤以紫微為核心，具有天生的領導特質和貴氣，適合擔任管理或指導角色。');
        }
    }
    // 星曜類型洞察
    if (analysis.starTypes.length > 0) {
        const typeDesc = analysis.starTypes.join('和');
        insights.push(`您的個性特質偏向${typeDesc}，建議發揮這些天賦優勢。`);
    }
    // 能量分佈洞察
    const strongPalaces = Object.entries(energyDist)
        .filter(([_, energy]) => energy > 4)
        .sort(([_, a], [__, b]) => b - a)
        .slice(0, 2)
        .map(([name]) => name);
    if (strongPalaces.length > 0) {
        insights.push(`目前${strongPalaces.join('、')}能量充沛，是重點發展的優勢領域。`);
    }
    // 如果沒有特殊洞察，提供一般性分析
    if (insights.length === 0) {
        insights.push('您的命盤結構均衡，各方面都有發展潛力，建議多元化發展並保持學習心態。');
    }
    return insights.join(' ');
};
// 行動建議
const actionAdvice = computed(() => {
    const advice = [];
    // 基於天賦的發揮建議
    if (personalTalents.value.length > 0) {
        const topTalent = personalTalents.value[0];
        advice.push({
            type: 'leverage',
            title: `發揮${topTalent.palaceName}天賦`,
            description: `善用您在${topTalent.coreTalent}方面的天賦，${getLeverageAdvice(topTalent.palaceName)}`
        });
    }
    // 基於潛能的發展建議
    if (potentialDevelopment.value.length > 0) {
        const topPotential = potentialDevelopment.value[0];
        advice.push({
            type: 'develop',
            title: `開發${topPotential.palaceName}潛能`,
            description: `透過${topPotential.developmentMethod}，${getDevelopAdvice(topPotential.palaceName)}`
        });
    }
    // 基於命盤結構的整體建議
    const structureAdvice = getStructuralAdvice();
    if (structureAdvice) {
        advice.push({
            type: 'general',
            title: '命盤結構建議',
            description: structureAdvice
        });
    }
    // 通用人生智慧
    advice.push({
        type: 'general',
        title: '紫微智慧提醒',
        description: '命盤顯示先天特質與潛能，後天的修為和努力同樣重要。建議以命盤為指引，結合實際行動，創造屬於自己的精彩人生。'
    });
    return advice.slice(0, 3); // 限制最多3個建議
});
// 輔助函數
const getCoreTalent = (palaceName, keyStars) => {
    // 星曜組合天賦分析
    const starTalentMap = {
        '紫微': '領導統御天賦',
        '天府': '管理經營天賦',
        '太陽': '光明磊落天賦',
        '太陰': '溫柔包容天賦',
        '天機': '智慧策劃天賦',
        '天同': '和諧協調天賦',
        '武曲': '務實執行天賦',
        '天相': '輔助服務天賦',
        '廉貞': '變革創新天賦',
        '天梁': '保護指導天賦',
        '破軍': '突破開創天賦',
        '七殺': '競爭進取天賦',
        '貪狼': '多元發展天賦',
        '巨門': '溝通表達天賦'
    };
    // 宮位特色天賦
    const palaceTalentMap = {
        '命宮': '個人魅力與領導力',
        '財帛宮': '財富創造與理財',
        '官祿宮': '專業能力與事業',
        '夫妻宮': '情感經營與合作',
        '子女宮': '創意發想與教育',
        '田宅宮': '環境營造與投資',
        '交友宮': '人際建立與社交',
        '遷移宮': '環境適應與發展',
        '疾厄宮': '身心健康與調理',
        '福德宮': '精神修養與智慧',
        '父母宮': '學習傳承與成長',
        '兄弟宮': '平等合作與支援'
    };
    // 優先使用最強的主星天賦
    for (const star of keyStars) {
        if (starTalentMap[star]) {
            return starTalentMap[star];
        }
    }
    return palaceTalentMap[palaceName] || '多元潛質發展';
};
const getTalentDescription = (palaceName, keyStars) => {
    const starDescriptions = {
        '紫微': '具備天生的領導魅力和統御能力',
        '天府': '擁有穩重的管理才能和財富直覺',
        '太陽': '散發正面能量，具有感化他人的力量',
        '太陰': '敏感細膩，富有藝術和審美天賦',
        '武曲': '實事求是，具備優秀的執行和理財能力',
        '天機': '頭腦靈活，善於策劃和創新思考',
        '天同': '性格溫和，具有協調和化解衝突的才能',
        '廉貞': '意志堅定，富有開創和變革的勇氣',
        '天相': '善於輔助他人，具備優秀的人際協調能力',
        '巨門': '口才好，適合從事傳播或教育相關工作',
        '貪狼': '多才多藝，具有強烈的求知慾和適應力',
        '破軍': '勇於突破，具備改革創新的膽識',
        '七殺': '意志力強，適合在競爭激烈的環境中發展',
        '天梁': '具備保護他人的特質，適合服務社會'
    };
    const primaryStarDesc = keyStars.map(star => starDescriptions[star]).filter(Boolean)[0];
    const baseDesc = primaryStarDesc || `在${palaceName}展現出獨特的天賦特質`;
    return `${baseDesc}，這是您與生俱來的優勢能力。`;
};
const getCorePotential = (palaceName, potentialTypes) => {
    const potentialMap = {
        '命宮': '個人品牌塑造',
        '財帛宮': '財富管理優化',
        '官祿宮': '專業技能提升',
        '夫妻宮': '情感智慧深化',
        '子女宮': '創意才能開發',
        '田宅宮': '生活品質改善',
        '交友宮': '人脈網絡擴展',
        '遷移宮': '國際視野培養',
        '疾厄宮': '身心靈調和',
        '福德宮': '精神層次提升',
        '父母宮': '知識學習深化',
        '兄弟宮': '合作關係強化'
    };
    // 根據潛能類型調整描述
    if (potentialTypes.includes('空宮發展')) {
        return potentialMap[palaceName] || '全新領域探索';
    }
    if (potentialTypes.includes('星曜提升')) {
        return potentialMap[palaceName] || '既有能力強化';
    }
    return potentialMap[palaceName] || '多維度發展';
};
const getPotentialDescription = (palaceName, potentialTypes) => {
    const typeDescriptions = {
        '空宮發展': '此領域具有無限可能性，可以從零開始建立',
        '星曜提升': '現有基礎良好，透過後天努力可以大幅提升',
        '吉星輔助': '具備良好的支援系統，貴人運強，發展條件佳',
        '格局形成': '具備形成特殊格局的潛力，發展前景可期',
        '變動格局': '適合在變動中求發展，勇於創新突破',
        '四化機會': '時機成熟，天時地利具備，適合積極發展',
        '能量協調': '各方面能量均衡，是穩健紮實發展的好時機'
    };
    // 優先選擇最重要的潛能類型
    const priorityOrder = ['格局形成', '四化機會', '吉星輔助', '變動格局', '星曜提升', '空宮發展', '能量協調'];
    let primaryTypeDesc = '';
    for (const priority of priorityOrder) {
        if (potentialTypes.includes(priority)) {
            primaryTypeDesc = typeDescriptions[priority];
            break;
        }
    }
    const baseDesc = primaryTypeDesc || `${palaceName}具有良好的發展潛力`;
    return `${baseDesc}，建議制定具體的發展計劃並持續努力。`;
};
const getDevelopmentMethod = (palaceName, potentialTypes) => {
    const methodMap = {
        '命宮': '自我提升、形象管理、領導力培養',
        '財帛宮': '理財規劃、投資學習、收入多元化',
        '官祿宮': '專業進修、技能認證、職涯規劃',
        '夫妻宮': '情感溝通、關係經營、心理成長',
        '子女宮': '創意開發、藝術學習、興趣培養',
        '田宅宮': '居住環境優化、不動產投資',
        '交友宮': '社交技巧、人脈經營、團隊合作',
        '遷移宮': '旅行體驗、文化交流、環境適應',
        '疾厄宮': '健康管理、運動養生、壓力調節',
        '福德宮': '精神修養、哲學思考、心靈成長',
        '父母宮': '終身學習、知識積累、師長請益',
        '兄弟宮': '同儕合作、資源共享、互助成長'
    };
    return methodMap[palaceName] || '多方面均衡發展';
};
const getLeverageAdvice = (palaceName) => {
    const adviceMap = {
        '命宮': '可主動爭取領導機會，展現個人能力。',
        '財帛宮': '適合進行投資理財，累積財富。',
        '官祿宮': '積極爭取升遷機會，發展事業。',
        '夫妻宮': '是談婚論嫁的好時機。',
        '交友宮': '多參與社交活動，擴展人脈。'
    };
    return adviceMap[palaceName] || '積極發揮這方面的潛能。';
};
const getDevelopAdvice = (palaceName) => {
    const adviceMap = {
        '命宮': '建議積極提升個人能力，樹立正面形象。',
        '財帛宮': '規劃財務目標，學習投資理財知識。',
        '官祿宮': '持續精進專業技能，建立職場競爭力。',
        '夫妻宮': '培養情感智慧，學習經營關係的藝術。',
        '子女宮': '開發創意潛能，培養藝術或教育才華。',
        '田宅宮': '改善居住環境，考慮不動產投資機會。',
        '交友宮': '擴展社交圈，建立互利的人際網絡。',
        '遷移宮': '增加國際視野，培養適應變化的能力。',
        '疾厄宮': '注重身心健康，建立良好的生活習慣。',
        '福德宮': '提升精神層次，培養正面的人生觀。',
        '父母宮': '加強學習能力，與長輩保持良好關係。',
        '兄弟宮': '強化團隊合作，發展平等互助的關係。'
    };
    return adviceMap[palaceName] || '建議制定具體的發展計劃並持續努力。';
};
const getStructuralAdvice = () => {
    if (!props.chartData?.palaces)
        return '';
    const allMainStars = props.chartData.palaces
        .flatMap(palace => palace.stars.filter(star => star.type === 'main'))
        .map(star => star.name);
    // 殺破狼格局建議
    if (['七殺', '破軍', '貪狼'].every(star => allMainStars.includes(star))) {
        return '您的命盤呈現殺破狼格局，建議在穩定中求變化，避免過度冒進，同時把握變革機會。';
    }
    // 機月同梁格局建議
    if (['天機', '太陰', '天同', '天梁'].some(star => allMainStars.includes(star))) {
        return '您的命盤偏向機月同梁格局，建議發揮智慧和服務精神，在穩健中求發展。';
    }
    // 紫微格局建議
    if (allMainStars.includes('紫微')) {
        return '您具有紫微帝星特質，建議培養領導能力，承擔責任，發揮正面影響力。';
    }
    return '建議根據個人特質，均衡發展各方面能力，保持積極正面的心態。';
};
const getAdviceIcon = (type) => {
    const iconMap = {
        'leverage': '🚀',
        'develop': '🌱',
        'general': '💫'
    };
    return iconMap[type] || '💡';
};
// 星曜屬性映射（用於核心能力分析）
const starAttributes = {
    leadership: ['紫微', '天府', '武曲', '貪狼', '七殺', '破軍'],
    creativity: ['貪狼', '廉貞', '巨門', '文昌', '文曲', '左輔', '右弼'],
    communication: ['太陽', '巨門', '天梁', '文昌', '文曲'],
    learning: ['文昌', '文曲', '天機', '太陰', '天梁'],
    financial: ['武曲', '天府', '太陰', '祿存', '化祿'],
    social: ['太陽', '天同', '天梁', '左輔', '右弼', '天魁', '天鉞']
};
// 核心能力分析
const coreAbilities = computed(() => {
    const abilities = [
        { name: '領導力', value: 0, color: '#ff6b6b', key: 'leadership' },
        { name: '創造力', value: 0, color: '#4ecdc4', key: 'creativity' },
        { name: '溝通力', value: 0, color: '#45b7d1', key: 'communication' },
        { name: '學習能力', value: 0, color: '#96ceb4', key: 'learning' },
        { name: '理財能力', value: 0, color: '#feca57', key: 'financial' },
        { name: '人際關係', value: 0, color: '#ff9ff3', key: 'social' }
    ];
    if (!props.chartData?.palaces) {
        abilities.forEach(ability => {
            ability.value = 4 + Math.floor(Math.random() * 3);
        });
        return abilities;
    }
    // 計算各項能力值
    abilities.forEach(ability => {
        const relatedStars = starAttributes[ability.key] || [];
        let score = 0;
        let starCount = 0;
        props.chartData.palaces.forEach(palace => {
            palace.stars?.forEach(star => {
                if (relatedStars.includes(star.name)) {
                    starCount++;
                    score += 2;
                    // 亮度加成
                    if (star.brightness) {
                        const brightnessBonus = {
                            '廟': 4, '旺': 3, '得地': 2, '利益': 1, '平和': 0, '不得地': -1, '落陷': -2
                        }[star.brightness] || 0;
                        score += brightnessBonus;
                    }
                    // 四化加成
                    if (star.transformations?.includes('祿'))
                        score += 2;
                    if (star.transformations?.includes('權'))
                        score += 2;
                    if (star.transformations?.includes('科'))
                        score += 1;
                    if (star.transformations?.includes('忌'))
                        score -= 2;
                    // 特殊宮位加成
                    if (palace.name === '命宮')
                        score += 1;
                    if (palace.name === '官祿宮' && ability.key === 'leadership')
                        score += 1;
                    if (palace.name === '財帛宮' && ability.key === 'financial')
                        score += 1;
                }
            });
        });
        let baseScore = 4;
        if (starCount > 0) {
            baseScore = Math.max(4, score);
        }
        else {
            baseScore = 4 + Math.floor(Math.random() * 3);
        }
        ability.value = Math.max(4, Math.min(10, Math.round(baseScore)));
    });
    return abilities;
});
// 分析外在特質（基於命宮）
const externalTraits = computed(() => {
    const traits = [];
    if (!props.chartData?.palaces)
        return ['外表沉穩內斂，給人可靠的印象', '在社交場合中表現得體，善於察言觀色'];
    const mingPalace = props.chartData.palaces.find(p => p.name === '命宮');
    if (mingPalace?.stars) {
        const mainStars = mingPalace.stars.filter(star => star.type === 'main');
        mainStars.forEach(star => {
            switch (star.name) {
                case '紫微':
                    traits.push('天生具有領導風範，舉止優雅高貴');
                    break;
                case '天機':
                    traits.push('思維敏捷，喜歡動腦思考問題');
                    break;
                case '太陽':
                    traits.push('性格開朗，樂於助人，具有正義感');
                    break;
                case '武曲':
                    traits.push('做事果斷，執行力強，重視效率');
                    break;
                case '天同':
                    traits.push('溫和友善，容易親近，處事圓融');
                    break;
                case '廉貞':
                    traits.push('個性鮮明，敢愛敢恨，有正義感');
                    break;
                default:
                    traits.push('外在表現穩重，為人處事有條理');
            }
        });
    }
    if (traits.length === 0) {
        traits.push('外表沉穩內斂，給人可靠的印象');
        traits.push('在社交場合中表現得體，善於察言觀色');
    }
    return traits.slice(0, 4);
});
// 分析內在特質（基於福德宮）
const internalTraits = computed(() => {
    const traits = [];
    if (!props.chartData?.palaces)
        return ['內心渴望安全感，重視情感的穩定', '具有同理心，能夠理解他人的感受'];
    const fudePalace = props.chartData.palaces.find(p => p.name === '福德宮');
    if (fudePalace?.stars) {
        const mainStars = fudePalace.stars.filter(star => star.type === 'main');
        mainStars.forEach(star => {
            switch (star.name) {
                case '紫微':
                    traits.push('內心高傲，對自己要求嚴格');
                    break;
                case '天機':
                    traits.push('內心細膩敏感，善於洞察人心');
                    break;
                case '太陽':
                    traits.push('內心熱忱，有強烈的使命感');
                    break;
                case '武曲':
                    traits.push('內心堅毅，不輕易向困難低頭');
                    break;
                case '天同':
                    traits.push('內心純真，渴望和諧美好的生活');
                    break;
                case '廉貞':
                    traits.push('內心複雜多變，情感豐富細膩');
                    break;
                default:
                    traits.push('內心世界豐富，有深層的思考能力');
            }
        });
    }
    // 分析疾厄宮了解內在壓力模式
    const jiePalace = props.chartData.palaces.find(p => p.name === '疾厄宮');
    if (jiePalace?.stars) {
        const hasInauspiciousStars = jiePalace.stars.some(star => star.attribute === '凶');
        if (hasInauspiciousStars) {
            traits.push('內心容易感到壓力，需要學會放鬆');
        }
    }
    if (traits.length === 0) {
        traits.push('內心渴望安全感，重視情感的穩定');
        traits.push('具有同理心，能夠理解他人的感受');
    }
    return traits.slice(0, 4);
});
// 特質綜合說明
const traitSynthesis = computed(() => {
    const external = externalTraits.value.length > 0 ? '外在表現' : '表面特質';
    const internal = internalTraits.value.length > 0 ? '內在本質' : '深層個性';
    return `您的${external}與${internal}形成了獨特的個性組合。在不同的環境和情境下，這兩種特質會交替顯現或相互影響。理解這種雙重性格有助於您更好地發揮優勢，並在人際交往中找到最適合的表達方式。建議在重要場合時發揮外在優勢，在私人時光中照顧內在需求。`;
});
// 輔助函數
const getAbilityIcon = (abilityName) => {
    const iconMap = {
        '領導力': '👑', '創造力': '🎨', '溝通力': '💬',
        '學習能力': '📚', '理財能力': '💰', '人際關係': '🤝'
    };
    return iconMap[abilityName] || '⭐';
};
const getAbilityLevel = (value) => {
    if (value >= 8)
        return '優秀';
    if (value >= 6)
        return '良好';
    if (value >= 4)
        return '普通';
    return '待提升';
};
const lightenColor = (color) => {
    const colorMap = {
        '#ff6b6b': '#ff9999', '#4ecdc4': '#7ee8e0', '#45b7d1': '#78c7e4',
        '#96ceb4': '#b8dcc6', '#feca57': '#fed887', '#ff9ff3': '#ffb8f7'
    };
    return colorMap[color] || color;
};
// 五行分析
const elementColors = {
    '金': '#FFD700',
    '木': '#32CD32',
    '水': '#4169E1',
    '火': '#FF4500',
    '土': '#8B4513'
};
const fiveElements = computed(() => {
    const elements = {
        '金': 0, '木': 0, '水': 0, '火': 0, '土': 0
    };
    if (props.chartData?.palaces) {
        props.chartData.palaces.forEach(palace => {
            palace.stars?.forEach(star => {
                if (star.element && elements.hasOwnProperty(star.element)) {
                    elements[star.element]++;
                }
            });
        });
    }
    const total = Object.values(elements).reduce((sum, count) => sum + count, 0);
    return Object.entries(elements).map(([name, count]) => ({
        name,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
        color: elementColors[name]
    }));
});
const dominantElement = computed(() => {
    return fiveElements.value.reduce((max, current) => current.count > max.count ? current : max);
});
const elementBalance = computed(() => {
    const counts = fiveElements.value.map(e => e.count);
    const max = Math.max(...counts);
    const min = Math.min(...counts);
    const variance = max - min;
    if (variance <= 1)
        return '極佳';
    if (variance <= 2)
        return '良好';
    if (variance <= 3)
        return '一般';
    if (variance <= 4)
        return '偏差';
    return '失衡';
});
const fiveElementsInterpretation = computed(() => {
    const interpretations = [];
    const dominant = dominantElement.value;
    if (dominant.count > 0) {
        switch (dominant.name) {
            case '金':
                interpretations.push('金行主導：性格堅毅，做事有原則，重視規則和秩序');
                break;
            case '木':
                interpretations.push('木行主導：富有生命力，善於成長和創新，適應力強');
                break;
            case '水':
                interpretations.push('水行主導：思維靈活，直覺敏銳，善於變通和適應');
                break;
            case '火':
                interpretations.push('火行主導：熱情積極，行動力強，具有領導魅力');
                break;
            case '土':
                interpretations.push('土行主導：穩重踏實，重視安全感，具有包容性');
                break;
        }
    }
    const balance = elementBalance.value;
    switch (balance) {
        case '極佳':
            interpretations.push('五行分佈均衡，個性發展全面，適應力強');
            break;
        case '良好':
            interpretations.push('五行分佈相對均衡，個性穩定，發展潛力大');
            break;
        case '一般':
            interpretations.push('五行分佈基本平衡，需要注意弱勢五行的補強');
            break;
        case '偏差':
            interpretations.push('五行分佈不均，建議透過後天努力來平衡發展');
            break;
        case '失衡':
            interpretations.push('五行分佈失衡，需要特別注意個性的調整和發展');
            break;
    }
    return interpretations;
});
// 關鍵格局分析
const keyPatterns = computed(() => {
    const patterns = [];
    if (!props.chartData?.palaces)
        return patterns;
    const palaces = props.chartData.palaces;
    // 檢查紫府夾命格
    const mingPalace = palaces.find(p => p.name === '命宮');
    if (mingPalace) {
        const hasZiwei = mingPalace.stars?.some(s => s.name === '紫微');
        const hasTianfu = mingPalace.stars?.some(s => s.name === '天府');
        if (hasZiwei && hasTianfu) {
            patterns.push({
                name: '紫府夾命格',
                description: '紫微天府同宮於命宮，為帝王格局，主貴氣天成。',
                effects: [
                    '具有天生的領導氣質和權威感',
                    '容易得到他人的尊重和信任',
                    '事業發展潛力大，適合管理職位'
                ],
                strength: 5,
                type: 'auspicious'
            });
        }
    }
    // 檢查左右夾命格
    const leftRight = palaces.some(p => p.stars?.some(s => s.name === '左輔') &&
        p.stars?.some(s => s.name === '右弼'));
    if (leftRight) {
        patterns.push({
            name: '左右夾命格',
            description: '左輔右弼拱照命宮，主得貴人相助。',
            effects: [
                '一生貴人運佳，容易得到幫助',
                '人際關係良好，善於合作',
                '事業上容易得到支持和提攜'
            ],
            strength: 4,
            type: 'auspicious'
        });
    }
    // 檢查文昌文曲格
    const wenchangWenqu = palaces.some(p => p.stars?.some(s => s.name === '文昌') &&
        p.stars?.some(s => s.name === '文曲'));
    if (wenchangWenqu) {
        patterns.push({
            name: '文昌文曲格',
            description: '文昌文曲同宮或拱照，主文才出眾。',
            effects: [
                '學習能力強，文筆佳',
                '適合從事文化、教育、傳媒工作',
                '考試運佳，學業成就突出'
            ],
            strength: 4,
            type: 'auspicious'
        });
    }
    // 檢查火鈴夾命格（不吉格局）
    const fireRing = palaces.some(p => p.stars?.some(s => s.name === '火星') &&
        p.stars?.some(s => s.name === '鈴星'));
    if (fireRing) {
        patterns.push({
            name: '火鈴夾命格',
            description: '火星鈴星夾命，主性格急躁，容易衝動。',
            effects: [
                '性格較為急躁，容易發脾氣',
                '做事衝動，需要學會控制情緒',
                '適合從事需要行動力的工作'
            ],
            strength: 3,
            type: 'inauspicious'
        });
    }
    return patterns;
});
const getPatternClass = (pattern) => {
    return `pattern-${pattern.type}`;
};
const getPatternIcon = (pattern) => {
    const icons = {
        'auspicious': '🌟',
        'inauspicious': '⚠️',
        'special': '🔮'
    };
    return icons[pattern.type] || '🔸';
};
const getPatternType = (pattern) => {
    const types = {
        'auspicious': '吉格',
        'inauspicious': '凶格',
        'special': '特殊格局'
    };
    return types[pattern.type] || '一般格局';
};
// 事件處理
const onTalentClick = (talent) => {
    emit('talentClick', talent);
    emit('palaceClick', talent.palaceIndex);
};
const onPotentialClick = (potential) => {
    emit('potentialClick', potential);
    emit('palaceClick', potential.palaceIndex);
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['insight-card']} */ ;
/** @type {__VLS_StyleScopedClasses['insight-card']} */ ;
/** @type {__VLS_StyleScopedClasses['insight-card']} */ ;
/** @type {__VLS_StyleScopedClasses['star']} */ ;
/** @type {__VLS_StyleScopedClasses['indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['advice-item']} */ ;
/** @type {__VLS_StyleScopedClasses['ability-card']} */ ;
/** @type {__VLS_StyleScopedClasses['ability-card']} */ ;
/** @type {__VLS_StyleScopedClasses['ability-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-side']} */ ;
/** @type {__VLS_StyleScopedClasses['external-traits']} */ ;
/** @type {__VLS_StyleScopedClasses['internal-traits']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-header']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-list']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-list']} */ ;
/** @type {__VLS_StyleScopedClasses['synthesis-text']} */ ;
/** @type {__VLS_StyleScopedClasses['overview-container']} */ ;
/** @type {__VLS_StyleScopedClasses['overview-title']} */ ;
/** @type {__VLS_StyleScopedClasses['cards-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['insight-card']} */ ;
/** @type {__VLS_StyleScopedClasses['energy-bar-item']} */ ;
/** @type {__VLS_StyleScopedClasses['advice-item']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-content']} */ ;
/** @type {__VLS_StyleScopedClasses['abilities-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['traits-container']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-divider']} */ ;
/** @type {__VLS_StyleScopedClasses['divider-line']} */ ;
/** @type {__VLS_StyleScopedClasses['synthesis-explanation']} */ ;
/** @type {__VLS_StyleScopedClasses['overview-title']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['energy-bar-item']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-label']} */ ;
/** @type {__VLS_StyleScopedClasses['energy-value']} */ ;
/** @type {__VLS_StyleScopedClasses['elements-chart']} */ ;
/** @type {__VLS_StyleScopedClasses['element-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['elements-analysis']} */ ;
/** @type {__VLS_StyleScopedClasses['elements-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['dominant-element']} */ ;
/** @type {__VLS_StyleScopedClasses['element-balance']} */ ;
/** @type {__VLS_StyleScopedClasses['elements-interpretation']} */ ;
/** @type {__VLS_StyleScopedClasses['interpretation-list']} */ ;
/** @type {__VLS_StyleScopedClasses['interpretation-list']} */ ;
/** @type {__VLS_StyleScopedClasses['interpretation-list']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-card']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-auspicious']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-auspicious']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-inauspicious']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-inauspicious']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-special']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-special']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-effects']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-effects']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-effects']} */ ;
/** @type {__VLS_StyleScopedClasses['strength-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['elements-container']} */ ;
/** @type {__VLS_StyleScopedClasses['patterns-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['elements-container']} */ ;
/** @type {__VLS_StyleScopedClasses['patterns-container']} */ ;
/** @type {__VLS_StyleScopedClasses['elements-chart']} */ ;
/** @type {__VLS_StyleScopedClasses['elements-analysis']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-card']} */ ;
/** @type {__VLS_StyleScopedClasses['element-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['patterns-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-header']} */ ;
/** @type {__VLS_StyleScopedClasses['element-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['element-label']} */ ;
/** @type {__VLS_StyleScopedClasses['element-value']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-effects']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "fortune-overview" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "overview-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
    ...{ class: "overview-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "title-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "talents-traits-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
    ...{ class: "section-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "section-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "cards-grid" },
});
for (const [talent, index] of __VLS_getVForSourceType((__VLS_ctx.personalTalents))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.onTalentClick(talent);
            } },
        key: (`talent-${index}`),
        ...{ class: "insight-card talent-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "palace-name" },
    });
    (talent.palaceName);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "palace-zhi" },
    });
    (talent.palaceZhi);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "core-talent" },
    });
    (talent.coreTalent);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "description" },
    });
    (talent.description);
    if (talent.keyStars.length > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "star-config" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "star-label" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "stars" },
        });
        (talent.keyStars.join('、'));
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-footer" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "talent-level" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "level-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "level-stars" },
    });
    for (const [i] of __VLS_getVForSourceType((5))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            key: (i),
            ...{ class: (['star', { active: i <= talent.level }]) },
        });
    }
}
if (__VLS_ctx.personalTalents.length === 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "no-insights" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "no-insights-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "potential-development-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
    ...{ class: "section-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "section-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "cards-grid" },
});
for (const [potential, index] of __VLS_getVForSourceType((__VLS_ctx.potentialDevelopment))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.onPotentialClick(potential);
            } },
        key: (`potential-${index}`),
        ...{ class: "insight-card potential-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "palace-name" },
    });
    (potential.palaceName);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "palace-zhi" },
    });
    (potential.palaceZhi);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "core-potential" },
    });
    (potential.corePotential);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "description" },
    });
    (potential.description);
    if (potential.developmentMethod) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "development-method" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "method-label" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "method" },
        });
        (potential.developmentMethod);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-footer" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "potential-level" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "level-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "level-indicators" },
    });
    for (const [i] of __VLS_getVForSourceType((5))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (i),
            ...{ class: (['indicator', 'potential-indicator', { active: i <= potential.level }]) },
        });
    }
}
if (__VLS_ctx.potentialDevelopment.length === 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "no-insights" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "no-insights-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "key-focus-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
    ...{ class: "section-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "section-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "focus-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "focus-summary" },
});
(__VLS_ctx.keyFocus.summary);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "energy-analysis" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "energy-distribution" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "energy-bars" },
});
for (const [energy, palaceName] of __VLS_getVForSourceType((__VLS_ctx.keyFocus.energyDistribution))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (palaceName),
        ...{ class: "energy-bar-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "palace-label" },
    });
    (palaceName);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "energy-bar" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "energy-fill" },
        ...{ style: ({
                width: `${Math.abs(energy)}%`,
                backgroundColor: energy > 0 ? '#28a745' : '#dc3545'
            }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "energy-value" },
    });
    (energy > 0 ? '+' : '');
    (energy);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "action-advice-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
    ...{ class: "section-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "section-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "advice-list" },
});
for (const [advice, index] of __VLS_getVForSourceType((__VLS_ctx.actionAdvice))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (`advice-${index}`),
        ...{ class: "advice-item" },
        ...{ class: (`advice-${advice.type}`) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "advice-icon" },
    });
    (__VLS_ctx.getAdviceIcon(advice.type));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "advice-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "advice-title" },
    });
    (advice.title);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "advice-description" },
    });
    (advice.description);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "core-abilities-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
    ...{ class: "section-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "section-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "abilities-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "abilities-grid" },
});
for (const [ability, index] of __VLS_getVForSourceType((__VLS_ctx.coreAbilities))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (`ability-${index}`),
        ...{ class: "ability-card" },
        ...{ style: ({ '--ability-color': ability.color }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "ability-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "ability-icon" },
        ...{ style: ({ backgroundColor: ability.color }) },
    });
    (__VLS_ctx.getAbilityIcon(ability.name));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "ability-info" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h6, __VLS_intrinsicElements.h6)({
        ...{ class: "ability-name" },
    });
    (ability.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "ability-score" },
    });
    (ability.value);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "ability-bar-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "ability-bar" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "ability-fill" },
        ...{ style: ({
                width: `${ability.value * 10}%`,
                background: `linear-gradient(90deg, ${ability.color}, ${__VLS_ctx.lightenColor(ability.color)})`
            }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "ability-level" },
    });
    (__VLS_ctx.getAbilityLevel(ability.value));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "personality-traits-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
    ...{ class: "section-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "section-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "traits-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "trait-side external-traits" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "trait-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "trait-subtitle" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "trait-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "trait-source" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({
    ...{ class: "trait-list" },
});
for (const [trait, index] of __VLS_getVForSourceType((__VLS_ctx.externalTraits))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
        key: (`external-${index}`),
    });
    (trait);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "trait-divider" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "divider-line" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "divider-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "divider-line" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "trait-side internal-traits" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "trait-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "trait-subtitle" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "trait-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "trait-source" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({
    ...{ class: "trait-list" },
});
for (const [trait, index] of __VLS_getVForSourceType((__VLS_ctx.internalTraits))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
        key: (`internal-${index}`),
    });
    (trait);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "synthesis-explanation" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "synthesis-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "synthesis-text" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h6, __VLS_intrinsicElements.h6)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
(__VLS_ctx.traitSynthesis);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "five-elements-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
    ...{ class: "section-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "section-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "elements-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "elements-chart" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "element-bars" },
});
for (const [element] of __VLS_getVForSourceType((__VLS_ctx.fiveElements))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (element.name),
        ...{ class: "element-bar" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "element-label" },
    });
    (element.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "element-progress" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "element-fill" },
        ...{ style: ({
                width: `${element.percentage}%`,
                backgroundColor: element.color
            }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "element-value" },
    });
    (element.count);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "elements-analysis" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "elements-summary" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "summary-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "dominant-element" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "value" },
});
(__VLS_ctx.dominantElement.name);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "element-balance" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "value" },
});
(__VLS_ctx.elementBalance);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "elements-interpretation" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({
    ...{ class: "interpretation-list" },
});
for (const [interpretation, index] of __VLS_getVForSourceType((__VLS_ctx.fiveElementsInterpretation))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
        key: (index),
    });
    (interpretation);
}
if (__VLS_ctx.keyPatterns.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "key-patterns-section" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
        ...{ class: "section-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "section-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "patterns-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "patterns-grid" },
    });
    for (const [pattern, index] of __VLS_getVForSourceType((__VLS_ctx.keyPatterns))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (`pattern-${index}`),
            ...{ class: "pattern-card" },
            ...{ class: (__VLS_ctx.getPatternClass(pattern)) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "pattern-header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "pattern-icon" },
        });
        (__VLS_ctx.getPatternIcon(pattern));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "pattern-name" },
        });
        (pattern.name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "pattern-type" },
        });
        (__VLS_ctx.getPatternType(pattern));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "pattern-content" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "pattern-description" },
        });
        (pattern.description);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "pattern-effects" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h6, __VLS_intrinsicElements.h6)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({});
        for (const [effect, idx] of __VLS_getVForSourceType((pattern.effects))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
                key: (idx),
            });
            (effect);
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "pattern-strength" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "strength-label" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "strength-bars" },
        });
        for (const [i] of __VLS_getVForSourceType((5))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (i),
                ...{ class: (['strength-bar', { active: i <= pattern.strength }]) },
            });
        }
    }
}
/** @type {__VLS_StyleScopedClasses['fortune-overview']} */ ;
/** @type {__VLS_StyleScopedClasses['overview-container']} */ ;
/** @type {__VLS_StyleScopedClasses['overview-title']} */ ;
/** @type {__VLS_StyleScopedClasses['title-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['talents-traits-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['cards-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['insight-card']} */ ;
/** @type {__VLS_StyleScopedClasses['talent-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-name']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-zhi']} */ ;
/** @type {__VLS_StyleScopedClasses['card-content']} */ ;
/** @type {__VLS_StyleScopedClasses['core-talent']} */ ;
/** @type {__VLS_StyleScopedClasses['description']} */ ;
/** @type {__VLS_StyleScopedClasses['star-config']} */ ;
/** @type {__VLS_StyleScopedClasses['star-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stars']} */ ;
/** @type {__VLS_StyleScopedClasses['card-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['talent-level']} */ ;
/** @type {__VLS_StyleScopedClasses['level-label']} */ ;
/** @type {__VLS_StyleScopedClasses['level-stars']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['star']} */ ;
/** @type {__VLS_StyleScopedClasses['no-insights']} */ ;
/** @type {__VLS_StyleScopedClasses['no-insights-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['potential-development-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['cards-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['insight-card']} */ ;
/** @type {__VLS_StyleScopedClasses['potential-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-name']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-zhi']} */ ;
/** @type {__VLS_StyleScopedClasses['card-content']} */ ;
/** @type {__VLS_StyleScopedClasses['core-potential']} */ ;
/** @type {__VLS_StyleScopedClasses['description']} */ ;
/** @type {__VLS_StyleScopedClasses['development-method']} */ ;
/** @type {__VLS_StyleScopedClasses['method-label']} */ ;
/** @type {__VLS_StyleScopedClasses['method']} */ ;
/** @type {__VLS_StyleScopedClasses['card-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['potential-level']} */ ;
/** @type {__VLS_StyleScopedClasses['level-label']} */ ;
/** @type {__VLS_StyleScopedClasses['level-indicators']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['potential-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['no-insights']} */ ;
/** @type {__VLS_StyleScopedClasses['no-insights-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['key-focus-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-content']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['energy-analysis']} */ ;
/** @type {__VLS_StyleScopedClasses['energy-distribution']} */ ;
/** @type {__VLS_StyleScopedClasses['energy-bars']} */ ;
/** @type {__VLS_StyleScopedClasses['energy-bar-item']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-label']} */ ;
/** @type {__VLS_StyleScopedClasses['energy-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['energy-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['energy-value']} */ ;
/** @type {__VLS_StyleScopedClasses['action-advice-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['advice-list']} */ ;
/** @type {__VLS_StyleScopedClasses['advice-item']} */ ;
/** @type {__VLS_StyleScopedClasses['advice-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['advice-content']} */ ;
/** @type {__VLS_StyleScopedClasses['advice-title']} */ ;
/** @type {__VLS_StyleScopedClasses['advice-description']} */ ;
/** @type {__VLS_StyleScopedClasses['core-abilities-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['abilities-container']} */ ;
/** @type {__VLS_StyleScopedClasses['abilities-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['ability-card']} */ ;
/** @type {__VLS_StyleScopedClasses['ability-header']} */ ;
/** @type {__VLS_StyleScopedClasses['ability-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['ability-info']} */ ;
/** @type {__VLS_StyleScopedClasses['ability-name']} */ ;
/** @type {__VLS_StyleScopedClasses['ability-score']} */ ;
/** @type {__VLS_StyleScopedClasses['ability-bar-container']} */ ;
/** @type {__VLS_StyleScopedClasses['ability-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['ability-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['ability-level']} */ ;
/** @type {__VLS_StyleScopedClasses['personality-traits-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['traits-container']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-side']} */ ;
/** @type {__VLS_StyleScopedClasses['external-traits']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-header']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-content']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-source']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-list']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-divider']} */ ;
/** @type {__VLS_StyleScopedClasses['divider-line']} */ ;
/** @type {__VLS_StyleScopedClasses['divider-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['divider-line']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-side']} */ ;
/** @type {__VLS_StyleScopedClasses['internal-traits']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-header']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-content']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-source']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-list']} */ ;
/** @type {__VLS_StyleScopedClasses['synthesis-explanation']} */ ;
/** @type {__VLS_StyleScopedClasses['synthesis-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['synthesis-text']} */ ;
/** @type {__VLS_StyleScopedClasses['five-elements-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['elements-container']} */ ;
/** @type {__VLS_StyleScopedClasses['elements-chart']} */ ;
/** @type {__VLS_StyleScopedClasses['element-bars']} */ ;
/** @type {__VLS_StyleScopedClasses['element-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['element-label']} */ ;
/** @type {__VLS_StyleScopedClasses['element-progress']} */ ;
/** @type {__VLS_StyleScopedClasses['element-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['element-value']} */ ;
/** @type {__VLS_StyleScopedClasses['elements-analysis']} */ ;
/** @type {__VLS_StyleScopedClasses['elements-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-content']} */ ;
/** @type {__VLS_StyleScopedClasses['dominant-element']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['element-balance']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['elements-interpretation']} */ ;
/** @type {__VLS_StyleScopedClasses['interpretation-list']} */ ;
/** @type {__VLS_StyleScopedClasses['key-patterns-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['patterns-container']} */ ;
/** @type {__VLS_StyleScopedClasses['patterns-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-card']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-header']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-name']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-type']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-content']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-description']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-effects']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-strength']} */ ;
/** @type {__VLS_StyleScopedClasses['strength-label']} */ ;
/** @type {__VLS_StyleScopedClasses['strength-bars']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['strength-bar']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            personalTalents: personalTalents,
            potentialDevelopment: potentialDevelopment,
            keyFocus: keyFocus,
            actionAdvice: actionAdvice,
            getAdviceIcon: getAdviceIcon,
            coreAbilities: coreAbilities,
            externalTraits: externalTraits,
            internalTraits: internalTraits,
            traitSynthesis: traitSynthesis,
            getAbilityIcon: getAbilityIcon,
            getAbilityLevel: getAbilityLevel,
            lightenColor: lightenColor,
            fiveElements: fiveElements,
            dominantElement: dominantElement,
            elementBalance: elementBalance,
            fiveElementsInterpretation: fiveElementsInterpretation,
            keyPatterns: keyPatterns,
            getPatternClass: getPatternClass,
            getPatternIcon: getPatternIcon,
            getPatternType: getPatternType,
            onTalentClick: onTalentClick,
            onPotentialClick: onPotentialClick,
        };
    },
    __typeEmits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=FortuneOverview.vue.js.map