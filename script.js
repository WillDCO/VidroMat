// Mobile Menu Toggle
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');
const closeMobileMenu = document.getElementById('close-mobile-menu');

mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

closeMobileMenu.addEventListener('click', () => {
    mobileMenu.classList.add('hidden');
});

// Simulador de Medidas e Cortes Personalizados
const larguraInput = document.getElementById('largura');
const alturaInput = document.getElementById('altura');
const tipoVidroSelect = document.getElementById('tipoVidro');
const espessuraSelect = document.getElementById('espessura');
const acabamentoSelect = document.getElementById('acabamento');
const precoEstimadoSpan = document.getElementById('precoEstimado');
const calcularPrecoButton = document.getElementById('calcularPreco');
const previewBox = document.getElementById('preview-box');
const previewDimensionsSpan = document.getElementById('preview-dimensions');

// Preços por m² (ajustados conforme as especificações do usuário)
const precosM2 = {
    temperado: {
        '6': 280, // Para Box
        '8': 400, // Para Portas e Janelas
        '10': 400 // Para Portas e Janelas
    },
    laminado: {
        '8': 400, // Para Portas e Janelas
        '10': 400, // Para Portas e Janelas
        '12': 400 // Para Portas e Janelas
    },
    comum: {
        '3': 50,
        '4': 60,
        '5': 70,
        '6': 80
    },
    espelhado: {
        '3': 220, // Preço do espelho
        '4': 220, // Preço do espelho
        '5': 220, // Preço do espelho
        '6': 220  // Preço do espelho
    },
    peliculas: {
        'default': 150 // Preço genérico para películas por m²
    }
};

// Custos adicionais (exemplo)
const custosAdicionais = {
    lapidado: 15, // por metro linear
    bisote: 25   // por metro linear
};

function atualizarEspessuras() {
    const tipoVidro = tipoVidroSelect.value;
    const espessurasDisponiveis = Object.keys(precosM2[tipoVidro] || {});
    espessuraSelect.innerHTML = ''; // Limpa as opções existentes

    if (tipoVidro === 'peliculas') {
        const option = document.createElement('option');
        option.value = 'default';
        option.textContent = 'Padrão';
        espessuraSelect.appendChild(option);
        espessuraSelect.disabled = true; // Películas não têm espessura variável como vidro
    } else if (espessurasDisponiveis.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'Nenhuma espessura disponível';
        espessuraSelect.appendChild(option);
        espessuraSelect.disabled = true;
    } else {
        espessurasDisponiveis.forEach(espessura => {
            const option = document.createElement('option');
            option.value = espessura;
            option.textContent = `${espessura}mm`;
            espessuraSelect.appendChild(option);
        });
        espessuraSelect.disabled = false;
    }
    // Seleciona a primeira opção ou a que estava selecionada se ainda existir
    if (espessuraSelect.options.length > 0) {
        espessuraSelect.value = espessurasDisponiveis[0] || 'default';
    }
}

function calcularPreco() {
    const larguraCm = parseFloat(larguraInput.value);
    const alturaCm = parseFloat(alturaInput.value);
    const tipoVidro = tipoVidroSelect.value;
    const espessura = espessuraSelect.value;
    const acabamento = acabamentoSelect.value;

    if (isNaN(larguraCm) || isNaN(alturaCm) || larguraCm <= 0 || alturaCm <= 0) {
        precoEstimadoSpan.textContent = 'R$ 0,00';
        return;
    }

    const larguraM = larguraCm / 100;
    const alturaM = alturaCm / 100;
    const areaM2 = larguraM * alturaM;

    let precoBaseM2 = 0;
    if (tipoVidro === 'peliculas') {
        precoBaseM2 = precosM2.peliculas.default;
    } else if (precosM2[tipoVidro] && precosM2[tipoVidro][espessura]) {
        precoBaseM2 = precosM2[tipoVidro][espessura];
    } else {
        precoEstimadoSpan.textContent = 'R$ 0,00';
        return;
    }

    let precoTotal = areaM2 * precoBaseM2;

    // Acabamento só se aplica a vidros, não películas
    if (tipoVidro !== 'peliculas' && acabamento !== 'nenhum' && custosAdicionais[acabamento]) {
        const perimetroM = 2 * (larguraM + alturaM);
        precoTotal += perimetroM * custosAdicionais[acabamento];
    }

    precoEstimadoSpan.textContent = `R$ ${precoTotal.toFixed(2).replace('.', ',')}`;

    // Atualizar pré-visualização
    const maxPreviewWidth = 200;
    const maxPreviewHeight = 150;
    const aspectRatio = larguraCm / alturaCm;

    let displayWidth = maxPreviewWidth;
    let displayHeight = maxPreviewWidth / aspectRatio;

    if (displayHeight > maxPreviewHeight) {
        displayHeight = maxPreviewHeight;
        displayWidth = maxPreviewHeight * aspectRatio;
    }

    previewBox.style.width = `${displayWidth}px`;
    previewBox.style.height = `${displayHeight}px`;
    previewDimensionsSpan.textContent = `${larguraCm}x${alturaCm} cm`;
}

// Event Listeners para o simulador
larguraInput.addEventListener('input', calcularPreco);
alturaInput.addEventListener('input', calcularPreco);
tipoVidroSelect.addEventListener('change', () => {
    atualizarEspessuras();
    calcularPreco();
});
espessuraSelect.addEventListener('change', calcularPreco);
acabamentoSelect.addEventListener('change', calcularPreco);
calcularPrecoButton.addEventListener('click', calcularPreco);

// Inicializar espessuras e preço ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    atualizarEspessuras();
    calcularPreco();
});


// Calculadora de Frete
const cepInput = document.getElementById('cep');
const calcularFreteButton = document.getElementById('calcularFrete');
const resultadoFreteDiv = document.getElementById('resultadoFrete');
const cepExibidoSpan = document.getElementById('cepExibido');
const valorFreteSpan = document.getElementById('valorFrete');
const prazoFreteSpan = document.getElementById('prazoFrete');
const freteErroDiv = document.getElementById('freteErro');

// Máscara para CEP
cepInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não é dígito
    if (value.length > 5) {
        value = value.substring(0, 5) + '-' + value.substring(5, 8);
    }
    e.target.value = value;
});

calcularFreteButton.addEventListener('click', () => {
    const cep = cepInput.value.replace(/\D/g, ''); // Apenas dígitos
    if (cep.length !== 8) {
        freteErroDiv.classList.remove('hidden');
        resultadoFreteDiv.classList.add('hidden');
        return;
    }

    freteErroDiv.classList.add('hidden');
    // Simulação de cálculo de frete (em um cenário real, faria uma requisição a uma API)
    const frete = (Math.random() * 100 + 50).toFixed(2); // Frete aleatório entre 50 e 150
    const prazo = Math.floor(Math.random() * 7) + 3; // Prazo aleatório entre 3 e 9 dias

    cepExibidoSpan.textContent = cepInput.value;
    valorFreteSpan.textContent = `R$ ${frete.replace('.', ',')}`;
    prazoFreteSpan.textContent = prazo;
    resultadoFreteDiv.classList.remove('hidden');
});

// Sistema de Orçamento Personalizado
const orcamentoForm = document.getElementById('orcamentoForm');
const orcamentoSucessoDiv = document.getElementById('orcamentoSucesso');

orcamentoForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Impede o envio padrão do formulário

    // Em um cenário real, você enviaria esses dados para um backend
    // usando fetch() ou XMLHttpRequest.
    console.log('Dados do Orçamento:', {
        largura: larguraInput.value,
        altura: alturaInput.value,
        tipoVidro: tipoVidroSelect.value,
        espessura: espessuraSelect.value,
        acabamento: acabamentoSelect.value,
        precoEstimado: precoEstimadoSpan.textContent,
        nome: document.getElementById('nome').value,
        email: document.getElementById('email').value,
        telefone: document.getElementById('telefone').value,
        descricao: document.getElementById('descricao').value,
        anexo: document.getElementById('anexo').files[0] ? document.getElementById('anexo').files[0].name : 'Nenhum arquivo'
    });

    // Simula o envio bem-sucedido
    orcamentoForm.reset(); // Limpa o formulário
    orcamentoSucessoDiv.classList.remove('hidden'); // Mostra mensagem de sucesso

    // Opcional: Esconder a mensagem de sucesso após alguns segundos
    setTimeout(() => {
        orcamentoSucessoDiv.classList.add('hidden');
    }, 5000);
});

// Newsletter Form
const newsletterForm = document.getElementById('newsletterForm');
const newsletterSucessoDiv = document.getElementById('newsletterSucesso');

newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('E-mail para Newsletter:', document.getElementById('newsletterEmail').value);
    newsletterForm.reset();
    newsletterSucessoDiv.classList.remove('hidden');
    setTimeout(() => {
        newsletterSucessoDiv.classList.add('hidden');
    }, 5000);
});
