
import html2canvas from 'html2canvas';

export const exportAsImage = async (element: HTMLElement, fileName: string): Promise<void> => {
  try {
    // Calculate the aspect ratio to maintain 9:16 (1080x1920) ratio
    const aspectRatio = 16/9;
    const width = element.offsetWidth;
    const height = width * aspectRatio;

    // Clone the element to modify it for export without affecting the original
    const clonedElement = element.cloneNode(true) as HTMLElement;
    document.body.appendChild(clonedElement);
    
    // Apply specific styles to ensure proper text formatting in the exported image
    const textareaElements = clonedElement.querySelectorAll('textarea');
    textareaElements.forEach((textarea) => {
      const div = document.createElement('div');
      div.innerHTML = textarea.value.replace(/\n/g, '<br>');
      div.style.fontFamily = 'Helvetica, Arial, sans-serif';
      div.style.fontSize = '15px';
      div.style.lineHeight = '1.5';
      div.style.whiteSpace = 'pre-wrap';
      div.style.wordBreak = 'break-word';
      div.style.textAlign = 'left';
      div.style.padding = '0';
      div.style.width = '100%';
      textarea.parentNode?.replaceChild(div, textarea);
    });
    
    // Hide borders and styling elements that shouldn't be in the export
    const elements = clonedElement.querySelectorAll('[class*="border"], [class*="shadow"]');
    elements.forEach((el) => {
      (el as HTMLElement).style.border = 'none';
      (el as HTMLElement).style.boxShadow = 'none';
    });

    // Make the element visible but off-screen for html2canvas
    clonedElement.style.position = 'absolute';
    clonedElement.style.left = '-9999px';
    clonedElement.style.top = '0';
    clonedElement.style.width = width + 'px';
    
    const canvas = await html2canvas(clonedElement, {
      allowTaint: true,
      useCORS: true,
      backgroundColor: 'white',
      scale: 2,
      width: width,
      height: clonedElement.scrollHeight,
      logging: false,
      removeContainer: true,
      foreignObjectRendering: true,
    });
    
    // Remove the cloned element
    document.body.removeChild(clonedElement);
    
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
