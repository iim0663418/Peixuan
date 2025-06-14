/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { QuestionFilled } from '@element-plus/icons-vue';
import { saveTimeZoneInfo, getTimeZoneInfo } from '../utils/storageService';
const emit = defineEmits(['submit']);
// 時區選項
const timezones = ref([
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
    gender: 'male',
    longitude: null,
    latitude: null,
    timezone: 'Asia/Taipei'
});
const selectedCity = ref('');
// 主要城市座標資料
const majorCities = ref([
    { label: '台北, 台灣', value: 'taipei', longitude: 121.5654, latitude: 25.0330, timezone: 'Asia/Taipei' },
    { label: '高雄, 台灣', value: 'kaohsiung', longitude: 120.3014, latitude: 22.6273, timezone: 'Asia/Taipei' },
    { label: '台中, 台灣', value: 'taichung', longitude: 120.6736, latitude: 24.1477, timezone: 'Asia/Taipei' },
    { label: '上海, 中國', value: 'shanghai', longitude: 121.4737, latitude: 31.2304, timezone: 'Asia/Shanghai' },
    { label: '北京, 中國', value: 'beijing', longitude: 116.4074, latitude: 39.9042, timezone: 'Asia/Shanghai' },
    { label: '香港', value: 'hongkong', longitude: 114.1694, latitude: 22.3193, timezone: 'Asia/Hong_Kong' },
    { label: '東京, 日本', value: 'tokyo', longitude: 139.6917, latitude: 35.6895, timezone: 'Asia/Tokyo' },
    { label: '首爾, 韓國', value: 'seoul', longitude: 126.9780, latitude: 37.5665, timezone: 'Asia/Seoul' },
    { label: '新加坡', value: 'singapore', longitude: 103.8198, latitude: 1.3521, timezone: 'Asia/Singapore' },
    { label: '倫敦, 英國', value: 'london', longitude: -0.1276, latitude: 51.5074, timezone: 'Europe/London' },
    { label: '紐約, 美國', value: 'newyork', longitude: -74.0060, latitude: 40.7128, timezone: 'America/New_York' },
    { label: '洛杉磯, 美國', value: 'losangeles', longitude: -118.2437, latitude: 34.0522, timezone: 'America/Los_Angeles' }
]);
// 填入城市座標
const fillCityCoordinates = (cityValue) => {
    const city = majorCities.value.find(c => c.value === cityValue);
    if (city) {
        formData.longitude = city.longitude;
        formData.latitude = city.latitude;
        formData.timezone = city.timezone;
    }
};
// 從 sessionStorage 加載保存的時區資訊
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
    ],
    location: [
        {
            validator: (_rule, _value, callback) => {
                // 驗證經度
                if (formData.longitude === null || formData.longitude === undefined) {
                    callback(new Error('請輸入出生地經度（可選擇城市自動填入）'));
                    return;
                }
                if (formData.longitude < -180 || formData.longitude > 180) {
                    callback(new Error('經度必須在 -180 到 180 之間'));
                    return;
                }
                // 驗證緯度
                if (formData.latitude === null || formData.latitude === undefined) {
                    callback(new Error('請輸入出生地緯度（可選擇城市自動填入）'));
                    return;
                }
                if (formData.latitude < -90 || formData.latitude > 90) {
                    callback(new Error('緯度必須在 -90 到 90 之間'));
                    return;
                }
                // 驗證時區
                if (!formData.timezone) {
                    callback(new Error('請選擇時區'));
                    return;
                }
                callback();
            },
            trigger: 'blur'
        }
    ]
};
const purpleStarForm = ref();
const submitForm = async () => {
    if (!purpleStarForm.value)
        return;
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
            const solarInstance = Solar.fromYmdHms(year, month, day, hour, minute, 0);
            const lunarDate = solarInstance.getLunar();
            // 保存時區資訊到 sessionStorage
            saveTimeZoneInfo(formData.timezone, year);
            // 驗證位置資訊
            if (formData.longitude === null || formData.latitude === null) {
                ElMessage.error('請提供完整的出生地理位置資訊（經度和緯度）');
                return;
            }
            // 構建發送給後端的資料格式
            const birthInfo = {
                birthDate: formData.birthDate,
                birthTime: formData.birthTime,
                gender: formData.gender,
                location: {
                    longitude: formData.longitude,
                    latitude: formData.latitude,
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
            }
            else {
                console.error('農曆轉換結果無效:', birthInfo.lunarInfo);
                ElMessage.error('農曆轉換失敗，請確認日期時間輸入正確');
            }
        }
    }
    catch (error) {
        console.error('表單驗證或農曆轉換失敗:', error);
        ElMessage.error('農曆轉換或表單驗證失敗，請檢查輸入資料');
    }
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
const __VLS_0 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onSubmit': {} },
    ref: "purpleStarForm",
    model: (__VLS_ctx.formData),
    rules: (__VLS_ctx.formRules),
}));
const __VLS_2 = __VLS_1({
    ...{ 'onSubmit': {} },
    ref: "purpleStarForm",
    model: (__VLS_ctx.formData),
    rules: (__VLS_ctx.formRules),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onSubmit: (__VLS_ctx.submitForm)
};
/** @type {typeof __VLS_ctx.purpleStarForm} */ ;
var __VLS_8 = {};
__VLS_3.slots.default;
const __VLS_10 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_11 = __VLS_asFunctionalComponent(__VLS_10, new __VLS_10({
    label: (__VLS_ctx.$t('astrology.purple_star_detail.form.title')),
}));
const __VLS_12 = __VLS_11({
    label: (__VLS_ctx.$t('astrology.purple_star_detail.form.title')),
}, ...__VLS_functionalComponentArgsRest(__VLS_11));
const __VLS_14 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({
    label: (__VLS_ctx.$t('astrology.purple_star_detail.form.birth_date')),
    prop: "birthDate",
}));
const __VLS_16 = __VLS_15({
    label: (__VLS_ctx.$t('astrology.purple_star_detail.form.birth_date')),
    prop: "birthDate",
}, ...__VLS_functionalComponentArgsRest(__VLS_15));
__VLS_17.slots.default;
const __VLS_18 = {}.ElDatePicker;
/** @type {[typeof __VLS_components.ElDatePicker, typeof __VLS_components.elDatePicker, ]} */ ;
// @ts-ignore
const __VLS_19 = __VLS_asFunctionalComponent(__VLS_18, new __VLS_18({
    modelValue: (__VLS_ctx.formData.birthDate),
    type: "date",
    placeholder: (__VLS_ctx.$t('astrology.purple_star_detail.form.birth_date')),
    valueFormat: "YYYY-MM-DD",
}));
const __VLS_20 = __VLS_19({
    modelValue: (__VLS_ctx.formData.birthDate),
    type: "date",
    placeholder: (__VLS_ctx.$t('astrology.purple_star_detail.form.birth_date')),
    valueFormat: "YYYY-MM-DD",
}, ...__VLS_functionalComponentArgsRest(__VLS_19));
var __VLS_17;
const __VLS_22 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_23 = __VLS_asFunctionalComponent(__VLS_22, new __VLS_22({
    label: (__VLS_ctx.$t('astrology.purple_star_detail.form.birth_time')),
    prop: "birthTime",
}));
const __VLS_24 = __VLS_23({
    label: (__VLS_ctx.$t('astrology.purple_star_detail.form.birth_time')),
    prop: "birthTime",
}, ...__VLS_functionalComponentArgsRest(__VLS_23));
__VLS_25.slots.default;
const __VLS_26 = {}.ElTimePicker;
/** @type {[typeof __VLS_components.ElTimePicker, typeof __VLS_components.elTimePicker, ]} */ ;
// @ts-ignore
const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({
    modelValue: (__VLS_ctx.formData.birthTime),
    placeholder: (__VLS_ctx.$t('astrology.purple_star_detail.form.birth_time')),
    format: "HH:mm",
    valueFormat: "HH:mm",
}));
const __VLS_28 = __VLS_27({
    modelValue: (__VLS_ctx.formData.birthTime),
    placeholder: (__VLS_ctx.$t('astrology.purple_star_detail.form.birth_time')),
    format: "HH:mm",
    valueFormat: "HH:mm",
}, ...__VLS_functionalComponentArgsRest(__VLS_27));
var __VLS_25;
const __VLS_30 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_31 = __VLS_asFunctionalComponent(__VLS_30, new __VLS_30({
    label: (__VLS_ctx.$t('astrology.purple_star_detail.form.gender')),
    prop: "gender",
}));
const __VLS_32 = __VLS_31({
    label: (__VLS_ctx.$t('astrology.purple_star_detail.form.gender')),
    prop: "gender",
}, ...__VLS_functionalComponentArgsRest(__VLS_31));
__VLS_33.slots.default;
const __VLS_34 = {}.ElRadioGroup;
/** @type {[typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, ]} */ ;
// @ts-ignore
const __VLS_35 = __VLS_asFunctionalComponent(__VLS_34, new __VLS_34({
    modelValue: (__VLS_ctx.formData.gender),
}));
const __VLS_36 = __VLS_35({
    modelValue: (__VLS_ctx.formData.gender),
}, ...__VLS_functionalComponentArgsRest(__VLS_35));
__VLS_37.slots.default;
const __VLS_38 = {}.ElRadio;
/** @type {[typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, ]} */ ;
// @ts-ignore
const __VLS_39 = __VLS_asFunctionalComponent(__VLS_38, new __VLS_38({
    value: ('male'),
}));
const __VLS_40 = __VLS_39({
    value: ('male'),
}, ...__VLS_functionalComponentArgsRest(__VLS_39));
__VLS_41.slots.default;
(__VLS_ctx.$t('form.genderOptions.male'));
var __VLS_41;
const __VLS_42 = {}.ElRadio;
/** @type {[typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, ]} */ ;
// @ts-ignore
const __VLS_43 = __VLS_asFunctionalComponent(__VLS_42, new __VLS_42({
    value: ('female'),
}));
const __VLS_44 = __VLS_43({
    value: ('female'),
}, ...__VLS_functionalComponentArgsRest(__VLS_43));
__VLS_45.slots.default;
(__VLS_ctx.$t('form.genderOptions.female'));
var __VLS_45;
var __VLS_37;
var __VLS_33;
const __VLS_46 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_47 = __VLS_asFunctionalComponent(__VLS_46, new __VLS_46({
    label: "出生地點（精確計算必需）",
    prop: "location",
}));
const __VLS_48 = __VLS_47({
    label: "出生地點（精確計算必需）",
    prop: "location",
}, ...__VLS_functionalComponentArgsRest(__VLS_47));
__VLS_49.slots.default;
const __VLS_50 = {}.ElRow;
/** @type {[typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ]} */ ;
// @ts-ignore
const __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50({
    gutter: (12),
}));
const __VLS_52 = __VLS_51({
    gutter: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_51));
__VLS_53.slots.default;
const __VLS_54 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_55 = __VLS_asFunctionalComponent(__VLS_54, new __VLS_54({
    span: (8),
}));
const __VLS_56 = __VLS_55({
    span: (8),
}, ...__VLS_functionalComponentArgsRest(__VLS_55));
__VLS_57.slots.default;
const __VLS_58 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_59 = __VLS_asFunctionalComponent(__VLS_58, new __VLS_58({
    modelValue: (__VLS_ctx.formData.longitude),
    modelModifiers: { number: true, },
    placeholder: "經度",
    type: "number",
    min: (-180),
    max: (180),
    step: (0.000001),
}));
const __VLS_60 = __VLS_59({
    modelValue: (__VLS_ctx.formData.longitude),
    modelModifiers: { number: true, },
    placeholder: "經度",
    type: "number",
    min: (-180),
    max: (180),
    step: (0.000001),
}, ...__VLS_functionalComponentArgsRest(__VLS_59));
__VLS_61.slots.default;
{
    const { prepend: __VLS_thisSlot } = __VLS_61.slots;
}
var __VLS_61;
var __VLS_57;
const __VLS_62 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_63 = __VLS_asFunctionalComponent(__VLS_62, new __VLS_62({
    span: (8),
}));
const __VLS_64 = __VLS_63({
    span: (8),
}, ...__VLS_functionalComponentArgsRest(__VLS_63));
__VLS_65.slots.default;
const __VLS_66 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_67 = __VLS_asFunctionalComponent(__VLS_66, new __VLS_66({
    modelValue: (__VLS_ctx.formData.latitude),
    modelModifiers: { number: true, },
    placeholder: "緯度",
    type: "number",
    min: (-90),
    max: (90),
    step: (0.000001),
}));
const __VLS_68 = __VLS_67({
    modelValue: (__VLS_ctx.formData.latitude),
    modelModifiers: { number: true, },
    placeholder: "緯度",
    type: "number",
    min: (-90),
    max: (90),
    step: (0.000001),
}, ...__VLS_functionalComponentArgsRest(__VLS_67));
__VLS_69.slots.default;
{
    const { prepend: __VLS_thisSlot } = __VLS_69.slots;
}
var __VLS_69;
var __VLS_65;
const __VLS_70 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_71 = __VLS_asFunctionalComponent(__VLS_70, new __VLS_70({
    span: (8),
}));
const __VLS_72 = __VLS_71({
    span: (8),
}, ...__VLS_functionalComponentArgsRest(__VLS_71));
__VLS_73.slots.default;
const __VLS_74 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_75 = __VLS_asFunctionalComponent(__VLS_74, new __VLS_74({
    modelValue: (__VLS_ctx.formData.timezone),
    filterable: true,
    placeholder: "時區",
    ...{ style: {} },
}));
const __VLS_76 = __VLS_75({
    modelValue: (__VLS_ctx.formData.timezone),
    filterable: true,
    placeholder: "時區",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_75));
__VLS_77.slots.default;
for (const [tz] of __VLS_getVForSourceType((__VLS_ctx.timezones))) {
    const __VLS_78 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_79 = __VLS_asFunctionalComponent(__VLS_78, new __VLS_78({
        key: (tz.value),
        label: (tz.label),
        value: (tz.value),
    }));
    const __VLS_80 = __VLS_79({
        key: (tz.value),
        label: (tz.label),
        value: (tz.value),
    }, ...__VLS_functionalComponentArgsRest(__VLS_79));
}
var __VLS_77;
var __VLS_73;
var __VLS_53;
const __VLS_82 = {}.ElText;
/** @type {[typeof __VLS_components.ElText, typeof __VLS_components.elText, typeof __VLS_components.ElText, typeof __VLS_components.elText, ]} */ ;
// @ts-ignore
const __VLS_83 = __VLS_asFunctionalComponent(__VLS_82, new __VLS_82({
    type: "warning",
    size: "small",
    ...{ style: {} },
}));
const __VLS_84 = __VLS_83({
    type: "warning",
    size: "small",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_83));
__VLS_85.slots.default;
const __VLS_86 = {}.ElTooltip;
/** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
// @ts-ignore
const __VLS_87 = __VLS_asFunctionalComponent(__VLS_86, new __VLS_86({
    content: "可使用 Google Maps 或其他地圖服務獲取出生地的精確經緯度座標",
}));
const __VLS_88 = __VLS_87({
    content: "可使用 Google Maps 或其他地圖服務獲取出生地的精確經緯度座標",
}, ...__VLS_functionalComponentArgsRest(__VLS_87));
__VLS_89.slots.default;
const __VLS_90 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_91 = __VLS_asFunctionalComponent(__VLS_90, new __VLS_90({}));
const __VLS_92 = __VLS_91({}, ...__VLS_functionalComponentArgsRest(__VLS_91));
__VLS_93.slots.default;
const __VLS_94 = {}.QuestionFilled;
/** @type {[typeof __VLS_components.QuestionFilled, ]} */ ;
// @ts-ignore
const __VLS_95 = __VLS_asFunctionalComponent(__VLS_94, new __VLS_94({}));
const __VLS_96 = __VLS_95({}, ...__VLS_functionalComponentArgsRest(__VLS_95));
var __VLS_93;
var __VLS_89;
var __VLS_85;
var __VLS_49;
const __VLS_98 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_99 = __VLS_asFunctionalComponent(__VLS_98, new __VLS_98({
    label: "或選擇常用城市（自動填入座標）",
}));
const __VLS_100 = __VLS_99({
    label: "或選擇常用城市（自動填入座標）",
}, ...__VLS_functionalComponentArgsRest(__VLS_99));
__VLS_101.slots.default;
const __VLS_102 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_103 = __VLS_asFunctionalComponent(__VLS_102, new __VLS_102({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.selectedCity),
    filterable: true,
    placeholder: "選擇城市快速填入座標",
    ...{ style: {} },
    clearable: true,
}));
const __VLS_104 = __VLS_103({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.selectedCity),
    filterable: true,
    placeholder: "選擇城市快速填入座標",
    ...{ style: {} },
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_103));
let __VLS_106;
let __VLS_107;
let __VLS_108;
const __VLS_109 = {
    onChange: (__VLS_ctx.fillCityCoordinates)
};
__VLS_105.slots.default;
for (const [city] of __VLS_getVForSourceType((__VLS_ctx.majorCities))) {
    const __VLS_110 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_111 = __VLS_asFunctionalComponent(__VLS_110, new __VLS_110({
        key: (city.value),
        label: (city.label),
        value: (city.value),
    }));
    const __VLS_112 = __VLS_111({
        key: (city.value),
        label: (city.label),
        value: (city.value),
    }, ...__VLS_functionalComponentArgsRest(__VLS_111));
}
var __VLS_105;
var __VLS_101;
const __VLS_114 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_115 = __VLS_asFunctionalComponent(__VLS_114, new __VLS_114({}));
const __VLS_116 = __VLS_115({}, ...__VLS_functionalComponentArgsRest(__VLS_115));
__VLS_117.slots.default;
const __VLS_118 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_119 = __VLS_asFunctionalComponent(__VLS_118, new __VLS_118({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_120 = __VLS_119({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_119));
let __VLS_122;
let __VLS_123;
let __VLS_124;
const __VLS_125 = {
    onClick: (__VLS_ctx.submitForm)
};
__VLS_121.slots.default;
(__VLS_ctx.$t('form.submit'));
var __VLS_121;
var __VLS_117;
var __VLS_3;
// @ts-ignore
var __VLS_9 = __VLS_8;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            QuestionFilled: QuestionFilled,
            timezones: timezones,
            formData: formData,
            selectedCity: selectedCity,
            majorCities: majorCities,
            fillCityCoordinates: fillCityCoordinates,
            formRules: formRules,
            purpleStarForm: purpleStarForm,
            submitForm: submitForm,
        };
    },
    emits: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    emits: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=PurpleStarInputForm.vue.js.map