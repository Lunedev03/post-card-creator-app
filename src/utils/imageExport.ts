
import html2canvas from 'html2canvas';

export const exportAsImage = async (element: HTMLElement, fileName: string): Promise<void> => {
  try {
    // Fixed 9:16 aspect ratio (1080x1920)
    const targetWidth = 1080;
    const targetHeight = 1920;

    // Clone the element to modify it for export without affecting the original
    const clonedElement = element.cloneNode(true) as HTMLElement;
    document.body.appendChild(clonedElement);
    
    // Set fixed dimensions for export
    clonedElement.style.width = targetWidth + 'px';
    clonedElement.style.backgroundColor = 'white';
    clonedElement.style.padding = '20px';
    clonedElement.style.boxSizing = 'border-box';
    clonedElement.style.border = 'none';
    clonedElement.style.borderRadius = '0';
    clonedElement.style.boxShadow = 'none';
    
    // Apply specific styles to ensure proper text formatting in the exported image
    const textareaElements = clonedElement.querySelectorAll('textarea');
    textareaElements.forEach((textarea) => {
      const div = document.createElement('div');
      div.innerHTML = textarea.value.replace(/\n/g, '<br>');
      div.style.fontFamily = 'Helvetica, Arial, sans-serif';
      div.style.fontSize = '18px';
      div.style.lineHeight = '1.5';
      div.style.whiteSpace = 'pre-wrap';
      div.style.wordBreak = 'break-word';
      div.style.textAlign = 'left';
      div.style.padding = '0';
      div.style.margin = '0';
      div.style.color = '#000';
      div.style.width = '100%';
      textarea.parentNode?.replaceChild(div, textarea);
    });
    
    // Remove all borders, shadows, and unnecessary styling
    const elements = clonedElement.querySelectorAll('*');
    elements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.border = 'none';
      htmlEl.style.boxShadow = 'none';
      htmlEl.style.borderRadius = '0';
      
      // Remove background colors from inner elements (except white)
      if (htmlEl.style.backgroundColor && htmlEl.style.backgroundColor !== 'white') {
        htmlEl.style.backgroundColor = 'transparent';
      }
    });

    // Position off-screen for rendering
    clonedElement.style.position = 'absolute';
    clonedElement.style.left = '-9999px';
    clonedElement.style.top = '0';
    
    // Render with html2canvas
    const canvas = await html2canvas(clonedElement, {
      allowTaint: true,
      useCORS: true,
      backgroundColor: 'white',
      width: targetWidth,
      height: targetHeight,
      scale: 2, // Higher scale for better quality
      logging: false,
      removeContainer: true,
      foreignObjectRendering: false, // Disable foreign object rendering for better compatibility
    });
    
    // Remove the cloned element after rendering
    document.body.removeChild(clonedElement);
    
    // Convert canvas to image and trigger download
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
