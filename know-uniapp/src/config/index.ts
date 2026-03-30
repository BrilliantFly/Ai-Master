import { isDevMode } from "@/utils/env";
const envBaseUrl = import.meta.env.VITE_APP_BASE_URL || "";
const envCustomerBaseUrl = import.meta.env.VITE_CUSTOMER_BASE_URL || "";

let baseUrl = `${envBaseUrl}/`;
let customerBaseUrl = `${envCustomerBaseUrl}/`;

/*
 * 微信小程序在`VITE_APP_BASE_URL`存在或`dev`模式下
 * 使用`VITE_APP_BASE_URL`的值
 * 其他情况使用`[baseUrl]`，方便服务端替换
 */

//#ifdef MP-WEIXIN
baseUrl = isDevMode() || envBaseUrl ? baseUrl : "[baseUrl]";
customerBaseUrl = isDevMode() || envCustomerBaseUrl ? customerBaseUrl : "[customerBaseUrl]";
//#endif

const config = {
    version: "1.9.0", //版本号
    baseUrl, //请求接口域名
    customerBaseUrl, //客户管理服务域名
    urlPrefix: "api", //请求默认前缀
    // Service path mapping - 服务路径映射
    serviceMap: {
        java: '/plan',    // Java services (plan, system, etc.)
        python: '/python', // Python AI services
        customer: '/customer' // Customer CRM service
    },
    timeout: 60 * 1000, //请求超时时长
};

export default config;
