/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { FrontendValidator } from '@/utils/frontendValidation';
const emit = defineEmits(['submit']);
const birthInfo = reactive({
    birthDate: '',
    birthTime: '',
    gender: 'male', // 設置預設值為 'male'，避免類型錯誤
    location: ''
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
const submitForm = () => {
    // 使用前端驗證工具進行表單驗證
    const validationResult = FrontendValidator.validateBaziForm({
        birthDate: birthInfo.birthDate,
        birthTime: birthInfo.birthTime,
        gender: birthInfo.gender,
        location: { timezone: 'Asia/Taipei' } // 八字計算時區影響較小，使用預設值
    });
    if (!validationResult.isValid) {
        ElMessage.error(validationResult.errors.join('、'));
        return;
    }
    // 檢查 lunar-javascript 是否可用
    const libraryCheck = FrontendValidator.checkLunarLibrary();
    if (!libraryCheck.isValid) {
        ElMessage.error(libraryCheck.errors.join('、'));
        return;
    }
    emit('submit', birthInfo);
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['el-form-item__label']} */ ;
/** @type {__VLS_StyleScopedClasses['el-radio-group']} */ ;
/** @type {__VLS_StyleScopedClasses['el-radio']} */ ;
/** @type {__VLS_StyleScopedClasses['el-button']} */ ;
/** @type {__VLS_StyleScopedClasses['el-form-item']} */ ;
/** @type {__VLS_StyleScopedClasses['el-form-item__label']} */ ;
/** @type {__VLS_StyleScopedClasses['el-input__inner']} */ ;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onSubmit': {} },
    ref: "baziForm",
    model: (__VLS_ctx.birthInfo),
    rules: (__VLS_ctx.formRules),
}));
const __VLS_2 = __VLS_1({
    ...{ 'onSubmit': {} },
    ref: "baziForm",
    model: (__VLS_ctx.birthInfo),
    rules: (__VLS_ctx.formRules),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onSubmit: (__VLS_ctx.submitForm)
};
/** @type {typeof __VLS_ctx.baziForm} */ ;
var __VLS_8 = {};
__VLS_3.slots.default;
const __VLS_10 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_11 = __VLS_asFunctionalComponent(__VLS_10, new __VLS_10({
    label: (__VLS_ctx.$t('astrology.bazi_detail.form.title')),
}));
const __VLS_12 = __VLS_11({
    label: (__VLS_ctx.$t('astrology.bazi_detail.form.title')),
}, ...__VLS_functionalComponentArgsRest(__VLS_11));
const __VLS_14 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({
    label: (__VLS_ctx.$t('astrology.bazi_detail.form.birth_date')),
    prop: "birthDate",
}));
const __VLS_16 = __VLS_15({
    label: (__VLS_ctx.$t('astrology.bazi_detail.form.birth_date')),
    prop: "birthDate",
}, ...__VLS_functionalComponentArgsRest(__VLS_15));
__VLS_17.slots.default;
const __VLS_18 = {}.ElDatePicker;
/** @type {[typeof __VLS_components.ElDatePicker, typeof __VLS_components.elDatePicker, ]} */ ;
// @ts-ignore
const __VLS_19 = __VLS_asFunctionalComponent(__VLS_18, new __VLS_18({
    modelValue: (__VLS_ctx.birthInfo.birthDate),
    type: "date",
    placeholder: (__VLS_ctx.$t('astrology.bazi_detail.form.birth_date')),
    valueFormat: "YYYY-MM-DD",
}));
const __VLS_20 = __VLS_19({
    modelValue: (__VLS_ctx.birthInfo.birthDate),
    type: "date",
    placeholder: (__VLS_ctx.$t('astrology.bazi_detail.form.birth_date')),
    valueFormat: "YYYY-MM-DD",
}, ...__VLS_functionalComponentArgsRest(__VLS_19));
var __VLS_17;
const __VLS_22 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_23 = __VLS_asFunctionalComponent(__VLS_22, new __VLS_22({
    label: (__VLS_ctx.$t('astrology.bazi_detail.form.birth_time')),
    prop: "birthTime",
}));
const __VLS_24 = __VLS_23({
    label: (__VLS_ctx.$t('astrology.bazi_detail.form.birth_time')),
    prop: "birthTime",
}, ...__VLS_functionalComponentArgsRest(__VLS_23));
__VLS_25.slots.default;
const __VLS_26 = {}.ElTimePicker;
/** @type {[typeof __VLS_components.ElTimePicker, typeof __VLS_components.elTimePicker, ]} */ ;
// @ts-ignore
const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({
    modelValue: (__VLS_ctx.birthInfo.birthTime),
    placeholder: (__VLS_ctx.$t('astrology.bazi_detail.form.birth_time')),
    format: "HH:mm",
    valueFormat: "HH:mm",
}));
const __VLS_28 = __VLS_27({
    modelValue: (__VLS_ctx.birthInfo.birthTime),
    placeholder: (__VLS_ctx.$t('astrology.bazi_detail.form.birth_time')),
    format: "HH:mm",
    valueFormat: "HH:mm",
}, ...__VLS_functionalComponentArgsRest(__VLS_27));
var __VLS_25;
const __VLS_30 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_31 = __VLS_asFunctionalComponent(__VLS_30, new __VLS_30({
    label: (__VLS_ctx.$t('astrology.bazi_detail.form.gender')),
    prop: "gender",
}));
const __VLS_32 = __VLS_31({
    label: (__VLS_ctx.$t('astrology.bazi_detail.form.gender')),
    prop: "gender",
}, ...__VLS_functionalComponentArgsRest(__VLS_31));
__VLS_33.slots.default;
const __VLS_34 = {}.ElRadioGroup;
/** @type {[typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, ]} */ ;
// @ts-ignore
const __VLS_35 = __VLS_asFunctionalComponent(__VLS_34, new __VLS_34({
    modelValue: (__VLS_ctx.birthInfo.gender),
}));
const __VLS_36 = __VLS_35({
    modelValue: (__VLS_ctx.birthInfo.gender),
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
    label: (__VLS_ctx.$t('astrology.bazi_detail.form.location')),
    prop: "location",
}));
const __VLS_48 = __VLS_47({
    label: (__VLS_ctx.$t('astrology.bazi_detail.form.location')),
    prop: "location",
}, ...__VLS_functionalComponentArgsRest(__VLS_47));
__VLS_49.slots.default;
const __VLS_50 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50({
    modelValue: (__VLS_ctx.birthInfo.location),
    placeholder: "出生地點（選填，影響真太陽時計算）",
}));
const __VLS_52 = __VLS_51({
    modelValue: (__VLS_ctx.birthInfo.location),
    placeholder: "出生地點（選填，影響真太陽時計算）",
}, ...__VLS_functionalComponentArgsRest(__VLS_51));
const __VLS_54 = {}.ElText;
/** @type {[typeof __VLS_components.ElText, typeof __VLS_components.elText, typeof __VLS_components.ElText, typeof __VLS_components.elText, ]} */ ;
// @ts-ignore
const __VLS_55 = __VLS_asFunctionalComponent(__VLS_54, new __VLS_54({
    type: "info",
    size: "small",
    ...{ style: {} },
}));
const __VLS_56 = __VLS_55({
    type: "info",
    size: "small",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_55));
__VLS_57.slots.default;
var __VLS_57;
var __VLS_49;
const __VLS_58 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_59 = __VLS_asFunctionalComponent(__VLS_58, new __VLS_58({}));
const __VLS_60 = __VLS_59({}, ...__VLS_functionalComponentArgsRest(__VLS_59));
__VLS_61.slots.default;
const __VLS_62 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_63 = __VLS_asFunctionalComponent(__VLS_62, new __VLS_62({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_64 = __VLS_63({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_63));
let __VLS_66;
let __VLS_67;
let __VLS_68;
const __VLS_69 = {
    onClick: (__VLS_ctx.submitForm)
};
__VLS_65.slots.default;
(__VLS_ctx.$t('form.submit'));
var __VLS_65;
var __VLS_61;
var __VLS_3;
// @ts-ignore
var __VLS_9 = __VLS_8;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            birthInfo: birthInfo,
            formRules: formRules,
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
//# sourceMappingURL=BaziInputForm.vue.js.map