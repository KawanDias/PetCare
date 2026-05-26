# 📧 Guia de Configuração - Envio de Emails

## Opção 1: Formspree (Recomendado - Mais Fácil ⭐)

### Passo 1: Criar conta no Formspree
1. Acesse [https://formspree.io/](https://formspree.io/)
2. Clique em "Sign Up"
3. Crie uma conta com seu email

### Passo 2: Criar novo formulário
1. Dentro do dashboard, clique em "New Form"
2. Configure o email destino: `kawandiascarneiro@gmail.com`
3. Copie a URL fornecida (será algo como `https://formspree.io/f/XXXXXXXXX`)

### Passo 3: Atualizar arquivo HTML
No arquivo `contato.html`, atualize o formulário:

```html
<form class="contact-form" method="POST" action="https://formspree.io/f/XXXXXXXXX">
  <!-- campos do formulário -->
  <input type="text" name="name" placeholder="Seu nome" required>
  <input type="email" name="email" placeholder="Seu e-mail" required>
  <input type="text" name="subject" placeholder="Assunto" required>
  <textarea name="message" placeholder="Digite sua mensagem" required></textarea>
  <button type="submit" class="primary">Enviar Mensagem</button>
</form>
```

### Passo 4: Remover scripts desnecessários
Delete a linha do `contato.js` no HTML (não será mais necessário).

---

## Opção 2: EmailJS (Mais Controle)

### Passo 1: Criar conta no EmailJS
1. Visite [https://www.emailjs.com/](https://www.emailjs.com/)
2. Clique em "Sign Up Free"
3. Crie sua conta

### Passo 2: Configurar Gmail
1. No dashboard, vá para "Email Services"
2. Clique em "Add Service" → "Gmail"
3. Conecte sua conta Gmail (kawandiascarneiro@gmail.com)
4. Copie o Service ID (algo como `service_xxxxx`)

### Passo 3: Criar Template
1. Vá para "Email Templates"
2. Clique em "Create New Template"
3. Configure com os seguintes campos:
   - **To Email**: `{{to_email}}`
   - **From Email**: `{{from_email}}`
   - **Subject**: `Novo Contato PetCare: {{subject}}`
   - **HTML Content**:
   ```html
   <p>Olá!</p>
   <p>Você recebeu uma nova mensagem de <strong>{{from_name}}</strong> ({{from_email}})</p>
   <p><strong>Assunto:</strong> {{subject}}</p>
   <p><strong>Mensagem:</strong></p>
   <p>{{message}}</p>
   <br>
   <p>Atenciosamente,<br>Sistema PetCare</p>
   ```
4. Copie o Template ID (algo como `template_xxxxx`)

### Passo 4: Obter chave pública
1. Vá para "Account" → "API Keys"
2. Copie sua Public Key

### Passo 5: Atualizar contato.js
No arquivo `contato.js`, na linha 4, substitua:
```javascript
emailjs.init('YOUR_PUBLIC_KEY'); 
```
pelo seu Public Key:
```javascript
emailjs.init('pk_xxxxx...');
```

E na linha 33, substitua:
```javascript
await emailjs.send(
  'YOUR_SERVICE_ID',
  'YOUR_TEMPLATE_ID',
  templateParams
);
```
por:
```javascript
await emailjs.send(
  'service_xxxxx',
  'template_xxxxx',
  templateParams
);
```

---

## ✅ Testando

Acesse a página de contato do PetCare e teste o envio:
1. Preencha o formulário
2. Clique em "Enviar Mensagem"
3. Você receberá um email em `kawandiascarneiro@gmail.com`

---

## 🔒 Notas de Segurança

- **Formspree** é mais seguro pois seu email não fica exposto no código
- **EmailJS** expõe sua Public Key (que é intencional e segura por design)
- Nunca compartilhe suas chaves privadas ou Service IDs
- Teste tudo localmente antes de colocar em produção

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique se todos os IDs foram copiados corretamente
2. Abra o console do navegador (F12) para ver mensagens de erro
3. Verifique se seus emails estão ativos e validados
