import QRCode from 'qrcode';

/**
 * Generates a high-resolution Data URL for the QR code encoding the specified public URL.
 */
export async function generateQrCodeDataUrl(url: string, size = 600): Promise<string> {
  try {
    return await QRCode.toDataURL(url, {
      width: size,
      margin: 2,
      color: {
        dark: '#181524', // Orbit dark purple theme color for QR blocks
        light: '#ffffff'
      },
      errorCorrectionLevel: 'H'
    });
  } catch (err) {
    console.error('Failed to generate QR Code Data URL:', err);
    throw err;
  }
}

/**
 * Triggers a PNG file download for the QR Code
 */
export async function downloadQrCode(url: string, filename = 'Orbit_Space_Certificate_QR.png'): Promise<void> {
  try {
    const dataUrl = await generateQrCodeDataUrl(url, 800);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('Failed to download QR code:', err);
  }
}
