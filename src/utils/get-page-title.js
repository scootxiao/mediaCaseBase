import defaultSettings from '@/settings'

const title = defaultSettings.title || '中泓在线'

export default function getPageTitle(pageTitle) {
  if (pageTitle) {
    return `${pageTitle} - ${title}`
  }
  return `${title}`
}
