/**
 * Robust copy-to-clipboard function that works in:
 * 1. Secure contexts (HTTPS / localhost) using modern navigator.clipboard
 * 2. Insecure contexts (HTTP / LAN IPs e.g. http://192.168.1.13:5173) using document.execCommand fallback
 * 3. Mobile devices (iOS Safari, Android Chrome) with selection range handling
 */
export async function copyToClipboard(text) {
  if (text === undefined || text === null) return false;
  const str = String(text);

  // 1. Try modern navigator.clipboard if available (only in secure context: HTTPS or localhost)
  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(str);
      return true;
    } catch (err) {
      console.warn('navigator.clipboard.writeText failed, falling back to execCommand:', err);
    }
  }

  // 2. Fallback using temporary textarea + document.execCommand('copy')
  try {
    const textArea = document.createElement('textarea');
    textArea.value = str;

    // Prevent scrolling to bottom of page in mobile & desktop
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    textArea.style.opacity = '0';
    textArea.setAttribute('readonly', '');

    document.body.appendChild(textArea);

    // Support iOS Safari selection
    if (navigator.userAgent.match(/ipad|ipod|iphone/i)) {
      const range = document.createRange();
      range.selectNodeContents(textArea);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
      textArea.setSelectionRange(0, 999999);
    } else {
      textArea.focus();
      textArea.select();
    }

    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Fallback execCommand copy failed:', err);
    return false;
  }
}

/**
 * Copy image blob to clipboard if supported, else returns false.
 */
export async function copyBlobToClipboard(blob) {
  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.write === 'function' && typeof window.ClipboardItem !== 'undefined') {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      return true;
    } catch (err) {
      console.warn('navigator.clipboard.write failed:', err);
      return false;
    }
  }
  return false;
}
