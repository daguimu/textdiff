export type Locale = 'en' | 'zh';

interface MessageDef {
  sample: string;
  allLeft: string;
  allRight: string;
  undo: string;
  prevDiff: string;
  nextDiff: string;
  noChanges: string;
  fileChanged: (n: number) => string;
  darkMode: string;
  lightMode: string;
  original: string;
  modified: string;
  clear: string;
  copy: string;
  copied: string;
  copyOriginal: string;
  copyModified: string;
  placeholderLeft: string;
  placeholderRight: string;
  lineEndings: string;
  copyLeft: string;
  copyRight: string;
  copiedBang: string;
  download: string;
  statsText: (files: number, ins: number, del: number) => string;
  acceptLeftToRight: string;
  acceptRightToLeft: string;
  loadSample: string;
  acceptAllLeft: string;
  acceptAllRight: string;
}

const messages: Record<Locale, MessageDef> = {
  en: {
    // Header
    sample: 'Sample',
    allLeft: 'All Left',
    allRight: 'All Right',
    undo: 'Undo',
    prevDiff: 'Previous difference',
    nextDiff: 'Next difference',
    noChanges: 'No changes',
    fileChanged: (n: number) => `${n} file${n !== 1 ? 's' : ''} changed`,
    darkMode: 'Switch to dark mode',
    lightMode: 'Switch to light mode',

    // Panel labels
    original: 'Original',
    modified: 'Modified',
    clear: 'Clear',

    // Editor
    copy: 'Copy',
    copied: 'Copied',
    copyOriginal: 'Copy original text',
    copyModified: 'Copy modified text',
    placeholderLeft: 'Paste or type the original text...',
    placeholderRight: 'Paste or type the modified text...',

    // Export bar
    lineEndings: 'Line endings',
    copyLeft: 'Copy Left',
    copyRight: 'Copy Right',
    copiedBang: 'Copied!',
    download: 'Download',
    statsText: (files: number, ins: number, del: number) =>
      `${files} file changed, ${ins} insertion${ins !== 1 ? 's' : ''} (+), ${del} deletion${del !== 1 ? 's' : ''} (-)`,

    // Merge gutter
    acceptLeftToRight: 'Accept left → right',
    acceptRightToLeft: 'Accept right → left',

    // Toolbar titles
    loadSample: 'Load sample texts',
    acceptAllLeft: 'Accept all from left',
    acceptAllRight: 'Accept all from right',
  },
  zh: {
    sample: '示例',
    allLeft: '采纳左侧',
    allRight: '采纳右侧',
    undo: '撤销',
    prevDiff: '上一个差异',
    nextDiff: '下一个差异',
    noChanges: '无差异',
    fileChanged: (n: number) => `${n} 个文件已更改`,
    darkMode: '切换到深色模式',
    lightMode: '切换到浅色模式',

    original: '原始文本',
    modified: '修改文本',
    clear: '清空',

    copy: '复制',
    copied: '已复制',
    copyOriginal: '复制原始文本',
    copyModified: '复制修改文本',
    placeholderLeft: '粘贴或输入原始文本...',
    placeholderRight: '粘贴或输入修改文本...',

    lineEndings: '换行符',
    copyLeft: '复制左侧',
    copyRight: '复制右侧',
    copiedBang: '已复制!',
    download: '下载',
    statsText: (files: number, ins: number, del: number) =>
      `${files} 个文件已更改, ${ins} 处插入 (+), ${del} 处删除 (-)`,

    acceptLeftToRight: '采纳左侧 → 右侧',
    acceptRightToLeft: '采纳右侧 → 左侧',

    loadSample: '加载示例文本',
    acceptAllLeft: '全部采纳左侧',
    acceptAllRight: '全部采纳右侧',
  },
};

export type Messages = MessageDef;

export function getMessages(locale: Locale): Messages {
  return messages[locale];
}
