'use client'

import { useEffect } from 'react'

export default function BaiduAnalytics() {
  useEffect(() => {
    const script = document.createElement('script')
    script.innerHTML = `
      var _hmt = _hmt || [];
      (function() {
        var hm = document.createElement("script");
        hm.src = "https://hm.baidu.com/hm.js?c1237f3793cdd5e33b25d70dc0911c49";
        var s = document.getElementsByTagName("script")[0]; 
        s.parentNode.insertBefore(hm, s);
      })();
    `
    document.head.appendChild(script)
  }, [])

  return null
}
