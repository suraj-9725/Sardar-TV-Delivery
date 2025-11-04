export const isIOS = () => {
  return [
    'iPad Simulator',
    'iPhone Simulator',
    'iPod Simulator',
    'iPad',
    'iPhone',
    'iPod'
  ].includes(navigator.platform)
  // Also check for iPad on iOS 13+
  || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
}
