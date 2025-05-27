// Modal.js - Componente de Modal reutilizável
class Modal {
    constructor() {
        this.overlay = null;
        this.content = null;
        this.isOpen = false;
        this.currentModal = null;
        
        this.init();
    }

    init() {
        // Encontrar elementos do modal no DOM
        this.overlay = document.getElementById('modal-overlay');
        this.content = document.getElementById('modal-body');
        this.titleElement = document.getElementById('modal-title');
        
        if (!this.overlay) {
            console.warn('Modal overlay não encontrado');
            return;
        }

        // Event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Fechar modal clicando no overlay
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.close();
            }
        });

        // Fechar modal com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Botão de fechar
        const closeBtn = document.getElementById('modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }
    }

    // Mostrar modal
    show(title, content, options = {}) {
        if (!this.overlay || !this.content) {
            console.error('Elementos do modal não encontrados');
            return;
        }

        // Configurar título
        if (this.titleElement && title) {
            this.titleElement.textContent = title;
        }

        // Configurar conteúdo
        if (typeof content === 'string') {
            this.content.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            this.content.innerHTML = '';
            this.content.appendChild(content);
        }

        // Aplicar opções
        this.applyOptions(options);

        // Mostrar modal
        this.overlay.classList.remove('hidden');
        this.isOpen = true;
        
        // Foco no modal para acessibilidade
        setTimeout(() => {
            const firstInput = this.content.querySelector('input, select, textarea, button');
            if (firstInput) {
                firstInput.focus();
            }
        }, 100);

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        // Callback de abertura
        if (options.onOpen) {
            options.onOpen();
        }

        this.currentModal = { title, content, options };
    }

    // Fechar modal
    close() {
        if (!this.isOpen || !this.overlay) return;

        // Callback antes de fechar
        if (this.currentModal?.options?.onBeforeClose) {
            const shouldClose = this.currentModal.options.onBeforeClose();
            if (shouldClose === false) return;
        }

        this.overlay.classList.add('hidden');
        this.isOpen = false;
        
        // Restore body scroll
        document.body.style.overflow = '';

        // Limpar conteúdo após animação
        setTimeout(() => {
            if (this.content) {
                this.content.innerHTML = '';
            }
            if (this.titleElement) {
                this.titleElement.textContent = '';
            }
        }, 300);

        // Callback de fechamento
        if (this.currentModal?.options?.onClose) {
            this.currentModal.options.onClose();
        }

        this.currentModal = null;
    }

    // Aplicar opções ao modal
    applyOptions(options) {
        const modalContent = this.overlay.querySelector('.modal-content');
        if (!modalContent) return;

        // Tamanho do modal
        if (options.size) {
            modalContent.classList.remove('modal-sm', 'modal-lg', 'modal-xl');
            if (options.size !== 'default') {
                modalContent.classList.add(`modal-${options.size}`);
            }
        }

        // Classes customizadas
        if (options.className) {
            modalContent.classList.add(options.className);
        }

        // Desabilitar fechamento
        if (options.disableClose) {
            this.overlay.style.pointerEvents = 'none';
            modalContent.style.pointerEvents = 'auto';
        } else {
            this.overlay.style.pointerEvents = 'auto';
        }
    }

    // Mostrar modal de confirmação
    confirm(title, message, options = {}) {
        return new Promise((resolve) => {
            const confirmModal = `
                <div class="confirmation-dialog">
                    <div class="icon ${options.type || 'warning'}">
                        ${this.getConfirmIcon(options.type)}
                    </div>
                    <h3>${title}</h3>
                    <p>${message}</p>
                    <div class="action-buttons">
                        <button class="btn btn-outline" id="confirm-cancel">
                            ${options.cancelText || 'Cancelar'}
                        </button>
                        <button class="btn btn-${options.type === 'danger' ? 'danger' : 'primary'}" id="confirm-ok">
                            ${options.confirmText || 'Confirmar'}
                        </button>
                    </div>
                </div>
            `;

            this.show(title, confirmModal, {
                ...options,
                onOpen: () => {
                    document.getElementById('confirm-cancel').addEventListener('click', () => {
                        this.close();
                        resolve(false);
                    });
                    
                    document.getElementById('confirm-ok').addEventListener('click', () => {
                        this.close();
                        resolve(true);
                    });
                }
            });
        });
    }

    // Mostrar modal de alerta
    alert(title, message, type = 'info') {
        return new Promise((resolve) => {
            const alertModal = `
                <div class="alert-dialog">
                    <div class="icon ${type}">
                        ${this.getAlertIcon(type)}
                    </div>
                    <h3>${title}</h3>
                    <p>${message}</p>
                    <div class="action-buttons">
                        <button class="btn btn-primary" id="alert-ok">
                            OK
                        </button>
                    </div>
                </div>
            `;

            this.show(title, alertModal, {
                onOpen: () => {
                    document.getElementById('alert-ok').addEventListener('click', () => {
                        this.close();
                        resolve(true);
                    });
                }
            });
        });
    }

    // Mostrar modal de prompt
    prompt(title, message, defaultValue = '', options = {}) {
        return new Promise((resolve) => {
            const promptModal = `
                <div class="prompt-dialog">
                    <h3>${title}</h3>
                    <p>${message}</p>
                    <div class="form-group">
                        <input type="${options.inputType || 'text'}" 
                               id="prompt-input" 
                               class="form-control" 
                               value="${defaultValue}"
                               placeholder="${options.placeholder || ''}"
                               ${options.required ? 'required' : ''}>
                    </div>
                    <div class="action-buttons">
                        <button class="btn btn-outline" id="prompt-cancel">
                            Cancelar
                        </button>
                        <button class="btn btn-primary" id="prompt-ok">
                            OK
                        </button>
                    </div>
                </div>
            `;

            this.show(title, promptModal, {
                onOpen: () => {
                    const input = document.getElementById('prompt-input');
                    const okBtn = document.getElementById('prompt-ok');
                    const cancelBtn = document.getElementById('prompt-cancel');

                    // Foco no input
                    input.focus();
                    input.select();

                    // Event listeners
                    const handleOk = () => {
                        const value = input.value.trim();
                        if (options.required && !value) {
                            input.focus();
                            return;
                        }
                        this.close();
                        resolve(value || null);
                    };

                    const handleCancel = () => {
                        this.close();
                        resolve(null);
                    };

                    okBtn.addEventListener('click', handleOk);
                    cancelBtn.addEventListener('click', handleCancel);
                    
                    // Enter para confirmar
                    input.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleOk();
                        }
                    });
                }
            });
        });
    }

    // Mostrar modal de loading
    showLoading(message = 'Carregando...') {
        const loadingModal = `
            <div class="loading-dialog">
                <div class="loading-spinner">
                    <div class="spinner"></div>
                </div>
                <p>${message}</p>
            </div>
        `;

        this.show('', loadingModal, {
            disableClose: true,
            className: 'modal-loading'
        });
    }

    // Atualizar conteúdo do modal atual
    updateContent(newContent) {
        if (!this.isOpen || !this.content) return;

        if (typeof newContent === 'string') {
            this.content.innerHTML = newContent;
        } else if (newContent instanceof HTMLElement) {
            this.content.innerHTML = '';
            this.content.appendChild(newContent);
        }
    }

    // Atualizar título do modal atual
    updateTitle(newTitle) {
        if (!this.isOpen || !this.titleElement) return;
        this.titleElement.textContent = newTitle;
    }

    // Verificar se modal está aberto
    isModalOpen() {
        return this.isOpen;
    }

    // Obter ícones para diferentes tipos
    getConfirmIcon(type) {
        const icons = {
            warning: '⚠️',
            danger: '🚨',
            success: '✅',
            info: 'ℹ️'
        };
        return icons[type] || icons.warning;
    }

    getAlertIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    // Método para criar modal programaticamente
    create(config) {
        const {
            title = '',
            content = '',
            buttons = [],
            ...options
        } = config;

        let modalContent = content;

        // Adicionar botões se especificados
        if (buttons.length > 0) {
            const buttonsHtml = buttons.map(btn => {
                const btnClass = btn.className || 'btn btn-outline';
                const btnId = btn.id || Utils.generateId('btn-');
                return `<button class="${btnClass}" id="${btnId}">${btn.text}</button>`;
            }).join('');

            modalContent += `
                <div class="modal-footer">
                    <div class="action-buttons">
                        ${buttonsHtml}
                    </div>
                </div>
            `;
        }

        this.show(title, modalContent, {
            ...options,
            onOpen: () => {
                // Adicionar event listeners para botões
                buttons.forEach(btn => {
                    const btnId = btn.id || Utils.generateId('btn-');
                    const btnElement = document.getElementById(btnId);
                    if (btnElement && btn.onClick) {
                        btnElement.addEventListener('click', () => {
                            const result = btn.onClick();
                            if (result !== false) {
                                this.close();
                            }
                        });
                    }
                });

                // Callback personalizado
                if (options.onOpen) {
                    options.onOpen();
                }
            }
        });
    }

    // Destruir modal
    destroy() {
        if (this.isOpen) {
            this.close();
        }
        
        // Remover event listeners
        document.removeEventListener('keydown', this.handleEscape);
        
        // Restore body scroll
        document.body.style.overflow = '';
    }
}

// Criar instância global
window.Modal = Modal;

// Inicializar modal global quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.modal = new Modal();
    });
} else {
    window.modal = new Modal();
}