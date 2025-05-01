
import html2canvas from 'html2canvas';

export const exportAsImage = async (
  element: HTMLElement,
  fileName: string
): Promise<void> => {
  try {
    // Create a clean copy for export
    const exportClone = element.cloneNode(true) as HTMLElement;
    
    // Set a fixed width for consistent exports
    exportClone.style.width = '600px';
    exportClone.style.backgroundColor = '#ffffff';
    exportClone.style.padding = '20px';
    exportClone.style.borderRadius = '0';
    
    // Find all textareas and convert to divs to ensure text is properly rendered
    const textareas = exportClone.querySelectorAll('textarea');
    textareas.forEach((textarea) => {
      const div = document.createElement('div');
      div.innerText = (textarea as HTMLTextAreaElement).value;
      div.style.fontFamily = 'Arial, sans-serif';
      div.style.fontSize = '16px';
      div.style.lineHeight = '1.5';
      div.style.whiteSpace = 'pre-wrap';
      div.style.wordBreak = 'break-word';
      textarea.parentNode?.replaceChild(div, textarea);
    });
    
    // Ensure images are properly sized to match text width
    const images = exportClone.querySelectorAll('img');
    images.forEach((img) => {
      img.style.maxWidth = '100%';
      img.style.objectFit = 'cover';
    });
    
    // Remove any buttons or unwanted UI elements
    const buttons = exportClone.querySelectorAll('button');
    buttons.forEach(button => button.remove());
    
    // Temporarily append to the document for conversion
    exportClone.style.position = 'absolute';
    exportClone.style.left = '-9999px';
    document.body.appendChild(exportClone);

    // Use html2canvas to create a canvas from the prepared element
    const canvas = await html2canvas(exportClone, {
      allowTaint: true,
      useCORS: true,
      scale: 2, // Higher quality
      backgroundColor: '#ffffff',
      logging: false,
    });

    // Remove the temporary element
    document.body.removeChild(exportClone);

    // Create and trigger download
    const image = canvas.toDataURL('image/png', 1.0);
    downloadImage(image, fileName);

    return Promise.resolve();
  } catch (error) {
    console.error('Error exporting image:', error);
    return Promise.reject(error);
  }
};

const downloadImage = (blob: string, fileName: string): void => {
  const fakeLink = document.createElement('a');
  fakeLink.download = fileName;
  fakeLink.href = blob;
  
  // Trigger download
  document.body.appendChild(fakeLink);
  fakeLink.click();
  document.body.removeChild(fakeLink);
};
