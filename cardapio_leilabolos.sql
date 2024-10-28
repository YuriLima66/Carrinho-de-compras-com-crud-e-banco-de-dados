-- Cria o banco de dados (se ele não existir)
CREATE DATABASE cardapio_leilabolos;


-- Cria a tabela "produtos"
CREATE TABLE produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10, 2) NOT NULL,
    imagem VARCHAR(255),
    categoria VARCHAR(50) 
);

-- Insere alguns exemplos de produtos
INSERT INTO produtos (nome, descricao, preco, imagem, categoria) VALUES
    ('Bolo Margherita', 'Bolo de baunilha com cobertura de cream cheese e morangos frescos, decorado com manjericão fresco. Uma explosão de frescor em cada fatia!', 35.00, 'imagens/bolo-margherita.jpg', 'bolos'),
    ('Bolo Floresta Negra', 'Bolo de chocolate com camadas de cerejas frescas, chantilly e raspas de chocolate. Um clássico irresistível com um toque de magia.', 38.00, 'imagens/bolo-floresta-negra.jpg', 'bolos'),
    ('Bolo de Queijo c/ Chocolate', 'Bolo de queijo cremoso com gotas de chocolate meio amargo. Simplesmente irresistível!', 34.00, 'imagens/bolo-queijo-chocolate.jpg', 'bolos'),
    ('Brigadeiro', 'O clássico brigadeiro, feito com chocolate em pó, leite condensado e manteiga. Irresistível!', 2.00, 'imagens/brigadeiro.jpg', 'doces'),
    ('Coxinha', 'Coxinha de frango com massa crocante e recheio saboroso. Um clássico brasileiro irresistível!', 5.00, 'imagens/coxinha.jpg', 'salgados');
