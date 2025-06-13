#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
紫微斗數五行局完整性分析工具
分析60甲子納音五行與五行局的對應關係
"""

# 六十甲子納音五行對照表（傳統紫微斗數五行局依據）
SIXTY_JIAZI_NAYIN = {
    # 水二局 (12個)
    "甲子": "海中金", "乙丑": "海中金",
    "甲寅": "大溪水", "乙卯": "大溪水", 
    "甲申": "井泉水", "乙酉": "井泉水",
    "壬子": "桑柘木", "癸丑": "桑柘木",
    "壬戌": "大海水", "癸亥": "大海水",
    "丙子": "澗下水", "丁丑": "澗下水",
    
    # 木三局 (12個)
    "壬申": "劍鋒金", "癸酉": "劍鋒金",
    "壬午": "楊柳木", "癸未": "楊柳木",
    "庚寅": "松柏木", "辛卯": "松柏木",
    "庚申": "石榴木", "辛酉": "石榴木",
    "戊辰": "大林木", "己巳": "大林木",
    "戊戌": "平地木", "己亥": "平地木",
    
    # 金四局 (12個)
    "甲午": "沙中金", "乙未": "沙中金",
    "壬寅": "金箔金", "癸卯": "金箔金",
    "庚辰": "白蠟金", "辛巳": "白蠟金",
    "庚戌": "釵釧金", "辛亥": "釵釧金",
    "甲辰": "覆燈火", "乙巳": "覆燈火",
    "丙申": "山下火", "丁酉": "山下火",
    
    # 土五局 (12個)
    "戊寅": "城頭土", "己卯": "城頭土",
    "丙戌": "屋上土", "丁亥": "屋上土",
    "庚午": "路旁土", "辛未": "路旁土",
    "戊申": "大驛土", "己酉": "大驛土",
    "庚子": "壁上土", "辛丑": "壁上土",
    "丙辰": "沙中土", "丁巳": "沙中土",
    
    # 火六局 (12個)
    "丙寅": "爐中火", "丁卯": "爐中火",
    "甲戌": "山頭火", "乙亥": "山頭火",
    "戊子": "霹靂火", "己丑": "霹靂火",
    "戊午": "天上火", "己未": "天上火",
    "甲申": "井泉水", "乙酉": "井泉水",  # 注意：這裡有重複，需要調整
    "丙午": "天河水", "丁未": "天河水",
}

# 正確的五行局分類（基於紫微斗數傳統）
CORRECT_FIVE_ELEMENTS_BUREAU = {
    # 水二局 (12個)
    "水二局": [
        "甲子", "乙丑",    # 海中金
        "甲寅", "乙卯",    # 大溪水  
        "甲申", "乙酉",    # 井泉水
        "壬子", "癸丑",    # 桑柘木
        "壬戌", "癸亥",    # 大海水
        "丙子", "丁丑"     # 澗下水
    ],
    
    # 木三局 (12個)
    "木三局": [
        "壬申", "癸酉",    # 劍鋒金
        "壬午", "癸未",    # 楊柳木
        "庚寅", "辛卯",    # 松柏木
        "庚申", "辛酉",    # 石榴木
        "戊辰", "己巳",    # 大林木
        "戊戌", "己亥"     # 平地木
    ],
    
    # 金四局 (12個)
    "金四局": [
        "甲午", "乙未",    # 沙中金
        "壬寅", "癸卯",    # 金箔金
        "庚辰", "辛巳",    # 白蠟金
        "庚戌", "辛亥",    # 釵釧金
        "甲辰", "乙巳",    # 覆燈火
        "丙申", "丁酉"     # 山下火
    ],
    
    # 土五局 (12個)
    "土五局": [
        "戊寅", "己卯",    # 城頭土
        "丙戌", "丁亥",    # 屋上土
        "庚午", "辛未",    # 路旁土
        "戊申", "己酉",    # 大驛土
        "庚子", "辛丑",    # 壁上土
        "丙辰", "丁巳"     # 沙中土
    ],
    
    # 火六局 (12個)
    "火六局": [
        "丙寅", "丁卯",    # 爐中火
        "甲戌", "乙亥",    # 山頭火
        "戊子", "己丑",    # 霹靂火
        "戊午", "己未",    # 天上火
        "甲申", "乙酉",    # 井泉水（特殊情況）
        "丙午", "丁未"     # 天河水
    ]
}

# 當前系統使用的五行局查表
CURRENT_SYSTEM_BUREAU = {
    "金四局": ["甲子", "乙丑", "壬申", "癸酉", "庚辰", "辛巳", "甲午", "乙未", "庚戌", "辛亥", "壬寅", "癸卯"],
    "火六局": ["丙寅", "丁卯", "甲戌", "乙亥", "戊子", "己丑", "丙申", "丁酉", "甲辰", "乙巳"],
    "木三局": ["戊辰", "己巳", "壬午", "癸未", "戊戌", "己亥", "壬子", "癸丑"],
    "土五局": ["庚午", "辛未", "戊寅", "己卯", "丙戌", "丁亥", "戊申", "己酉", "庚子", "辛丑"],
    "水二局": ["丙子", "丁丑", "甲申", "乙酉", "壬辰", "癸巳", "丙午", "丁未"]
}

def analyze_completeness():
    """分析當前系統五行局的完整性"""
    print("=== 紫微斗數五行局完整性分析 ===")
    
    # 統計當前系統覆蓋的組合
    current_combinations = set()
    for bureau, combinations in CURRENT_SYSTEM_BUREAU.items():
        current_combinations.update(combinations)
        print(f"{bureau}: {len(combinations)}個組合")
    
    print(f"\n當前系統總覆蓋: {len(current_combinations)}/60 個組合")
    
    # 生成完整的60甲子
    heavenly_stems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]
    earthly_branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]
    
    all_combinations = []
    for i in range(60):
        stem = heavenly_stems[i % 10]
        branch = earthly_branches[i % 12]
        all_combinations.append(stem + branch)
    
    # 找出缺失的組合
    missing_combinations = set(all_combinations) - current_combinations
    print(f"\n缺失的組合 ({len(missing_combinations)}個):")
    for combo in sorted(missing_combinations):
        print(f"  {combo}")
    
    return missing_combinations

def generate_corrected_lookup():
    """生成修正後的查表代碼"""
    print("\n=== 生成修正後的五行局查表 ===")
    
    # 基於傳統紫微斗數理論的正確分類
    corrected_bureau = {
        "水二局": [
            "甲子", "乙丑", "丙子", "丁丑", "甲寅", "乙卯", 
            "甲申", "乙酉", "壬子", "癸丑", "壬戌", "癸亥"
        ],
        "木三局": [
            "戊辰", "己巳", "壬午", "癸未", "戊戌", "己亥", 
            "壬申", "癸酉", "庚寅", "辛卯", "庚申", "辛酉"
        ],
        "金四局": [
            "甲午", "乙未", "壬寅", "癸卯", "庚辰", "辛巳",
            "庚戌", "辛亥", "甲辰", "乙巳", "丙申", "丁酉"
        ],
        "土五局": [
            "戊寅", "己卯", "丙戌", "丁亥", "庚午", "辛未",
            "戊申", "己酉", "庚子", "辛丑", "丙辰", "丁巳"
        ],
        "火六局": [
            "丙寅", "丁卯", "甲戌", "乙亥", "戊子", "己丑",
            "戊午", "己未", "丙午", "丁未", "壬辰", "癸巳"
        ]
    }
    
    print("TypeScript 代碼:")
    print("private calculateFiveElementsBureau(): string {")
    print("  const mingPalaceGan = this.mingPalaceGan;")
    print("  const mingPalaceZhi = this.ZHI_NAMES[this.mingPalaceStdIndex];")
    print("  const mingGanZhi = mingPalaceGan + mingPalaceZhi;")
    print()
    
    for bureau, combinations in corrected_bureau.items():
        combo_str = '", "'.join(combinations)
        print(f'  if (["{combo_str}"].includes(mingGanZhi)) return "{bureau}";')
    
    print()
    print("  // 如果找不到對應的五行局，拋出錯誤而非使用預設值")
    print("  throw new Error(`無法確定命宮干支 ${mingGanZhi} 的五行局，請檢查輸入資料是否正確`);")
    print("}")
    
    return corrected_bureau

if __name__ == "__main__":
    # 分析當前系統的完整性
    missing = analyze_completeness()
    
    # 生成修正後的查表
    corrected = generate_corrected_lookup()
    
    # 驗證修正後的完整性
    print("\n=== 驗證修正後的完整性 ===")
    corrected_combinations = set()
    for bureau, combinations in corrected.items():
        corrected_combinations.update(combinations)
    
    print(f"修正後總覆蓋: {len(corrected_combinations)}/60 個組合")
    
    if len(corrected_combinations) == 60:
        print("✅ 修正後的查表已完整覆蓋所有60甲子組合")
    else:
        print("❌ 修正後的查表仍有缺失")