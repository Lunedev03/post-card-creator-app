import React, { useState, useEffect } from 'react';
import { Clock, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mapa de termos de busca em português para cada categoria de emoji
const emojiSearchTerms: Record<string, string[]> = {
  // Emoções
  '😀': ['feliz', 'sorriso', 'alegre', 'contente', 'sorrir', 'alegria'],
  '😃': ['feliz', 'sorriso', 'alegre', 'contente', 'sorrir', 'alegria', 'sorridente'],
  '😄': ['feliz', 'sorriso', 'alegre', 'contente', 'sorrir', 'alegria', 'rindo', 'riso'],
  '😁': ['feliz', 'sorriso', 'alegre', 'contente', 'sorrir', 'alegria', 'dentuço'],
  '😆': ['feliz', 'sorriso', 'alegre', 'contente', 'sorrir', 'alegria', 'engraçado', 'risada'],
  '😅': ['feliz', 'sorriso', 'suor', 'nervoso', 'alívio', 'alivio'],
  '😂': ['rindo', 'lagrimas', 'lágrimas', 'engracado', 'engraçado', 'rir', 'chorando', 'risada', 'caindo na risada'],
  '🙂': ['feliz', 'sorriso', 'leve', 'simples', 'educado', 'gentil'],
  '🙃': ['maluco', 'loucura', 'divertido', 'brincalhão', 'ironia', 'sarcasmo', 'de cabeça para baixo'],
  '😉': ['piscada', 'piscadela', 'flerte', 'flertar', 'insinuação', 'sugestivo'],
  '😊': ['feliz', 'sorriso', 'corar', 'tímido', 'fofo', 'sorridente', 'envergonhado', 'timido'],
  '😇': ['feliz', 'sorriso', 'anjo', 'santo', 'aureola', 'auréola', 'inocente', 'anjinho'],
  '😍': ['amor', 'apaixonado', 'olhos de coração', 'amando', 'paixão', 'adorando', 'adoro'],
  '🥰': ['amor', 'apaixonado', 'corações', 'amando', 'feliz', 'carinho', 'carinhoso'],
  '😘': ['beijo', 'mandando beijo', 'beijinho', 'beijar', 'amor', 'carinho', 'xoxo'],
  '😗': ['beijo', 'beijinho', 'simples', 'beijar', 'beijando'],
  '😙': ['beijo', 'feliz', 'sorriso', 'beijar', 'beijando', 'carinhoso'],
  '😋': ['delicia', 'delícia', 'gostoso', 'gostosa', 'babando', 'comida', 'lambendo', 'saboroso'],
  '😛': ['lingua', 'língua', 'mostrando a língua', 'gozação', 'zombaria', 'brincadeira', 'desleixado'],
  '😜': ['lingua', 'língua', 'piscando', 'maluquice', 'gozação', 'maluco', 'brincadeira', 'desleixado'],
  '😝': ['lingua', 'língua', 'olhos fechados', 'gozação', 'zombaria', 'brincadeira', 'desleixado', 'nojo'],
  '🤑': ['dinheiro', 'rico', 'sorte', 'fortuna', 'milionário', 'cifrão', 'cifrao', 'riqueza'],
  '🤗': ['abraço', 'abraçando', 'feliz', 'animado', 'entusiasmado', 'carinho', 'carinhoso'],
  '🤭': ['ops', 'surpresa', 'risadinha', 'tímido', 'timido', 'mão na boca', 'envergonhado', 'abafando riso'],
  '🤔': ['pensando', 'pensativo', 'reflexivo', 'duvidoso', 'dúvida', 'duvida', 'questionando', 'considerar'],
  '🤐': ['calado', 'silêncio', 'silencio', 'boca fechada', 'zipado', 'zipper', 'segredo', 'secreto'],
  '😶': ['sem palavras', 'chocado', 'mudo', 'silencioso', 'surpreso', 'sem expressão', 'neutro'],
  '😏': ['sorriso', 'malicioso', 'sugestivo', 'sarcástico', 'ironia', 'duvidoso', 'desconfiado'],
  '😒': ['insatisfeito', 'chateado', 'irritado', 'frustrado', 'decepcionado', 'desinteressado', 'entediado'],
  '🙄': ['revirar os olhos', 'irritado', 'entediado', 'duvidoso', 'desdém', 'sarcasmo', 'descrente'],
  '😬': ['nervoso', 'apreensivo', 'tenso', 'ansioso', 'desconfortável', 'desconfortavel', 'constrangido'],
  '😌': ['aliviado', 'alívio', 'alivio', 'satisfeito', 'contente', 'calmo', 'relaxado', 'sereno'],
  '😔': ['triste', 'deprimido', 'melancólico', 'melancolico', 'pensativo', 'arrependido', 'pesar'],
  '😪': ['sonolento', 'sono', 'cansado', 'exausto', 'cochilando', 'fatigado', 'dormindo'],
  '🫨': ['tremendo', 'chocado', 'assustado', 'surpreso', 'abalado', 'estremecendo', 'surpresa'],
  '🫠': ['derretendo', 'desconfortável', 'desanimado', 'derretido', 'constrangido', 'envergonhado'],
  '🥹': ['emocionado', 'chorando', 'comovido', 'lágrimas', 'emoção', 'segurando lágrimas'],
  
  // Pessoas e heróis
  '🦸': ['heroi', 'herói', 'super', 'super-herói', 'super-heroi', 'super herói', 'super heroi', 'superheroi', 'poder', 'fantasia', 'salvador'],
  '🦸‍♂️': ['heroi', 'herói', 'super-homem', 'super homem', 'super-herói', 'super-heroi', 'super herói', 'super heroi', 'superheroi', 'homem', 'poder', 'fantasia', 'salvador'],
  '🦸‍♀️': ['heroina', 'super-mulher', 'super mulher', 'super-heroína', 'super-heroina', 'super heroína', 'super heroina', 'superheroina', 'mulher', 'poder', 'fantasia', 'salvadora'],
  '🧙': ['mago', 'maga', 'bruxo', 'feiticeiro', 'magia', 'gandalf', 'merlim', 'merlin', 'wizard', 'bruxa', 'feitiçaria'],
  '🧝': ['elfo', 'elfa', 'fantasia', 'criatura', 'ser mágico', 'orelha pontuda', 'mitológico', 'mágico', 'legolas'],
  '🧚': ['fada', 'fadas', 'asas', 'sininho', 'tinkerbell', 'magia', 'mágico', 'fantasia', 'pequeno', 'voador'],
  '🧛': ['vampiro', 'vampira', 'drácula', 'dracula', 'sangue', 'monstro', 'criatura', 'fantasia', 'halloween', 'terror', 'noturno', 'mordida'],
  '🧔': ['anão', 'anao', 'hobbit', 'pequeno', 'barba', 'gimli', 'senhor dos anéis', 'barbudinho', 'fantasia', 'mitologia'],
  '🧌': ['troll', 'ogro', 'criatura', 'monstro', 'fantasia', 'mitologia', 'feiura', 'feio', 'verde'],
  '🫅': ['realeza', 'rei', 'rainha', 'coroa', 'monarquia', 'monarca', 'poder', 'nobreza', 'nobre', 'reino'],
  '🫃': ['grávido', 'homem grávido', 'gestante', 'gravidez', 'barriga', 'pai', 'paternidade'],
  '🫄': ['gravidez', 'grávida', 'gestante', 'barriga', 'bebê', 'criança', 'mãe', 'maternidade'],
  '🧑‍🍼': ['cuidando', 'bebê', 'mamadeira', 'alimentando', 'criança', 'cuidador', 'pai', 'mãe'],
  
  // Animais - apenas alguns exemplos
  '🐶': ['cachorro', 'cão', 'cao', 'dog', 'canino', 'filhote', 'puppy', 'animal de estimação', 'pet'],
  '🐱': ['gato', 'felino', 'cat', 'gatinho', 'animal de estimação', 'pet', 'miau'],
  '🐭': ['rato', 'mouse', 'ratinho', 'roedor', 'mickey'],
  '🐹': ['hamster', 'roedor', 'animal pequeno', 'animal de estimação', 'pet'],
  '🐰': ['coelho', 'coelhinho', 'páscoa', 'pascoa', 'bunny', 'lebre'],
  '🦊': ['raposa', 'fox', 'animal selvagem', 'astuto', 'animal'],
  '🐻': ['urso', 'bear', 'grande', 'animal selvagem', 'pardo', 'marrom', 'mamífero'],
  '🐉': ['dragão', 'dragao', 'dragões', 'fogo', 'fantasia', 'criatura', 'mítico', 'lenda', 'mitologia', 'medieval', 'game of thrones'],
  '🦫': ['castor', 'beaver', 'roedor', 'animal', 'aquático', 'madeira', 'construtor', 'dentes grandes'],
  '🦭': ['foca', 'leão marinho', 'animal marinho', 'mamífero', 'aquático', 'água', 'gelo', 'ártico'],
  '🪿': ['alce', 'cervo', 'veado', 'animal', 'chifres', 'floresta', 'mamífero', 'selvagem'],
  '🫎': ['fênix', 'fenix', 'pássaro', 'mitologia', 'fogo', 'renascimento', 'imortal', 'mágico', 'lendário'],
  
  // Comidas - apenas alguns exemplos
  '🍎': ['maçã', 'maca', 'fruta', 'vermelho', 'alimento', 'frutas', 'comida'],
  '🍕': ['pizza', 'comida', 'italiana', 'fast food', 'fastfood', 'alimento', 'queijo'],
  '🍔': ['hamburguer', 'hamburger', 'cheese', 'fast food', 'fastfood', 'alimento', 'lanche'],
  '🫚': ['gengibre', 'raiz', 'tempero', 'especiaria', 'chá', 'comida asiática', 'picante', 'condimento'],
  '🫛': ['ervilha', 'vegetal', 'verdura', 'legume', 'comida', 'verde', 'saudável', 'leguminosa'],
  '🪸': ['coral', 'marinho', 'oceano', 'recife', 'mar', 'natureza', 'aquático', 'submarino'],
  
  // Viagens - apenas alguns exemplos
  '🚗': ['carro', 'automóvel', 'automovel', 'veículo', 'veiculo', 'transporte', 'dirigir', 'viagem'],
  '✈️': ['avião', 'aviao', 'viagem', 'voar', 'transporte', 'aéreo', 'aereo', 'jato'],
  '🛝': ['escorregador', 'tobogã', 'parque', 'diversão', 'brinquedo', 'playground', 'criança'],
  
  // Atividades - apenas alguns exemplos
  '⚽': ['futebol', 'esporte', 'bola', 'jogo', 'time', 'soccer', 'atividade', 'jogador'],
  '🏀': ['basquete', 'basketball', 'esporte', 'bola', 'jogo', 'nba', 'atividade', 'cesta'],
  '🪩': ['bola de discoteca', 'disco', 'festa', 'dançar', 'balada', 'boate', 'night club', 'dança'],
  
  // Plantas
  '🪷': ['lótus', 'lotus', 'flor', 'nenúfar', 'aquática', 'rosa', 'bonita', 'oriental', 'meditação', 'yoga', 'budismo'],
  '🪻': ['jacinto', 'flor', 'primavera', 'roxa', 'perfumada', 'jardim', 'planta', 'bulbo', 'lilás'],
  '🪼': ['planta jovem', 'broto', 'muda', 'crescimento', 'jardim', 'plantar', 'verde', 'natureza', 'plantação'],
  
  // Objetos
  '🪭': ['recipiente', 'pote', 'vaso', 'bacia', 'vasilha', 'cerâmica', 'artesanato', 'cozinha'],
  '🪮': ['molinete', 'cata-vento', 'roda', 'brinquedo', 'vento', 'girar', 'colorido', 'infantil'],
  '🪯': ['khanda', 'símbolo', 'religioso', 'sikh', 'sikhismo', 'índia', 'espada', 'fé', 'religião'],
  '🪄': ['varinha mágica', 'magia', 'feitiço', 'bruxaria', 'harry potter', 'mágico', 'truque', 'ilusão'],
  
  // Símbolos - apenas alguns exemplos
  '❤️': ['coração', 'coracao', 'amor', 'vermelho', 'romântico', 'romantico', 'carinho', 'paixão'],
  '🫶': ['coração com mãos', 'amor', 'carinho', 'afeição', 'mãos', 'gesto', 'amor próprio', 'apoio', 'carinho'],
  '🩵': ['coração azul claro', 'azul', 'céu', 'amor', 'carinho', 'tranquilidade', 'calma', 'serenidade'],
  '🩶': ['coração cinza', 'cinza', 'amor', 'neutro', 'calma', 'moderação', 'equilíbrio', 'sabedoria'],
  '🩷': ['coração rosa', 'rosa', 'amor', 'carinho', 'gentileza', 'delicadeza', 'ternura', 'romance']
};

// Emojis atualizados e garantidamente compatíveis com a maioria dos dispositivos
const emojiCategories = {
  recentes: [],
  emocoes: [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🙂', 
    '🙃', '😉', '😊', '😇', '😍', '🥰', '😘', '😗', 
    '😙', '😋', '😛', '😜', '😝', '🤑', '🤗', '🤭',
    '🤔', '🤐', '😶', '😏', '😒', '🙄', '😬', '😌',
    '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢',
    '🤧', '😵', '🤯', '😎', '🤓', '🧐', '😕', '😟',
    '🙁', '😮', '😯', '😲', '😳', '🥺', '😦', '😧',
    '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣',
    '😞', '😓', '😩', '😫', '😤', '😡', '😠', '🤬',
    '🥱', '😈', '👿', '👹', '👺', '💀', '☠️', '👻',
    '👽', '👾', '🤖', '💩', '🥳', '🤩', '🫣', '🫢',
    '🫡', '🫥', '🥸', '🫠', '😶‍🌫️', '🥴', '😵‍💫', '🤥',
    '🤫', '🫨', '🥹'
  ],
  pessoas: [
    '👋', '🤚', '✋', '🖖', '👌', '🤏', '✌️', '🤞', 
    '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '👍', 
    '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', 
    '🤲', '🙏', '💪', '🧠', '👀', '👁️', '👄', '👶',
    '👦', '👧', '👨', '👩', '👴', '👵', '👨‍⚕️', '👩‍⚕️',
    '👨‍🎓', '👩‍🎓', '👨‍🏫', '👩‍🏫', '👨‍⚖️', '👩‍⚖️', '👮‍♂️', '👮‍♀️',
    '🧑', '🧒', '👱', '👨‍🦰', '👩‍🦰', '👨‍🦱', '👩‍🦱', '👨‍🦲',
    '👩‍🦲', '👨‍🦳', '👩‍🦳', '🧔', '🧔‍♀️', '🧔‍♂️', '👲', '👳',
    '👳‍♀️', '👳‍♂️', '🧕', '👮', '👷', '👷‍♀️', '👷‍♂️', '💂',
    '💂‍♀️', '💂‍♂️', '🕵️', '🕵️‍♀️', '🕵️‍♂️', '👨‍⚕️', '👩‍⚕️', '👨‍🍳',
    '👩‍🍳', '👨‍🔧', '👩‍🔧', '👨‍🚒', '👩‍🚒', '👨‍✈️', '👩‍✈️', '👰',
    '🤵', '🤵‍♀️', '🤵‍♂️', '👰‍♀️', '👰‍♂️', '🦸', '🦸‍♀️', '🦸‍♂️',
    '🫅', '🫃', '🫄', '🧝', '🧙', '🧛', '🧚', '🧑‍🍼', '🧌'
  ],
  gestos: [
    '🫱', '🫲', '🫳', '🫴', '🫰', '🫵', '🫶', '🦾',
    '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧑‍🦯', '🧑‍🦼',
    '🧑‍🦽', '👣', '👁️‍🗨️', '🗣️', '👥', '👤', '🫦', '🦷',
    '🦴', '👅', '🧠', '🫀', '🫁', '🧒', '👶', '🧑',
    '🧔', '🧓', '🧑‍🦰', '🧑‍🦱', '🧑‍🦳', '🧑‍🦲', '👱', '👨‍🦰',
    '👩‍🦰', '👨‍🦱', '👩‍🦱', '👨‍🦲', '👩‍🦲', '👨‍🦳', '👩‍🦳'
  ],
  animais: [
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
    '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', 
    '🙉', '🙊', '🐒', '🦍', '🦧', '🐔', '🐧', '🐦', 
    '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴',
    '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟',
    '🦗', '🕷️', '🕸️', '🦂', '🐢', '🐍', '🦎', '🦖',
    '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', 
    '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆',
    '🦓', '🦬', '🦣', '🦫', '🦥', '🐘', '🦏',
    '🦛', '🦘', '🦒', '🐪', '🐫', '🦙', '🦮', '🐕‍🦺',
    '🐩', '🐕', '🐈', '🐈‍⬛', '🪶', '🐓', '🦃', '🦤',
    '🦚', '🦜', '🦢', '🦩', '🦝', '🦨', '🦡', '🦔',
    '🦭', '🐿️', '🦇', '🦦', '🦨', '🦘', '🦫', '🪿', '🫎'
  ],
  plantas: [
    '🌵', '🎄', '🌲', '🌳', '🌴', '🪵', '🌱', '🌿',
    '☘️', '🍀', '🍁', '🍂', '🍃', '🪴', '🪸', '🌷',
    '🌹', '🥀', '🪷', '🪻', '🪼', '🪹', '🪺', '🌺',
    '🌸', '🌼', '🌻', '💐', '🌾'
  ],
  comidas: [
    '🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇',
    '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝',
    '🍅', '🥑', '🥦', '🥬', '🥒', '🌶️', '🌽', '🥕',
    '🧄', '🧅', '🥔', '🍠', '🥐', '🍞', '🥖', '🥨',
    '🧀', '🥚', '🍳', '🧈', '🥞', '🥓', '🍔', '🍟',
    '🍕', '🌭', '🥪', '🌮', '🌯', '🍝', '🍜', '🍲',
    '🍛', '🍣', '🍱', '🥟', '🍤', '🍦', '🍧', '🍨',
    '🍩', '🍪', '🎂', '🍰', '🧁', '🥧', '🍫', '🍼',
    '🥛', '☕', '🫚', '🫛'
  ],
  viagens: [
    '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑',
    '🚒', '🚐', '🚚', '🚛', '🚜', '🛴', '🚲', '🛵',
    '🏍️', '🚨', '🚔', '🚍', '🚘', '🚖', '🚡', '🚠',
    '🚟', '🚃', '🚋', '🚞', '🚝', '🚄', '🚅', '🚈',
    '🚂', '🚆', '🚇', '🚊', '🚉', '✈️', '🛫', '🛬',
    '🛩️', '💺', '🛰️', '🚀', '🛸', '🚁', '🛶', '⛵',
    '🚤', '🛥️', '🛳️', '⛴️', '🚢', '⚓', '🗼', '🏰',
    '🏯', '🏟️', '🎡', '🎢', '🎠', '⛱️', '🏖️', '🏝️',
    '🏜️', '🏕️', '⛰️', '🏔️', '🗻', '🏞️', '🏙️', '🏛️',
    '🛣️', '🛤️', '🌅', '🌄', '🌠', '🎆', '🌇', '🌆',
    '🏙️', '🌃', '🌌', '🌉', '🌁', '🏨', '🏩', '🏯',
    '🏰', '🏥', '🏤', '🏣', '🏢', '🏬', '🏭', '🏗️',
    '🏚️', '🏠', '🏡', '🏘️', '🏦', '🛝'
  ],
  atividades: [
    '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉',
    '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍',
    '🏏', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊',
    '🥋', '🎽', '🛹', '🛼', '🛷', '⛸️', '🥌', '🎿',
    '⛷️', '🏂', '🪂', '🏋️‍♀️', '🏋️‍♂️', '🤼‍♀️', '🤼‍♂️', '🤸‍♀️',
    '🤸‍♂️', '⛹️‍♀️', '⛹️‍♂️', '🤺', '🤾‍♀️', '🤾‍♂️', '🏌️‍♀️', '🏌️‍♂️',
    '🏇', '🧘‍♀️', '🧘‍♂️', '🏄‍♀️', '🏄‍♂️', '🏊‍♀️', '🏊‍♂️', '🤽‍♀️',
    '🎮', '🕹️', '🎲', '🎭', '🎨', '🎬', '🎤', '🎧',
    '🎪', '🎫', '🎗️', '🏵️', '🎖️', '🏆', '🥇', '🥈',
    '🥉', '🎯', '🎱', '🎮', '🎰', '🎨', '🖼️', '🎭',
    '🎨', '🧵', '🧶', '🪢', '🪡', '🧷', '📷', '📸',
    '📹', '📼', '📽️', '🎥', '📞', '📟', '📠', '📱', '🪩'
  ],
  objetos: [
    '⌚', '📱', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️',
    '📸', '📹', '🎥', '📽️', '🎞️', '📠', '☎️', '📟',
    '📻', '📺', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️',
    '⏰', '🕰️', '⌛', '⏳', '📡', '🔋', '🔌', '💡',
    '🔦', '🕯️', '🧯', '🛢️', '💸', '💵', '💴', '💶',
    '💷', '💰', '💳', '💎', '⚖️', '🧰', '🔧', '🔨',
    '⚒️', '🛠️', '⛏️', '🔩', '⚙️', '🧱', '⛓️', '🧲',
    '📚', '📖', '🖋️', '✒️', '🖌️', '🖍️', '📝', '✏️',
    '💊', '💉', '🩸', '🩹', '🩺', '🪒', '🧴', '🧽',
    '🧼', '🪥', '🧻', '🪣', '🧹', '🧺', '🧯', '🛁',
    '🚿', '🚽', '🪠', '🧸', '🪆', '🪄', '🧶', '🧵',
    '🪡', '🧷', '🪢', '👓', '🕶️', '🥽', '🥼', '🦺',
    '👔', '👕', '👖', '🧣', '🧤', '🧥', '🧦', '👚',
    '👙', '👗', '👘', '🥻', '👝', '👛', '👜', '💼',
    '🪭', '🪮', '🪯'
  ],
  simbolos: [
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
    '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖',
    '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️',
    '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈',
    '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐',
    '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️',
    '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️',
    '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹',
    '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌',
    '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️',
    '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗',
    '❕', '❓', '❔', '‼️', '⁉️', '🔅', '🔆', '〽️',
    '⚠️', '🚸', '🔱', '⚜️', '🔰', '♻️', '✅', '🈯',
    '🫶', '🩵', '🩶', '🩷'
  ],
  bandeiras: [
    '🏁', '🚩', '🎌', '🏴', '🏳️', '🇧🇷', '🇺🇸', '🇬🇧',
    '🇫🇷', '🏳️‍🌈', '🏳️‍⚧️', '🇩🇪', '🇯🇵', '🇰🇷', '🇨🇳', '🇮🇹',
    '🇪🇸', '🇵🇹', '🇷🇺', '🇨🇦', '🇲🇽', '🇦🇷', '🇦🇺', '🇮🇳',
    '🇿🇦', '🇸🇦', '🇦🇪', '🇪🇬', '🇹🇷', '🇬🇷', '🇨🇭', '🇳🇱',
    '🇧🇪', '🇸🇪', '🇳🇴', '🇩🇰', '🇫🇮', '🇮🇪', '🇦🇹', '🇵🇱'
  ]
};

const EmojiPicker = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('emocoes');
  const [recentEmojis, setRecentEmojis] = useState<string[]>([]);
  const [emojiSize, setEmojiSize] = useState<24 | 32 | 42>(32);
  const [isMobile, setIsMobile] = useState(false);
  const { toast } = useToast();

  // Detectar se é dispositivo móvel
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Ajustar tamanho dos emojis para dispositivos móveis
      if (mobile && emojiSize > 32) {
        setEmojiSize(32);
      }
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, [emojiSize]);

  // Carregar emojis recentes do localStorage quando o componente montar
  useEffect(() => {
    try {
      const saved = localStorage.getItem('recentEmojis');
      if (saved) {
        const parsed = JSON.parse(saved);
        setRecentEmojis(parsed);
        // Atualizar a categoria "recentes" com os emojis carregados
        emojiCategories.recentes = parsed;
      }
    } catch (e) {
      console.error('Erro ao carregar emojis recentes:', e);
    }
  }, []);

  const handleCopyEmoji = (emoji: string) => {
    navigator.clipboard.writeText(emoji);
    
    // Adicionar à lista de recentes e salvar no localStorage
    const updatedRecents = [emoji, ...(recentEmojis.filter(e => e !== emoji))].slice(0, 24);
    setRecentEmojis(updatedRecents);
    emojiCategories.recentes = updatedRecents;
    
    try {
      localStorage.setItem('recentEmojis', JSON.stringify(updatedRecents));
    } catch (e) {
      console.error('Erro ao salvar emojis recentes:', e);
    }
    
    toast({
      title: "Emoji copiado!",
      description: `${emoji} foi copiado para a área de transferência.`,
      duration: 1500,
    });
  };

  const categoryLabels: Record<string, string> = {
    recentes: 'Recentes',
    emocoes: 'Emoções',
    pessoas: 'Pessoas',
    gestos: 'Gestos',
    animais: 'Animais',
    plantas: 'Plantas',
    comidas: 'Comidas',
    viagens: 'Viagens',
    atividades: 'Atividades',
    objetos: 'Objetos',
    simbolos: 'Símbolos',
    bandeiras: 'Bandeiras'
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    recentes: <Clock size={18} />,
    emocoes: '😊',
    pessoas: '👨',
    gestos: '👋',
    animais: '🐶',
    plantas: '🌷',
    comidas: '🍔',
    viagens: '🚗',
    atividades: '⚽',
    objetos: '💡',
    simbolos: '❤️',
    bandeiras: '🇧🇷'
  };

  // Filtrar emojis por busca
  let displayedEmojis: string[] = [];
  if (searchQuery) {
    // Para busca, incluir todos os emojis de todas as categorias
    const allEmojis = Object.values(emojiCategories).flat();
    
    // Busca em português usando o mapa de termos de busca
    const searchTermLower = searchQuery.toLowerCase();
    
    displayedEmojis = allEmojis.filter(emoji => {
      // Verifica se o emoji tem termos de busca associados
      const terms = emojiSearchTerms[emoji];
      
      if (terms) {
        // Verifica se algum dos termos de busca contém a consulta
        return terms.some(term => term.includes(searchTermLower));
      }
      
      // Fallback para a busca direta no emoji (caso não tenha termos associados)
      return emoji.toLowerCase().includes(searchTermLower);
    });
  } else {
    displayedEmojis = emojiCategories[activeCategory as keyof typeof emojiCategories] || [];
  }

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-gray-950 rounded-md overflow-hidden">
      <div className="p-2 sm:p-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <h3 className="font-medium text-gray-800 dark:text-white text-sm sm:text-base">Emojis</h3>
        
        <div className="flex gap-1">
          <Button 
            variant={emojiSize === 24 ? "secondary" : "ghost"} 
            size="sm" 
            className="px-1 sm:px-2 h-6 sm:h-7 text-xs"
            onClick={() => setEmojiSize(24)}
          >
            P
          </Button>
          <Button 
            variant={emojiSize === 32 ? "secondary" : "ghost"} 
            size="sm" 
            className="px-1 sm:px-2 h-6 sm:h-7 text-xs"
            onClick={() => setEmojiSize(32)}
          >
            M
          </Button>
          {!isMobile && (
            <Button 
              variant={emojiSize === 42 ? "secondary" : "ghost"} 
              size="sm" 
              className="px-1 sm:px-2 h-6 sm:h-7 text-xs"
              onClick={() => setEmojiSize(42)}
            >
              G
            </Button>
          )}
        </div>
      </div>
      
      <div className="p-2 sm:p-3">
        <div className="relative mb-2 sm:mb-3">
          <Input
            placeholder="Buscar emoji..."
            className="pl-8 h-8 text-xs sm:text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
        </div>
        
        {!searchQuery && (
          <div className="flex overflow-x-auto pb-2 gap-1 hide-scrollbar scrollbar-none">
            {Object.keys(emojiCategories).map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "secondary" : "ghost"}
                size="sm"
                className="flex-shrink-0 text-xs h-6 sm:h-7 px-1.5 sm:px-2"
                onClick={() => setActiveCategory(category)}
              >
                <span className="mr-1 text-base">
                  {category === 'recentes' 
                    ? <Clock size={16} />
                    : categoryIcons[category]
                  }
                </span>
                {category === 'recentes' ? 'Recentes' : ''}
              </Button>
            ))}
          </div>
        )}
      </div>
      
      <ScrollArea className="flex-1 px-2 sm:px-3 pb-2 sm:pb-3">
        {searchQuery && displayedEmojis.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-gray-500 dark:text-gray-400">
            <p>Nenhum emoji encontrado</p>
          </div>
        ) : (
          <>
            {!searchQuery && (
              <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                {categoryLabels[activeCategory]}
              </h4>
            )}
            <div className={`grid ${
              emojiSize === 42 
                ? 'grid-cols-6 sm:grid-cols-7' 
                : emojiSize === 32 
                  ? 'grid-cols-7 sm:grid-cols-8' 
                  : 'grid-cols-8 sm:grid-cols-10'
            } gap-1 sm:gap-2`}>
              {displayedEmojis.map((emoji, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="icon"
                  className="emoji-button p-0 rounded-md flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800"
                  style={{ 
                    height: `${emojiSize + (isMobile ? 6 : 12)}px`, 
                    width: `${emojiSize + (isMobile ? 6 : 12)}px` 
                  }}
                  onClick={() => handleCopyEmoji(emoji)}
                >
                  <span 
                    className="emoji-text"
                    style={{ fontSize: `${emojiSize}px` }}
                  >
                    {emoji}
                  </span>
                </Button>
              ))}
            </div>
          </>
        )}
      </ScrollArea>

      <style>
        {`
          .emoji-text {
            font-family: "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif;
            line-height: 1;
          }
          
          .emoji-button {
            cursor: pointer;
            transition: transform 0.1s ease;
          }
          
          .emoji-button:hover {
            transform: scale(1.1);
          }
          
          .emoji-button:active {
            transform: scale(0.95);
          }
          
          .scrollbar-none::-webkit-scrollbar {
            display: none;
          }
          
          .scrollbar-none {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}
      </style>
    </div>
  );
};

export default EmojiPicker;
