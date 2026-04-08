import { langToLocaleMap } from "@i18n/language";
import { getDefaultLanguage } from "./language";


// export function formatDateToYYYYMMDD(date: Date): string {
//     return date.toISOString().substring(0, 10);
// }

// 国际化日期格式化函数
// export function formatDateI18n(dateString: string): string {
//     const date = new Date(dateString);
//     const lang = getDefaultLanguage();

//     // 根据语言设置不同的日期格式
//     const options: Intl.DateTimeFormatOptions = {
//         year: "numeric",
//         month: "long",
//         day: "numeric",
//     };

//     // 使用统一的语言配置获取 locale
//     const locale = langToLocaleMap[lang] || "en-US";
//     return date.toLocaleDateString(locale, options);
// }

// 只保留这一个 formatDateToYYYYMMDD 即可
export function formatDateToYYYYMMDD(date: Date): string {
    // 获取本地时间，并确保补齐两位数
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    // 拼接成年-月-日 时:分 的格式
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}