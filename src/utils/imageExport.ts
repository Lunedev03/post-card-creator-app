
import html2canvas from 'html2canvas';

export const exportAsImage = async (element: HTMLElement, fileName: string): Promise<void> => {
  try {
    // Calculate the aspect ratio to maintain 9:16 (1080x1920) ratio
    const aspectRatio = 16/9;
    const width = element.offsetWidth;
    const height = width * aspectRatio;

    const canvas = await html2canvas(element, {
      allowTaint: true,
      useCORS: true,
      backgroundColor: null,
      scale: 2, // Higher resolution
      width: width,
      height: element.scrollHeight, // Allow dynamic height based on content
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
