
import html2canvas from 'html2canvas';

export const exportAsImage = async (element: HTMLElement, fileName: string): Promise<void> => {
  try {
    const canvas = await html2canvas(element, {
      allowTaint: true,
      useCORS: true,
      backgroundColor: null,
      scale: 2, // Higher resolution
    });
    
    const image = canvas.toDataURL('image/png', 1.0);
    
    // Create download link
    const downloadLink = document.createElement('a');
    downloadLink.href = image;
    downloadLink.download = fileName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  } catch (error) {
    console.error('Failed to export image:', error);
  }
};
