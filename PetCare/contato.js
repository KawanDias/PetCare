// ENVIO DE EMAIL COM EMAILJS

// Inicializar EmailJS com sua chave pública
// IMPORTANTE: Substitua 'YOUR_PUBLIC_KEY' pela sua chave pública do EmailJS
emailjs.init('YOUR_PUBLIC_KEY');

const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.querySelector('input[name="name"]').value;
        const email = document.querySelector('input[name="email"]').value;
        const subject = document.querySelector('input[name="subject"]').value;
        const message = document.querySelector('textarea[name="message"]').value;

        // Dados que serão enviados
        const templateParams = {
            from_name: name,
            from_email: email,
            subject: subject,
            message: message,
            to_email: 'kawandiascarneiro@gmail.com'
        };

        try {
            // Mostrar estado de carregamento
            const button = contactForm.querySelector('button[type="submit"]');
            const originalText = button.textContent;
            button.textContent = 'Enviando...';
            button.disabled = true;

            // Enviar email usando EmailJS
            // IMPORTANTE: Substitua 'YOUR_SERVICE_ID' e 'YOUR_TEMPLATE_ID'
            await emailjs.send(
                'YOUR_SERVICE_ID',
                'YOUR_TEMPLATE_ID',
                templateParams
            );

            // Sucesso
            button.textContent = originalText;
            button.disabled = false;
            showContactAlert('Mensagem enviada com sucesso! ❤️', 'success');
            contactForm.reset();

        } catch (error) {
            console.error('Erro ao enviar email:', error);

            const button = contactForm.querySelector('button[type="submit"]');
            button.textContent = 'Enviar Mensagem';
            button.disabled = false;

            showContactAlert('Erro ao enviar. Tente novamente mais tarde.', 'error');
        }
    });
}

// Mostrar alerta
function showContactAlert(message, type = 'info') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;

    document.body.appendChild(alert);

    setTimeout(() => {
        alert.classList.add('show');
    }, 10);

    setTimeout(() => {
        alert.classList.remove('show');
        setTimeout(() => alert.remove(), 300);
    }, 4000);
}

// NOTA: Como alternativa mais simples, você pode usar Formspree:
// 1. Visite https://formspree.io/ e crie uma conta
// 2. Configure seu email (kawandiascarneiro@gmail.com)
// 3. Substitua action="YOUR_FORMSPREE_URL" no formulário HTML
// 4. Use method="POST" no formulário
