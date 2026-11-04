/**
 * 身份常量：插件 id、API 前缀、数据根目录名、UI 入口（家族口径，TAK 版）。
 * `id` 必须与 package.json 的 name 一致（check-workbench-package 比对）。
 * API_PREFIX 是宿主挂载前缀；宿主里 API_BASE='/api/takayasu'，页面拼 `${API_BASE}/api/bootstrap`。
 * 守卫只禁「交界处重复 /api」，不许 includes('/api') 一刀切（GBM 踩 4）。
 */
export const PLUGIN_ID = 'takayasu-workbench-main';
export const PACKAGE_NAME = '@xyb-community/takayasu-workbench';
export const API_PREFIX = 'takayasu';
export const HOME_DIR = 'takayasu';
export const DB_FILE = 'takayasu-workbench.sqlite';
export const UI_ENTRY = 'index.html';
export const DEV_PORT = 7795;
