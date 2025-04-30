
import html2canvas from 'html2canvas';

export const exportAsImage = async (element: HTMLElement, fileName: string): Promise<void> => {
  try {
    // Removemos o elemento do DOM para trabalhar com uma cópia limpa
    const originalElement = element;
    
    // Criamos um clone do elemento para manipular sem afetar o original
    const clone = originalElement.cloneNode(true) as HTMLElement;
    
    // Configurações visuais para o clone
    clone.style.position = 'fixed';
    clone.style.top = '0';
    clone.style.left = '0';
    clone.style.width = '1080px'; // Largura fixa para exportação
    clone.style.backgroundColor = '#ffffff';
    clone.style.zIndex = '-9999';
    clone.style.padding = '20px';
    clone.style.boxSizing = 'border-box';
    
    // Remover elementos de UI que não devem aparecer na exportação
    const buttonsToRemove = clone.querySelectorAll('button');
    buttonsToRemove.forEach(button => button.remove());
    
    // Converter textareas para divs com estilos apropriados
    const textareas = clone.querySelectorAll('textarea');
    textareas.forEach(textarea => {
      const textContent = (textarea as HTMLTextAreaElement).value;
      const div = document.createElement('div');
      div.innerHTML = textContent.replace(/\n/g, '<br>');
      div.style.fontFamily = 'Helvetica, Arial, sans-serif';
      div.style.fontSize = '18px';
      div.style.lineHeight = '1.5';
      div.style.whiteSpace = 'pre-wrap';
      div.style.wordBreak = 'break-word';
      div.style.width = '100%';
      div.style.textAlign = 'left';
      div.style.color = '#000000';
      textarea.parentNode?.replaceChild(div, textarea);
    });
    
    // Remover qualquer elemento de drag-and-drop ou upload
    const dropzones = clone.querySelectorAll('[class*="drag"], [class*="drop"]');
    dropzones.forEach(zone => {
      if (zone.classList.contains('hidden') || zone.getAttribute('style')?.includes('display: none')) {
        return;
      }
      
      const parent = zone.parentElement;
      if (parent) parent.removeChild(zone);
    });
    
    // Adicionar o clone ao body para renderização
    document.body.appendChild(clone);
    
    // Renderizar com html2canvas
    const canvas = await html2canvas(clone, {
      allowTaint: true,
      useCORS: true,
      backgroundColor: '#ffffff',
      scale: 2, // Maior escala para melhor qualidade
      logging: false,
    });
    
    // Remover o clone após renderização
    document.body.removeChild(clone);
    
    // Converter canvas para imagem e iniciar download
    const image = canvas.toDataURL('image/png', 1.0);
    
    // Criar link de download
    const link = document.createElement('a');
    link.download = fileName;
    link.href = image;
    link.click();
  } catch (error) {
    console.error('Falha ao exportar imagem:', error);
  }
};
