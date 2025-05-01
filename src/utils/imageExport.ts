
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
    
    // Find edit fields and make them static text
    const inputs = exportClone.querySelectorAll('input[type="text"]');
    inputs.forEach((input) => {
      const span = document.createElement('span');
      span.innerText = (input as HTMLInputElement).value;
      if ((input as HTMLInputElement).className.includes('font-bold')) {
        span.style.fontWeight = 'bold';
      }
      if ((input as HTMLInputElement).className.includes('text-gray-500')) {
        span.style.color = '#6b7280';
      }
      span.style.fontSize = (input as HTMLInputElement).className.includes('text-sm') ? '14px' : '16px';
      input.parentNode?.replaceChild(span, input);
    });
    
    // Remove checkboxes and labels
    const checkboxes = exportClone.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      const label = checkbox.nextElementSibling;
      if (label) label.remove();
      checkbox.remove();
    });
    
    // Fix image grid positioning and ensure all images are loaded properly
    const imageContainers = exportClone.querySelectorAll('.grid-cols-2');
    imageContainers.forEach((container) => {
      container.classList.add('gap-2');
      container.classList.remove('gap-1');
    });
    
    // Ensure images are properly sized to match text width
    const images = exportClone.querySelectorAll('img');
    images.forEach((img) => {
      img.style.maxWidth = '100%';
      img.style.objectFit = 'cover';
      
      // Fix profile image
      if (img.parentElement?.classList.contains('rounded-full')) {
        img.style.width = '48px';
        img.style.height = '48px';
        img.style.borderRadius = '50%';
      }
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
