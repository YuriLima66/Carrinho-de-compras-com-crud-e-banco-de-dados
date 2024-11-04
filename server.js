// Importando módulos necessários
const express = require('express'); // Importa o framework Express para criar o servidor web
const app = express(); // Cria uma instância do aplicativo Express
const mysql = require('mysql2'); // Importa o módulo para interagir com o banco de dados MySQL
const session = require('express-session'); // Importa o módulo para gerenciar sessões de usuário
const bodyParser = require('body-parser'); // Importa o módulo body-parser para analisar o corpo das requisições

// Configuração do banco de dados MySQL
const db = mysql.createConnection({
    host: 'localhost', // Endereço do servidor do banco de dados (geralmente 'localhost' para desenvolvimento local)
    user: 'root', // Nome de usuário do banco de dados
    password: '', // Senha do banco de dados
    database: 'cardapio_leilabolos' // Nome do banco de dados a ser usado
});

// Configuração do Express
app.use(express.static('public')); // Define a pasta 'public' como a pasta de arquivos estáticos (CSS, JavaScript, imagens)
app.set('view engine', 'ejs'); // Define o EJS como o mecanismo de visualização (template engine)
app.set('views', __dirname + '/views'); // Define a pasta 'views' como a pasta onde as views (arquivos EJS) estão localizadas

// Configuração do middleware de sessões
app.use(session({
    secret: 'sua_chave_secreta', // Define uma chave secreta para assinar as sessões (troque por uma chave forte e aleatória)
    resave: false, // Não força o salvamento da sessão se ela não foi modificada
    saveUninitialized: true // Salva a sessão mesmo que ela não tenha sido inicializada com dados
}));

// Configuração do body-parser para analisar o corpo das requisições
app.use(bodyParser.urlencoded({ extended: true })); // Analisa requisições com codificação URL
app.use(bodyParser.json()); // Analisa requisições com formato JSON

// Rota para a página inicial (index)
app.get('/', (req, res) => {
    res.render('index'); // Renderiza a view 'index.ejs' (que deve estar na pasta 'views')
});

// Rota para a página do cardápio
app.get('/cardapio', (req, res) => {
    // Consulta todos os produtos do banco de dados
    db.query('SELECT * FROM produtos', (err, results) => {
        if (err) {
            console.error(err); // Loga o erro no console
            res.status(500).send('Erro ao buscar produtos'); // Envia uma resposta de erro 500 para o cliente
            return; // Encerra a execução da função para evitar que o código continue
        }

        // Converte o preço de cada produto para um número de ponto flutuante
        results.forEach(produto => {
            produto.preco = parseFloat(produto.preco);
        });

        // Renderiza a view 'cardapio.ejs' e passa os produtos como dados para a view
        res.render('cardapio', { produtos: results });
    });
});

// Rota para a página de checkout
app.get('/checkout', (req, res) => {
    // Renderiza a view 'checkout.ejs' e passa os itens do carrinho (da sessão) como dados
    res.render('checkout', { cartItems: req.session.cart || [] }); // Se a sessão não tiver um carrinho, passa um array vazio
});

// Rota para a página de administração de produtos
app.get('/admin-produtos', (req, res) => {
    // Consulta todos os produtos do banco de dados para exibir na lista
    db.query('SELECT * FROM produtos', (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Erro ao buscar produtos');
            return;
        }

        results.forEach(produto => {
            produto.preco = parseFloat(produto.preco);
        });

        res.render('admin-produtos', { produtos: results });
    });
});

// Rota para adicionar um novo produto
app.post('/admin-produtos/adicionar', (req, res) => {
    const { nome, descricao, preco, imagem } = req.body;

    db.query(
        'INSERT INTO produtos (nome, descricao, preco, imagem) VALUES (?, ?, ?, ?)',
        [nome, descricao, preco, imagem],
        (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).send('Erro ao inserir produto');
                return;
            }

            console.log('Produto inserido com sucesso!');
            res.redirect('/admin-produtos');
        }
    );
});

// Rota para processar a edição de um produto
app.post('/admin-produtos/editar/:id', (req, res) => {
    const productId = req.params.id;
    const { nome, descricao, preco, imagem } = req.body;

    db.query(
        'UPDATE produtos SET nome = ?, descricao = ?, preco = ?, imagem = ? WHERE id = ?',
        [nome, descricao, preco, imagem, productId],
        (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).send('Erro ao editar produto');
                return;
            }

            console.log('Produto editado com sucesso!');
            res.redirect('/admin-produtos');
        }
    );
});

// Rota para remover um produto
app.get('/admin-produtos/remover/:id', (req, res) => {
    const productId = req.params.id;

    db.query('DELETE FROM produtos WHERE id = ?', [productId], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Erro ao remover produto');
            return;
        }

        console.log('Produto removido com sucesso!');
        res.redirect('/admin-produtos');
    });
});


// Rota para adicionar um produto ao carrinho (requisição POST)
app.post('/add-to-cart', (req, res) => {
    const productId = req.body.produtoId; // Obtém o ID do produto do corpo da requisição

    // Inicializa o carrinho na sessão se ele ainda não existir
    if (!req.session.cart) {
        req.session.cart = [];
    }

    // Verifica se o produto já está no carrinho
    let existingProduct = req.session.cart.find(item => item.id === productId);

    if (existingProduct) {
        // Se o produto já estiver no carrinho, incrementa a quantidade
        existingProduct.quantity++;
    } else {
        // Se o produto não estiver no carrinho, busca as informações do produto no banco de dados
        db.query('SELECT * FROM produtos WHERE id = ?', [productId], (err, product) => {
            if (err) {
                console.error(err); // Loga o erro no console
                res.status(500).send('Erro ao adicionar ao carrinho'); // Envia uma resposta de erro 500
                return; // Encerra a execução da função
            }

            // Se o produto foi encontrado no banco de dados
            if (product.length > 0) {
                // Adiciona o produto ao carrinho na sessão
                req.session.cart.push({
                    id: productId,
                    name: product[0].nome,
                    price: parseFloat(product[0].preco),
                    quantity: 1
                });
                res.redirect('/cardapio'); // Redireciona o usuário para a página do cardápio
            } else {
                // Se o produto não foi encontrado no banco de dados, envia uma resposta de erro 404
                res.status(404).send('Produto não encontrado');
            }
        });
    }
});

// Inicia o servidor na porta 3010
app.listen(3010, () => {
    console.log('Servidor iniciado na porta 3010');
});