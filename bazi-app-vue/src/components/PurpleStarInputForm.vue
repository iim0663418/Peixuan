<template>
  <el-form 
    ref="purpleStarForm"
    :model="formData" 
    :rules="formRules"
    @submit.prevent="submitForm"
  >
    <el-form-item :label="$t('astrology.purple_star_detail.form.title')" />
    
    <el-form-item :label="$t('astrology.purple_star_detail.form.birth_date')" prop="birthDate">
      <el-date-picker
        v-model="formData.birthDate"
        type="date"
        :placeholder="$t('astrology.purple_star_detail.form.birth_date')"
        value-format="YYYY-MM-DD"
      />
    </el-form-item>

    <el-form-item :label="$t('astrology.purple_star_detail.form.birth_time')" prop="birthTime">
      <el-time-picker
        v-model="formData.birthTime"
        :placeholder="$t('astrology.purple_star_detail.form.birth_time')"
        format="HH:mm"
        value-format="HH:mm"
      />
    </el-form-item>

    <el-form-item :label="$t('astrology.purple_star_detail.form.gender')" prop="gender">
      <el-radio-group v-model="formData.gender">
        <el-radio :value="'male'">{{ $t('form.genderOptions.male') }}</el-radio>
        <el-radio :value="'female'">{{ $t('form.genderOptions.female') }}</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item label="出生地點（時區選擇）">
      <el-select
        v-model="formData.timezone"
        filterable
        placeholder="選擇時區"
        style="width: 100%"
      >
        <el-option
          v-for="tz in timezones"
          :key="tz.value"
          :label="tz.label"
          :value="tz.value"
        />
      </el-select>
      <el-text type="info" size="small">
        選擇時區可提高紫微斗數計算的精確度
        <el-tooltip content="時區會影響命盤計算的精確性。若不確定，請選擇出生地附近的城市時區。">
          <el-icon><QuestionFilled /></el-icon>
        </el-tooltip>
      </el-text>
    </el-form-item>

    <el-form-item>
      <el-button 
        type="primary" 
        @click="submitForm"
      >
        {{ $t('form.submit') }}
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { QuestionFilled } from '@element-plus/icons-vue';
import { saveTimeZoneInfo, getTimeZoneInfo } from '../utils/storageService';

const emit = defineEmits(['submit']);

// 時區選項
const timezones = ref<Array<{ label: string; value: string }>>([
  { label: '亞洲/台北 (GMT+8)', value: 'Asia/Taipei' },
  { label: '亞洲/上海 (GMT+8)', value: 'Asia/Shanghai' },
  { label: '亞洲/香港 (GMT+8)', value: 'Asia/Hong_Kong' },
  { label: '亞洲/東京 (GMT+9)', value: 'Asia/Tokyo' },
  { label: '亞洲/首爾 (GMT+9)', value: 'Asia/Seoul' },
  { label: '亞洲/新加坡 (GMT+8)', value: 'Asia/Singapore' },
  { label: '澳洲/悉尼 (GMT+10)', value: 'Australia/Sydney' },
  { label: '歐洲/倫敦 (GMT+0)', value: 'Europe/London' },
  { label: '歐洲/巴黎 (GMT+1)', value: 'Europe/Paris' },
  { label: '美洲/紐約 (GMT-5)', value: 'America/New_York' },
  { label: '美洲/洛杉磯 (GMT-8)', value: 'America/Los_Angeles' },
  { label: '美洲/溫哥華 (GMT-8)', value: 'America/Vancouver' }
]);

const formData = reactive({
  birthDate: '',
  birthTime: '',
  gender: 'male' as 'male' | 'female',
  timezone: 'Asia/Taipei'
});

// 從 sessionStorage 加載保存的時區信息
onMounted(() => {
  const savedTimezone = getTimeZoneInfo();
  if (savedTimezone && savedTimezone.timeZone) {
    formData.timezone = savedTimezone.timeZone;
  }
});

const formRules = {
  birthDate: [
    { required: true, message: '請選擇出生日期', trigger: 'change' }
  ],
  birthTime: [
    { required: true, message: '請選擇出生時間', trigger: 'change' }
  ],
  gender: [
    { required: true, message: '請選擇性別', trigger: 'change' }
  ]
};

const purpleStarForm = ref();

const submitForm = async () => {
  if (!purpleStarForm.value) return;
  
  try {
    const isValid = await purpleStarForm.value.validate();
    if (isValid) {
      // 驗證通過，檢查必填欄位
      if (!formData.birthDate || !formData.birthTime || !formData.gender) {
        ElMessage.error('請填寫完整的出生資訊');
        return;
      }
      
      // 解析日期和時間
      const [year, month, day] = formData.birthDate.split('-').map(Number);
      const [hour, minute] = formData.birthTime.split(':').map(Number);
      
      if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour) || isNaN(minute)) {
        ElMessage.error('日期時間格式錯誤');
        return;
      }
      
      // 檢查 lunar-javascript 是否可用
      if (typeof Solar === 'undefined' || typeof Lunar === 'undefined') {
        ElMessage.error('lunar-javascript 庫未正確載入，請重新整理頁面');
        return;
      }
      
      console.log('農曆轉換輸入:', { year, month, day, hour, minute });
      
      // 直接使用解析出的數值創建 Solar 實例，避免 Date 對象的潛在問題
      const solarInstance = Solar.fromYmdHms(
        year,
        month,
        day,
        hour,
        minute,
        0
      );
      const lunarDate = solarInstance.getLunar();
      
      // 保存時區信息到 sessionStorage
      saveTimeZoneInfo(formData.timezone, year);
      
      // 構建發送給後端的資料格式
      const birthInfo = {
        birthDate: formData.birthDate,
        birthTime: formData.birthTime,
        gender: formData.gender,
        location: {
          longitude: 0, // 這裡可以根據時區推算一個大致經度，或者使用城市中心點
          latitude: 0,  // 同上
          timezone: formData.timezone
        },
        lunarInfo: {
          year: lunarDate.getYear(),
          month: lunarDate.getMonth(),
          day: lunarDate.getDay(),
          hour: lunarDate.getHour(),
          yearGan: lunarDate.getYearGan(),
          yearZhi: lunarDate.getYearZhi(),
          monthGan: lunarDate.getMonthGan(),
          monthZhi: lunarDate.getMonthZhi(),
          dayGan: lunarDate.getDayGan(),
          dayZhi: lunarDate.getDayZhi(),
          timeGan: lunarDate.getTimeGan(),
          timeZhi: lunarDate.getTimeZhi(),
          yearInGanZhi: lunarDate.getYearInGanZhi(),
          monthInGanZhi: lunarDate.getMonthInGanZhi(),
          dayInGanZhi: lunarDate.getDayInGanZhi(),
          timeInGanZhi: lunarDate.getTimeInGanZhi()
        }
      };
      
      console.log('前端農曆轉換結果:', birthInfo.lunarInfo);
      
      // 額外檢查農曆轉換結果是否有效
      if (birthInfo.lunarInfo.year && 
          !isNaN(birthInfo.lunarInfo.year) && 
          birthInfo.lunarInfo.month && 
          birthInfo.lunarInfo.day) {
        emit('submit', birthInfo);
      } else {
        console.error('農曆轉換結果無效:', birthInfo.lunarInfo);
        ElMessage.error('農曆轉換失敗，請確認日期時間輸入正確');
      }
    }
  } catch (error) {
    console.error('表單驗證或農曆轉換失敗:', error);
    ElMessage.error('農曆轉換或表單驗證失敗，請檢查輸入資料');
  }
};
</script>
